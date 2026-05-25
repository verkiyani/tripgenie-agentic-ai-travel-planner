"""
Pydantic schemas for POST /api/trips/generate (simplified capstone API).
"""

from typing import Any

from pydantic import BaseModel, Field


class TripGenerateRequest(BaseModel):
    """Minimal trip inputs from the client."""

    destination: str = Field(..., min_length=1, examples=["New York, USA"])
    budget: float = Field(..., gt=0, examples=[800])
    travelers: str = Field(..., examples=["1 Adult"])
    interests: str = Field(..., examples=["Museums, Local Food"])


class MockBookingConfirmation(BaseModel):
    """Simulated booking hold — no real provider integration."""

    provider_name: str
    confirmation_id: str
    status: str
    estimated_cost: float


class MockConfirmations(BaseModel):
    hotel_confirmation: MockBookingConfirmation
    flight_confirmation: MockBookingConfirmation
    transportation_confirmation: MockBookingConfirmation


class TripGenerateResponse(BaseModel):
    """Structured plan returned to the client."""

    trip_summary: dict[str, Any]
    itinerary: dict[str, list[dict[str, str]]]
    budget_breakdown: dict[str, Any]
    agent_steps: list[dict[str, str]]
    mock_confirmations: MockConfirmations
