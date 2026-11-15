"""
decision_engine.py — TerraShift Agronomic Decision Engine
Scores three crop rotation strategies using NASA SMAP + ECOSTRESS data.
"""

import logging
from datetime import datetime, timezone

from api.nasa_client import (
    fetch_ecostress_data,
    fetch_smap_data,
    get_location_climate_zone,
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

STRATEGY_DROUGHT = "drought_resilient"
STRATEGY_MARKET = "market_optimized"
STRATEGY_LEGUME = "nitrogen_fixing"

VULNERABILITY_MAP = {
    "Extreme Climate Stress": "extreme",
    "High Heat & Drought Stress": "high",
    "High Water Stress": "high",
    "High Heat Stress": "high",
    "Moderate Conditions": "moderate",
}


# ---------------------------------------------------------------------------
# Scoring helpers
# ---------------------------------------------------------------------------

def _score_drought_resilient(moisture_level: str, heat_stress: str,
                              climate_zone: str, priority: str) -> int:
    score = 60
    if moisture_level in ("critical", "low"):
        score += 25
    if heat_stress in ("high", "critical"):
        score += 10
    if moisture_level == "adequate":
        score -= 10
    if climate_zone in ("arid", "semi-arid"):
        score += 5
    if priority == "Water":
        score += 8
    return min(score, 98)


def _score_market_optimized(moisture_level: str, heat_stress: str,
                             climate_zone: str, priority: str) -> int:
    score = 65
    if moisture_level == "adequate":
        score += 20
    if heat_stress == "low":
        score += 10
    if moisture_level == "critical":
        score -= 15
    if heat_stress == "critical":
        score -= 10
    if climate_zone == "temperate":
        score += 10
    if priority == "Profit":
        score += 10
    return min(score, 98)


def _score_nitrogen_fixing(moisture_level: str, heat_stress: str,
                            climate_zone: str, current_crop: str,
                            priority: str) -> int:
    score = 70
    if moisture_level in ("moderate", "adequate"):
        score += 15
    if current_crop in ("Corn", "Wheat", "Sorghum"):
        score += 10
    if heat_stress == "critical":
        score -= 8
    if climate_zone in ("temperate", "continental"):
        score += 5
    if priority == "Soil Health":
        score += 10
    return min(score, 98)


# ---------------------------------------------------------------------------
# Reason generators
# ---------------------------------------------------------------------------

def _reason_drought(moisture_raw: float, moisture_level: str,
                    lst_celsius: float, heat_stress: str,
                    climate_zone: str) -> str:
    return (
        f"With a soil moisture reading of {moisture_raw:.3f} (classified as '{moisture_level}') "
        f"and a land surface temperature of {lst_celsius:.1f}°C (heat stress: '{heat_stress}'), "
        f"drought-tolerant cover crops such as Sorghum-Sudan Grass or Buckwheat are well-suited "
        f"to maintain soil cover and limit evapotranspiration. "
        f"The {climate_zone} climate profile of this location further amplifies water stress risk, "
        f"making deep-rooted, low-water-demand species the most prudent agronomic choice."
    )


def _reason_market(moisture_raw: float, moisture_level: str,
                   lst_celsius: float, heat_stress: str,
                   climate_zone: str) -> str:
    return (
        f"Soil moisture at {moisture_raw:.3f} ({moisture_level}) and LST of {lst_celsius:.1f}°C "
        f"({heat_stress} heat stress) determine whether high-value cash crops can achieve optimal "
        f"yields in this {climate_zone} environment. "
        f"Market-optimized species like Winter Wheat, Canola, or Soybeans deliver strong economic "
        f"returns when moisture and temperature conditions are within acceptable agronomic thresholds. "
        f"Irrigation planning and variety selection should account for the current environmental readings."
    )


def _reason_legume(moisture_raw: float, moisture_level: str,
                   lst_celsius: float, heat_stress: str,
                   current_crop: str, climate_zone: str) -> str:
    predecessor_note = (
        f"Following {current_crop}, which is a nitrogen-depleting crop, "
        if current_crop in ("Corn", "Wheat", "Sorghum")
        else "Regardless of the previous crop, "
    )
    return (
        f"With a soil moisture index of {moisture_raw:.3f} ({moisture_level}) and "
        f"a surface temperature of {lst_celsius:.1f}°C ({heat_stress} heat stress) in this "
        f"{climate_zone} zone, nitrogen-fixing legumes are a biologically sound rotation option. "
        f"{predecessor_note}"
        f"introducing Clover, Vetch, or Field Peas will restore soil nitrogen and organic matter, "
        f"reducing fertiliser costs in the following season while improving long-term soil structure."
    )


# ---------------------------------------------------------------------------
# Vulnerability classifier
# ---------------------------------------------------------------------------

def _compute_vulnerability(moisture_level: str, heat_stress: str) -> str:
    if heat_stress == "critical" and moisture_level == "critical":
        return "Extreme Climate Stress"
    if heat_stress in ("high", "critical") and moisture_level in ("low", "critical"):
        return "High Heat & Drought Stress"
    if moisture_level in ("low", "critical"):
        return "High Water Stress"
    if heat_stress in ("high", "critical"):
        return "High Heat Stress"
    return "Moderate Conditions"


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------

def evaluate_field(lat: float, lon: float,
                   current_crop: str, priority: str) -> dict:
    """
    Evaluate a farm field and return ranked crop rotation strategies.

    Parameters
    ----------
    lat, lon      : WGS-84 coordinates
    current_crop  : Crop currently grown (e.g. "Corn")
    priority      : Farmer's priority — "Water", "Profit", or "Soil Health"

    Returns
    -------
    dict  Structured analysis with vulnerability assessment, climate data,
          and three ranked agronomic strategies.
    """
    logger.info("Evaluating field at (%.4f, %.4f) crop=%s priority=%s",
                lat, lon, current_crop, priority)

    # Step 1 — Fetch satellite data
    smap = fetch_smap_data(lat, lon)
    eco = fetch_ecostress_data(lat, lon)
    climate_zone = get_location_climate_zone(lat, lon)

    moisture_raw: float = smap["moisture_raw"]
    moisture_level: str = smap["moisture_level"]
    lst_celsius: float = eco["lst_celsius"]
    heat_stress: str = eco["heat_stress"]

    logger.info("SMAP moisture=%.4f (%s)  LST=%.1f°C (%s)  zone=%s",
                moisture_raw, moisture_level, lst_celsius, heat_stress, climate_zone)

    # Step 2 — Compute scores
    score_a = _score_drought_resilient(moisture_level, heat_stress, climate_zone, priority)
    score_b = _score_market_optimized(moisture_level, heat_stress, climate_zone, priority)
    score_c = _score_nitrogen_fixing(moisture_level, heat_stress, climate_zone, current_crop, priority)

    # Step 3 — Generate reasons
    reason_a = _reason_drought(moisture_raw, moisture_level, lst_celsius, heat_stress, climate_zone)
    reason_b = _reason_market(moisture_raw, moisture_level, lst_celsius, heat_stress, climate_zone)
    reason_c = _reason_legume(moisture_raw, moisture_level, lst_celsius, heat_stress, current_crop, climate_zone)

    # Step 4 — Vulnerability
    vulnerability = _compute_vulnerability(moisture_level, heat_stress)
    vulnerability_level = VULNERABILITY_MAP.get(vulnerability, "moderate")

    # Step 5 — Assemble strategies and sort
    strategies_raw = [
        {
            "id": STRATEGY_DROUGHT,
            "name": "Drought-Resilient Cover Crop",
            "example_crops": ["Sorghum-Sudan Grass", "Buckwheat", "Millet", "Cowpea"],
            "score": score_a,
            "reason": reason_a,
            "priority_tag": "Water Conservation",
        },
        {
            "id": STRATEGY_MARKET,
            "name": "Market-Optimized Cash Crop",
            "example_crops": ["Winter Wheat", "Canola", "Soybeans", "Sunflower"],
            "score": score_b,
            "reason": reason_b,
            "priority_tag": "Economic Yield",
        },
        {
            "id": STRATEGY_LEGUME,
            "name": "Nitrogen-Fixing Legume",
            "example_crops": ["Clover", "Vetch", "Field Peas", "Lentils"],
            "score": score_c,
            "reason": reason_c,
            "priority_tag": "Soil Health",
        },
    ]

    strategies_sorted = sorted(strategies_raw, key=lambda s: s["score"], reverse=True)
    for rank, strategy in enumerate(strategies_sorted, start=1):
        strategy["rank"] = rank

    data_sources = list({smap["source"], eco["source"]})

    return {
        "vulnerability": vulnerability,
        "vulnerability_level": vulnerability_level,
        "coordinates": {"lat": lat, "lon": lon},
        "climate_zone": climate_zone,
        "soil_moisture": {
            "raw": moisture_raw,
            "level": moisture_level,
        },
        "heat_stress": {
            "celsius": lst_celsius,
            "level": heat_stress,
        },
        "strategies": strategies_sorted,
        "data_sources": data_sources,
        "analysis_timestamp": datetime.now(timezone.utc).isoformat(),
    }
