import { useState } from 'react'
import { theme } from '../theme'
import { useApp } from '../WebApp'
import { symptomsList, triggersList } from '../types'
import { markCheckedInToday } from '../notifications'

interface Props { existingEntryId: string | null; onClose: () => void }

// Generate a post-check-in insight based on historical data
function generateInsight(checkIns: Array<{ mood: number; symptoms: string[]; sleepQuality: number; stressLevel: number; date: string }>, currentMood: number, currentSymptoms: Set<string>, currentSleep: number): string | null {
  if (checkIns.length < 2) return null
  const recent = checkIns.slice(0, 14)

  // Sleep → symptom correlation
  const symptomsArr = Array.from(currentSymptoms)
  if (currentSleep > 0 && currentSleep <= 2 && symptomsArr.some(s => s === 'brainfog' || s === 'fatigue')) {
    const poorSleepDays = recent.filter(e => e.sleepQuality > 0 && e.sleepQuality <= 2)
    const fogOnPoorSleep = poorSleepDays.filter(e => e.symptoms.includes('brainfog') || e.symptoms.includes('fatigue'))
    if (poorSleepDays.length >= 2 && fogOnPoorSleep.length >= 2) {
      return `Brain fog and poor sleep appeared together in ${fogOnPoorSleep.length} of your last ${poorSleepDays.length} low-sleep days. There's a pattern here — sleep might be the lever.`
    }
  }

  // Mood trend
  const recentMoods = recent.slice(0, 7).map(e => e.mood)
  if (recentMoods.length >= 3) {
    const avg = recentMoods.reduce((s, m) => s + m, 0) / recentMoods.length
    if (currentMood >= 4 && avg < 3) return `Today is a good day — and that matters. Your average mood this week has been ${avg.toFixed(1)}/5. Hold onto what's working today.`
    if (currentMood <= 2 && avg >= 3.5) return `Tough day. Your average this week is ${avg.toFixed(1)}/5 — today is below your trend. Be gentle with yourself.`
  }

  // Top symptom frequency
  const symFreq: Record<string, number> = {}
  recent.forEach(e => e.symptoms.forEach(s => { symFreq[s] = (symFreq[s] || 0) + 1 }))
  const topSym = Object.entries(symFreq).sort((a, b) => b[1] - a[1])[0]
  if (topSym && topSym[1] >= 3) {
    const label = symptomsList.find(s => s.id === topSym[0])?.label ?? topSym[0]
    return `${label} has appeared in ${topSym[1]} of your last ${recent.length} check-ins. This is worth mentioning to your doctor.`
  }

  // Streak encouragement
  if (checkIns.length === 3) return "3 check-ins done. You're building a picture that no single appointment could capture."
  if (checkIns.length === 7) return "One full week of data. Patterns are starting to emerge — the insights tab is where the magic happens."
  if (checkIns.length === 14) return "14 check-ins. Your data is now clinically meaningful. The Doctor Report will have real substance."

  return null
}

export default function CheckInView({ existingEntryId, onClose }: Props) {
  const { checkIns, addCheckIn, updateCheckIn } = useApp()
  const existing = existingEntryId ? checkIns.find(e => e.id === existingEntryId) : null

  const [step, setStep] = useState(0)
  const [insightText, setInsightText] = useState<string | null>(null)
  const [mood, setMood] = useState<number | null>(existing?.mood ?? null)
  const [sleep, setSleep] = useState(existing?.sleepQuality ?? 0)
  const [energy, setEnergy] = useState(existing?.energyLevel ?? 0)
  const [stress, setStress] = useState(existing?.stressLevel ?? 0)
  const [symptoms, setSymptoms] = useState<Set<string>>(new Set(existing?.symptoms ?? []))
  const [customSymptoms, setCustomSymptoms] = useState<string[]>([])
  const [customInput, setCustomInput] = useState('')
  const [triggers, setTriggers] = useState<Set<string>>(new Set(existing?.triggers ?? []))
  const [note, setNote] = useState(existing?.note ?? '')

  const TOTAL = 5

  const toggleSymptom = (id: string) => {
    const next = new Set(symptoms)
    next.has(id) ? next.delete(id) : next.add(id)
    setSymptoms(next)
  }

  const toggleTrigger = (id: string) => {
    const next = new Set(triggers)
    next.has(id) ? next.delete(id) : next.add(id)
    setTriggers(next)
  }

  const addCustom = () => {
    const trimmed = customInput.trim()
    if (!trimmed || customSymptoms.includes(trimmed)) return
    setCustomSymptoms(prev => [...prev, trimmed])
    setSymptoms(prev => new Set(prev).add(trimmed))
    setCustomInput('')
  }

  const handleSave = () => {
    const data = {
      mood: mood ?? 3,
      symptoms: Array.from(symptoms),
      sleepQuality: sleep,
      energyLevel: energy,
      stressLevel: stress,
      triggers: Array.from(triggers),
      note,
    }

    if (existing) {
      updateCheckIn(existing.id, data)
      onClose()
    } else {
      addCheckIn({ id: crypto.randomUUID(), date: new Date().toISOString(), ...data })
      markCheckedInToday()
      // Show post-check-in insight
      const insight = generateInsight(checkIns, mood ?? 3, symptoms, sleep)
      if (insight) {
        setInsightText(insight)
      } else {
        onClose()
      }
    }
  }

  const canProceed = step === 0 ? mood !== null : true

  const moodOptions = [
    { icon: '☀️', level: 5, label: 'Great' },
    { icon: '🌤️', level: 4, label: 'Good' },
    { icon: '☁️', level: 3, label: 'Okay' },
    { icon: '🌧️', level: 2, label: 'Low' },
    { icon: '🌧️', level: 1, label: 'Hard' },
  ]

  // Post-check-in insight screen
  if (insightText) {
    return (
      <div className="flex flex-col flex-1 px-6 items-center justify-center" style={{ background: theme.background }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ background: theme.mintFill }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={theme.textPrimary} strokeWidth="2" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
        </div>
        <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: theme.textPrimary }}>Check-in saved</h2>
        <div className="rounded-3xl p-5 mb-8 w-full" style={{ background: theme.surface }}>
          <div className="flex items-start gap-3">
            <span className="text-lg mt-0.5">💡</span>
            <p className="text-sm leading-relaxed" style={{ color: theme.textPrimary }}>{insightText}</p>
          </div>
        </div>
        <button onClick={onClose} className="w-full py-4 rounded-2xl text-white font-semibold" style={{ background: theme.dark }}>
          Continue
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 px-6" style={{ background: theme.background }}>
      <div className="flex-shrink-0" style={{ height: 8 }} />

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5 mb-6">
        {Array.from({ length: TOTAL }).map((_, i) => (
          <div
            key={i}
            className="h-1.5 rounded-full transition-all"
            style={{
              width: i === step ? 20 : 6,
              background: i <= step ? theme.dark : theme.separator,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Step 0: Mood */}
        {step === 0 && (
          <>
            <h2 className="text-3xl font-bold mb-1" style={{ color: theme.textPrimary }}>How are you<br />feeling today?</h2>
            <p className="text-sm mb-10" style={{ color: theme.textSecondary }}>Be honest — this is just for you.</p>
            <div className="flex rounded-3xl p-4" style={{ background: theme.surface }}>
              {moodOptions.map(m => (
                <button
                  key={m.level}
                  onClick={() => setMood(m.level)}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center transition-all"
                    style={{
                      background: mood === m.level ? theme.lavenderFill : 'transparent',
                      transform: mood === m.level ? 'scale(1.1)' : 'scale(1)',
                    }}
                  >
                    <span className="text-2xl">{m.icon}</span>
                  </div>
                  <span className="text-xs" style={{
                    color: mood === m.level ? theme.textPrimary : theme.textLight,
                    fontWeight: mood === m.level ? 600 : 400,
                  }}>{m.label}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 1: Wellbeing */}
        {step === 1 && (
          <>
            <h2 className="text-3xl font-bold mb-1" style={{ color: theme.textPrimary }}>A little more<br />about today</h2>
            <p className="text-sm mb-8" style={{ color: theme.textSecondary }}>Optional — skip any row.</p>
            <div className="rounded-3xl overflow-hidden" style={{ background: theme.surface }}>
              <WellbeingRow label="Sleep" icon="🌙" hint="1 = poor · 5 = great" value={sleep} onChange={setSleep} fill={theme.lavenderFill} />
              <div className="mx-4" style={{ height: 1, background: theme.separator }} />
              <WellbeingRow label="Energy" icon="⚡" hint="1 = drained · 5 = high" value={energy} onChange={setEnergy} fill={theme.marigoldFill} />
              <div className="mx-4" style={{ height: 1, background: theme.separator }} />
              <WellbeingRow label="Stress" icon="💨" hint="1 = very high · 5 = calm" value={stress} onChange={setStress} fill={theme.sageFill} />
            </div>
          </>
        )}

        {/* Step 2: Symptoms */}
        {step === 2 && (
          <>
            <h2 className="text-3xl font-bold mb-1" style={{ color: theme.textPrimary }}>Any symptoms<br />today?</h2>
            <p className="text-sm mb-6" style={{ color: theme.textSecondary }}>Select all that apply, or add your own.</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {symptomsList.map(s => (
                <button
                  key={s.id}
                  onClick={() => toggleSymptom(s.id)}
                  className="flex items-center gap-2 px-3.5 py-3.5 rounded-2xl text-sm transition-all text-left"
                  style={{
                    background: symptoms.has(s.id) ? theme.lavenderFill : theme.surface,
                    color: theme.textPrimary,
                    fontWeight: symptoms.has(s.id) ? 600 : 400,
                  }}
                >
                  <span>{s.icon}</span> {s.label}
                </button>
              ))}
            </div>
            {customSymptoms.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {customSymptoms.map(s => (
                  <button key={s} onClick={() => toggleSymptom(s)}
                    className="text-xs font-medium px-3 py-2 rounded-full"
                    style={{ background: symptoms.has(s) ? theme.lavenderFill : theme.surface, color: theme.textPrimary }}>
                    {s} {symptoms.has(s) ? '✕' : '+'}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustom()}
                placeholder="Add your own symptom..."
                className="flex-1 px-4 py-3 rounded-2xl text-sm focus:outline-none"
                style={{ background: theme.surface, color: theme.textPrimary }}
              />
              {customInput.trim() && (
                <button onClick={addCustom} className="px-3 rounded-2xl" style={{ background: theme.surface }}>
                  <span style={{ color: theme.textPrimary }}>+</span>
                </button>
              )}
            </div>
          </>
        )}

        {/* Step 3: Triggers */}
        {step === 3 && (
          <>
            <h2 className="text-3xl font-bold mb-1" style={{ color: theme.textPrimary }}>What may have<br />influenced today?</h2>
            <p className="text-sm mb-6" style={{ color: theme.textSecondary }}>Optional — helps spot patterns.</p>
            <div className="grid grid-cols-2 gap-2">
              {triggersList.map(t => (
                <button
                  key={t.id}
                  onClick={() => toggleTrigger(t.id)}
                  className="flex items-center gap-2 px-3.5 py-3.5 rounded-2xl text-sm transition-all text-left"
                  style={{
                    background: triggers.has(t.id) ? theme.lavenderFill : theme.surface,
                    color: theme.textPrimary,
                    fontWeight: triggers.has(t.id) ? 600 : 400,
                  }}
                >
                  <span>{t.icon}</span> {t.label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 4: Note */}
        {step === 4 && (
          <>
            <h2 className="text-3xl font-bold mb-1" style={{ color: theme.textPrimary }}>Anything you'd<br />like to add?</h2>
            <p className="text-sm mb-6" style={{ color: theme.textSecondary }}>Optional — a few words or a lot more.</p>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="How was today?"
              rows={5}
              autoFocus
              className="w-full px-4 py-3 rounded-3xl text-sm focus:outline-none resize-none"
              style={{ background: theme.surface, color: theme.textPrimary }}
            />
          </>
        )}
      </div>

      {/* Action button */}
      <div className="pb-10 pt-4">
        <button
          onClick={() => step === TOTAL - 1 ? handleSave() : setStep(s => s + 1)}
          disabled={!canProceed}
          className="w-full py-4 rounded-2xl text-white font-semibold transition-opacity disabled:opacity-30"
          style={{ background: theme.dark }}
        >
          {step === TOTAL - 1 ? 'Save check-in' : 'Continue'}
        </button>
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} className="w-full text-center mt-3 text-sm" style={{ color: theme.textLight }}>
            Back
          </button>
        )}
      </div>
    </div>
  )
}

function WellbeingRow({ label, icon, hint, value, onChange, fill }: {
  label: string; icon: string; hint: string; value: number; onChange: (v: number) => void; fill: string
}) {
  return (
    <div className="flex items-center px-4 py-3.5">
      <div className="flex items-center gap-1.5 w-24">
        <span className="text-xs">{icon}</span>
        <div>
          <p className="text-sm font-semibold" style={{ color: theme.textPrimary }}>{label}</p>
          <p className="text-xs" style={{ color: theme.textLight }}>{hint}</p>
        </div>
      </div>
      <div className="flex-1 flex justify-end gap-1.5">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            onClick={() => onChange(value === n ? 0 : n)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all"
            style={{
              background: value === n ? fill : theme.background,
              color: value === n ? theme.textPrimary : theme.textLight,
              fontWeight: value === n ? 600 : 400,
            }}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}
