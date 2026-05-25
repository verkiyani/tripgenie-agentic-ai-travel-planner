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
  CheckCircle2,
  Building2,
  Bus,
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
  destination: 'New York, USA',
  budget: 800,
  travelers: '1 Adult',
  interests: 'Museums, Local Food',
}

/** Static demo until the user generates a trip via the API */
const INITIAL_PLAN = {
  trip_summary: {
    destination: 'New York, USA',
    budget: 800,
    travelers: '1 Adult',
    interests: 'Museums, Local Food',
  },
  itinerary: {
    'Day 1': [
      { time: '09:00 AM', title: 'Arrival at JFK Airport' },
      { time: '11:00 AM', title: 'Hotel Check-in' },
      { time: '01:00 PM', title: 'Lunch at Local Restaurant' },
      { time: '03:30 PM', title: 'The Metropolitan Museum' },
      { time: '07:00 PM', title: 'Dinner in Times Square' },
    ],
    'Day 2': [
      { time: '09:30 AM', title: 'Central Park Walk' },
      { time: '12:00 PM', title: 'Lunch in Greenwich Village' },
      { time: '02:00 PM', title: 'MoMA Visit' },
      { time: '06:30 PM', title: 'Evening in Midtown' },
    ],
    'Day 3': [
      { time: '10:00 AM', title: 'Brooklyn Bridge & DUMBO' },
      { time: '01:00 PM', title: 'Local Food Tour' },
      { time: '04:00 PM', title: 'Statue of Liberty Ferry' },
      { time: '08:00 PM', title: 'Dinner — Little Italy' },
    ],
  },
  budget_breakdown: {
    budget: 800,
    total_cost: 760,
    remaining: 40,
    items: [
      { category: 'Accommodation', amount: 320 },
      { category: 'Transportation', amount: 96 },
      { category: 'Meals', amount: 224 },
      { category: 'Activities', amount: 120 },
    ],
  },
  agent_steps: [],
}

/** Single simulated booking block from API mock_confirmations */
function BookingBlock({ title, icon: Icon, booking }) {
  if (!booking) return null
  const statusClass =
    booking.status === 'confirmed'
      ? 'bg-emerald-100 text-emerald-800'
      : 'bg-slate-100 text-slate-700'

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-100 text-emerald-600">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold text-slate-900">{title}</span>
      </div>
      <dl className="space-y-2 text-sm">
        <div>
          <dt className="text-xs font-medium text-slate-500">Provider</dt>
          <dd className="text-slate-900">{booking.provider_name}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-slate-500">Confirmation ID</dt>
          <dd className="font-mono text-xs text-slate-800 break-all">{booking.confirmation_id}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-slate-500">Status</dt>
          <dd>
            <span className={`inline-block mt-0.5 text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${statusClass}`}>
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
      setPlan(data)
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

      <aside className="hidden lg:flex w-64 flex-col border-r border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2.5 px-5 py-6 border-b border-slate-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25">
            <Plane className="h-5 w-5" strokeWidth={2.25} />
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-900">TripGenie</p>
            <p className="text-xs text-slate-500">AI Travel Planner</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ id, label, icon: Icon, highlight, active }) => (
            <button
              key={id}
              type="button"
              onClick={id === 'new-trip' ? () => setModalOpen(true) : undefined}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                highlight
                  ? 'mt-1 mb-3 bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                  : active
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-90" size={18} />
              {label}
              {active && !highlight && <ChevronRight className="ml-auto h-4 w-4 text-emerald-600" />}
            </button>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 text-center">Connected to FastAPI</p>
        </div>
      </aside>

      <div className="lg:hidden fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <Plane className="h-4 w-4" />
          </div>
          <span className="font-bold text-slate-900">TripGenie</span>
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

          {plan.mock_confirmations && (
            <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-emerald-600" />
                Booking summary
              </h2>
              <p className="text-sm text-slate-500 mb-4">
                Simulated holds from the trip generation API — not real reservations.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          {plan.agent_steps?.length > 0 && (
            <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Bot className="h-5 w-5 text-emerald-600" />
                Agent workflow
              </h2>
              <ul className="space-y-3 max-h-56 overflow-y-auto">
                {plan.agent_steps.map((step, idx) => (
                  <li key={`${step.agent}-${idx}`} className="flex gap-3 text-sm border-l-2 border-emerald-200 pl-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-slate-800">{step.agent}</span>
                      <span className="text-slate-400 mx-1">·</span>
                      <span className="text-slate-500">{step.status}</span>
                      <p className="text-slate-600 mt-0.5">{step.message}</p>
                    </div>
                  </li>
                ))}
              </ul>
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
                TripGenie simulated agents built this plan for <strong>{summary.interests}</strong> within a{' '}
                <strong>${Math.round(budget)}</strong> budget for <strong>{summary.travelers}</strong>.
                Use <strong>New Trip</strong> to regenerate from the API.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
