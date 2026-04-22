from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import CoffeeShop, Review, User, UserInteraction
from app.schemas import (
    CoffeeShopBrief,
    CoffeeShopDetail,
    ReviewOut,
    RecommendationResponse,
    InteractionCreate,
    InteractionOut,
    DirectionsResponse,
)
from app.services import google_maps as gm
from app.services.recommender import recommend, NEW_SHOP_DAYS
from app.services.auth_service import get_current_user, require_user

router = APIRouter(prefix="/api/shops", tags=["Coffee Shops"])


# ── Recommendations ──────────────────────────────────────────────────────────

@router.get("/recommend", response_model=RecommendationResponse)
def get_recommendations(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    radius: int = Query(5000, description="Search radius in metres"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    """
    Get 8 recommended coffee shops for the given location.
    1. Fetches nearby shops from Google Maps (caches in DB).
    2. Runs the hybrid recommender.
    3. Returns the top 8 with scores.
    """
    # Step 1 — scrape / refresh from Google Maps
    gm.search_coffee_shops(lat, lng, radius=radius, db=db)

    # Step 2 — run recommender
    user_id = current_user.id if current_user else None
    results = recommend(db, lat, lng, user_id=user_id, limit=8)

    # Step 3 — build response
    now = datetime.utcnow()
    cards = []
    for shop, score, distance_km in results:
        photo_url = None
        if shop.photo_refs and len(shop.photo_refs) > 0:
            photo_url = gm.get_photo_url(shop.photo_refs[0])

        if shop.status != "active":
            continue

        is_new = (
            shop.created_at is not None
            and (now - shop.created_at) < timedelta(days=NEW_SHOP_DAYS)
        )

        cards.append(CoffeeShopBrief(
            id=shop.id,
            place_id=shop.place_id,
            name=shop.name,
            address=shop.address,
            lat=shop.lat,
            lng=shop.lng,
            rating=shop.rating,
            total_ratings=shop.total_ratings,
            price_level=shop.price_level,
            photo_url=photo_url,
            is_new=is_new,
            distance_km=round(distance_km, 2),
        ))

    return RecommendationResponse(recommendations=cards, total=len(cards))


# ── Shop Details ──────────────────────────────────────────────────────────────

@router.get("/{place_id}", response_model=CoffeeShopDetail)
def get_shop_detail(
    place_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    """Get full details for a single coffee shop, including reviews and photos."""
    # Fetch fresh details from Google Maps (also updates DB)
    gm.get_shop_details(place_id, db=db)

    shop = db.query(CoffeeShop).filter(CoffeeShop.place_id == place_id, CoffeeShop.status == "active").first()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")

    # Log implicit "view" interaction
    if current_user:
        interaction = UserInteraction(
            user_id=current_user.id,
            shop_id=shop.id,
            interaction_type="view",
        )
        db.add(interaction)
        db.commit()

    # Build photo URLs
    photo_urls = [gm.get_photo_url(ref) for ref in (shop.photo_refs or [])]

    # Get reviews
    reviews = db.query(Review).filter(Review.shop_id == shop.id, Review.status == "active").all()

    now = datetime.utcnow()
    is_new = (
        shop.created_at is not None
        and (now - shop.created_at) < timedelta(days=NEW_SHOP_DAYS)
    )

    return CoffeeShopDetail(
        id=shop.id,
        place_id=shop.place_id,
        name=shop.name,
        address=shop.address,
        lat=shop.lat,
        lng=shop.lng,
        rating=shop.rating,
        total_ratings=shop.total_ratings,
        price_level=shop.price_level,
        photo_urls=photo_urls,
        types=shop.types or [],
        opening_hours=shop.opening_hours,
        website=shop.website,
        phone_number=shop.phone_number,
        business_status=shop.business_status,
        reviews=[ReviewOut.model_validate(r) for r in reviews],
        is_new=is_new,
    )


# ── Photos ────────────────────────────────────────────────────────────────────

@router.get("/{place_id}/photos")
def get_shop_photos(
    place_id: str,
    db: Session = Depends(get_db),
):
    """Return photo URLs for a shop."""
    shop = db.query(CoffeeShop).filter(CoffeeShop.place_id == place_id, CoffeeShop.status == "active").first()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")

    photo_urls = [gm.get_photo_url(ref) for ref in (shop.photo_refs or [])]
    return {"place_id": place_id, "photos": photo_urls}


# ── Reviews ───────────────────────────────────────────────────────────────────

@router.get("/{place_id}/reviews")
def get_shop_reviews(
    place_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    """Paginated reviews for a shop."""
    shop = db.query(CoffeeShop).filter(CoffeeShop.place_id == place_id, CoffeeShop.status == "active").first()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")

    # Log implicit "read_reviews" interaction
    if current_user:
        interaction = UserInteraction(
            user_id=current_user.id,
            shop_id=shop.id,
            interaction_type="read_reviews",
        )
        db.add(interaction)
        db.commit()

    total = db.query(Review).filter(Review.shop_id == shop.id, Review.status == "active").count()
    reviews = (
        db.query(Review)
        .filter(Review.shop_id == shop.id, Review.status == "active")
        .order_by(Review.time.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        "place_id": place_id,
        "page": page,
        "page_size": page_size,
        "total": total,
        "reviews": [ReviewOut.model_validate(r) for r in reviews],
    }


# ── Directions ────────────────────────────────────────────────────────────────

@router.get("/{place_id}/directions", response_model=DirectionsResponse)
def get_directions(
    place_id: str,
    origin_lat: float = Query(..., description="Origin latitude"),
    origin_lng: float = Query(..., description="Origin longitude"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    """Generate a Google Maps directions link for navigation."""
    shop = db.query(CoffeeShop).filter(CoffeeShop.place_id == place_id, CoffeeShop.status == "active").first()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")

    # Log implicit "click_direction" interaction
    if current_user:
        interaction = UserInteraction(
            user_id=current_user.id,
            shop_id=shop.id,
            interaction_type="click_direction",
        )
        db.add(interaction)
        db.commit()

    url = gm.get_directions_url(origin_lat, origin_lng, shop.lat, shop.lng)
    return DirectionsResponse(
        directions_url=url,
        shop_name=shop.name,
        destination_lat=shop.lat,
        destination_lng=shop.lng,
    )


# ── Interactions (explicit logging) ──────────────────────────────────────────

@router.post("/{place_id}/interact", response_model=InteractionOut, status_code=201)
def log_interaction(
    place_id: str,
    data: InteractionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """Log an implicit user interaction (view, read_reviews, click_direction)."""
    valid_types = {"view", "read_reviews", "click_direction"}
    if data.interaction_type not in valid_types:
        raise HTTPException(
            status_code=400,
            detail=f"interaction_type must be one of {valid_types}",
        )

    shop = db.query(CoffeeShop).filter(CoffeeShop.place_id == place_id, CoffeeShop.status == "active").first()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")

    interaction = UserInteraction(
        user_id=current_user.id,
        shop_id=shop.id,
        interaction_type=data.interaction_type,
    )
    db.add(interaction)
    db.commit()
    db.refresh(interaction)
    return interaction
