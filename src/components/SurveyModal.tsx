import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export type SurveyAnswers = {
  q1?: string
  q2?: string
  q3?: string
  q4?: string
}

interface Props {
  onComplete: (answers: SurveyAnswers) => void
  onSkip: () => void
}

const TOTAL = 4

export default function SurveyModal({ onComplete, onSkip }: Props) {
  const { t } = useTranslation()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<SurveyAnswers>({})
  const [animating, setAnimating] = useState(false)
  const [showOtherInput, setShowOtherInput] = useState(false)
  const [otherValue, setOtherValue] = useState('')
  const otherInputRef = useRef<HTMLInputElement>(null)

  const questions = t('survey.questions', { returnObjects: true }) as Array<{
    question: string
    options: string[]
  }>

  const otherLabel = t('survey.other')
  const current = questions[step]
  const isOtherStep = step === 0

  useEffect(() => {
    if (showOtherInput) {
      otherInputRef.current?.focus()
    }
  }, [showOtherInput])

  const advance = (value: string) => {
    const key = `q${step + 1}` as keyof SurveyAnswers
    const newAnswers = { ...answers, [key]: value }
    setAnswers(newAnswers)

    if (step < TOTAL - 1) {
      setAnimating(true)
      setTimeout(() => {
        setStep(s => s + 1)
        setShowOtherInput(false)
        setOtherValue('')
        setAnimating(false)
      }, 160)
    } else {
      onComplete(newAnswers)
    }
  }

  const handleSelect = (option: string) => {
    if (isOtherStep && option === otherLabel) {
      setShowOtherInput(true)
      return
    }
    advance(option)
  }

  const handleOtherConfirm = () => {
    const trimmed = otherValue.trim()
    if (!trimmed) return
    advance(trimmed)
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

        {/* Question + options */}
        <div
          style={{
            opacity: animating ? 0 : 1,
            transform: animating ? 'translateY(6px)' : 'translateY(0)',
            transition: 'opacity 160ms ease, transform 160ms ease',
          }}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-5 leading-snug">
            {current?.question}
          </h3>

          <div className="flex flex-col gap-2.5">
            {current?.options.map((option) => {
              const isOther = isOtherStep && option === otherLabel
              const isSelected = isOther && showOtherInput

              return (
                <button
                  key={option}
                  onClick={() => handleSelect(option)}
                  className="w-full text-left px-5 py-3.5 rounded-2xl border text-sm font-medium transition-all duration-150 active:scale-[0.99]"
                  style={{
                    borderColor: isSelected ? '#E83E73' : '#E5E7EB',
                    color: isSelected ? '#E83E73' : '#374151',
                    background: isSelected ? '#FDF0F4' : 'transparent',
                  }}
                  onMouseEnter={e => {
                    if (isSelected) return
                    ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#E83E73'
                    ;(e.currentTarget as HTMLButtonElement).style.color = '#E83E73'
                    ;(e.currentTarget as HTMLButtonElement).style.background = '#FDF0F4'
                  }}
                  onMouseLeave={e => {
                    if (isSelected) return
                    ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#E5E7EB'
                    ;(e.currentTarget as HTMLButtonElement).style.color = '#374151'
                    ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                  }}
                >
                  {option}
                </button>
              )
            })}
          </div>

          {/* Other free-text input */}
          {showOtherInput && (
            <div className="mt-3 flex gap-2">
              <input
                ref={otherInputRef}
                type="text"
                value={otherValue}
                onChange={e => setOtherValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleOtherConfirm()}
                placeholder={t('survey.otherPlaceholder')}
                className="flex-1 px-4 py-3 rounded-2xl border text-sm text-gray-800 placeholder-gray-400 focus:outline-none transition-all duration-150"
                style={{ borderColor: '#E83E73', background: '#FDF0F4' }}
              />
              <button
                onClick={handleOtherConfirm}
                disabled={!otherValue.trim()}
                className="px-4 py-3 rounded-2xl text-sm font-semibold text-white transition-all duration-150 disabled:opacity-40"
                style={{ background: '#E83E73' }}
              >
                {t('survey.otherConfirm')}
              </button>
            </div>
          )}
        </div>

        {/* Skip */}
        <button
          onClick={onSkip}
          className="mt-6 w-full text-center text-xs transition-colors duration-150"
          style={{ color: '#D1D5DB' }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = '#9CA3AF')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = '#D1D5DB')}
        >
          {t('survey.skip')}
        </button>
      </div>
    </div>
  )
}
