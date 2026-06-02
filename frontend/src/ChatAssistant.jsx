import { useEffect, useRef, useState } from 'react'
import { Bot, Loader2, Send, Sparkles, User } from 'lucide-react'
import ReactMarkdown from 'react-markdown'


function AgentTracePanel({ trace }) {
  if (!trace || typeof trace !== 'object') return null

  const rows = [
    ['Orchestrator', trace.orchestrator],
    ['Activity Agent', trace.activity_agent],
    ['Budget Agent', trace.budget_agent],
    ['Itinerary Agent', trace.itinerary_agent],
  ].filter(([, value]) => value != null && String(value).trim() !== '')

  if (rows.length === 0) return null

  return (
    <details className="rounded-xl border border-slate-200/80 bg-white/90 text-xs shadow-sm">
      <summary className="cursor-pointer list-none px-3 py-2 font-semibold text-slate-600 hover:text-slate-800 [&::-webkit-details-marker]:hidden">
        Agent Trace
      </summary>
      <dl className="px-3 pb-3 pt-1 space-y-2.5 border-t border-slate-100">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="font-semibold text-emerald-700">{label}</dt>
            <dd className="text-slate-600 mt-0.5 leading-relaxed">{value}</dd>
          </div>
        ))}
      </dl>
    </details>
  )
}

export default function ChatAssistant({ tripContext }) {
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

  const handleSend = async (e) => {
    e.preventDefault()
  
    const text = input.trim()
    if (!text || isWaiting) return
  
    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
    }
  
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsWaiting(true)
  
    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          trip_context: tripContext,
        }),
      })
  
      if (!response.ok) {
        throw new Error('Chat API failed')
      }
  
      const data = await response.json()
  
      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: data.reply || 'TripGenie could not generate a response.',
        ...(data.agent_trace ? { agentTrace: data.agent_trace } : {}),
      }
  
      setMessages((prev) => [...prev, assistantMsg])
    } catch (error) {
      console.error('Chat API error:', error)
  
      const errorMsg = {
        id: `assistant-error-${Date.now()}`,
        role: 'assistant',
        text: 'Sorry, TripGenie could not respond right now. Please try again.',
      }
  
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsWaiting(false)
    }
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
            <p className="text-sm text-slate-500">Travel planning help · connected to AI backend</p>
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 rounded-2xl border border-slate-200/80 bg-white shadow-sm flex flex-col overflow-hidden">
        {tripContext && (
          <div className="shrink-0 border-b border-emerald-100/80 bg-gradient-to-r from-emerald-50/90 to-teal-50/50 px-4 sm:px-5 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
              Current Trip
            </p>
            <p className="text-sm text-slate-700 mt-1 leading-snug">
              {[
                tripContext.destination,
                tripContext.budget != null && `$${Number(tripContext.budget).toLocaleString()}`,
                tripContext.interests,
                tripContext.travelers,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
        )}
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
              <div className={`max-w-[85%] flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-md'
                      : 'bg-slate-100 text-slate-800 rounded-tl-md border border-slate-100'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>
                {msg.role === 'assistant' && msg.agentTrace ? (
                  <AgentTracePanel trace={msg.agentTrace} />
                ) : null}
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
