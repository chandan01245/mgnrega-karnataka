from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone
import requests
import asyncio
from collections import defaultdict

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

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
    # Initialize districts if not exists
    existing = await db.districts.count_documents({})
    if existing == 0:
        districts_data = [{**d} for d in KARNATAKA_DISTRICTS]
        await db.districts.insert_many(districts_data)
        logger.info(f"Initialized {len(districts_data)} districts")
    
    # Generate mock data if no metrics exist
    existing_metrics = await db.metrics.count_documents({})
    if existing_metrics == 0:
        await generate_mock_metrics()
        logger.info("Generated mock metrics data")

# Generate mock data for demonstration
async def generate_mock_metrics():
    import random
    from datetime import timedelta
    
    metrics = []
    current_date = datetime.now(timezone.utc)
    
    for district in KARNATAKA_DISTRICTS:
        for month_offset in range(6):  # Last 6 months
            target_date = current_date - timedelta(days=30 * month_offset)
            target_job_days = random.randint(80000, 150000)
            actual_job_days = random.randint(int(target_job_days * 0.6), int(target_job_days * 1.1))
            performance = (actual_job_days / target_job_days) * 100
            
            metric = {
                "id": str(uuid.uuid4()),
                "district_id": district["id"],
                "year": target_date.year,
                "month": target_date.month,
                "total_job_days": actual_job_days,
                "target_job_days": target_job_days,
                "households_covered": random.randint(5000, 15000),
                "wages_paid": actual_job_days * random.uniform(180, 220),
                "performance_index": round(performance, 2),
                "timestamp": target_date.isoformat()
            }
            metrics.append(metric)
    
    if metrics:
        await db.metrics.insert_many(metrics)

# API Routes
@api_router.get("/")
async def root():
    return {"message": "MGNREGA Karnataka Dashboard API", "version": "1.0"}

@api_router.get("/districts", response_model=List[District])
async def get_districts():
    """Get all Karnataka districts"""
    districts = await db.districts.find({}, {"_id": 0}).to_list(100)
    return districts

@api_router.get("/districts/{district_id}", response_model=DistrictPerformance)
async def get_district_performance(district_id: str):
    """Get detailed performance for a specific district"""
    # Get district info
    district = await db.districts.find_one({"id": district_id}, {"_id": 0})
    if not district:
        raise HTTPException(status_code=404, detail="District not found")
    
    # Get latest metrics (current month)
    latest_metric = await db.metrics.find_one(
        {"district_id": district_id},
        {"_id": 0},
        sort=[("year", -1), ("month", -1)]
    )
    
    # Get trend data (last 6 months)
    trend_data = await db.metrics.find(
        {"district_id": district_id},
        {"_id": 0}
    ).sort([("year", -1), ("month", -1)]).limit(6).to_list(6)
    
    # Convert timestamps
    if latest_metric and isinstance(latest_metric.get('timestamp'), str):
        latest_metric['timestamp'] = datetime.fromisoformat(latest_metric['timestamp'])
    
    for metric in trend_data:
        if isinstance(metric.get('timestamp'), str):
            metric['timestamp'] = datetime.fromisoformat(metric['timestamp'])
    
    # Determine performance category
    performance_category = "medium"
    if latest_metric:
        perf = latest_metric.get('performance_index', 0)
        if perf >= 90:
            performance_category = "high"
        elif perf < 75:
            performance_category = "low"
    
    return {
        "district": district,
        "latest_metrics": latest_metric,
        "trend": trend_data,
        "performance_category": performance_category
    }

@api_router.get("/metrics/state", response_model=StateStatistics)
async def get_state_statistics():
    """Get state-level aggregated statistics"""
    # Get all latest metrics for each district
    pipeline = [
        {"$sort": {"year": -1, "month": -1}},
        {"$group": {
            "_id": "$district_id",
            "latest": {"$first": "$$ROOT"}
        }}
    ]
    
    results = await db.metrics.aggregate(pipeline).to_list(100)
    
    total_job_days = 0
    total_households = 0
    total_wages = 0
    performances = []
    district_performances = {}
    
    for result in results:
        metric = result['latest']
        total_job_days += metric['total_job_days']
        total_households += metric['households_covered']
        total_wages += metric['wages_paid']
        performances.append(metric['performance_index'])
        district_performances[result['_id']] = metric['performance_index']
    
    avg_performance = sum(performances) / len(performances) if performances else 0
    
    # Find best and worst districts
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
    pipeline = [
        {"$sort": {"year": -1, "month": -1}},
        {"$group": {
            "_id": "$district_id",
            "performance_index": {"$first": "$performance_index"},
            "total_job_days": {"$first": "$total_job_days"},
            "households_covered": {"$first": "$households_covered"}
        }}
    ]
    
    results = await db.metrics.aggregate(pipeline).to_list(100)
    
    # Get district names
    districts_map = {d['id']: d for d in KARNATAKA_DISTRICTS}
    
    comparison_data = []
    for result in results:
        district_id = result['_id']
        district_info = districts_map.get(district_id, {})
        comparison_data.append({
            "district_id": district_id,
            "name_en": district_info.get('name_en', district_id),
            "name_kn": district_info.get('name_kn', district_id),
            "performance_index": result['performance_index'],
            "total_job_days": result['total_job_days'],
            "households_covered": result['households_covered']
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
    client.close()