"""
Hybrid Implicit-Feedback Coffee Shop Recommender

Combines:
1. Content-based scoring (Google rating, review volume, price, sentiment)
2. Collaborative filtering (user-item implicit interaction matrix)
3. Location proximity (distance decay)
4. New-shop boost (surfacing recently added shops)
"""

import math
import logging
from datetime import datetime, timedelta
from typing import List, Optional, Tuple, Dict
from collections import defaultdict

import numpy as np
from sqlalchemy.orm import Session

from app.models import CoffeeShop, UserInteraction, Review

logger = logging.getLogger(__name__)

# ── Tunable weights ──────────────────────────────────────────────────────────
ALPHA = 0.35   # content-based
BETA = 0.25    # collaborative
GAMMA = 0.30   # proximity
DELTA = 0.10   # new-shop boost

# Interaction type weights for implicit signals
INTERACTION_WEIGHTS = {
    "view": 1.0,
    "read_reviews": 2.0,
    "click_direction": 3.0,
}

NEW_SHOP_DAYS = 7             # shops added within this window get a boost
MAX_RECOMMENDATIONS = 8


# ── Public API ────────────────────────────────────────────────────────────────

def recommend(
    db: Session,
    lat: float,
    lng: float,
    user_id: Optional[int] = None,
    limit: int = MAX_RECOMMENDATIONS,
) -> List[Tuple[CoffeeShop, float, float]]:
    """
    Return top-N coffee shops as (CoffeeShop, score, distance_km) tuples.
    """
    shops: List[CoffeeShop] = db.query(CoffeeShop).all()
    if not shops:
        return []

    # Pre-compute distances
    shop_distances: Dict[int, float] = {}
    for shop in shops:
        shop_distances[shop.id] = _haversine(lat, lng, shop.lat, shop.lng)

    # Content scores (0-1 normalised)
    content_scores = _content_scores(db, shops)

    # Collaborative scores (only meaningful for authenticated users)
    collab_scores = _collaborative_scores(db, user_id, shops) if user_id else {}

    # Build final scores
    scored: List[Tuple[CoffeeShop, float, float]] = []
    now = datetime.utcnow()

    for shop in shops:
        cs = content_scores.get(shop.id, 0.0)
        cf = collab_scores.get(shop.id, 0.0)
        dist = shop_distances[shop.id]
        prox = _proximity_score(dist)
        new_boost = _newness_bonus(shop.created_at, now)

        final = (ALPHA * cs) + (BETA * cf) + (GAMMA * prox) + (DELTA * new_boost)
        scored.append((shop, final, dist))

    # Sort descending by score
    scored.sort(key=lambda x: x[1], reverse=True)
    return scored[:limit]


# ── Content-based scoring ─────────────────────────────────────────────────────

def _content_scores(db: Session, shops: List[CoffeeShop]) -> Dict[int, float]:
    """
    Score each shop 0–1 based on:
      • Google rating (40%)
      • Total ratings (popularity, 25%)
      • Review sentiment (positive keyword ratio, 20%)
      • Price level reasonableness (15%)
    """
    scores: Dict[int, float] = {}

    if not shops:
        return scores

    max_total = max((s.total_ratings or 0) for s in shops) or 1

    for shop in shops:
        # Rating component (0-1)
        rating_score = min((shop.rating or 0) / 5.0, 1.0)

        # Popularity component (log-scaled, 0-1)
        pop = math.log1p(shop.total_ratings or 0) / math.log1p(max_total) if max_total > 0 else 0

        # Review sentiment
        reviews = db.query(Review).filter(Review.shop_id == shop.id).all()
        sentiment = _review_sentiment(reviews)

        # Price level: mid-range (2) is most favourable
        price = shop.price_level or 2
        price_score = max(0, 1.0 - abs(price - 2) * 0.25)

        scores[shop.id] = (
            0.40 * rating_score
            + 0.25 * pop
            + 0.20 * sentiment
            + 0.15 * price_score
        )

    return scores


_POSITIVE_KEYWORDS = {
    "great", "excellent", "amazing", "wonderful", "fantastic", "love",
    "best", "perfect", "delicious", "friendly", "cozy", "cosy",
    "awesome", "recommend", "favourite", "favorite", "beautiful",
    "lovely", "superb", "outstanding", "good", "nice", "clean",
    "comfortable", "warm", "welcoming", "pleasant",
}

_NEGATIVE_KEYWORDS = {
    "bad", "terrible", "awful", "worst", "dirty", "rude", "slow",
    "horrible", "disgusting", "disappointing", "overpriced", "cold",
    "stale", "poor", "avoid", "never",
}


def _review_sentiment(reviews: List[Review]) -> float:
    """Simple keyword-based sentiment score 0–1."""
    if not reviews:
        return 0.5  # neutral default

    total_pos = 0
    total_neg = 0
    total_words = 0

    for r in reviews:
        text = (r.text or "").lower()
        words = text.split()
        total_words += len(words)
        for w in words:
            cleaned = w.strip(".,!?;:'\"()")
            if cleaned in _POSITIVE_KEYWORDS:
                total_pos += 1
            elif cleaned in _NEGATIVE_KEYWORDS:
                total_neg += 1

    if total_pos + total_neg == 0:
        return 0.5

    return total_pos / (total_pos + total_neg)


# ── Collaborative filtering ──────────────────────────────────────────────────

def _collaborative_scores(
    db: Session,
    user_id: int,
    shops: List[CoffeeShop],
) -> Dict[int, float]:
    """
    User-based collaborative filtering on implicit interactions.
    Finds similar users via cosine similarity and scores shops
    those similar users interacted with.
    """
    all_interactions = db.query(UserInteraction).all()
    if not all_interactions:
        return {}

    # Build user-item matrix
    user_ids = set()
    shop_ids = [s.id for s in shops]
    shop_id_set = set(shop_ids)
    shop_idx = {sid: i for i, sid in enumerate(shop_ids)}

    user_vectors: Dict[int, np.ndarray] = defaultdict(lambda: np.zeros(len(shop_ids)))

    for inter in all_interactions:
        if inter.shop_id not in shop_id_set:
            continue
        user_ids.add(inter.user_id)
        weight = INTERACTION_WEIGHTS.get(inter.interaction_type, 1.0)
        user_vectors[inter.user_id][shop_idx[inter.shop_id]] += weight

    if user_id not in user_vectors:
        return {}

    target_vec = user_vectors[user_id]
    target_norm = np.linalg.norm(target_vec)
    if target_norm == 0:
        return {}

    # Cosine similarity with every other user
    similarities: List[Tuple[int, float]] = []
    for uid, vec in user_vectors.items():
        if uid == user_id:
            continue
        vnorm = np.linalg.norm(vec)
        if vnorm == 0:
            continue
        sim = float(np.dot(target_vec, vec) / (target_norm * vnorm))
        if sim > 0:
            similarities.append((uid, sim))

    if not similarities:
        return {}

    # Weight shops by similar-user interactions
    scores: Dict[int, float] = defaultdict(float)
    total_sim = sum(s for _, s in similarities)

    for uid, sim in similarities:
        for sid, idx in shop_idx.items():
            if user_vectors[uid][idx] > 0 and target_vec[idx] == 0:
                scores[sid] += sim * user_vectors[uid][idx]

    # Normalise 0–1
    max_score = max(scores.values()) if scores else 1
    return {sid: v / max_score for sid, v in scores.items()} if max_score > 0 else scores


# ── Utility functions ─────────────────────────────────────────────────────────

def _haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Distance in km between two lat/lng points."""
    R = 6371.0
    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lng / 2) ** 2
    )
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _proximity_score(distance_km: float) -> float:
    """Exponential distance-decay: 1.0 at 0 km, ~0.37 at 3 km, ~0.05 at 10 km."""
    return math.exp(-distance_km / 3.0)


def _newness_bonus(created_at: Optional[datetime], now: datetime) -> float:
    """
    Shops created within NEW_SHOP_DAYS get a bonus that decays linearly.
    Returns 1.0 on day 0 → 0.0 on day NEW_SHOP_DAYS.
    """
    if created_at is None:
        return 0.0
    age_days = (now - created_at).total_seconds() / 86400
    if age_days > NEW_SHOP_DAYS:
        return 0.0
    return max(0.0, 1.0 - age_days / NEW_SHOP_DAYS)
