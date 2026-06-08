"""
Specialist agents for POST /api/chat — deterministic orchestration before the final OpenAI reply.
"""

from __future__ import annotations

import re
from typing import Any, Optional


def _trip_fields(trip_context: Optional[dict[str, Any]]) -> dict[str, Any]:
    if not trip_context or not isinstance(trip_context, dict):
        return {}
    summary = trip_context.get("trip_summary")
    if isinstance(summary, dict):
        return {**summary, **{k: v for k, v in trip_context.items() if k != "trip_summary"}}
    return trip_context


def activity_agent(message: str, trip_context: Optional[dict[str, Any]]) -> str:
    """Suggest activity types and venues aligned with interests and the user question."""
    fields = _trip_fields(trip_context)
    destination = fields.get("destination") or "the destination"
    interests = (fields.get("interests") or "sightseeing").strip()
    msg = (message or "").lower()

    focus: list[str] = []
    if any(w in msg for w in ("museum", "museums", "gallery", "art")):
        focus.append("museums and galleries")
    if any(w in msg for w in ("food", "restaurant", "dining", "seafood", "wine")):
        focus.append("dining and local food")
    if any(w in msg for w in ("park", "hike", "outdoor", "beach")):
        focus.append("outdoor experiences")
    if not focus:
        focus.append("top-rated experiences matching stated interests")

    return (
        f"Activity focus for {destination}: prioritize {', '.join(focus)}. "
        f"Anchor picks to interests ({interests}); cluster by neighborhood to reduce transit."
    )


def budget_agent(trip_context: Optional[dict[str, Any]]) -> str:
    """Budget pacing and allocation hints from trip context."""
    fields = _trip_fields(trip_context)
    if not fields:
        return "No budget context: remind user to set a trip budget when generating a plan."

    raw_budget = fields.get("budget")
    try:
        budget = float(raw_budget)
    except (TypeError, ValueError):
        budget = None

    travelers = fields.get("travelers") or "travelers"
    if budget is None:
        return f"Budget not specified for {travelers}; suggest rough daily caps and track meals vs activities."

    daily = max(1, int(budget / 3))
    return (
        f"Total budget ${budget:,.0f} for {travelers}. "
        f"Rough guide: ~${daily:,}/day for lodging, meals, local transit, and paid activities; "
        "leave ~10% buffer for taxes/tips and one splurge meal."
    )


def hotel_agent(message: str, trip_context: Optional[dict[str, Any]]) -> str:
    """Accommodation planning: area, budget fit, traveler needs (advice only)."""
    fields = _trip_fields(trip_context)
    destination = fields.get("destination") or "the destination"
    travelers = fields.get("travelers") or "travelers"
    msg = (message or "").lower()

    area_hint = "central or transit-friendly neighborhoods near main sights"
    if any(w in msg for w in ("quiet", "boutique", "luxury", "hostel", "airbnb")):
        area_hint = "match lodging style to what the user mentioned (comfort vs budget)"

    try:
        budget = float(fields.get("budget"))
        nightly = max(80, int((budget * 0.4) / 3))
        price_note = f"price-sensitive: aim near ~${nightly}/night lodging share of total budget"
    except (TypeError, ValueError):
        price_note = "price sensitivity unknown; suggest mid-range options with clear cancellation terms"

    return (
        f"Hotel planning for {destination} ({travelers}): prefer {area_hint}; {price_note}. "
        "Fit room type and beds to party size; planning advice only — no bookings claimed."
    )


def flight_agent(message: str, trip_context: Optional[dict[str, Any]]) -> str:
    """Flight and long-haul transport planning: timing, cost, constraints (advice only)."""
    fields = _trip_fields(trip_context)
    destination = fields.get("destination") or "the destination"
    msg = (message or "").lower()

    timing = "allow buffer on arrival day; avoid tight same-day activity stacks after landing"
    if any(w in msg for w in ("early", "red-eye", "late", "morning")):
        timing = "align flight times with user timing preferences and jet-lag recovery"

    try:
        budget = float(fields.get("budget"))
        flight_share = int(budget * 0.25)
        cost_note = f"rough flight/major transport cap ~${flight_share:,} within stated budget if applicable"
    except (TypeError, ValueError):
        cost_note = "compare fare windows and baggage fees; keep transport flexible until budget is set"

    return (
        f"Flight/transport note for {destination}: {timing}; {cost_note}. "
        "Check airport transfers and local transit; planning only — no tickets or bookings claimed."
    )


def itinerary_agent(message: str, trip_context: Optional[dict[str, Any]]) -> str:
    """Day-level pacing and sequencing hints from the question and trip context."""
    fields = _trip_fields(trip_context)
    destination = fields.get("destination") or "the destination"
    msg = message or ""

    day_match = re.search(r"\bday\s*(\d+)\b", msg, re.IGNORECASE)
    day_label = f"Day {day_match.group(1)}" if day_match else "each day"

    travelers = fields.get("travelers") or "the group"
    return (
        f"Itinerary note for {destination} ({day_label}): plan 2-4 anchors with buffer between stops; "
        f"match pace to {travelers}; morning for transit-heavy sights, afternoon for flexible interests, "
        "evening for dining."
    )


def orchestrator_agent(
    message: str, trip_context: Optional[dict[str, Any]]
) -> dict[str, str]:
    """Run specialist agents and return structured trace for the final LLM prompt."""
    activity_out = activity_agent(message, trip_context)
    budget_out = budget_agent(trip_context)
    itinerary_out = itinerary_agent(message, trip_context)
    hotel_out = hotel_agent(message, trip_context)
    flight_out = flight_agent(message, trip_context)

    orchestrator_summary = (
        "Orchestrator merged specialist outputs: "
        "activity, budget, itinerary, hotel (lodging fit), flight (timing & transport cost)."
    )

    return {
        "orchestrator": orchestrator_summary,
        "activity_agent": activity_out,
        "budget_agent": budget_out,
        "itinerary_agent": itinerary_out,
        "hotel_agent": hotel_out,
        "flight_agent": flight_out,
    }
