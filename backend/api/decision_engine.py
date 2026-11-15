from api.nasa_client import fetch_smap_data, fetch_ecostress_data

def evaluate_field(lat, lon, current_crop, priority):
    smap = fetch_smap_data(lat, lon)
    ecostress = fetch_ecostress_data(lat, lon)
    
    # Mocked logic for hackathon boilerplate
    return {
        "vulnerability": "High Water Stress",
        "strategies": [
            {"name": f"Current: {current_crop}", "score": 40, "reason": "High water demand."},
            {"name": "Drought-Resilient Cover Crop", "score": 85, "reason": "Improves soil retention."},
            {"name": "Market-Optimized Rotation", "score": 75, "reason": "Balances water use with local market demand."}
        ]
    }
