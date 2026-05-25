import { useMemo, useState } from 'react'
import {
  LayoutDashboard,
  Map,
  MessageCircle,
  Heart,
  CalendarCheck,
  Settings,
  Plus,
  Plane,
  MapPin,
  Wallet,
  Users,
  Sparkles,
  Clock,
  ChevronRight,
  Sparkle,
  X,
  Loader2,
  Bot,
  Building2,
  Bus,
  CheckCircle2,
} from 'lucide-react'
import { generateTripPlan } from './api/trips'
import './index.css'

const NAV_ITEMS = [
  { id: 'new-trip', label: 'New Trip', icon: Plus, highlight: true },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, active: true },
  { id: 'itinerary', label: 'Itinerary', icon: Map },
  { id: 'chat', label: 'Chat Assistant', icon: MessageCircle },
  { id: 'favorites', label: 'Favorites', icon: Heart },
  { id: 'bookings', label: 'Bookings', icon: CalendarCheck },
  { id: 'settings', label: 'Settings', icon: Settings },
]

const DEFAULT_FORM = {
  destination: 'San Francisco, CA',
  budget: 1200,
  travelers: '2 Adults',
  interests: 'Art, Seafood & Wine',
}

/** Sample plan shown before the first API generate */
const INITIAL_PLAN = {
  trip_summary: {
    destination: 'San Francisco, CA',
    budget: 1200,
    travelers: '2 Adults',
    interests: 'Art, Seafood & Wine',
  },
  itinerary: {
    'Day 1': [
      { time: '10:00 AM', title: 'Arrival at SFO — AirTrain to city' },
      { time: '12:30 PM', title: 'Check-in near Union Square' },
      { time: '02:00 PM', title: 'Ferry Building & waterfront lunch' },
      { time: '04:30 PM', title: 'SFMOMA visit' },
      { time: '07:30 PM', title: 'Dinner in North Beach' },
    ],
    'Day 2': [
      { time: '09:00 AM', title: 'Golden Gate Bridge viewpoints' },
      { time: '12:00 PM', title: 'Seafood lunch at Fisherman\'s Wharf' },
      { time: '03:00 PM', title: 'Exploratorium or Alcatraz cruise' },
      { time: '07:00 PM', title: 'Sunset at Lands End' },
    ],
    'Day 3': [
      { time: '10:00 AM', title: 'Mission District murals & café' },
      { time: '01:00 PM', title: 'Wine tasting — Sonoma day trip (optional)' },
      { time: '05:00 PM', title: 'Hotel check-out' },
      { time: '08:00 PM', title: 'Departure from SFO' },
    ],
  },
  budget_breakdown: {
    budget: 1200,
    total_cost: 1140,
    remaining: 60,
    items: [
      { category: 'Accommodation', amount: 504 },
      { category: 'Transportation', amount: 144 },
      { category: 'Meals', amount: 336 },
      { category: 'Activities', amount: 156 },
    ],
  },
  agent_steps: [],
}

/** Single simulated booking block from API mock_confirmations */
function BookingBlock({ title, icon: Icon, booking }) {
  if (!booking) return null
  const confirmed = booking.status === 'confirmed'

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
      <div className="flex items-start gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-700 ring-1 ring-emerald-100">
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
          <p className="text-sm font-semibold text-slate-900 mt-0.5 leading-snug">{booking.provider_name}</p>
        </div>
      </div>
      <dl className="space-y-3 text-sm flex-1">
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Confirmation ID</dt>
          <dd className="font-mono text-xs text-slate-800 break-all mt-1 bg-slate-50 rounded-md px-2 py-1.5 border border-slate-100">
            {booking.confirmation_id}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Status</dt>
          <dd className="mt-1">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                confirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {confirmed && <CheckCircle2 className="h-3.5 w-3.5" />}
              {booking.status}
            </span>
          </dd>
        </div>
      </dl>
    </div>
  )
}

function NewTripModal({ open, onClose, onSubmit, loading, form, setForm }) {
  if (!open) return null

  const setField = (field) => (e) => {
    const value = field === 'budget' ? Number(e.target.value) : e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-200"
        role="dialog"
        aria-labelledby="new-trip-title"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 id="new-trip-title" className="text-lg font-semibold text-slate-900">
            Plan a new trip
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          className="px-6 py-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit()
          }}
        >
          <label className="block">
            <span className="text-xs font-medium text-slate-500">Destination</span>
            <input
              required
              value={form.destination}
              onChange={setField('destination')}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-500">Budget ($)</span>
            <input
              required
              type="number"
              min={1}
              value={form.budget}
              onChange={setField('budget')}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-500">Travelers</span>
            <input
              required
              value={form.travelers}
              onChange={setField('travelers')}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-500">Interests</span>
            <input
              required
              value={form.interests}
              onChange={setField('interests')}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </label>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-60"
            >
              Generate trip
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function App() {
  const [plan, setPlan] = useState(INITIAL_PLAN)
  const [activeDay, setActiveDay] = useState('Day 1')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const days = useMemo(() => Object.keys(plan.itinerary ?? {}), [plan])
  const timeline = plan.itinerary?.[activeDay] ?? []
  const agentSteps = useMemo(() => {
    const steps = plan?.agent_steps
    return Array.isArray(steps) ? steps : []
  }, [plan])

  const summary = plan.trip_summary ?? {}
  const budgetData = plan.budget_breakdown ?? {}
  const totalCost = budgetData.total_cost ?? 0
  const budget = budgetData.budget ?? summary.budget ?? 0
  const remaining = budgetData.remaining ?? budget - totalCost
  const progress = budget > 0 ? Math.min(100, Math.round((totalCost / budget) * 100)) : 0

  const summaryCards = [
    { label: 'Destination', value: summary.destination, icon: MapPin },
    { label: 'Budget', value: `$${Number(budget).toLocaleString()}`, icon: Wallet },
    { label: 'Travelers', value: summary.travelers, icon: Users },
    { label: 'Interests', value: summary.interests, icon: Sparkles },
  ]

  const handleGenerate = async () => {
    setError(null)
    setLoading(true)
    setModalOpen(false)
    try {
      const data = await generateTripPlan({
        destination: form.destination,
        budget: Number(form.budget),
        travelers: form.travelers,
        interests: form.interests,
      })
      setPlan({
        ...data,
        agent_steps: Array.isArray(data?.agent_steps) ? data.agent_steps : [],
      })
      const firstDay = Object.keys(data.itinerary ?? {})[0]
      if (firstDay) setActiveDay(firstDay)
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(
        typeof detail === 'string'
          ? detail
          : 'Could not reach the API. Start the backend: uvicorn main:app --reload',
      )
      setModalOpen(true)
    } finally {
      setLoading(false)
    }
  }

  const cityLabel = summary.destination?.split(',')[0] ?? 'your destination'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      <NewTripModal
        open={modalOpen}
        onClose={() => !loading && setModalOpen(false)}
        onSubmit={handleGenerate}
        loading={loading}
        form={form}
        setForm={setForm}
      />

      <aside className="hidden lg:flex w-[17rem] shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
            <Plane className="h-5 w-5" strokeWidth={2.25} />
          </div>
          <div className="min-w-0 leading-tight">
            <p className="text-[17px] font-bold tracking-tight text-slate-900">TripGenie</p>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">AI Travel Planner</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-5 flex flex-col gap-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon, highlight, active }) => (
            <button
              key={id}
              type="button"
              onClick={id === 'new-trip' ? () => setModalOpen(true) : undefined}
              className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${
                highlight
                  ? 'mb-2 bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 hover:shadow'
                  : active
                    ? 'bg-emerald-50 text-emerald-900 ring-1 ring-emerald-100'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className="h-[18px] w-[18px] shrink-0 opacity-90" />
              <span className="truncate">{label}</span>
              {active && !highlight && <ChevronRight className="ml-auto h-4 w-4 text-emerald-600 shrink-0" />}
            </button>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-slate-100">
          <p className="text-[11px] text-slate-400 text-center font-medium">Capstone demo · Agentic planning</p>
        </div>
      </aside>

      <div className="lg:hidden fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <Plane className="h-4 w-4" strokeWidth={2.25} />
          </div>
          <div className="leading-tight">
            <span className="font-bold text-slate-900 text-sm">TripGenie</span>
            <p className="text-[10px] text-slate-500 font-medium">Travel Planner</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="text-sm font-medium text-emerald-600"
        >
          New Trip
        </button>
      </div>

      <main className="flex-1 min-w-0 overflow-y-auto pt-16 lg:pt-0 relative">
        {loading && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
            <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
            <p className="mt-4 text-base font-medium text-slate-800">
              TripGenie agents are planning your trip...
            </p>
          </div>
        )}

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-8">
          <header>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Hello, Sara!</h1>
            <p className="mt-1 text-slate-500 text-sm sm:text-base">
              Here&apos;s your trip overview for {cityLabel}.
            </p>
            {error && (
              <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
          </header>

          <section>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Trip summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {summaryCards.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2 text-emerald-600 mb-2">
                    <Icon className="h-4 w-4" />
                    <span className="text-xs font-medium text-slate-500">{label}</span>
                  </div>
                  <p className="text-base font-semibold text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          </section>

          {agentSteps.length > 0 && (
            <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-1 flex items-center gap-2">
                <Bot className="h-5 w-5 text-emerald-600" />
                Agent Activity
              </h2>
              <p className="text-sm text-slate-500 mb-5">Simulated multi-agent pipeline for this trip plan.</p>
              <ul className="space-y-4">
                {agentSteps.map((step, idx) => {
                  const done = step.status === 'completed'
                  return (
                    <li
                      key={`${step.agent}-${idx}`}
                      className="flex gap-3.5 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3.5 text-sm shadow-sm"
                    >
                      <CheckCircle2
                        className={`h-5 w-5 shrink-0 mt-0.5 ${done ? 'text-emerald-600' : 'text-slate-300'}`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-900">{step.agent}</p>
                          <span
                            className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                              done
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-50 text-amber-800'
                            }`}
                          >
                            {step.status}
                          </span>
                        </div>
                        {step.message ? (
                          <p className="text-sm text-slate-600 mt-2 leading-relaxed">{step.message}</p>
                        ) : null}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          {plan.mock_confirmations && (
            <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-1 flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-emerald-600" />
                Booking summary
              </h2>
              <p className="text-sm text-slate-500 mb-5">
                Simulated confirmations for hotel, flight, and local transportation.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <BookingBlock
                  title="Hotel"
                  icon={Building2}
                  booking={plan.mock_confirmations.hotel_confirmation}
                />
                <BookingBlock
                  title="Flight"
                  icon={Plane}
                  booking={plan.mock_confirmations.flight_confirmation}
                />
                <BookingBlock
                  title="Transportation"
                  icon={Bus}
                  booking={plan.mock_confirmations.transportation_confirmation}
                />
              </div>
            </section>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <section className="xl:col-span-1 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Sparkle className="h-5 w-5 text-emerald-600" />
                Budget breakdown
              </h2>
              <ul className="space-y-3">
                {(budgetData.items ?? []).map((item) => (
                  <li
                    key={item.category}
                    className="flex justify-between text-sm border-b border-slate-50 pb-2 last:border-0"
                  >
                    <span className="text-slate-600">{item.category}</span>
                    <span className="font-medium text-slate-900">${Math.round(item.amount)}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="xl:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Recommended itinerary</h2>
              <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-100 pb-4">
                {days.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setActiveDay(day)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeDay === day
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <ul className="relative space-y-0">
                {timeline.map((item, index) => (
                  <li key={`${item.time}-${item.title}`} className="relative flex gap-4 pb-8 last:pb-0">
                    {index < timeline.length - 1 && (
                      <span
                        className="absolute left-[11px] top-8 bottom-0 w-px bg-gradient-to-b from-emerald-200 to-slate-200"
                        aria-hidden
                      />
                    )}
                    <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 ring-4 ring-white">
                      <Clock className="h-3 w-3 text-emerald-700" />
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p className="text-xs font-semibold text-emerald-700 tabular-nums">{item.time}</p>
                      <p className="text-sm font-medium text-slate-900 mt-0.5">{item.title}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Estimated cost</h2>
              <div className="flex items-end justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm text-slate-500">Total cost</p>
                  <p className="text-3xl font-bold text-slate-900">${Math.round(totalCost)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Budget</p>
                  <p className="text-xl font-semibold text-slate-700">${Math.round(budget)}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-slate-600">
                  <span>{progress}% of budget used</span>
                  <span className="text-emerald-600">${Math.round(remaining)} remaining</span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50/80 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-emerald-900 mb-2 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-600" />
                Why this itinerary?
              </h2>
              <p className="text-sm text-emerald-900/90 leading-relaxed">
                This itinerary balances <strong>{summary.interests}</strong> with your{' '}
                <strong>${Math.round(budget).toLocaleString()}</strong> budget for{' '}
                <strong>{summary.travelers}</strong>. Agents optimized routing, spend, and pacing for{' '}
                <strong>{summary.destination}</strong>.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
