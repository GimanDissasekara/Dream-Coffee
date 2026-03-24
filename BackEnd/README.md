# ☕ Coffee Shop Recommender API

A hybrid implicit-feedback recommender system that scrapes coffee shop data from Google Maps and recommends the top 8 shops based on your location.

---

## Prerequisites

- **Python 3.10+** installed ([python.org](https://www.python.org/downloads/))
- **Google Maps API Key** (already configured in `.env`)

---

## Setup & Run

### 1. Open a terminal in the `BackEnd` folder

```bash
cd "c:\Users\ASUS\OneDrive - University of Moratuwa\Desktop\Coffee Rec System\BackEnd"
```

### 2. Create a virtual environment

```bash
python -m venv .venv
```

### 3. Activate the virtual environment

**Windows (PowerShell):**
```powershell
.venv\Scripts\activate
```

**Windows (CMD):**
```cmd
.venv\Scripts\activate.bat
```

You should see `(.venv)` at the beginning of your terminal prompt.

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Run the server

```bash
python -m uvicorn main:app --reload
```

### 6. Open the API docs

Navigate to: **http://127.0.0.1:8000/docs**

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login → JWT token |
| GET | `/api/shops/recommend?lat=6.9271&lng=79.8612` | Get 8 recommended shops |
| GET | `/api/shops/{place_id}` | Shop details + reviews + photos |
| GET | `/api/shops/{place_id}/photos` | Photo URLs |
| GET | `/api/shops/{place_id}/reviews` | Paginated reviews |
| GET | `/api/shops/{place_id}/directions?origin_lat=...&origin_lng=...` | Google Maps directions link |
| POST | `/api/shops/{place_id}/interact` | Log user interaction (requires auth) |

---

## Environment Variables

The `.env` file contains:

| Variable | Description |
|----------|-------------|
| `GOOGLE_MAPS_API_KEY` | Google Maps Places API key |
| `SECRET_KEY` | JWT signing secret |
| `DATABASE_URL` | SQLite database path |

---

## Troubleshooting

**`No module named uvicorn`** — You need to install dependencies inside the venv:
```bash
.venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload
```
