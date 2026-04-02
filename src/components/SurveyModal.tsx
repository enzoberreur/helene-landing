import { useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

export type SurveyAnswers = {
  firstName?: string
  age?: string
  periodStatus?: string
}

interface Props {
  onComplete: (answers: SurveyAnswers) => void
  onSkip: () => void
}

export default function SurveyModal({ onComplete, onSkip }: Props) {
  const { t } = useTranslation()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<SurveyAnswers>({})
  const [animating, setAnimating] = useState(false)
  const [textValue, setTextValue] = useState('')
  const completed = useRef(false)

  const periodOptions = t('survey.periodOptions', { returnObjects: true }) as string[]

  const TOTAL = 3

  const advance = useCallback((field: keyof SurveyAnswers, value: string) => {
    if (completed.current) return
    const newAnswers = { ...answers, [field]: value }
    setAnswers(newAnswers)

    if (step < TOTAL - 1) {
      setAnimating(true)
      setTimeout(() => {
        setStep(s => s + 1)
        setTextValue('')
        setAnimating(false)
      }, 160)
    } else {
      completed.current = true
      onComplete(newAnswers)
    }
  }, [step, answers, onComplete])

  const handleTextSubmit = () => {
    const trimmed = textValue.trim()
    if (!trimmed) return
    if (step === 0) advance('firstName', trimmed)
    else if (step === 1) advance('age', trimmed)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-md p-8 relative"
        style={{ boxShadow: '0 32px 80px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.04)' }}
      >
        {/* Progress bar */}
        <div className="flex items-center gap-1.5 mb-8">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{ background: i <= step ? '#E83E73' : '#F3F4F6' }}
            />
          ))}
          <span className="text-xs font-medium ml-2 tabular-nums" style={{ color: '#9CA3AF', minWidth: '28px' }}>
            {step + 1}/{TOTAL}
          </span>
        </div>

        {/* Content */}
        <div
          style={{
            opacity: animating ? 0 : 1,
            transform: animating ? 'translateY(6px)' : 'translateY(0)',
            transition: 'opacity 160ms ease, transform 160ms ease',
          }}
        >
          {/* Step 0: First name */}
          {step === 0 && (
            <>
              <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug">
                {t('survey.nameQuestion')}
              </h3>
              <p className="text-sm text-gray-400 mb-5">{t('survey.nameHint')}</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={textValue}
                  onChange={e => setTextValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleTextSubmit()}
                  placeholder={t('survey.namePlaceholder')}
                  autoFocus
                  className="flex-1 px-5 py-3.5 rounded-2xl border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#E83E73] transition-all duration-150"
                  style={{ borderColor: '#E5E7EB' }}
                />
                <button
                  onClick={handleTextSubmit}
                  disabled={!textValue.trim()}
                  className="px-5 py-3.5 rounded-2xl text-sm font-semibold text-white transition-all duration-150 disabled:opacity-40"
                  style={{ background: '#E83E73' }}
                >
                  →
                </button>
              </div>
            </>
          )}

          {/* Step 1: Age */}
          {step === 1 && (
            <>
              <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug">
                {t('survey.ageQuestion')}
              </h3>
              <p className="text-sm text-gray-400 mb-5">{t('survey.ageHint')}</p>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={textValue}
                  onChange={e => setTextValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleTextSubmit()}
                  placeholder={t('survey.agePlaceholder')}
                  autoFocus
                  min="30"
                  max="70"
                  className="flex-1 px-5 py-3.5 rounded-2xl border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#E83E73] transition-all duration-150"
                  style={{ borderColor: '#E5E7EB' }}
                />
                <button
                  onClick={handleTextSubmit}
                  disabled={!textValue.trim()}
                  className="px-5 py-3.5 rounded-2xl text-sm font-semibold text-white transition-all duration-150 disabled:opacity-40"
                  style={{ background: '#E83E73' }}
                >
                  →
                </button>
              </div>
            </>
          )}

          {/* Step 2: Period status (maps to STRAW stages) */}
          {step === 2 && (
            <>
              <h3 className="text-lg font-bold text-gray-900 mb-5 leading-snug">
                {t('survey.periodQuestion')}
              </h3>
              <div className="flex flex-col gap-2.5">
                {periodOptions.map(option => (
                  <button
                    key={option}
                    onClick={() => advance('periodStatus', option)}
                    className="w-full text-left px-5 py-3.5 rounded-2xl border text-sm font-medium transition-all duration-150 active:scale-[0.99]"
                    style={{ borderColor: '#E5E7EB', color: '#374151' }}
                    onMouseEnter={e => {
                      ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#E83E73'
                      ;(e.currentTarget as HTMLButtonElement).style.color = '#E83E73'
                      ;(e.currentTarget as HTMLButtonElement).style.background = '#FDF0F4'
                    }}
                    onMouseLeave={e => {
                      ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#E5E7EB'
                      ;(e.currentTarget as HTMLButtonElement).style.color = '#374151'
                      ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Close — goes back to email form, does NOT submit */}
        <button
          onClick={onSkip}
          className="mt-6 w-full text-center text-xs transition-colors duration-150"
          style={{ color: '#D1D5DB' }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = '#9CA3AF')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = '#D1D5DB')}
        >
          {t('survey.close')}
        </button>
      </div>
    </div>
  )
}
