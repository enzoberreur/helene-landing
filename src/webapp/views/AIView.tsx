import { useState, useRef, useEffect } from 'react'
import { theme } from '../theme'
import { useApp } from '../WebApp'
import { mrsScores } from '../types'

export default function AIView() {
  const { chatMessages, addChatMessage, profile, checkIns, mrsEntries, treatments } = useApp()
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [chatMessages, isTyping])

  const quickActions = [
    "How am I doing this week?",
    "What patterns do you see?",
    "Help me prepare for my doctor",
    "I'm not feeling great today",
  ]

  const buildContext = () => ({
    firstName: profile.firstName,
    journeyStage: profile.journeyStage,
    ageRange: profile.ageRange,
    hrtStatus: profile.hrtStatus,
    selectedSymptoms: profile.selectedSymptoms,
    recentCheckIns: checkIns.slice(0, 7).map(e => ({
      date: e.date, mood: e.mood, symptoms: e.symptoms,
      sleepQuality: e.sleepQuality, energyLevel: e.energyLevel,
      stressLevel: e.stressLevel, note: e.note,
    })),
    latestMRS: mrsEntries[0] ? mrsScores(mrsEntries[0]) : null,
    treatments: treatments.slice(0, 5).map(t => ({ name: t.name, status: t.status, category: t.category })),
    chatHistory: chatMessages.slice(-10).map(m => ({ role: m.role, text: m.text })),
  })

  const send = async (text: string) => {
    if (!text.trim() || isTyping) return
    const userMsg = text.trim()
    setInput('')

    addChatMessage({ id: crypto.randomUUID(), role: 'user', text: userMsg, timestamp: new Date().toISOString() })
    setIsTyping(true)

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, context: buildContext() }),
      })

      if (res.ok) {
        const data = await res.json() as { text: string }
        addChatMessage({ id: crypto.randomUUID(), role: 'assistant', text: data.text, timestamp: new Date().toISOString() })
      } else {
        // Fallback to local response if API fails
        addChatMessage({ id: crypto.randomUUID(), role: 'assistant', text: generateFallback(userMsg), timestamp: new Date().toISOString() })
      }
    } catch {
      addChatMessage({ id: crypto.randomUUID(), role: 'assistant', text: generateFallback(userMsg), timestamp: new Date().toISOString() })
    } finally {
      setIsTyping(false)
    }
  }

  const generateFallback = (userMsg: string): string => {
    const lower = userMsg.toLowerCase()
    if (lower.includes('week') || lower.includes('doing')) {
      const recent = checkIns.slice(0, 7)
      if (!recent.length) return `You haven't logged any check-ins yet, ${profile.firstName}. Try checking in daily — even a quick mood log helps me spot patterns for you.`
      const avg = (recent.reduce((s, e) => s + e.mood, 0) / recent.length).toFixed(1)
      return `Your average mood this week has been ${avg}/5 across ${recent.length} check-ins, ${profile.firstName}. Keep logging — the more data I have, the better I can help you understand your patterns.`
    }
    if (lower.includes('doctor') || lower.includes('prepare')) {
      return `Great idea to prepare, ${profile.firstName}. Check out the Doctor Report on your home screen — it generates a full summary with your data, symptoms, and smart questions to bring to your appointment.`
    }
    if (lower.includes('not feeling') || lower.includes('bad') || lower.includes('hard')) {
      return `I hear you, ${profile.firstName}. Days like these are real and they matter. A few slow breaths can help — try the Calm Tools on your home screen. And remember: what you're feeling is physiological, not a personal failing.`
    }
    return `Thanks for sharing that, ${profile.firstName}. I'm here to help you make sense of what you're going through. You can ask me about your patterns, prepare for a doctor visit, or just talk about how you're feeling.`
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-6 pt-2 pb-3">
        <h1 className="text-2xl font-bold" style={{ color: theme.textPrimary }}>Hélène</h1>
        <p className="text-xs" style={{ color: theme.textSecondary }}>Your companion through the transition</p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6">
        {chatMessages.length === 0 && (
          <div className="mt-8" style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="rounded-3xl p-5 mb-4" style={{ background: theme.surface }}>
              <p className="text-sm font-semibold mb-1" style={{ color: theme.textPrimary }}>
                Hi{profile.firstName ? `, ${profile.firstName}` : ''}!
              </p>
              <p className="text-sm leading-relaxed" style={{ color: theme.textSecondary }}>
                I'm here to help you understand your patterns, prepare for doctor visits, or just listen.
                What's on your mind?
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {quickActions.map(q => (
                <button key={q} onClick={() => send(q)} className="text-left text-sm px-4 py-3 rounded-2xl transition-all active:scale-[0.98]"
                  style={{ background: theme.surface, color: theme.textPrimary }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {chatMessages.map(m => (
          <div key={m.id} className={`mb-3 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            style={{ animation: 'fadeIn 0.2s ease' }}>
            <div
              className="max-w-[85%] px-4 py-3 rounded-3xl text-sm whitespace-pre-wrap leading-relaxed"
              style={{
                background: m.role === 'user' ? theme.dark : theme.surface,
                color: m.role === 'user' ? '#fff' : theme.textPrimary,
                borderBottomRightRadius: m.role === 'user' ? 6 : 24,
                borderBottomLeftRadius: m.role === 'assistant' ? 6 : 24,
              }}
            >
              {m.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="mb-3 flex justify-start" style={{ animation: 'fadeIn 0.2s ease' }}>
            <div className="px-4 py-3 rounded-3xl text-sm" style={{ background: theme.surface, borderBottomLeftRadius: 6 }}>
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: theme.textLight, animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: theme.textLight, animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: theme.textLight, animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="px-6 pb-6 pt-2">
        <div className="flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send(input)}
            placeholder="Message Hélène..." disabled={isTyping}
            className="flex-1 px-4 py-3 rounded-2xl text-sm focus:outline-none disabled:opacity-50"
            style={{ background: theme.surface, color: theme.textPrimary }} />
          <button onClick={() => send(input)} disabled={!input.trim() || isTyping}
            className="px-4 py-3 rounded-2xl text-sm font-semibold text-white disabled:opacity-30"
            style={{ background: theme.dark }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" /></svg>
          </button>
        </div>
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  )
}
