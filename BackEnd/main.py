import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import engine, Base, SessionLocal
from app.routers import auth, shops, admin
from app.models import User
from app.services.auth_service import hash_password

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


def create_default_admin():
    db: Session = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.role == "admin").first()
        if not admin_user:
            logger.info("Creating default admin user...")
            admin_user = User(
                username="admin",
                email="admin@system.local",
                hashed_password=hash_password("admin123"), # Default password, should be changed
                role="admin",
                status="active"
            )
            db.add(admin_user)
            db.commit()
    finally:
        db.close()


# ── Lifespan (startup / shutdown) ─────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Starting Coffee Rec System — creating tables…")
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Database tables ready")
    create_default_admin()
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
app.include_router(admin.router)


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
