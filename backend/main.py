import logging
import traceback
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

from api.decision_engine import evaluate_field

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("terrashift-api")
logger.info("TerraShift API starting up...")

app = FastAPI(
    title="TerraShift API",
    description="Climate-smart crop rotation decision support system powered by NASA satellite observations.",
    version="1.0.0"
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"  # permissive for hackathon demo versatility
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_PRIORITIES = {"Water", "Profit", "Soil Health"}

class FieldRequest(BaseModel):
    lat: float = Field(..., ge=-90.0, le=90.0, description="Latitude between -90 and 90")
    lon: float = Field(..., ge=-180.0, le=180.0, description="Longitude between -180 and 180")
    current_crop: str = Field(..., min_length=2, max_length=50, description="Name of current crop")
    priority: str = Field(..., description="Optimization priority: Water, Profit, or Soil Health")

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: str) -> str:
        cleaned = v.strip()
        if cleaned not in ALLOWED_PRIORITIES:
            raise ValueError(f"Priority must be one of: {', '.join(sorted(ALLOWED_PRIORITIES))}")
        return cleaned

    @field_validator("current_crop")
    @classmethod
    def validate_crop(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("current_crop cannot be empty")
        return cleaned


@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "TerraShift API",
        "version": "1.0.0",
        "challenge": "NASA Space Apps Challenge 2024 - Field Shift"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "service": "TerraShift API"
    }


@app.post("/api/evaluate")
def evaluate(req: FieldRequest):
    """
    Evaluates field coordinates and inputs against NASA SMAP and ECOSTRESS datasets
    to deliver ranked, climate-resilient crop rotation strategies.
    """
    logger.info(
        "Evaluating field at lat=%.4f, lon=%.4f, crop=%s, priority=%s",
        req.lat, req.lon, req.current_crop, req.priority
    )
    try:
        results = evaluate_field(
            lat=req.lat,
            lon=req.lon,
            current_crop=req.current_crop,
            priority=req.priority
        )
        return results
    except ValueError as ve:
        logger.warning("Validation error during field evaluation: %s", str(ve))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid field evaluation parameters: {str(ve)}"
        )
    except Exception as exc:
        logger.error("Unhandled error evaluating field: %s\n%s", exc, traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error processing satellite data. Please verify coordinates and try again."
        )
