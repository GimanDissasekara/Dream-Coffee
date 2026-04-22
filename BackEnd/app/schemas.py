from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr


# ── Auth ──────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    username: Optional[str] = None
    email: str
    role: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    password: Optional[str] = None


# ── Reviews ───────────────────────────────────────────────────────────────────

class ReviewOut(BaseModel):
    id: int
    shop_id: int
    author_name: Optional[str] = None
    text: Optional[str] = None
    rating: Optional[float] = None
    time: Optional[int] = None
    profile_photo_url: Optional[str] = None
    relative_time_description: Optional[str] = None
    status: Optional[str] = "active"

    class Config:
        from_attributes = True


class ReviewUpdate(BaseModel):
    status: Optional[str] = None


# ── Coffee Shops ──────────────────────────────────────────────────────────────

class CoffeeShopBrief(BaseModel):
    """Compact card for recommendation lists."""
    id: int
    place_id: Optional[str] = None
    name: str
    address: Optional[str] = None
    lat: float
    lng: float
    rating: Optional[float] = 0.0
    total_ratings: Optional[int] = 0
    price_level: Optional[int] = 0
    photo_url: Optional[str] = None
    is_new: bool = False
    distance_km: Optional[float] = None
    status: str = "active"
    is_manual: bool = False

    class Config:
        from_attributes = True


class CoffeeShopDetail(BaseModel):
    """Full shop page."""
    id: int
    place_id: Optional[str] = None
    name: str
    address: Optional[str] = None
    lat: float
    lng: float
    rating: Optional[float] = 0.0
    total_ratings: Optional[int] = 0
    price_level: Optional[int] = 0
    photo_urls: List[str] = []
    types: List[str] = []
    opening_hours: Optional[dict] = None
    website: Optional[str] = None
    phone_number: Optional[str] = None
    business_status: Optional[str] = None
    description: Optional[str] = None
    recommendation: Optional[str] = None
    reviews: List[ReviewOut] = []
    is_new: bool = False
    status: str = "active"
    is_manual: bool = False

    class Config:
        from_attributes = True


class CoffeeShopCreate(BaseModel):
    name: str
    address: Optional[str] = None
    lat: float
    lng: float
    rating: Optional[float] = 0.0
    description: Optional[str] = None
    recommendation: Optional[str] = None
    photo_urls: Optional[List[str]] = []


class CoffeeShopUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    rating: Optional[float] = None
    description: Optional[str] = None
    recommendation: Optional[str] = None
    status: Optional[str] = None


# ── Recommendations ──────────────────────────────────────────────────────────

class RecommendationRequest(BaseModel):
    lat: float
    lng: float
    radius: int = 5000       # metres


class RecommendationResponse(BaseModel):
    recommendations: List[CoffeeShopBrief]
    total: int


# ── Interactions ──────────────────────────────────────────────────────────────

class InteractionCreate(BaseModel):
    interaction_type: str     # view | read_reviews | click_direction


class InteractionOut(BaseModel):
    id: int
    user_id: int
    shop_id: int
    interaction_type: str
    timestamp: datetime

    class Config:
        from_attributes = True


# ── Directions ────────────────────────────────────────────────────────────────

class DirectionsRequest(BaseModel):
    origin_lat: float
    origin_lng: float


class DirectionsResponse(BaseModel):
    directions_url: str
    shop_name: str
    destination_lat: float
    destination_lng: float


# ── System Config ─────────────────────────────────────────────────────────────

class SystemConfigOut(BaseModel):
    key: str
    value: Any

    class Config:
        from_attributes = True

class SystemConfigUpdate(BaseModel):
    value: Any


# ── Audit Log ─────────────────────────────────────────────────────────────────

class AuditLogOut(BaseModel):
    id: int
    admin_id: int
    action: str
    target_type: str
    target_id: Optional[str] = None
    details: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True
