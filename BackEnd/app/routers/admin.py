from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, CoffeeShop, Review, AuditLog, SystemConfig
from app.schemas import (
    UserOut, UserUpdate, CoffeeShopBrief, CoffeeShopDetail, CoffeeShopCreate, CoffeeShopUpdate,
    ReviewOut, ReviewUpdate, SystemConfigOut, SystemConfigUpdate, AuditLogOut
)
from app.services.auth_service import require_admin, hash_password
from app.services import google_maps as gm

router = APIRouter(prefix="/api/admin", tags=["Admin"])

# Helper for Audit Logging
def log_action(db: Session, admin_id: int, action: str, target_type: str, target_id: Optional[str] = None, details: Optional[str] = None):
    log = AuditLog(
        admin_id=admin_id,
        action=action,
        target_type=target_type,
        target_id=str(target_id) if target_id else None,
        details=details
    )
    db.add(log)
    db.commit()


# ── User Management ──────────────────────────────────────────────────────────

@router.get("/users", response_model=List[UserOut])
def get_users(db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    return db.query(User).all()

@router.put("/users/{user_id}", response_model=UserOut)
def update_user(user_id: int, data: UserUpdate, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if data.username is not None:
        user.username = data.username
    if data.email is not None:
        user.email = data.email
    if data.role is not None:
        user.role = data.role
    if data.status is not None:
        user.status = data.status
    if data.password is not None:
        user.hashed_password = hash_password(data.password)

    db.commit()
    db.refresh(user)
    log_action(db, current_admin.id, "update_user", "user", user.id, f"Updated user {user.email}")
    return user

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Soft delete -> suspended
    user.status = "suspended"
    db.commit()
    log_action(db, current_admin.id, "delete_user", "user", user.id, f"Soft deleted (suspended) user {user.email}")
    return {"message": "User suspended successfully"}


# ── Shop Management ──────────────────────────────────────────────────────────

@router.get("/shops", response_model=List[CoffeeShopBrief])
def get_all_shops(db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    """Returns ALL shops (including inactive) for admin management."""
    shops = db.query(CoffeeShop).all()
    result = []
    for shop in shops:
        photo_url = None
        if shop.photo_refs:
            ref = shop.photo_refs[0]
            photo_url = ref if ref.startswith("http") else gm.get_photo_url(ref)
        result.append(CoffeeShopBrief(
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
            status=shop.status,
            is_manual=shop.is_manual,
        ))
    return result


@router.post("/shops", response_model=CoffeeShopDetail, status_code=status.HTTP_201_CREATED)
def add_shop(data: CoffeeShopCreate, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    # Manual shop creation
    shop = CoffeeShop(
        name=data.name,
        address=data.address,
        lat=data.lat,
        lng=data.lng,
        rating=data.rating,
        description=data.description,
        recommendation=data.recommendation,
        is_manual=True,
        photo_refs=data.photo_urls, # Using photo_refs to store URL directly for manual
    )
    db.add(shop)
    db.commit()
    db.refresh(shop)
    log_action(db, current_admin.id, "add_shop", "shop", shop.id, f"Added shop {shop.name}")
    
    # Format for output
    return CoffeeShopDetail(
        id=shop.id,
        name=shop.name,
        address=shop.address,
        lat=shop.lat,
        lng=shop.lng,
        rating=shop.rating,
        description=shop.description,
        recommendation=shop.recommendation,
        photo_urls=shop.photo_refs or [],
        status=shop.status,
        is_manual=shop.is_manual,
        is_new=True
    )

@router.put("/shops/{shop_id}", response_model=CoffeeShopDetail)
def update_shop(shop_id: int, data: CoffeeShopUpdate, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    shop = db.query(CoffeeShop).filter(CoffeeShop.id == shop_id).first()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(shop, key, value)
        
    db.commit()
    db.refresh(shop)
    log_action(db, current_admin.id, "update_shop", "shop", shop.id, f"Updated shop {shop.name}")
    
    # We rebuild photo URLs (assuming manual shops use full URLs in photo_refs, others use references)
    photo_urls = []
    for ref in (shop.photo_refs or []):
        if ref.startswith("http"):
            photo_urls.append(ref)
        else:
            photo_urls.append(gm.get_photo_url(ref))

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
        description=shop.description,
        recommendation=shop.recommendation,
        reviews=[],
        status=shop.status,
        is_manual=shop.is_manual
    )

@router.delete("/shops/{shop_id}")
def delete_shop(shop_id: int, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    shop = db.query(CoffeeShop).filter(CoffeeShop.id == shop_id).first()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    
    shop.status = "inactive"
    db.commit()
    log_action(db, current_admin.id, "delete_shop", "shop", shop.id, f"Soft deleted shop {shop.name}")
    return {"message": "Shop marked as inactive"}


# ── Review Management ────────────────────────────────────────────────────────

@router.get("/reviews", response_model=List[ReviewOut])
def get_all_reviews(db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    # Returns all reviews for moderation
    return db.query(Review).all()

@router.put("/reviews/{review_id}", response_model=ReviewOut)
def update_review(review_id: int, data: ReviewUpdate, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    if data.status is not None:
        review.status = data.status
        
    db.commit()
    db.refresh(review)
    log_action(db, current_admin.id, "update_review", "review", review.id, f"Updated review status to {review.status}")
    return review

@router.delete("/reviews/{review_id}")
def delete_review(review_id: int, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    review.status = "deleted"
    db.commit()
    log_action(db, current_admin.id, "delete_review", "review", review.id, "Soft deleted review")
    return {"message": "Review marked as deleted"}


# ── Config Management ────────────────────────────────────────────────────────

@router.get("/config", response_model=List[SystemConfigOut])
def get_configs(db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    return db.query(SystemConfig).all()

@router.put("/config/{key}", response_model=SystemConfigOut)
def update_config(key: str, data: SystemConfigUpdate, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    config = db.query(SystemConfig).filter(SystemConfig.key == key).first()
    if not config:
        config = SystemConfig(key=key, value=data.value)
        db.add(config)
    else:
        config.value = data.value
    
    db.commit()
    db.refresh(config)
    log_action(db, current_admin.id, "update_config", "config", key, f"Updated config {key}")
    return config


# ── Analytics ────────────────────────────────────────────────────────────────

@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    total_users = db.query(User).count()
    total_shops = db.query(CoffeeShop).count()
    total_reviews = db.query(Review).count()
    
    return {
        "total_users": total_users,
        "total_shops": total_shops,
        "total_reviews": total_reviews,
        "status": "healthy"
    }
