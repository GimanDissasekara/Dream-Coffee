import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routers import auth, shops

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


# ── Lifespan (startup / shutdown) ─────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Starting Coffee Rec System — creating tables…")
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Database tables ready")
    yield
    logger.info("👋 Shutting down Coffee Rec System")


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="☕ Coffee Shop Recommender API",
    description=(
        "A hybrid implicit-feedback recommender system for coffee shops. "
        "Scrapes data from Google Maps, analyses reviews & ratings, "
        "and recommends the top 8 shops for your location."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(shops.router)


# ── Root ──────────────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def root():
    return {
        "service": "Coffee Shop Recommender API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running",
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}
