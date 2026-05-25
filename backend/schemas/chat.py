"""
Pydantic models for POST /api/chat — TripGenie AI travel assistant.
"""

from typing import Any, Optional

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """User message plus optional trip plan context from the dashboard."""

    message: str = Field(..., min_length=1, examples=["What museums should I visit on Day 2?"])
    trip_context: Optional[dict[str, Any]] = Field(
        default=None,
        description="Optional trip_summary, itinerary, budget, etc. from a generated plan",
    )


class ChatResponse(BaseModel):
    """Assistant reply and metadata for the frontend."""

    reply: str
    source: str = Field(
        ...,
        description='e.g. "openai" when the model answered, "fallback" when using local template',
    )
    status: str = Field(
        ...,
        description='e.g. "ok" on success, "degraded" when fallback was used after an error',
    )
