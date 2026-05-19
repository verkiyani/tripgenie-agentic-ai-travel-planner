import { useState } from 'react'
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
  Calendar,
  Wallet,
  Users,
  Bus,
  Building2,
  Sparkles,
  Gauge,
  Leaf,
  Clock,
  ChevronRight,
  Sparkle,
} from 'lucide-react'
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

const TRIP_SUMMARY = [
  { label: 'Destination', value: 'New York, USA', icon: MapPin },
  { label: 'Dates', value: 'May 20 – May 23', icon: Calendar },
  { label: 'Budget', value: '$800', icon: Wallet },
  { label: 'Travelers', value: '1 Adult', icon: Users },
]

const PREFERENCES = [
  { label: 'Transportation', value: 'Public Transit', icon: Bus },
  { label: 'Accommodation', value: 'Budget Hotel', icon: Building2 },
  { label: 'Interests', value: 'Museums, Local Food', icon: Sparkles },
  { label: 'Pace', value: 'Moderate', icon: Gauge },
  { label: 'Special Requests', value: 'Vegetarian Food', icon: Leaf },
]

const DAYS = ['Day 1', 'Day 2', 'Day 3', 'Day 4']

const TIMELINE_BY_DAY = {
  'Day 1': [
    { time: '09:00 AM', title: 'Arrival at JFK Airport' },
    { time: '11:00 AM', title: 'Hotel Check-in' },
    { time: '01:00 PM', title: 'Lunch at Local Restaurant' },
    { time: '03:30 PM', title: 'The Metropolitan Museum' },
    { time: '07:00 PM', title: 'Dinner in Times Square' },
  ],
  'Day 2': [
    { time: '09:30 AM', title: 'Central Park Walk' },
    { time: '12:00 PM', title: 'Vegetarian Lunch — Greenwich Village' },
    { time: '02:00 PM', title: 'MoMA Visit' },
    { time: '06:30 PM', title: 'Broadway Show (optional)' },
  ],
  'Day 3': [
    { time: '10:00 AM', title: 'Brooklyn Bridge & DUMBO' },
    { time: '01:00 PM', title: 'Local Food Tour' },
    { time: '04:00 PM', title: 'Statue of Liberty Ferry' },
    { time: '08:00 PM', title: 'Dinner — Little Italy' },
  ],
  'Day 4': [
    { time: '09:00 AM', title: 'Brunch & Souvenirs' },
    { time: '11:30 AM', title: 'Hotel Check-out' },
    { time: '02:00 PM', title: 'Transfer to JFK' },
    { time: '05:00 PM', title: 'Departure' },
  ],
}

const TOTAL_COST = 760
const BUDGET = 800
const PROGRESS = Math.round((TOTAL_COST / BUDGET) * 100)

function App() {
  const [activeDay, setActiveDay] = useState('Day 1')
  const timeline = TIMELINE_BY_DAY[activeDay] ?? TIMELINE_BY_DAY['Day 1']

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar */}
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
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                highlight
                  ? 'mt-1 mb-3 bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                  : active
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`h-4.5 w-4.5 shrink-0 ${highlight ? '' : 'opacity-80'}`} size={18} />
              {label}
              {active && !highlight && (
                <ChevronRight className="ml-auto h-4 w-4 text-emerald-600" />
              )}
            </button>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 text-center">Presentation build · No backend</p>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <Plane className="h-4 w-4" />
          </div>
          <span className="font-bold text-slate-900">TripGenie</span>
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-y-auto pt-16 lg:pt-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-8">
          {/* Greeting */}
          <header>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Hello, Sara!
            </h1>
            <p className="mt-1 text-slate-500 text-sm sm:text-base">
              Here&apos;s your trip overview and AI-optimized itinerary for New York.
            </p>
          </header>

          {/* Trip summary cards */}
          <section>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Trip summary
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {TRIP_SUMMARY.map(({ label, value, icon: Icon }) => (
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

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Preferences */}
            <section className="xl:col-span-1 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Sparkle className="h-5 w-5 text-emerald-600" />
                Your preferences
              </h2>
              <ul className="space-y-4">
                {PREFERENCES.map(({ label, value, icon: Icon }) => (
                  <li key={label} className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-500">{label}</p>
                      <p className="text-sm font-medium text-slate-900">{value}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* Itinerary */}
            <section className="xl:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Recommended itinerary
              </h2>

              <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-100 pb-4">
                {DAYS.map((day) => (
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
            {/* Estimated cost */}
            <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Estimated cost</h2>
              <div className="flex items-end justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm text-slate-500">Total cost</p>
                  <p className="text-3xl font-bold text-slate-900">${TOTAL_COST}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Budget</p>
                  <p className="text-xl font-semibold text-slate-700">${BUDGET}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-slate-600">
                  <span>{PROGRESS}% of budget used</span>
                  <span className="text-emerald-600">${BUDGET - TOTAL_COST} remaining</span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                    style={{ width: `${PROGRESS}%` }}
                  />
                </div>
              </div>
            </section>

            {/* Why this itinerary */}
            <section className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50/80 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-emerald-900 mb-2 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-600" />
                Why this itinerary?
              </h2>
              <p className="text-sm text-emerald-900/90 leading-relaxed">
                This plan was optimized by TripGenie based on your <strong>budget</strong>,{' '}
                <strong>interests</strong> (museums and local food), and <strong>time preferences</strong>{' '}
                (moderate pace with public transit). Activities are clustered to reduce travel time,
                vegetarian dining options are prioritized, and estimated costs stay within your $800
                budget—leaving room for spontaneous experiences.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
