from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr


# ── Auth ──────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


# ── Reviews ───────────────────────────────────────────────────────────────────

class ReviewOut(BaseModel):
    id: int
    author_name: Optional[str] = None
    text: Optional[str] = None
    rating: Optional[float] = None
    time: Optional[int] = None
    profile_photo_url: Optional[str] = None
    relative_time_description: Optional[str] = None

    class Config:
        from_attributes = True


# ── Coffee Shops ──────────────────────────────────────────────────────────────

class CoffeeShopBrief(BaseModel):
    """Compact card for recommendation lists."""
    id: int
    place_id: str
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

    class Config:
        from_attributes = True


class CoffeeShopDetail(BaseModel):
    """Full shop page."""
    id: int
    place_id: str
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
    reviews: List[ReviewOut] = []
    is_new: bool = False

    class Config:
        from_attributes = True


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
