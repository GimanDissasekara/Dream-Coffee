from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Text, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    interactions = relationship("UserInteraction", back_populates="user")


class CoffeeShop(Base):
    __tablename__ = "coffee_shops"

    id = Column(Integer, primary_key=True, index=True)
    place_id = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    address = Column(Text)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    rating = Column(Float, default=0.0)
    total_ratings = Column(Integer, default=0)
    price_level = Column(Integer, default=0)
    photo_refs = Column(JSON, default=list)       # list of photo_reference strings
    types = Column(JSON, default=list)             # e.g. ["cafe", "restaurant"]
    opening_hours = Column(JSON, default=dict)     # structured hours
    website = Column(String(500))
    phone_number = Column(String(50))
    business_status = Column(String(50))
    vicinity = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    reviews = relationship("Review", back_populates="shop", cascade="all, delete-orphan")
    interactions = relationship("UserInteraction", back_populates="shop")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    shop_id = Column(Integer, ForeignKey("coffee_shops.id"), nullable=False)
    author_name = Column(String(255))
    text = Column(Text)
    rating = Column(Float)
    time = Column(Integer)                         # Unix timestamp from Google
    profile_photo_url = Column(String(500))
    relative_time_description = Column(String(100))

    shop = relationship("CoffeeShop", back_populates="reviews")


class UserInteraction(Base):
    """Implicit feedback: tracks what users do (view, read_reviews, click_direction)."""
    __tablename__ = "user_interactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    shop_id = Column(Integer, ForeignKey("coffee_shops.id"), nullable=False)
    interaction_type = Column(String(50), nullable=False)   # view | read_reviews | click_direction
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="interactions")
    shop = relationship("CoffeeShop", back_populates="interactions")
