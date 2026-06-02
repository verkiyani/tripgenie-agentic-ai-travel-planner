"""
TripGenie chat service — calls OpenAI when configured, otherwise returns a safe fallback reply.
"""

from __future__ import annotations

import json
import logging
import os
from typing import Any, Optional

from dotenv import load_dotenv

# Load variables from backend/.env (or project root .env) for local development.
load_dotenv()

logger = logging.getLogger(__name__)

# Default model for capstone demos (cost-effective, capable for travel Q&A).
OPENAI_MODEL = os.getenv("OPENAI_CHAT_MODEL", "gpt-4o-mini")

SYSTEM_PROMPT = """You are TripGenie, a friendly and professional AI travel planning assistant.
Help the user with itinerary ideas, budgeting tips, transportation, dining, and pacing.
If trip_context is provided, use it to give specific, practical answers.
Keep replies concise (under about 200 words unless the user asks for detail).
Do not invent real booking confirmations or claim you booked anything — planning advice only."""


def _fallback_reply(message: str, trip_context: Optional[dict[str, Any]], reason: str) -> dict[str, str]:
    """
    Deterministic helpful response when OpenAI is unavailable (no key, API error, etc.).
    Still sounds like TripGenie so the UI remains demo-ready.
    """
    destination = "your destination"
    if trip_context and isinstance(trip_context, dict):
        summary = trip_context.get("trip_summary") or trip_context
        if isinstance(summary, dict) and summary.get("destination"):
            destination = summary["destination"]

    snippet = message.strip()[:120]
    reply = (
        f"I'm TripGenie (offline assistant mode). I couldn't reach the live AI model ({reason}), "
        f"but I can still help with {destination}. "
        f"You asked: \"{snippet}{'…' if len(message) > 120 else ''}\" — "
        "Try grouping sights by neighborhood, leaving buffer time between activities, and "
        "checking transit or walking times. Add OPENAI_API_KEY to backend/.env for full AI answers."
    )
    return {"reply": reply, "source": "fallback", "status": "degraded"}


def _trip_context_prompt_block(trip_context: dict[str, Any]) -> str:
    """Human-readable trip summary for the model (dashboard or nested trip_summary)."""
    summary = trip_context.get("trip_summary")
    if not isinstance(summary, dict):
        summary = trip_context
    lines: list[str] = []
    for label, key in (
        ("Destination", "destination"),
        ("Budget", "budget"),
        ("Interests", "interests"),
        ("Travelers", "travelers"),
    ):
        value = summary.get(key)
        if value is not None and value != "":
            lines.append(f"{label}: {value}")
    if lines:
        return "\n".join(lines)
    return json.dumps(trip_context, default=str)


def _call_openai(message: str, trip_context: Optional[dict[str, Any]]) -> str:
    """Invoke OpenAI Chat Completions API; raises on failure."""
    from openai import OpenAI

    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise ValueError("OPENAI_API_KEY is not set")

    client = OpenAI(api_key=api_key)

    user_text = message.strip()
    if trip_context:
        user_text += "\n\n---\nThe user's current trip:\n" + _trip_context_prompt_block(trip_context)

    completion = client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_text},
        ],
        temperature=0.7,
        max_tokens=500,
    )

    choice = completion.choices[0].message.content
    if not choice or not choice.strip():
        raise ValueError("Empty response from OpenAI")
    return choice.strip()


def generate_chat_reply(message: str, trip_context: Optional[dict[str, Any]] = None) -> dict[str, str]:
    """
    Main entry used by the /api/chat route.
    Returns dict with keys: reply, source, status.
    """
    if not message or not message.strip():
        return {
            "reply": "Please send a non-empty message so I can help with your trip.",
            "source": "fallback",
            "status": "ok",
        }

    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        logger.info("OPENAI_API_KEY missing; using fallback chat response")
        return _fallback_reply(message, trip_context, "API key not configured")

    try:
        reply_text = _call_openai(message, trip_context)
        return {"reply": reply_text, "source": "openai", "status": "ok"}
    except Exception as exc:  # noqa: BLE001 — capstone-safe degrade path
        logger.exception("OpenAI chat failed: %s", exc)
        return _fallback_reply(message, trip_context, "temporary service issue")
