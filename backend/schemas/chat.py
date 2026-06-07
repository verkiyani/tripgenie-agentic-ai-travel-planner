"""
Pydantic models for POST /api/chat — TripGenie AI travel assistant.
"""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """User message plus optional trip plan context from the dashboard."""

    message: str = Field(..., min_length=1, examples=["What museums should I visit on Day 2?"])
    trip_context: Optional[dict[str, Any]] = Field(
        default=None,
        description="Optional trip_summary, itinerary, budget, etc. from a generated plan",
    )
    conversation_history: Optional[List[Dict[str, str]]] = Field(
    default=None,
    description="Recent chat history for conversational memory",
    )


class AgentTrace(BaseModel):
    """Specialist agent outputs from chat orchestration (optional for clients)."""

    orchestrator: str
    activity_agent: str
    budget_agent: str
    itinerary_agent: str


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
    agent_trace: Optional[AgentTrace] = Field(
        default=None,
        description="Populated when specialist agents ran before the final reply",
    )
