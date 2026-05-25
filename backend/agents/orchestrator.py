"""
Simulated agent orchestrator — runs a short pipeline and builds the API response.
No external APIs, database, or authentication.
"""

import hashlib

from schemas.trip import TripGenerateRequest


def _step(agent: str, message: str, status: str = "completed") -> dict[str, str]:
    return {"agent": agent, "status": status, "message": message}


def _confirmation_id(prefix: str, seed: str) -> str:
    """Deterministic simulated confirmation number for demos."""
    digest = hashlib.sha256(seed.encode()).hexdigest()[:8].upper()
    return f"TG-{prefix}-{digest}"


def _build_mock_confirmations(
    destination: str,
    hotel_cost: float,
    transport_cost: float,
    budget: float,
) -> dict:
    """
    Simulated booking confirmations (hotel, flight, local transportation).
    Costs align with budget breakdown where applicable; flight is a separate simulated fare.
    """
    city = destination.split(",")[0].strip()
    seed_base = f"{destination}|{budget}"

    flight_cost = round(min(budget * 0.35, budget - hotel_cost - transport_cost - 50), 2)
    if flight_cost < 50:
        flight_cost = round(budget * 0.25, 2)

    return {
        "hotel_confirmation": {
            "provider_name": f"StayFinder — {city}",
            "confirmation_id": _confirmation_id("HTL", seed_base + "|hotel"),
            "status": "confirmed",
            "estimated_cost": hotel_cost,
        },
        "flight_confirmation": {
            "provider_name": "SkyRoute Airlines (simulated)",
            "confirmation_id": _confirmation_id("FLT", seed_base + "|flight"),
            "status": "confirmed",
            "estimated_cost": flight_cost,
        },
        "transportation_confirmation": {
            "provider_name": "CityTransit Pass (simulated)",
            "confirmation_id": _confirmation_id("TRN", seed_base + "|transport"),
            "status": "confirmed",
            "estimated_cost": transport_cost,
        },
    }


def _build_itinerary(destination: str, interests: str) -> dict[str, list[dict[str, str]]]:
    """Simple 3-day template; NYC gets a richer demo schedule."""
    city = destination.split(",")[0].strip()
    is_nyc = "new york" in destination.lower()

    if is_nyc:
        return {
            "Day 1": [
                {"time": "09:00 AM", "title": "Arrival at JFK Airport"},
                {"time": "11:00 AM", "title": "Hotel check-in"},
                {"time": "01:00 PM", "title": "Lunch — local favorites"},
                {"time": "03:30 PM", "title": "The Metropolitan Museum of Art"},
                {"time": "07:00 PM", "title": "Dinner in Times Square"},
            ],
            "Day 2": [
                {"time": "10:00 AM", "title": f"Activities: {interests}"},
                {"time": "12:30 PM", "title": "Central Park & lunch"},
                {"time": "03:00 PM", "title": "MoMA visit"},
                {"time": "07:00 PM", "title": "Evening in Midtown"},
            ],
            "Day 3": [
                {"time": "09:00 AM", "title": "Brunch & souvenirs"},
                {"time": "11:30 AM", "title": "Hotel check-out"},
                {"time": "02:00 PM", "title": "Transfer to airport"},
                {"time": "05:00 PM", "title": "Departure"},
            ],
        }

    return {
        "Day 1": [
            {"time": "09:00 AM", "title": f"Arrive in {city}"},
            {"time": "12:00 PM", "title": "City orientation"},
            {"time": "03:00 PM", "title": f"Explore: {interests}"},
            {"time": "07:00 PM", "title": "Welcome dinner"},
        ],
        "Day 2": [
            {"time": "10:00 AM", "title": f"Highlights — {interests}"},
            {"time": "01:00 PM", "title": "Local lunch"},
            {"time": "04:00 PM", "title": "Free time / shopping"},
            {"time": "07:00 PM", "title": "Evening activity"},
        ],
        "Day 3": [
            {"time": "09:00 AM", "title": "Morning café"},
            {"time": "11:00 AM", "title": "Check-out"},
            {"time": "02:00 PM", "title": "Departure"},
        ],
    }


def generate_trip_plan(request: TripGenerateRequest) -> dict:
    """
    Orchestrator entry: validate input, simulate agents, return JSON payload.
    """
    destination = request.destination.strip()
    if not destination:
        raise ValueError("destination is required")

    steps: list[dict[str, str]] = []
    steps.append(_step("Orchestrator", "Received trip preferences.", "running"))

    # Destination Agent (simulated validation)
    normalized = destination if "," in destination else f"{destination}, USA"
    steps.append(_step("Destination Agent", f"Validated destination: {normalized}."))

    # Itinerary Agent (simulated generation)
    itinerary = _build_itinerary(normalized, request.interests)
    steps.append(
        _step(
            "Itinerary Agent",
            f"Built {len(itinerary)}-day itinerary aligned with interests: {request.interests}.",
        )
    )

    # Budget Agent (simulated cost split — stays under user budget)
    budget = float(request.budget)
    hotel = round(budget * 0.42, 2)
    transport = round(budget * 0.12, 2)
    meals = round(budget * 0.28, 2)
    activities = round(budget * 0.13, 2)
    total_cost = round(hotel + transport + meals + activities, 2)
    if total_cost > budget:
        scale = budget / total_cost
        hotel, transport, meals, activities = (
            round(hotel * scale, 2),
            round(transport * scale, 2),
            round(meals * scale, 2),
            round(activities * scale, 2),
        )
        total_cost = round(sum([hotel, transport, meals, activities]), 2)

    budget_breakdown = {
        "budget": budget,
        "total_cost": total_cost,
        "remaining": round(budget - total_cost, 2),
        "items": [
            {"category": "Accommodation", "amount": hotel},
            {"category": "Transportation", "amount": transport},
            {"category": "Meals", "amount": meals},
            {"category": "Activities", "amount": activities},
        ],
    }
    steps.append(
        _step(
            "Budget Agent",
            f"Estimated total ${total_cost} of ${budget} budget.",
        )
    )

    # Booking simulation — mock holds for hotel, flight, and transportation
    mock_confirmations = _build_mock_confirmations(normalized, hotel, transport, budget)
    steps.append(
        _step(
            "Booking Agent",
            "Simulated confirmations created for hotel, flight, and transportation.",
        )
    )

    steps.append(_step("Orchestrator", "Trip plan ready.", "completed"))

    trip_summary = {
        "destination": normalized,
        "budget": budget,
        "travelers": request.travelers,
        "interests": request.interests,
    }

    return {
        "trip_summary": trip_summary,
        "itinerary": itinerary,
        "budget_breakdown": budget_breakdown,
        "agent_steps": steps,
        "mock_confirmations": mock_confirmations,
    }
