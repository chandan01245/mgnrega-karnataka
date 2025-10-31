import asyncio
import logging
import os
import uuid
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional

import requests
from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import (JSON, Column, DateTime, Float, ForeignKey, Integer,
                        String, desc, func, select, text)
# SQLAlchemy async imports
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Postgres connection
raw_db = os.environ.get('DATABASE_URL', '')
if not raw_db:
    # default local compose url
    DATABASE_URL = 'postgresql+asyncpg://postgres:postgres@postgres:5432/mgnrega'
else:
    # Normalize common Postgres URL forms to SQLAlchemy asyncpg scheme
    if raw_db.startswith('postgres://'):
        DATABASE_URL = raw_db.replace('postgres://', 'postgresql+asyncpg://', 1)
    elif raw_db.startswith('postgresql://') and '+asyncpg' not in raw_db:
        DATABASE_URL = raw_db.replace('postgresql://', 'postgresql+asyncpg://', 1)
    else:
        DATABASE_URL = raw_db
engine = create_async_engine(DATABASE_URL, future=True)
AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()


# ORM models
class DistrictORM(Base):
    __tablename__ = 'districts'
    id = Column(String, primary_key=True, index=True)
    name_en = Column(String)
    name_kn = Column(String)
    feature = Column(String)
    coordinates = Column(JSON)


class MetricORM(Base):
    __tablename__ = 'metrics'
    id = Column(String, primary_key=True, index=True)
    district_id = Column(String, ForeignKey('districts.id'))
    year = Column(Integer)
    month = Column(Integer)
    total_job_days = Column(Float)
    target_job_days = Column(Float)
    households_covered = Column(Integer)
    wages_paid = Column(Float)
    performance_index = Column(Float)
    timestamp = Column(DateTime(timezone=True))

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# MGNREGA API Configuration
MGNREGA_API_KEY = os.environ.get('MGNREGA_API_KEY', '')
MGNREGA_BASE_URL = "https://api.data.gov.in/resource"

# Karnataka Districts
KARNATAKA_DISTRICTS = [
    {"id": "KA01", "name_en": "Bagalkot", "name_kn": "ಬಾಗಲಕೋಟೆ", "feature": "Red soil"},
    {"id": "KA02", "name_en": "Bangalore Rural", "name_kn": "ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ", "feature": "Silk production"},
    {"id": "KA03", "name_en": "Bangalore Urban", "name_kn": "ಬೆಂಗಳೂರು ನಗರ", "feature": "IT Hub"},
    {"id": "KA04", "name_en": "Belgaum", "name_kn": "ಬೆಳಗಾವಿ", "feature": "Sugarcane"},
    {"id": "KA05", "name_en": "Bellary", "name_kn": "ಬಳ್ಳಾರಿ", "feature": "Iron ore"},
    {"id": "KA06", "name_en": "Bidar", "name_kn": "ಬೀದರ್", "feature": "Heritage monuments"},
    {"id": "KA07", "name_en": "Chamarajanagar", "name_kn": "ಚಾಮರಾಜನಗರ", "feature": "Bandipur forest"},
    {"id": "KA08", "name_en": "Chikkaballapur", "name_kn": "ಚಿಕ್ಕಬಳ್ಳಾಪುರ", "feature": "Nandi Hills"},
    {"id": "KA09", "name_en": "Chikkamagaluru", "name_kn": "ಚಿಕ್ಕಮಗಳೂರು", "feature": "Coffee plantations"},
    {"id": "KA10", "name_en": "Chitradurga", "name_kn": "ಚಿತ್ರದುರ್ಗ", "feature": "Fort"},
    {"id": "KA11", "name_en": "Dakshina Kannada", "name_kn": "ದಕ್ಷಿಣ ಕನ್ನಡ", "feature": "Coastal region"},
    {"id": "KA12", "name_en": "Davanagere", "name_kn": "ದಾವಣಗೆರೆ", "feature": "Cotton"},
    {"id": "KA13", "name_en": "Dharwad", "name_kn": "ಧಾರವಾಡ", "feature": "Educational hub"},
    {"id": "KA14", "name_en": "Gadag", "name_kn": "ಗದಗ", "feature": "Temples"},
    {"id": "KA15", "name_en": "Gulbarga", "name_kn": "ಗುಲಬರ್ಗಾ", "feature": "Historical"},
    {"id": "KA16", "name_en": "Hassan", "name_kn": "ಹಾಸನ", "feature": "Hoysala temples"},
    {"id": "KA17", "name_en": "Haveri", "name_kn": "ಹಾವೇರಿ", "feature": "Handloom"},
    {"id": "KA18", "name_en": "Kodagu", "name_kn": "ಕೊಡಗು", "feature": "Coffee & spices"},
    {"id": "KA19", "name_en": "Kolar", "name_kn": "ಕೋಲಾರ", "feature": "Gold mines"},
    {"id": "KA20", "name_en": "Koppal", "name_kn": "ಕೊಪ್ಪಳ", "feature": "Agriculture"},
    {"id": "KA21", "name_en": "Mandya", "name_kn": "ಮಂಡ್ಯ", "feature": "Sugar capital"},
    {"id": "KA22", "name_en": "Mysore", "name_kn": "ಮೈಸೂರು", "feature": "Palace city"},
    {"id": "KA23", "name_en": "Raichur", "name_kn": "ರಾಯಚೂರು", "feature": "Thermal power"},
    {"id": "KA24", "name_en": "Ramanagara", "name_kn": "ರಾಮನಗರ", "feature": "Silk cocoons"},
    {"id": "KA25", "name_en": "Shimoga", "name_kn": "ಶಿವಮೊಗ್ಗ", "feature": "Jog Falls"},
    {"id": "KA26", "name_en": "Tumkur", "name_kn": "ತುಮಕೂರು", "feature": "Coconut"},
    {"id": "KA27", "name_en": "Udupi", "name_kn": "ಉಡುಪಿ", "feature": "Krishna temple"},
    {"id": "KA28", "name_en": "Uttara Kannada", "name_kn": "ಉತ್ತರ ಕನ್ನಡ", "feature": "Western Ghats"},
    {"id": "KA29", "name_en": "Vijayapura", "name_kn": "ವಿಜಯಪುರ", "feature": "Gol Gumbaz"},
    {"id": "KA30", "name_en": "Yadgir", "name_kn": "ಯಾದಗಿರಿ", "feature": "Agriculture"}
]

# Models
class District(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name_en: str
    name_kn: str
    feature: str
    coordinates: Optional[List[float]] = [15.3173, 75.7139]  # Default Karnataka center

class MonthlyMetric(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    district_id: str
    year: int
    month: int
    total_job_days: float
    target_job_days: float
    households_covered: int
    wages_paid: float
    performance_index: float
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DistrictPerformance(BaseModel):
    district: District
    latest_metrics: Optional[MonthlyMetric] = None
    trend: List[MonthlyMetric] = []
    performance_category: str = "medium"  # low, medium, high

class StateStatistics(BaseModel):
    total_job_days: float
    total_households: int
    total_wages: float
    avg_performance: float
    best_district: Optional[str] = None
    worst_district: Optional[str] = None

# Initialize districts in database
@app.on_event("startup")
async def startup_event():
    # Try connecting to the database with retry/backoff so the backend waits for Postgres readiness
    max_retries = 30
    delay_seconds = 1
    for attempt in range(1, max_retries + 1):
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)

            # Initialize districts if not exists
            async with AsyncSessionLocal() as session:
                existing = (await session.execute(select(func.count()).select_from(DistrictORM))).scalar_one()
                if existing == 0:
                    districts_objs = []
                    for d in KARNATAKA_DISTRICTS:
                        districts_objs.append(DistrictORM(
                            id=d['id'], name_en=d['name_en'], name_kn=d['name_kn'], feature=d['feature'], coordinates=[15.3173, 75.7139]
                        ))
                    session.add_all(districts_objs)
                    await session.commit()
                    logger.info(f"Initialized {len(districts_objs)} districts")

                # Generate mock data if no metrics exist
                existing_metrics = (await session.execute(select(func.count()).select_from(MetricORM))).scalar_one()
                if existing_metrics == 0:
                    await generate_mock_metrics()
                    logger.info("Generated mock metrics data")

            # If we reach here, DB operations succeeded
            break
        except Exception as e:
            logger.warning(f"Database not ready (attempt {attempt}/{max_retries}): {e}")
            if attempt == max_retries:
                logger.error("Exceeded max retries for DB connection during startup")
                raise
            await asyncio.sleep(delay_seconds)

# Generate mock data for demonstration
async def generate_mock_metrics():
    import random
    from datetime import timedelta

    current_date = datetime.now(timezone.utc)
    metrics_objs = []
    for district in KARNATAKA_DISTRICTS:
        for month_offset in range(6):  # Last 6 months
            target_date = current_date - timedelta(days=30 * month_offset)
            target_job_days = random.randint(80000, 150000)
            actual_job_days = random.randint(int(target_job_days * 0.6), int(target_job_days * 1.1))
            performance = (actual_job_days / target_job_days) * 100

            metric = MetricORM(
                id=str(uuid.uuid4()),
                district_id=district['id'],
                year=target_date.year,
                month=target_date.month,
                total_job_days=actual_job_days,
                target_job_days=target_job_days,
                households_covered=random.randint(5000, 15000),
                wages_paid=actual_job_days * random.uniform(180, 220),
                performance_index=round(performance, 2),
                timestamp=target_date
            )
            metrics_objs.append(metric)

    if metrics_objs:
        async with AsyncSessionLocal() as session:
            session.add_all(metrics_objs)
            await session.commit()

# API Routes
@api_router.get("/")
async def root():
    return {"message": "MGNREGA Karnataka Dashboard API", "version": "1.0"}

@api_router.get("/districts", response_model=List[District])
async def get_districts():
    """Get all Karnataka districts"""
    async with AsyncSessionLocal() as session:
        # Try new schema first (ORM). If the database has an older schema, fall back to a compatibility query.
        try:
            res = await session.execute(select(DistrictORM))
            rows = res.scalars().all()
            if rows:
                return [
                    {
                        "id": r.id,
                        "name_en": r.name_en,
                        "name_kn": r.name_kn,
                        "feature": r.feature,
                        "coordinates": r.coordinates or [15.3173, 75.7139]
                    }
                    for r in rows
                ]
        except Exception:
            # fall through to compatibility mode
            pass

        # Compatibility: older schema uses columns like id (int), name, name_kn, geojson
        try:
            q = text("SELECT id::text AS id, name AS name_en, name_kn, state, geojson FROM districts")
            res = await session.execute(q)
            rows = res.fetchall()
            return [
                {
                    "id": r[0],
                    "name_en": r[1] or "",
                    "name_kn": r[2] or "",
                    "feature": r[3] or "",
                    "coordinates": (r[4] and (r[4] if isinstance(r[4], list) else [15.3173, 75.7139])) or [15.3173, 75.7139]
                }
                for r in rows
            ]
        except Exception:
            return []

@api_router.get("/districts/{district_id}", response_model=DistrictPerformance)
async def get_district_performance(district_id: str):
    """Get detailed performance for a specific district"""
    # Get district info
    async with AsyncSessionLocal() as session:
        # Try new schema first
        try:
            res = await session.execute(select(DistrictORM).where(DistrictORM.id == district_id))
            district_row = res.scalars().first()
        except Exception:
            district_row = None

        if district_row:
            # Latest metric
            res_latest = await session.execute(
                select(MetricORM).where(MetricORM.district_id == district_id).order_by(desc(MetricORM.year), desc(MetricORM.month)).limit(1)
            )
            latest_metric = res_latest.scalars().first()

            # Trend (last 6 months)
            res_trend = await session.execute(
                select(MetricORM).where(MetricORM.district_id == district_id).order_by(desc(MetricORM.year), desc(MetricORM.month)).limit(6)
            )
            trend_rows = res_trend.scalars().all()
        else:
            # Compatibility with older schema
            # district_id in old schema may be integer; convert
            try:
                q = text("SELECT id::text, name, name_kn, state, geojson FROM districts WHERE id::text = :did")
                res = await session.execute(q, {"did": district_id})
                r = res.fetchone()
                if not r:
                    raise HTTPException(status_code=404, detail="District not found")
                district_row = type("D", (), {"id": r[0], "name_en": r[1], "name_kn": r[2], "feature": r[3], "coordinates": r[4]})()
            except Exception:
                raise HTTPException(status_code=404, detail="District not found")

            # Fetch latest and trend from old metrics table and map columns
            try:
                q_latest = text("SELECT id::text, district_id::text, fin_year, month, persondays_central_liability AS total_job_days, NULL AS target_job_days, total_households_worked AS households_covered, wages AS wages_paid, NULL AS performance_index, created_at AS timestamp FROM metrics WHERE district_id::text = :did ORDER BY created_at DESC LIMIT 1")
                res_latest = await session.execute(q_latest, {"did": district_id})
                latest_metric = res_latest.fetchone()

                q_trend = text("SELECT id::text, district_id::text, fin_year, month, persondays_central_liability AS total_job_days, NULL AS target_job_days, total_households_worked AS households_covered, wages AS wages_paid, NULL AS performance_index, created_at AS timestamp FROM metrics WHERE district_id::text = :did ORDER BY created_at DESC LIMIT 6")
                res_trend = await session.execute(q_trend, {"did": district_id})
                trend_rows = res_trend.fetchall()
            except Exception:
                latest_metric = None
                trend_rows = []

        def metric_to_dict(m):
            if not m:
                return None
            # m can be an ORM object or a SQL row/tuple
            if hasattr(m, "id"):
                return {
                    "id": m.id,
                    "district_id": m.district_id,
                    "year": getattr(m, "year", None),
                    "month": getattr(m, "month", None),
                    "total_job_days": getattr(m, "total_job_days", None),
                    "target_job_days": getattr(m, "target_job_days", None),
                    "households_covered": getattr(m, "households_covered", None),
                    "wages_paid": getattr(m, "wages_paid", None),
                    "performance_index": getattr(m, "performance_index", None),
                    "timestamp": getattr(m, "timestamp", None)
                }
            else:
                # assume tuple-like from raw SQL
                # mapping follows q_latest/q_trend select order
                return {
                    "id": m[0],
                    "district_id": m[1],
                    "year": (int(m[2].split('-')[0]) if m[2] and isinstance(m[2], str) and '-' in m[2] else (int(m[2]) if m[2] else None)),
                    "month": (int(m[3]) if m[3] and str(m[3]).isdigit() else None),
                    "total_job_days": m[4],
                    "target_job_days": m[5],
                    "households_covered": m[6],
                    "wages_paid": float(m[7]) if m[7] is not None else None,
                    "performance_index": m[8],
                    "timestamp": m[9]
                }

        # Determine performance category
        performance_category = "medium"
        if latest_metric:
            perf = latest_metric.performance_index or 0
            if perf >= 90:
                performance_category = "high"
            elif perf < 75:
                performance_category = "low"

        return {
            "district": {
                "id": district_row.id,
                "name_en": district_row.name_en,
                "name_kn": district_row.name_kn,
                "feature": district_row.feature,
                "coordinates": district_row.coordinates or [15.3173, 75.7139]
            },
            "latest_metrics": metric_to_dict(latest_metric),
            "trend": [metric_to_dict(m) for m in trend_rows],
            "performance_category": performance_category
        }

@api_router.get("/metrics/state", response_model=StateStatistics)
async def get_state_statistics():
    """Get state-level aggregated statistics"""
    # Get all latest metrics for each district
    # Fetch latest metric per district by iterating districts (small state - acceptable)
    async with AsyncSessionLocal() as session:
        districts = (await session.execute(select(DistrictORM.id))).scalars().all()

        total_job_days = 0
        total_households = 0
        total_wages = 0
        performances = []
        district_performances = {}

        for did in districts:
            res_latest = await session.execute(
                select(MetricORM).where(MetricORM.district_id == did).order_by(desc(MetricORM.year), desc(MetricORM.month)).limit(1)
            )
            m = res_latest.scalars().first()
            if m:
                total_job_days += m.total_job_days or 0
                total_households += m.households_covered or 0
                total_wages += m.wages_paid or 0
                perf = m.performance_index or 0
                performances.append(perf)
                district_performances[did] = perf

        avg_performance = sum(performances) / len(performances) if performances else 0

        best_district = max(district_performances.items(), key=lambda x: x[1])[0] if district_performances else None
        worst_district = min(district_performances.items(), key=lambda x: x[1])[0] if district_performances else None

        return {
            "total_job_days": total_job_days,
            "total_households": total_households,
            "total_wages": total_wages,
            "avg_performance": round(avg_performance, 2),
            "best_district": best_district,
            "worst_district": worst_district
        }

@api_router.get("/metrics/comparison")
async def get_comparison_data():
    """Get comparison data for all districts"""
    # Get latest metrics for each district
    async with AsyncSessionLocal() as session:
        districts_map = {d['id']: d for d in KARNATAKA_DISTRICTS}
        comparison_data = []
        district_ids = (await session.execute(select(DistrictORM.id))).scalars().all()
        for did in district_ids:
            res_latest = await session.execute(
                select(MetricORM).where(MetricORM.district_id == did).order_by(desc(MetricORM.year), desc(MetricORM.month)).limit(1)
            )
            m = res_latest.scalars().first()
            district_info = districts_map.get(did, {})
            comparison_data.append({
                "district_id": did,
                "name_en": district_info.get('name_en', did),
                "name_kn": district_info.get('name_kn', did),
                "performance_index": m.performance_index if m else None,
                "total_job_days": m.total_job_days if m else None,
                "households_covered": m.households_covered if m else None
            })

        return comparison_data

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    await engine.dispose()