import { useState, useEffect, useRef, useCallback } from 'react'
import { theme } from '../theme'

interface BreathPhase { label: string; seconds: number; scale: number }
interface Exercise { name: string; tagline: string; detail: string; duration: string; fill: string; phases: BreathPhase[]; cycles: number }

const exercises: Exercise[] = [
  {
    name: 'Physiological Sigh', tagline: 'Fastest stress reset',
    detail: 'Two quick inhales through the nose, one long exhale. Shown by Stanford research to lower stress faster than any other technique.',
    duration: '1.5 min', fill: theme.lavenderFill,
    phases: [
      { label: 'Inhale', seconds: 3.5, scale: 1.5 },
      { label: '2nd inhale', seconds: 1.5, scale: 1.7 },
      { label: 'Long exhale', seconds: 8.0, scale: 1.0 },
    ],
    cycles: 4,
  },
  {
    name: 'Box Breathing', tagline: 'Focus & calm',
    detail: 'Equal counts of inhale, hold, exhale, hold. Balances the nervous system and sharpens focus.',
    duration: '5 min', fill: theme.peachFill,
    phases: [
      { label: 'Inhale', seconds: 4, scale: 1.5 },
      { label: 'Hold', seconds: 4, scale: 1.5 },
      { label: 'Exhale', seconds: 4, scale: 1.0 },
      { label: 'Hold', seconds: 4, scale: 1.0 },
    ],
    cycles: 5,
  },
  {
    name: '4-7-8 Breathing', tagline: 'Wind down for sleep',
    detail: 'Extended exhale activates the parasympathetic system. Ideal for winding down before bed.',
    duration: '5 min', fill: theme.mintFill,
    phases: [
      { label: 'Inhale', seconds: 4, scale: 1.5 },
      { label: 'Hold', seconds: 7, scale: 1.5 },
      { label: 'Exhale', seconds: 8, scale: 1.0 },
    ],
    cycles: 3,
  },
]

export default function CalmToolsView({ onClose }: { onClose: () => void }) {
  const [active, setActive] = useState<Exercise | null>(null)

  if (active) return <ActiveExercise exercise={active} onClose={() => setActive(null)} onDone={onClose} />

  return (
    <div className="flex flex-col flex-1 min-h-0 px-6" style={{ background: theme.background }}>
      <div style={{ height: 8 }} />

      <h2 className="text-3xl font-bold mb-2" style={{ color: theme.textPrimary }}>Calm tools</h2>
      <p className="text-sm mb-6 leading-relaxed" style={{ color: theme.textSecondary }}>
        Science-backed breathing exercises. Choose one and follow the guide — your body will do the rest.
      </p>

      <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto">
        {exercises.map((ex, i) => (
          <button key={i} onClick={() => setActive(ex)} className="text-left">
            <div className="rounded-3xl p-5 relative overflow-hidden" style={{ background: ex.fill, height: 148 }}>
              {/* Decorative circles */}
              <div className="absolute -top-8 -right-4 w-28 h-28 rounded-full border opacity-30" style={{ borderColor: 'rgba(255,255,255,0.5)' }} />
              <div className="absolute -top-12 right-3 w-16 h-16 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />

              <div className="flex justify-between items-start mb-auto">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.55)', color: theme.textSecondary }}>{ex.duration}</span>
                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.55)' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={theme.textPrimary} strokeWidth="3" strokeLinecap="round"><path d="M7 17L17 7M17 7H7M17 7v10" /></svg>
                </div>
              </div>
              <div className="absolute bottom-5 left-5">
                <p className="text-xl font-bold" style={{ color: theme.textPrimary }}>{ex.name}</p>
                <p className="text-sm" style={{ color: theme.textSecondary }}>{ex.tagline}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="pb-10 pt-4">
        <button onClick={onClose} className="w-full text-center text-sm" style={{ color: theme.textLight }}>Close</button>
      </div>
    </div>
  )
}

function ActiveExercise({ exercise, onClose, onDone }: { exercise: Exercise; onClose: () => void; onDone: () => void }) {
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [cycle, setCycle] = useState(1)
  const [countdown, setCountdown] = useState(exercise.phases[0].seconds)
  const [circleScale, setCircleScale] = useState(1.0)
  const [isComplete, setIsComplete] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const phase = exercise.phases[phaseIndex]

  const startPhase = useCallback((pIdx: number) => {
    const p = exercise.phases[pIdx]
    setCountdown(p.seconds)
    setCircleScale(p.scale)
  }, [exercise.phases])

  useEffect(() => {
    startPhase(0)
  }, [startPhase])

  useEffect(() => {
    if (isComplete) return
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 0.1) {
          // Advance
          const nextPhase = phaseIndex + 1
          if (nextPhase >= exercise.phases.length) {
            if (cycle >= exercise.cycles) {
              setIsComplete(true)
              if (timerRef.current) clearInterval(timerRef.current)
              return 0
            }
            setCycle(c => c + 1)
            setPhaseIndex(0)
            startPhase(0)
            return exercise.phases[0].seconds
          }
          setPhaseIndex(nextPhase)
          startPhase(nextPhase)
          return exercise.phases[nextPhase].seconds
        }
        return prev - 0.1
      })
    }, 100)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phaseIndex, cycle, isComplete, exercise, startPhase])

  if (isComplete) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center px-6" style={{ background: theme.background }}>
        <div className="relative mb-8">
          <div className="w-32 h-32 rounded-full flex items-center justify-center" style={{ background: `${exercise.fill}40` }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: exercise.fill }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={theme.textPrimary} strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
            </div>
          </div>
        </div>
        <h2 className="text-3xl font-bold mb-2" style={{ color: theme.textPrimary }}>Well done</h2>
        <p className="text-sm text-center leading-relaxed mb-12" style={{ color: theme.textSecondary }}>
          You completed {exercise.cycles} cycles of {exercise.name}.<br />Your nervous system thanks you.
        </p>
        <button onClick={onDone} className="w-full py-4 rounded-2xl text-white font-semibold" style={{ background: theme.dark }}>Done</button>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 px-6" style={{ background: theme.background }}>
      {/* Top bar */}
      <div className="flex items-center justify-between pt-5 mb-8">
        <div>
          <p className="text-base font-semibold" style={{ color: theme.textPrimary }}>{exercise.name}</p>
          <p className="text-xs" style={{ color: theme.textSecondary }}>Cycle {cycle} of {exercise.cycles}</p>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: theme.surface }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Breathing circle */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div
            className="absolute rounded-full transition-transform"
            style={{ width: 260, height: 260, background: `${exercise.fill}30`, transform: `scale(${circleScale * 0.88})`, transitionDuration: `${phase.seconds}s`, transitionTimingFunction: 'ease-in-out' }}
          />
          <div
            className="absolute rounded-full transition-transform"
            style={{ width: 230, height: 230, background: `${exercise.fill}59`, transform: `scale(${circleScale * 0.94})`, transitionDuration: `${phase.seconds}s`, transitionTimingFunction: 'ease-in-out' }}
          />
          <div
            className="rounded-full flex flex-col items-center justify-center transition-transform"
            style={{ width: 200, height: 200, background: exercise.fill, transform: `scale(${circleScale})`, transitionDuration: `${phase.seconds}s`, transitionTimingFunction: 'ease-in-out' }}
          >
            <p className="text-xl font-semibold" style={{ color: theme.textPrimary }}>{phase.label}</p>
            <p className="text-base font-medium mt-1" style={{ color: theme.textSecondary }}>{Math.ceil(countdown)}s</p>
          </div>
        </div>
      </div>

      {/* Phase dots */}
      <div className="flex items-center justify-center gap-2 mb-12">
        {exercise.phases.map((_, i) => (
          <div key={i} className="rounded-full transition-all" style={{
            width: i === phaseIndex ? 22 : 6, height: 6,
            background: i === phaseIndex ? theme.dark : theme.separator,
          }} />
        ))}
      </div>
    </div>
  )
}
