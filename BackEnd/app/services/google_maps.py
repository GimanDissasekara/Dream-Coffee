import os
import logging
from typing import List, Optional, Dict, Any

import googlemaps
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from app.models import CoffeeShop, Review

load_dotenv()

logger = logging.getLogger(__name__)

GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "")

gmaps = googlemaps.Client(key=GOOGLE_MAPS_API_KEY) if GOOGLE_MAPS_API_KEY else None


def search_coffee_shops(
    lat: float,
    lng: float,
    radius: int = 5000,
    db: Optional[Session] = None,
) -> List[Dict[str, Any]]:
    """
    Search for coffee shops near a location using Google Maps Nearby Search.
    Results are stored/updated in the database.
    """
    if gmaps is None:
        logger.error("Google Maps client not initialized — missing API key")
        return []

    results = []
    try:
        response = gmaps.places_nearby(
            location=(lat, lng),
            radius=radius,
            type="cafe",
            keyword="coffee",
        )
        results.extend(response.get("results", []))

        # Fetch up to 2 more pages for broader coverage
        for _ in range(2):
            next_token = response.get("next_page_token")
            if not next_token:
                break
            import time
            time.sleep(2)  # token needs a moment to become valid
            response = gmaps.places_nearby(page_token=next_token)
            results.extend(response.get("results", []))

    except Exception as e:
        logger.error(f"Google Maps Nearby Search failed: {e}")
        return []

    # Persist to DB
    if db is not None:
        for place in results:
            _upsert_shop_from_search(db, place)

    return results


def get_shop_details(place_id: str, db: Optional[Session] = None) -> Optional[Dict[str, Any]]:
    """
    Fetch full Place Details (reviews, photos, hours, etc.) from Google Maps.
    Updates the DB record.
    """
    if gmaps is None:
        return None

    try:
        result = gmaps.place(
            place_id=place_id,
            fields=[
                "place_id", "name", "formatted_address", "geometry",
                "rating", "user_ratings_total", "price_level",
                "photo", "type", "opening_hours", "review",
                "website", "formatted_phone_number", "business_status",
                "vicinity",
            ],
        )
        details = result.get("result", {})

        if db is not None:
            _upsert_shop_from_details(db, details)

        return details
    except Exception as e:
        logger.error(f"Google Maps Place Details failed for {place_id}: {e}")
        return None


def get_photo_url(photo_reference: str, max_width: int = 800) -> str:
    """Build a Google Maps photo URL."""
    return (
        f"https://maps.googleapis.com/maps/api/place/photo"
        f"?maxwidth={max_width}"
        f"&photo_reference={photo_reference}"
        f"&key={GOOGLE_MAPS_API_KEY}"
    )


def get_directions_url(
    origin_lat: float,
    origin_lng: float,
    dest_lat: float,
    dest_lng: float,
) -> str:
    """Generate a Google Maps directions deep-link."""
    return (
        f"https://www.google.com/maps/dir/"
        f"{origin_lat},{origin_lng}/"
        f"{dest_lat},{dest_lng}/"
    )


# ── DB helpers ────────────────────────────────────────────────────────────────

def _upsert_shop_from_search(db: Session, place: Dict[str, Any]) -> CoffeeShop:
    """Insert or update a CoffeeShop from a Nearby Search result."""
    place_id = place.get("place_id", "")
    existing = db.query(CoffeeShop).filter(CoffeeShop.place_id == place_id).first()

    geo = place.get("geometry", {}).get("location", {})
    photo_refs = [p.get("photo_reference", "") for p in place.get("photos", [])]

    data = dict(
        name=place.get("name", "Unknown"),
        address=place.get("vicinity", ""),
        lat=geo.get("lat", 0.0),
        lng=geo.get("lng", 0.0),
        rating=place.get("rating", 0.0),
        total_ratings=place.get("user_ratings_total", 0),
        price_level=place.get("price_level", 0),
        photo_refs=photo_refs,
        types=place.get("types", []),
        business_status=place.get("business_status", ""),
        vicinity=place.get("vicinity", ""),
    )

    if existing:
        for k, v in data.items():
            setattr(existing, k, v)
        db.commit()
        return existing
    else:
        shop = CoffeeShop(place_id=place_id, **data)
        db.add(shop)
        db.commit()
        db.refresh(shop)
        return shop


def _upsert_shop_from_details(db: Session, details: Dict[str, Any]) -> CoffeeShop:
    """Insert or update a CoffeeShop from Place Details + reviews."""
    place_id = details.get("place_id", "")
    existing = db.query(CoffeeShop).filter(CoffeeShop.place_id == place_id).first()

    geo = details.get("geometry", {}).get("location", {})
    photo_refs = [p.get("photo_reference", "") for p in details.get("photos", [])]

    data = dict(
        name=details.get("name", "Unknown"),
        address=details.get("formatted_address", ""),
        lat=geo.get("lat", 0.0),
        lng=geo.get("lng", 0.0),
        rating=details.get("rating", 0.0),
        total_ratings=details.get("user_ratings_total", 0),
        price_level=details.get("price_level", 0),
        photo_refs=photo_refs,
        types=details.get("types", []),
        opening_hours=details.get("opening_hours", {}),
        website=details.get("website"),
        phone_number=details.get("formatted_phone_number"),
        business_status=details.get("business_status", ""),
        vicinity=details.get("vicinity", ""),
    )

    if existing:
        for k, v in data.items():
            setattr(existing, k, v)
        shop = existing
    else:
        shop = CoffeeShop(place_id=place_id, **data)
        db.add(shop)

    db.commit()
    db.refresh(shop)

    # Upsert reviews
    reviews_data = details.get("reviews", [])
    if reviews_data:
        # Clear old reviews for this shop and re-insert
        db.query(Review).filter(Review.shop_id == shop.id).delete()
        for r in reviews_data:
            review = Review(
                shop_id=shop.id,
                author_name=r.get("author_name"),
                text=r.get("text"),
                rating=r.get("rating"),
                time=r.get("time"),
                profile_photo_url=r.get("profile_photo_url"),
                relative_time_description=r.get("relative_time_description"),
            )
            db.add(review)
        db.commit()

    return shop
