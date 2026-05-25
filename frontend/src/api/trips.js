/**
 * TripGenie API — POST /api/trips/generate (FastAPI, local dev).
 */
import axios from 'axios'

const API_BASE = 'http://127.0.0.1:8000'

/**
 * @param {{ destination: string, budget: number, travelers: string, interests: string }} payload
 * @returns {Promise<{ trip_summary, itinerary, budget_breakdown, agent_steps }>}
 */
export async function generateTripPlan(payload) {
  const { data } = await axios.post(`${API_BASE}/api/trips/generate`, payload, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 60000,
  })
  return data
}
