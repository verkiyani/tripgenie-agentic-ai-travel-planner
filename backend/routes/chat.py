"""
Chat API — POST /api/chat for TripGenie AI travel assistant.
"""

from fastapi import APIRouter

from schemas.chat import ChatRequest, ChatResponse
from services.chat_service import generate_chat_reply

router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
def post_chat(body: ChatRequest):
    """
    Accept a user message and optional trip_context; return assistant reply.
    Uses OpenAI when OPENAI_API_KEY is set, otherwise a helpful fallback.
    """
    result = generate_chat_reply(body.message, body.trip_context)
    return result
