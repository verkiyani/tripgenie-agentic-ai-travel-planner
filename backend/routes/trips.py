"""
Trip API routes — POST /api/trips/generate
"""

from fastapi import APIRouter, HTTPException

from agents.orchestrator import generate_trip_plan
from schemas.trip import TripGenerateRequest, TripGenerateResponse

router = APIRouter(prefix="/api/trips", tags=["trips"])


@router.post("/generate", response_model=TripGenerateResponse)
def post_generate_trip(body: TripGenerateRequest):
    """
    Accept destination, budget, travelers, interests; return simulated agent plan.
    """
    try:
        return generate_trip_plan(body)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
