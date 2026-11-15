from fastapi import FastAPI
from pydantic import BaseModel
from api.decision_engine import evaluate_field

app = FastAPI(title="TerraShift API")

class FieldRequest(BaseModel):
    lat: float
    lon: float
    current_crop: str
    priority: str

@app.post("/api/evaluate")
def evaluate(req: FieldRequest):
    return evaluate_field(req.lat, req.lon, req.current_crop, req.priority)
