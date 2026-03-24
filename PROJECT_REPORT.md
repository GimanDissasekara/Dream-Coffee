<![CDATA[<div align="center">

# ☕ Coffee Shop Recommender System

### Full Technical Report & Documentation

**Version 1.0.0**

---

*A hybrid implicit-feedback recommender system that leverages the Google Maps API, keyword-based sentiment analysis, collaborative filtering, and proximity scoring to recommend the top 8 coffee shops based on a user's location.*

</div>

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Quick Start Guide](#2-quick-start-guide)
3. [Technology Stack](#3-technology-stack)
4. [System Architecture](#4-system-architecture)
5. [Backend Architecture](#5-backend-architecture)
6. [Recommender System — Deep Dive](#6-recommender-system--deep-dive)
7. [API Reference](#7-api-reference)
8. [Frontend Architecture](#8-frontend-architecture)
9. [Authentication Pipeline](#9-authentication-pipeline)
10. [Data Pipeline](#10-data-pipeline)
11. [Database Schema](#11-database-schema)
12. [Deployment Notes](#12-deployment-notes)

---

## 1. Project Overview

The **Coffee Shop Recommender System** is a full-stack web application that helps users discover the best coffee shops near any location in the world. Users can search by city name (e.g., *Kegalle*, *New York*, *Berlin*) or use their device's GPS, and the system recommends the top 8 coffee shops using a **hybrid scoring algorithm** that combines:

- **Content-based scoring** — Google ratings, review volume, review sentiment, and price level
- **Collaborative filtering** — User-based implicit-feedback analysis via cosine similarity
- **Location proximity** — Exponential distance-decay scoring
- **New-shop boosting** — Surfacing recently added shops for discovery

Each recommended shop includes real-time data fetched from the **Google Maps Places API**: photos, reviews, ratings, opening hours, contact info, and Google Maps directions.

### Key Features

| Feature | Description |
|---------|-------------|
| 🔍 **City Search** | Search any city/address worldwide with autocomplete suggestions |
| 📍 **GPS Location** | One-click geolocation detection via browser API |
| 🤖 **AI Scoring** | Hybrid 4-pillar recommender algorithm (content + collaborative + proximity + newness) |
| 📸 **Photo Gallery** | Scrollable photo carousel sourced from Google Maps |
| ⭐ **Reviews & Ratings** | Full Google reviews with author info, timestamps, and star ratings |
| 🗺️ **Interactive Map** | Dark-themed Leaflet map with custom markers on all pages |
| 🧭 **Directions** | One-click Google Maps navigation link |
| 🔐 **Authentication** | JWT-based auth with token expiry, protected routes, and auto-logout |
| 🎨 **Premium UI** | Dark theme, glassmorphism, micro-animations, responsive design |

---

## 2. Quick Start Guide

### 2.1 Prerequisites

Ensure the following are installed on your system:

| Software | Version | Purpose |
|----------|---------|---------|
| **Python** | 3.9+ | Backend runtime |
| **Node.js** | 18+ | Frontend runtime |
| **npm** | 9+ | Frontend package manager |
| **Git** | Any | Version control |

You will also need a **Google Maps API Key** with the following APIs enabled:
- Places API
- Directions API

### 2.2 Backend Setup

```bash
# 1. Navigate to the backend directory
cd "Coffee Rec System/BackEnd"

# 2. Create a Python virtual environment
python -m venv venv

# 3. Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# 4. Install all Python dependencies
pip install -r requirements.txt

# 5. Create the environment file
# Create a file named .env in the BackEnd directory with:
```

Create a `.env` file in the `BackEnd/` directory:

```env
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
SECRET_KEY=your_jwt_secret_key_here
DATABASE_URL=sqlite:///./coffee_rec.db
```

```bash
# 6. Start the backend server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at: **http://localhost:8000**
Interactive API docs (Swagger): **http://localhost:8000/docs**

### 2.3 Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd "Coffee Rec System/FrontEnd"

# 2. Install all Node.js dependencies
npm install

# 3. Start the development server
npm run dev
```

The frontend will be available at: **http://localhost:5173**

> **Important:** The frontend Vite dev server is configured to proxy all `/api` requests to `http://localhost:8000`, so the backend must be running first.

### 2.4 Verify Installation

```bash
# Test if the backend is healthy
curl http://localhost:8000/health
# Expected: {"status": "ok"}

# Test if the frontend loads
# Open http://localhost:5173 in your browser
```

### 2.5 Full Dependency List

#### Backend (`requirements.txt`)

```
fastapi            # Web framework
uvicorn            # ASGI server
sqlalchemy         # ORM (Object-Relational Mapper)
python-dotenv      # Environment variable management
googlemaps         # Google Maps API Python client
requests           # HTTP client
passlib[bcrypt]    # Password hashing
python-jose[cryptography]  # JWT token encoding/decoding
scikit-learn       # Machine learning utilities
numpy              # Numerical computing
scipy              # Scientific computing
bcrypt==4.0.1      # BCrypt fixed version for compatibility
```

#### Frontend (`package.json`)

```
react              # UI library
react-dom          # React DOM renderer
react-router-dom   # Client-side routing
axios              # HTTP client for API calls
framer-motion      # Animation library
react-icons        # Icon library (Feather icons)
leaflet            # Map rendering library
react-leaflet      # React wrapper for Leaflet
```

---

## 3. Technology Stack

### 3.1 Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.9+ | Primary backend language |
| **FastAPI** | Latest | Async web framework with auto-generated Swagger docs |
| **Uvicorn** | Latest | ASGI server for running FastAPI |
| **SQLAlchemy** | Latest | ORM for database models and queries |
| **SQLite** | Built-in | Lightweight relational database (default) |
| **Pydantic** | v2 | Data validation and serialization |
| **python-jose** | Latest | JWT (JSON Web Token) creation and validation |
| **Passlib + bcrypt** | Latest | Password hashing (SHA-256 pre-hash → bcrypt) |
| **googlemaps** | Latest | Google Maps API Python client |
| **NumPy** | Latest | Vector operations for collaborative filtering |

### 3.2 Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18+ | Component-based UI framework |
| **Vite** | 8.x | Fast build tool and dev server with HMR |
| **React Router v6** | Latest | Client-side routing with protected routes |
| **Axios** | Latest | HTTP client with interceptor support |
| **Framer Motion** | Latest | Declarative animation library |
| **Leaflet** | Latest | Interactive map rendering |
| **React-Leaflet** | Latest | React bindings for Leaflet |
| **React Icons** | Latest | Feather icon set (FiCoffee, FiMap, etc.) |
| **Vanilla CSS** | — | Custom design system with CSS variables |
| **Google Fonts** | — | Outfit (display) + Inter (body) typography |

### 3.3 External APIs

| API | Provider | Usage |
|-----|----------|-------|
| **Places API — Nearby Search** | Google Maps | Discover coffee shops within a radius |
| **Places API — Place Details** | Google Maps | Fetch reviews, photos, hours, contact info |
| **Places API — Place Photos** | Google Maps | Retrieve shop photographs |
| **Nominatim Geocoding** | OpenStreetMap | Convert city names to lat/lng coordinates (frontend) |
| **CartoDB Dark Tiles** | CARTO | Dark-themed map tiles for Leaflet |

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                          │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              React SPA (Vite Dev Server :5173)            │   │
│  │                                                          │   │
│  │  ┌────────────┐  ┌──────────────┐  ┌────────────────┐   │   │
│  │  │  Auth       │  │  Location     │  │  Toast          │   │   │
│  │  │  Context    │  │  Context      │  │  Context        │   │   │
│  │  └────────────┘  └──────────────┘  └────────────────┘   │   │
│  │                                                          │   │
│  │  ┌─────────┐ ┌──────────┐ ┌───────────┐ ┌──────────┐   │   │
│  │  │ Landing │ │  Login   │ │   Home    │ │ ShopDetail│   │   │
│  │  │  Page   │ │ Register │ │ Grid+Map  │ │  + Map   │   │   │
│  │  └─────────┘ └──────────┘ └───────────┘ └──────────┘   │   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Axios Service Layer (JWT Interceptor, /api proxy) │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                    Vite Proxy │ /api → :8000                      │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           FastAPI Backend (Uvicorn :8000)                 │   │
│  │                                                          │   │
│  │  ┌──────────┐  ┌──────────────┐  ┌─────────────────┐   │   │
│  │  │ Auth     │  │ Shops        │  │ Recommender      │   │   │
│  │  │ Router   │  │ Router       │  │ Engine           │   │   │
│  │  └──────────┘  └──────────────┘  └─────────────────┘   │   │
│  │                                                          │   │
│  │  ┌──────────┐  ┌──────────────┐  ┌─────────────────┐   │   │
│  │  │ Auth     │  │ Google Maps  │  │ SQLAlchemy       │   │   │
│  │  │ Service  │  │ Service      │  │ ORM              │   │   │
│  │  └──────────┘  └──────────────┘  └─────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                     │                        │                   │
│          ┌──────────▼──────────┐   ┌────────▼──────────┐        │
│          │  Google Maps API    │   │  SQLite Database   │        │
│          │  (Places, Photos)   │   │  coffee_rec.db     │        │
│          └─────────────────────┘   └───────────────────┘        │
└─────────────────────────────────────────────────────────────────┘

External Services:
  ┌────────────────────────┐     ┌───────────────────────┐
  │  Nominatim Geocoding   │     │  CartoDB Map Tiles    │
  │  (City → lat/lng)      │     │  (Dark theme tiles)   │
  └────────────────────────┘     └───────────────────────┘
```

### Data Flow Summary

1. **User enters a city name** → Frontend calls Nominatim API → converts to lat/lng
2. **Frontend sends lat/lng** → `GET /api/shops/recommend?lat=X&lng=Y`
3. **Backend scrapes Google Maps** → Nearby Search API → caches shops in SQLite
4. **Recommender engine scores** → Hybrid algorithm produces top 8
5. **Frontend displays results** → Shop cards with photos, ratings, distance
6. **User clicks a shop** → `GET /api/shops/{place_id}` → Full details from Google + DB
7. **User clicks Directions** → Google Maps deep-link opens in new tab
8. **Interactions are logged** → Implicit feedback feeds back into collaborative filtering

---

## 5. Backend Architecture

### 5.1 Directory Structure

```
BackEnd/
├── main.py                     # FastAPI application entry point
├── requirements.txt            # Python dependencies
├── .env                        # Environment variables (not committed)
├── coffee_rec.db               # SQLite database (auto-created)
└── app/
    ├── __init__.py
    ├── database.py             # SQLAlchemy engine, session, Base
    ├── models.py               # ORM models (User, CoffeeShop, Review, UserInteraction)
    ├── schemas.py              # Pydantic request/response schemas
    ├── routers/
    │   ├── __init__.py
    │   ├── auth.py             # /api/auth/register, /api/auth/login
    │   └── shops.py            # /api/shops/* endpoints
    └── services/
        ├── __init__.py
        ├── auth_service.py     # JWT + password hashing
        ├── google_maps.py      # Google Maps API integration
        └── recommender.py      # Hybrid recommender algorithm
```

### 5.2 Application Lifecycle

The FastAPI application uses a **lifespan context manager** that:

1. **Startup:** Creates all database tables using SQLAlchemy's `Base.metadata.create_all()`
2. **Runtime:** Serves API requests via Uvicorn ASGI server
3. **Shutdown:** Logs shutdown message and releases resources

### 5.3 CORS Configuration

The backend allows all origins (`*`) during development. For production, restrict `allow_origins` to your frontend domain.

---

## 6. Recommender System — Deep Dive

### 6.1 Overview

The recommender is a **hybrid implicit-feedback system** that produces a final score for each coffee shop by combining **four independent scoring pillars**, each normalised to a 0–1 range:

```
Final Score = (α × Content Score) + (β × Collaborative Score) + (γ × Proximity Score) + (δ × Newness Boost)
```

Where the **tunable weights** are:

| Symbol | Weight | Pillar | Description |
|--------|--------|--------|-------------|
| α (ALPHA) | **0.35** | Content-Based | Shop quality signals |
| β (BETA) | **0.25** | Collaborative Filtering | Similar-user preferences |
| γ (GAMMA) | **0.30** | Location Proximity | Distance decay |
| δ (DELTA) | **0.10** | New-Shop Boost | Discovery incentive |

### 6.2 Pillar 1: Content-Based Scoring (α = 0.35)

This pillar evaluates each shop's intrinsic quality using data from Google Maps. The content score is a weighted combination of four sub-factors:

```
Content Score = (0.40 × Rating) + (0.25 × Popularity) + (0.20 × Sentiment) + (0.15 × Price)
```

#### 6.2.1 Rating Component (40%)

```python
rating_score = min(shop.rating / 5.0, 1.0)
```

The Google rating (0–5 stars) is normalised to 0–1. A shop rated 4.5 ⭐ scores 0.90.

#### 6.2.2 Popularity Component (25%)

```python
pop = log1p(shop.total_ratings) / log1p(max_total_across_all_shops)
```

Uses **logarithmic scaling** (`log1p`) to prevent shops with thousands of reviews from completely dominating. This creates a fairer distribution where:
- 10 reviews → meaningful score
- 100 reviews → higher but not 10x
- 1000 reviews → slightly higher still

#### 6.2.3 Review Sentiment Component (20%)

A **keyword-based sentiment analyser** that scans all review texts for positive and negative words:

**Positive keywords (26):** great, excellent, amazing, wonderful, fantastic, love, best, perfect, delicious, friendly, cozy, awesome, recommend, favourite, beautiful, lovely, superb, outstanding, good, nice, clean, comfortable, warm, welcoming, pleasant, ...

**Negative keywords (16):** bad, terrible, awful, worst, dirty, rude, slow, horrible, disgusting, disappointing, overpriced, cold, stale, poor, avoid, never

```python
sentiment = positive_count / (positive_count + negative_count)
```

If no sentiment words are found, a neutral default of **0.5** is used. This approach is lightweight, requires no ML model loading, and runs in O(n) where n is total word count.

#### 6.2.4 Price Level Component (15%)

```python
price_score = max(0, 1.0 - abs(price_level - 2) * 0.25)
```

Favours **mid-range pricing** (level 2 out of 0–4):
| Price Level | Score | Interpretation |
|-------------|-------|---------------|
| 0 (free/unknown) | 0.50 | Penalised — likely missing data |
| 1 ($) | 0.75 | Budget-friendly |
| 2 ($$) | **1.00** | Sweet spot |
| 3 ($$$) | 0.75 | Upscale |
| 4 ($$$$) | 0.50 | Premium/luxury |

### 6.3 Pillar 2: Collaborative Filtering (β = 0.25)

This pillar implements **user-based collaborative filtering** on implicit interaction data.

#### How It Works

1. **Build the User-Item Interaction Matrix:**

   For every user in the system, a row vector is created where each column represents a coffee shop. The cells contain weighted interaction signals:

   | Interaction Type | Weight | Signal Strength |
   |-----------------|--------|----------------|
   | `view` | 1.0 | Mild interest |
   | `read_reviews` | 2.0 | Moderate interest |
   | `click_direction` | 3.0 | Strong intent to visit |

2. **Compute Cosine Similarity** between the current user and every other user:

   ```
   similarity(A, B) = dot(A, B) / (||A|| × ||B||)
   ```

   Users who interacted with the same shops in similar ways have high similarity.

3. **Score Shops** the current user hasn't interacted with, weighted by similar users' interactions:

   ```
   score(shop) = Σ(similarity(current_user, similar_user) × similar_user_interaction_weight)
   ```

4. **Normalise** all collaborative scores to 0–1.

#### Cold-Start Handling

When a user has no interaction history (new users), the collaborative score returns `{}` (empty), and the system gracefully falls back to the other three pillars (content + proximity + newness).

### 6.4 Pillar 3: Location Proximity (γ = 0.30)

Uses **exponential distance decay** to favour closer shops:

```python
proximity_score = e^(-distance_km / 3.0)
```

| Distance | Score | Interpretation |
|----------|-------|---------------|
| 0 km | **1.00** | Right here |
| 1 km | 0.72 | Walking distance |
| 3 km | 0.37 | Short drive |
| 5 km | 0.19 | Moderate drive |
| 10 km | 0.04 | Far — heavily penalised |

Distance is calculated using the **Haversine formula** — the standard method for computing great-circle distance between two points on a sphere:

```python
d = 2R × arctan2(√a, √(1−a))
where a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlng/2)
and R = 6371 km (Earth's radius)
```

### 6.5 Pillar 4: New-Shop Boost (δ = 0.10)

Shops added to the database within the last **7 days** receive a linear decay bonus:

```python
bonus = max(0, 1.0 - age_in_days / 7)
```

| Shop Age | Bonus | Purpose |
|----------|-------|---------|
| Day 0 (just added) | **1.00** | Maximum visibility |
| Day 3 | 0.57 | Still boosted |
| Day 7+ | 0.00 | Normal operation |

This prevents the "rich-get-richer" problem where popular established shops dominate all recommendations, ensuring new coffee shops get a fair chance of being discovered.

### 6.6 Final Score Calculation — Example

Consider a shop with:
- Google rating: 4.5 ⭐, 120 reviews, positive sentiment 0.80, price level 2
- Current user has no interaction history (new user)
- Distance: 2 km from the user
- Added to DB 2 days ago

```
Content  = 0.40×(4.5/5) + 0.25×(log(121)/log(max)) + 0.20×0.80 + 0.15×1.0
         ≈ 0.40×0.90 + 0.25×0.75 + 0.20×0.80 + 0.15×1.0
         ≈ 0.360 + 0.188 + 0.160 + 0.150
         = 0.858

Collab   = 0.0 (new user, no history)

Proximity = e^(-2/3) ≈ 0.513

Newness  = 1.0 - 2/7 ≈ 0.714

Final    = 0.35×0.858 + 0.25×0.0 + 0.30×0.513 + 0.10×0.714
         = 0.300 + 0.000 + 0.154 + 0.071
         = 0.525
```

The top 8 shops by final score are returned to the user.

---

## 7. API Reference

### 7.1 Authentication Endpoints

#### `POST /api/auth/register`

Create a new user account.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | ✅ | User email address |
| `password` | string | ✅ | Password (min. 6 characters) |

**Response:** `201 Created`
```json
{
  "id": 1,
  "email": "user@example.com",
  "created_at": "2026-03-24T12:00:00"
}
```

#### `POST /api/auth/login`

Authenticate an existing user.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | ✅ | User email |
| `password` | string | ✅ | User password |

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

### 7.2 Shop Endpoints

#### `GET /api/shops/recommend`

Get personalised coffee shop recommendations.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `lat` | float | ✅ | — | Latitude |
| `lng` | float | ✅ | — | Longitude |
| `radius` | int | ❌ | 5000 | Search radius (metres) |

**Response:** `200 OK`
```json
{
  "recommendations": [
    {
      "id": 1,
      "place_id": "ChIJ...",
      "name": "The Brew Lab",
      "address": "123 Coffee St",
      "lat": 6.9271,
      "lng": 79.8612,
      "rating": 4.5,
      "total_ratings": 120,
      "price_level": 2,
      "photo_url": "https://maps.googleapis.com/...",
      "is_new": false,
      "distance_km": 0.5
    }
  ],
  "total": 8
}
```

#### `GET /api/shops/{place_id}`

Get full details for a single shop.

**Response:** Includes `photo_urls[]`, `reviews[]`, `opening_hours`, `website`, `phone_number`, `business_status`, `types[]`.

#### `GET /api/shops/{place_id}/photos`

Get all photo URLs for a shop.

#### `GET /api/shops/{place_id}/reviews`

Paginated reviews with `page` and `page_size` query parameters.

#### `GET /api/shops/{place_id}/directions`

Get a Google Maps directions URL.

| Parameter | Type | Required |
|-----------|------|----------|
| `origin_lat` | float | ✅ |
| `origin_lng` | float | ✅ |

**Response:**
```json
{
  "directions_url": "https://www.google.com/maps/dir/6.9271,79.8612/6.9300,79.8650/",
  "shop_name": "The Brew Lab",
  "destination_lat": 6.9300,
  "destination_lng": 79.8650
}
```

#### `POST /api/shops/{place_id}/interact`

Log an implicit user interaction (requires authentication).

| Parameter | Type | Values |
|-----------|------|--------|
| `interaction_type` | string | `view`, `read_reviews`, `click_direction` |

### 7.3 Health Endpoints

| Endpoint | Response |
|----------|----------|
| `GET /` | Service info + version |
| `GET /health` | `{"status": "ok"}` |

---

## 8. Frontend Architecture

### 8.1 Directory Structure

```
FrontEnd/src/
├── main.jsx                    # React entry point
├── App.jsx                     # Root component with Router + Providers
├── App.css                     # Layout styles
├── index.css                   # Global design system (CSS variables, animations)
├── services/
│   └── api.js                  # Axios instance + JWT interceptor + API functions
├── context/
│   ├── AuthContext.jsx          # JWT auth state management
│   ├── LocationContext.jsx      # Geolocation + Nominatim city search
│   └── ToastContext.jsx         # Notification system
├── components/
│   ├── Navbar.jsx               # Responsive navigation bar
│   ├── ShopCard.jsx             # Recommendation card with hover animations
│   ├── ShopMap.jsx              # Leaflet map with dark tiles + custom markers
│   ├── StarRating.jsx           # Star rating display (half-star support)
│   ├── ReviewCard.jsx           # Customer review display
│   ├── LocationPicker.jsx       # City search + GPS location input
│   ├── SkeletonCard.jsx         # Loading placeholder with shimmer
│   ├── Toast.jsx                # Slide-in notification system
│   ├── ProtectedRoute.jsx       # Auth guard (redirects to /login)
│   └── GuestRoute.jsx           # Guest guard (redirects to /home)
└── pages/
    ├── Landing.jsx              # Hero page with features showcase
    ├── Login.jsx                # Sign-in with redirect-back-to-origin
    ├── Register.jsx             # Registration with validation
    ├── Home.jsx                 # Recommendation grid + map toggle
    └── ShopDetail.jsx           # Full shop page with gallery + map + reviews
```

### 8.2 Design System

The frontend uses a custom CSS design system defined in `index.css` with:

- **Dark theme:** Deep navy/charcoal backgrounds (`#0a0a12`)
- **Accent colour:** Amber/gold (`#d4a056`) with gradient variants
- **Glassmorphism:** Semi-transparent cards with `backdrop-filter: blur()`
- **Typography:** Outfit (display) + Inter (body) from Google Fonts
- **Animations:** `@keyframes` for gradient shift, orb float, shimmer, spin
- **CSS Variables:** 30+ tokens for colours, spacing, radii, shadows, transitions

### 8.3 State Management

| Context | Purpose | Key State |
|---------|---------|-----------|
| **AuthContext** | JWT auth lifecycle | `token`, `user`, `isAuthenticated`, `loading` |
| **LocationContext** | User location management | `location {lat, lng, name}`, geocoding |
| **ToastContext** | Notification queue | `toasts[]`, auto-dismiss timers |

### 8.4 Route Protection Strategy

```
/                → Landing        (public)
/login           → Login          (GuestRoute — redirects to /home if logged in)
/register        → Register       (GuestRoute — redirects to /home if logged in)
/home            → Home           (ProtectedRoute — redirects to /login if not logged in)
/shop/:placeId   → ShopDetail     (ProtectedRoute — redirects to /login if not logged in)
```

### 8.5 City Search (Geocoding Pipeline)

1. User types a city name (e.g., "Kegalle")
2. After 400ms debounce, `LocationContext.searchCity()` fires
3. Calls **Nominatim API**: `https://nominatim.openstreetmap.org/search?q=Kegalle&format=json&limit=5`
4. Returns up to 5 autocomplete suggestions with lat/lng
5. User selects a result → sets `location` state
6. `Home.jsx` detects location change → calls `GET /api/shops/recommend`

### 8.6 Map Integration

| Page | Map Behaviour |
|------|--------------|
| **Home** | Shows all 8 recommended shops + user location with auto-fit bounds |
| **ShopDetail** | Shows single shop + user location at zoom level 16 |

Map features:
- **Dark tiles:** CartoDB dark_all basemap (matches app theme)
- **Custom markers:** ☕ coffee pin (amber teardrop shape) for shops
- **User marker:** 📍 with pulsing blue ring animation
- **Popups:** Shop name, star rating, address, "View Details" link

---

## 9. Authentication Pipeline

### 9.1 Registration Flow

```
User fills form → POST /api/auth/register
    → Backend hashes password (SHA-256 pre-hash → bcrypt)
    → Creates User record in DB
    → Frontend auto-calls POST /api/auth/login
    → Backend creates JWT (24h expiry, HS256)
    → Token stored in localStorage
    → Redirect to /home
```

### 9.2 Login Flow

```
User submits credentials → POST /api/auth/login
    → Backend verifies (SHA-256 pre-hash → bcrypt compare)
    → Creates JWT with user_id in payload
    → Frontend stores token in localStorage
    → Redirect to original page (or /home)
```

### 9.3 Password Security

The system uses a **double-hash strategy** to bypass bcrypt's 72-byte password limit:

```
User password → SHA-256 (produces 64-char hex) → bcrypt (produces final hash)
```

This ensures passwords of **any length** are securely supported.

### 9.4 JWT Token Lifecycle

| Event | Action |
|-------|--------|
| Login/Register | Token created (24h TTL), stored in `localStorage` |
| Every API request | Axios interceptor attaches `Authorization: Bearer <token>` |
| Token expiry | `AuthContext` auto-logout timer fires, clears storage |
| 401 API response | Axios response interceptor clears token, redirects to `/login` |
| App reload | `AuthContext` checks token expiry on init, clears if stale |

---

## 10. Data Pipeline

### 10.1 Complete Request Pipeline

```
┌─────────────┐     ┌──────────────┐     ┌────────────────┐     ┌──────────────┐
│  User types  │────▶│  Nominatim   │────▶│  lat/lng set   │────▶│  GET /api/    │
│  "Kegalle"   │     │  Geocoding   │     │  in context    │     │  shops/       │
│              │     │  API         │     │                │     │  recommend    │
└─────────────┘     └──────────────┘     └────────────────┘     └──────┬───────┘
                                                                       │
                                                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BACKEND PIPELINE                                     │
│                                                                             │
│  Step 1: Google Maps Nearby Search                                          │
│  ────────────────────────────────                                          │
│  • Calls places_nearby(lat, lng, radius, type="cafe", keyword="coffee")    │
│  • Fetches up to 3 pages of results (60 shops max)                         │
│  • Upserts each shop into SQLite (insert or update)                        │
│                                                                             │
│  Step 2: Hybrid Recommender Scoring                                         │
│  ──────────────────────────────────                                        │
│  • Content score: rating + popularity + sentiment + price                   │
│  • Collaborative score: user-item matrix → cosine similarity               │
│  • Proximity score: haversine distance → exponential decay                  │
│  • Newness boost: linear decay over 7 days                                  │
│  • Final = 0.35×content + 0.25×collab + 0.30×proximity + 0.10×newness     │
│                                                                             │
│  Step 3: Build Response                                                     │
│  ─────────────────────                                                     │
│  • Sort by final score descending                                           │
│  • Take top 8                                                               │
│  • Attach photo URLs from Google Maps Photos API                            │
│  • Return JSON response                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND RENDERING                                    │
│                                                                             │
│  • ShopCard grid (4 columns, responsive) with Framer Motion stagger        │
│  • Interactive Leaflet map with custom coffee-pin markers                    │
│  • Grid/Map view toggle                                                     │
│  • Click card → /shop/:placeId → GET /api/shops/:placeId                   │
│    → Photo gallery, reviews, hours, directions, mini-map                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.2 Implicit Feedback Loop

Every user action is **silently logged** as an interaction, which feeds back into the collaborative filtering model:

```
User views shop detail   → logs "view"            (weight: 1.0)
User reads reviews       → logs "read_reviews"     (weight: 2.0)
User clicks directions   → logs "click_direction"  (weight: 3.0)
                                    │
                                    ▼
                    UserInteraction table in SQLite
                                    │
                                    ▼
                    Next recommendation request uses
                    updated interaction matrix for
                    collaborative filtering scores
```

This creates a **self-improving feedback loop** — the more users interact with the system, the better its collaborative filtering becomes.

---

## 11. Database Schema

### 11.1 Entity-Relationship Diagram

```
┌─────────────────┐       ┌─────────────────────────┐       ┌──────────────────┐
│     users        │       │     coffee_shops          │       │     reviews       │
├─────────────────┤       ├─────────────────────────┤       ├──────────────────┤
│ id (PK)         │       │ id (PK)                  │───┐   │ id (PK)          │
│ email (UNIQUE)  │       │ place_id (UNIQUE)        │   │   │ shop_id (FK)     │──┐
│ hashed_password │       │ name                     │   │   │ author_name      │  │
│ created_at      │       │ address                  │   │   │ text             │  │
└────────┬────────┘       │ lat, lng                 │   │   │ rating           │  │
         │                │ rating                   │   │   │ time             │  │
         │                │ total_ratings             │   │   │ profile_photo_url │  │
         │                │ price_level               │   └───│ relative_time_   │  │
         │                │ photo_refs (JSON)         │       │   description    │  │
         │                │ types (JSON)              │       └──────────────────┘  │
         │                │ opening_hours (JSON)      │                              │
         │                │ website, phone_number     │                              │
         │                │ business_status, vicinity │      ┌──────────────────┐   │
         │                │ created_at, updated_at    │      │ user_interactions │   │
         │                └─────────────┬─────────────┘      ├──────────────────┤   │
         │                              │                    │ id (PK)          │   │
         │                              │                    │ user_id (FK)     │───┘
         └──────────────────────────────┼────────────────────│ shop_id (FK)     │
                                        │                    │ interaction_type │
                                        └────────────────────│ timestamp        │
                                                             └──────────────────┘
```

### 11.2 Table Descriptions

| Table | Rows | Description |
|-------|------|-------------|
| `users` | Per registered user | Stores email, hashed password, creation timestamp |
| `coffee_shops` | Per unique Google Place | Full shop data: location, rating, photos, hours |
| `reviews` | Per review per shop | Google review text, author, rating, timestamp |
| `user_interactions` | Per user action | Implicit feedback: view, read_reviews, click_direction |

---

## 12. Deployment Notes

### 12.1 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOOGLE_MAPS_API_KEY` | ✅ | — | Google Maps API key with Places API enabled |
| `SECRET_KEY` | ✅ | fallback | JWT signing secret (use a strong random string) |
| `DATABASE_URL` | ❌ | `sqlite:///./coffee_rec.db` | SQLAlchemy database URL |

### 12.2 Production Checklist

- [ ] Replace SQLite with PostgreSQL/MySQL for concurrent access
- [ ] Set a strong, unique `SECRET_KEY`
- [ ] Restrict CORS `allow_origins` to your frontend domain
- [ ] Enable HTTPS on both frontend and backend
- [ ] Set `DEBUG=False` and configure proper logging
- [ ] Add rate limiting to prevent Google Maps API abuse
- [ ] Consider Redis caching for hot Google Maps responses
- [ ] Set up a reverse proxy (Nginx) for both services

### 12.3 Production Commands

```bash
# Backend (production)
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# Frontend (build for production)
cd FrontEnd
npm run build
# Serve the dist/ folder with Nginx or any static file server
```

---

<div align="center">

*Built with ❤️ and ☕*

**Coffee Shop Recommender System v1.0.0**

</div>
]]>
