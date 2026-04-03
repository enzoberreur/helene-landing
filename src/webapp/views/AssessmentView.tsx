import { useState } from 'react'
import { theme } from '../theme'
import { useApp } from '../WebApp'
import { useT } from '../i18n'
import { mrsScores } from '../types'
import type { MRSEntry } from '../types'
import { trackApp } from '../../analytics'

const questions = {
  somatic: [
    { key: 'hotFlashes', label: 'Hot flashes, sweating' },
    { key: 'heartDiscomfort', label: 'Heart discomfort (pounding, racing)' },
    { key: 'sleepProblems', label: 'Sleep problems' },
    { key: 'jointPain', label: 'Joint and muscular discomfort' },
  ],
  psychological: [
    { key: 'depressiveMood', label: 'Depressive mood' },
    { key: 'irritability', label: 'Irritability' },
    { key: 'anxiety', label: 'Anxiety' },
    { key: 'exhaustion', label: 'Physical and mental exhaustion' },
  ],
  urogenital: [
    { key: 'sexualProblems', label: 'Sexual problems' },
    { key: 'bladderProblems', label: 'Bladder problems' },
    { key: 'vaginalDryness', label: 'Vaginal dryness' },
  ],
}

const levels = ['None', 'Mild', 'Moderate', 'Severe', 'Very severe']

export default function AssessmentView({ onClose }: { onClose: () => void }) {
  const t = useT()
  const { addMRS } = useApp()
  const [step, setStep] = useState(0) // 0=intro, 1=somatic, 2=psych, 3=urogenital, 4=results
  const [answers, setAnswers] = useState<Record<string, number>>({})

  const setAnswer = (key: string, val: number) => setAnswers(prev => ({ ...prev, [key]: val }))

  const domainForStep = step === 1 ? 'somatic' : step === 2 ? 'psychological' : 'urogenital'
  const domainQuestions = step >= 1 && step <= 3 ? questions[domainForStep] : []
  const domainComplete = domainQuestions.every(q => answers[q.key] !== undefined)

  const save = () => {
    const entry: MRSEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      hotFlashes: answers.hotFlashes ?? 0,
      heartDiscomfort: answers.heartDiscomfort ?? 0,
      sleepProblems: answers.sleepProblems ?? 0,
      jointPain: answers.jointPain ?? 0,
      depressiveMood: answers.depressiveMood ?? 0,
      irritability: answers.irritability ?? 0,
      anxiety: answers.anxiety ?? 0,
      exhaustion: answers.exhaustion ?? 0,
      sexualProblems: answers.sexualProblems ?? 0,
      bladderProblems: answers.bladderProblems ?? 0,
      vaginalDryness: answers.vaginalDryness ?? 0,
    }
    addMRS(entry)
    const scores = mrsScores(entry)
    trackApp.mrsComplete(scores.total, scores.severity)
    setStep(4)
  }

  const resultEntry: MRSEntry | null = step === 4 ? {
    id: '', date: '',
    hotFlashes: answers.hotFlashes ?? 0, heartDiscomfort: answers.heartDiscomfort ?? 0,
    sleepProblems: answers.sleepProblems ?? 0, jointPain: answers.jointPain ?? 0,
    depressiveMood: answers.depressiveMood ?? 0, irritability: answers.irritability ?? 0,
    anxiety: answers.anxiety ?? 0, exhaustion: answers.exhaustion ?? 0,
    sexualProblems: answers.sexualProblems ?? 0, bladderProblems: answers.bladderProblems ?? 0,
    vaginalDryness: answers.vaginalDryness ?? 0,
  } : null

  const scores = resultEntry ? mrsScores(resultEntry) : null

  return (
    <div className="flex flex-col flex-1 min-h-0 px-6" style={{ background: theme.background }}>
      <div style={{ height: 8 }} />

      <div className="flex-1 min-h-0 overflow-y-auto">
        {step === 0 && (
          <>
            <h2 className="text-3xl font-bold mb-2" style={{ color: theme.textPrimary }}>Weekly<br />Assessment</h2>
            <p className="text-sm mb-6" style={{ color: theme.textSecondary }}>
              The MRS (Menopause Rating Scale) is a standardised tool used by specialists.
              11 questions, about 3–5 minutes.
            </p>
            <div className="rounded-3xl p-5" style={{ background: theme.surface }}>
              <p className="text-sm" style={{ color: theme.textPrimary }}>
                Rate each symptom based on <strong>the past week</strong>. Your score helps track
                changes over time and gives your doctor real data.
              </p>
            </div>
          </>
        )}

        {step >= 1 && step <= 3 && (
          <>
            <h2 className="text-2xl font-bold mb-1" style={{ color: theme.textPrimary }}>
              {step === 1 ? 'Somatic symptoms' : step === 2 ? 'Psychological symptoms' : 'Urogenital symptoms'}
            </h2>
            <p className="text-sm mb-6" style={{ color: theme.textSecondary }}>Rate each for the past week.</p>
            <div className="flex flex-col gap-5">
              {domainQuestions.map(q => (
                <div key={q.key}>
                  <p className="text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>{q.label}</p>
                  <div className="flex gap-1.5">
                    {levels.map((l, i) => (
                      <button
                        key={i}
                        onClick={() => setAnswer(q.key, i)}
                        className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
                        style={{
                          background: answers[q.key] === i ? theme.lavenderFill : theme.surface,
                          color: answers[q.key] === i ? theme.textPrimary : theme.textLight,
                        }}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {step === 4 && scores && (
          <>
            <h2 className="text-3xl font-bold mb-2" style={{ color: theme.textPrimary }}>Your results</h2>
            <div className="rounded-3xl p-5 mb-4" style={{ background: theme.surface }}>
              <p className="text-4xl font-bold mb-1" style={{ color: theme.textPrimary }}>{scores.total}</p>
              <p className="text-sm font-semibold" style={{ color: theme.rose }}>{scores.severity}</p>
              <p className="text-xs mt-2" style={{ color: theme.textSecondary }}>out of 44 possible</p>
            </div>
            <div className="flex flex-col gap-2">
              <ScoreBar label="Somatic" score={scores.somatic} max={16} fill={theme.peachFill} />
              <ScoreBar label="Psychological" score={scores.psychological} max={16} fill={theme.lavenderFill} />
              <ScoreBar label="Urogenital" score={scores.urogenital} max={12} fill={theme.mintFill} />
            </div>
          </>
        )}
      </div>

      <div className="pb-10 pt-4">
        {step === 4 ? (
          <button onClick={onClose} className="w-full py-4 rounded-2xl text-white font-semibold" style={{ background: theme.dark }}>
            {t('common.done')}
          </button>
        ) : (
          <button
            onClick={() => step === 3 ? save() : setStep(s => s + 1)}
            disabled={step >= 1 && step <= 3 && !domainComplete}
            className="w-full py-4 rounded-2xl text-white font-semibold transition-opacity disabled:opacity-30"
            style={{ background: theme.dark }}
          >
            {step === 0 ? 'Begin assessment' : step === 3 ? 'See results' : t('checkin.continue')}
          </button>
        )}
        {step > 0 && step < 4 && (
          <button onClick={() => setStep(s => s - 1)} className="w-full text-center mt-3 text-sm" style={{ color: theme.textLight }}>{t('common.back')}</button>
        )}
      </div>
    </div>
  )
}

function ScoreBar({ label, score, max, fill }: { label: string; score: number; max: number; fill: string }) {
  return (
    <div className="rounded-2xl p-3" style={{ background: theme.surface }}>
      <div className="flex justify-between mb-1.5">
        <span className="text-xs font-semibold" style={{ color: theme.textPrimary }}>{label}</span>
        <span className="text-xs font-semibold" style={{ color: theme.textSecondary }}>{score}/{max}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: theme.separator }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${(score / max) * 100}%`, background: fill }} />
      </div>
    </div>
  )
}
