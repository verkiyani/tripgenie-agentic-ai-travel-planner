import { useEffect, useRef, useState } from 'react'
import { Bot, Loader2, Send, Sparkles, User } from 'lucide-react'

const THINKING_REPLY = 'TripGenie is thinking...'
const THINKING_DELAY_MS = 900

/**
 * Local-only chat UI (backend wiring comes later).
 */
export default function ChatAssistant() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Hi Sara! I\'m your TripGenie travel assistant. Ask about destinations, budgets, itineraries, or packing tips.',
    },
  ])
  const [input, setInput] = useState('')
  const [isWaiting, setIsWaiting] = useState(false)
  const listEndRef = useRef(null)

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isWaiting])

  const handleSend = (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || isWaiting) return

    const userMsg = { id: `user-${Date.now()}`, role: 'user', text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsWaiting(true)

    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: `assistant-${Date.now()}`, role: 'assistant', text: THINKING_REPLY },
      ])
      setIsWaiting(false)
    }, THINKING_DELAY_MS)
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] lg:h-[calc(100dvh-0px)] max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 lg:py-8">
      <header className="shrink-0 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Chat Assistant</h1>
            <p className="text-sm text-slate-500">Travel planning help · local demo mode</p>
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 rounded-2xl border border-slate-200/80 bg-white shadow-sm flex flex-col overflow-hidden">
        <ul className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => (
            <li
              key={msg.id}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  msg.role === 'user'
                    ? 'bg-slate-200 text-slate-600'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {msg.role === 'user' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-md'
                    : 'bg-slate-100 text-slate-800 rounded-tl-md border border-slate-100'
                }`}
              >
                {msg.text}
              </div>
            </li>
          ))}

          {isWaiting && (
            <li className="flex gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl rounded-tl-md bg-slate-100 border border-slate-100 px-4 py-3 flex items-center gap-2 text-sm text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                Waiting for TripGenie...
              </div>
            </li>
          )}
          <li ref={listEndRef} aria-hidden className="h-px" />
        </ul>

        <form
          onSubmit={handleSend}
          className="shrink-0 border-t border-slate-100 p-3 sm:p-4 bg-slate-50/80 flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your trip..."
            disabled={isWaiting}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isWaiting || !input.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isWaiting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  )
}
