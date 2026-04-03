import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6
type Status = 'idle' | 'submitting' | 'success' | 'error' | 'expired'

export default function Survey() {
  const { t, i18n } = useTranslation()
  const [searchParams] = useSearchParams()
  const pageId = searchParams.get('id')
  const name = searchParams.get('name') ?? ''

  const [step, setStep] = useState<Step>(0)
  const [status, setStatus] = useState<Status>(pageId ? 'idle' : 'expired')
  const [animating, setAnimating] = useState(false)

  // Answers
  const [contraception, setContraception] = useState('')
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [doctorVisit, setDoctorVisit] = useState('')
  const [currentTools, setCurrentTools] = useState<string[]>([])
  const [goldenQuestion, setGoldenQuestion] = useState('')
  const [coDesign, setCoDesign] = useState('')
  const [location, setLocation] = useState('')

  const TOTAL = 7
  const isFr = i18n.language === 'fr'

  // Contraception options: use Notion values directly, display labels for FR
  const contraceptionOptions = t('survey2.contraceptionOptions', { returnObjects: true }) as string[]
  const contraceptionLabels = isFr
    ? (t('survey2.contraceptionLabels', { returnObjects: true }) as string[])
    : contraceptionOptions

  const symptomsOptions = t('survey2.symptomsOptions', { returnObjects: true }) as string[]

  // Doctor: for EN we display nice labels but map to Notion values; for FR we display FR labels and map via doctorNotionMap
  const doctorLabels = isFr
    ? (t('survey2.doctorLabels', { returnObjects: true }) as string[])
    : (t('survey2.doctorOptions', { returnObjects: true }) as string[])
  const doctorNotionMap = t('survey2.doctorNotionMap', { returnObjects: true }) as Record<string, string>

  const toolsOptions = t('survey2.toolsOptions', { returnObjects: true }) as string[]

  const coDesignLabels = isFr
    ? (t('survey2.coDesignLabels', { returnObjects: true }) as string[])
    : [
        "Yes, I'd love to test it and share feedback",
        "Yes, just let me try it when it's ready",
        "I'd prefer to wait for the final version",
      ]
  const coDesignNotionMap = t('survey2.coDesignNotionMap', { returnObjects: true }) as Record<string, string>

  // For EN, doctor display labels map to Notion keys
  const enDoctorNotionMap: Record<string, string> = {
    "No, I haven't": "No I have not",
    "Yes, but I didn't feel heard or understood": "Yes but did not feel heard",
    "Yes, and it was helpful": "Yes and it was helpful",
    "I'm not sure these are worth mentioning to a doctor": "Not sure worth mentioning",
  }

  const enCoDesignNotionMap: Record<string, string> = {
    "Yes, I'd love to test it and share feedback": "Yes test and feedback",
    "Yes, just let me try it when it's ready": "Yes just let me try it",
    "I'd prefer to wait for the final version": "Prefer to wait",
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const goTo = (next: Step) => {
    setAnimating(true)
    setTimeout(() => {
      setStep(next)
      setAnimating(false)
    }, 160)
  }

  const canAdvance = (): boolean => {
    switch (step) {
      case 0: return !!contraception
      case 1: return symptoms.length > 0
      case 2: return !!doctorVisit
      case 3: return currentTools.length > 0
      case 4: return goldenQuestion.trim().length > 0
      case 5: return !!coDesign
      case 6: return true // location is optional
      default: return false
    }
  }

  const handleSubmit = async () => {
    if (!pageId) return
    setStatus('submitting')

    // Map display values to Notion select keys
    const doctorNotionValue = isFr
      ? doctorNotionMap[doctorVisit] ?? doctorVisit
      : enDoctorNotionMap[doctorVisit] ?? doctorVisit

    const coDesignNotionValue = isFr
      ? coDesignNotionMap[coDesign] ?? coDesign
      : enCoDesignNotionMap[coDesign] ?? coDesign

    try {
      const res = await fetch('/api/waitlist', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId,
          contraception,
          symptoms: symptoms.join(', '),
          doctorVisit: doctorNotionValue,
          currentTools: currentTools.join(', '),
          goldenQuestion,
          coDesign: coDesignNotionValue,
          location,
        }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  const toggleMulti = (value: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(value) ? list.filter(v => v !== value) : [...list, value])
  }

  // --- Expired / Success / Error screens ---

  if (status === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#FAFAFA' }}>
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{t('survey2.expiredTitle')}</h1>
          <p className="text-gray-500">{t('survey2.expiredMessage')}</p>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#FAFAFA' }}>
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: '#FDF0F4' }}>
            <span className="text-2xl">💛</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{t('survey2.successTitle')}</h1>
          <p className="text-gray-500">{t('survey2.successMessage')}</p>
        </div>
      </div>
    )
  }

  // --- Main survey form ---

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FAFAFA' }}>
      {/* Header */}
      <div className="pt-12 pb-6 px-4 text-center">
        <img src="/images/logo.svg" alt="Hélène" className="h-8 mx-auto mb-8" />
        {name && (
          <p className="text-sm font-medium mb-1" style={{ color: '#E83E73' }}>
            {name},
          </p>
        )}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('survey2.pageTitle')}</h1>
        <p className="text-sm text-gray-400">{t('survey2.pageSubtitle')}</p>
      </div>

      {/* Progress */}
      <div className="max-w-lg mx-auto w-full px-6 mb-8">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{ background: i <= step ? '#E83E73' : '#E5E7EB' }}
            />
          ))}
          <span className="text-xs font-medium ml-2 tabular-nums" style={{ color: '#9CA3AF' }}>
            {step + 1}/{TOTAL}
          </span>
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-start justify-center px-4 pb-12">
        <div
          className="bg-white rounded-3xl w-full max-w-lg p-8"
          style={{ boxShadow: '0 32px 80px -12px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.04)' }}
        >
          <div
            style={{
              opacity: animating ? 0 : 1,
              transform: animating ? 'translateY(6px)' : 'translateY(0)',
              transition: 'opacity 160ms ease, transform 160ms ease',
            }}
          >
            {/* Step 0: Contraception */}
            {step === 0 && (
              <SingleSelect
                question={t('survey2.contraceptionQuestion')}
                options={contraceptionOptions}
                labels={contraceptionLabels}
                value={contraception}
                onChange={setContraception}
              />
            )}

            {/* Step 1: Symptoms */}
            {step === 1 && (
              <MultiSelect
                question={t('survey2.symptomsQuestion')}
                hint={t('survey2.symptomsHint')}
                options={symptomsOptions}
                values={symptoms}
                onToggle={(v) => toggleMulti(v, symptoms, setSymptoms)}
              />
            )}

            {/* Step 2: Doctor */}
            {step === 2 && (
              <SingleSelect
                question={t('survey2.doctorQuestion')}
                options={doctorLabels}
                labels={doctorLabels}
                value={doctorVisit}
                onChange={setDoctorVisit}
              />
            )}

            {/* Step 3: Current tools */}
            {step === 3 && (
              <MultiSelect
                question={t('survey2.toolsQuestion')}
                hint={t('survey2.toolsHint')}
                options={toolsOptions}
                values={currentTools}
                onToggle={(v) => toggleMulti(v, currentTools, setCurrentTools)}
              />
            )}

            {/* Step 4: Golden question */}
            {step === 4 && (
              <>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t('survey2.goldenQuestion')}</h3>
                <p className="text-sm text-gray-400 mb-5">{t('survey2.goldenHint')}</p>
                <textarea
                  value={goldenQuestion}
                  onChange={(e) => setGoldenQuestion(e.target.value)}
                  placeholder={t('survey2.goldenPlaceholder')}
                  rows={5}
                  autoFocus
                  className="w-full px-5 py-4 rounded-2xl border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#E83E73] transition-all duration-150 resize-none"
                  style={{ borderColor: '#E5E7EB' }}
                />
              </>
            )}

            {/* Step 5: Co-design */}
            {step === 5 && (
              <SingleSelect
                question={t('survey2.coDesignQuestion')}
                options={coDesignLabels}
                labels={coDesignLabels}
                value={coDesign}
                onChange={setCoDesign}
              />
            )}

            {/* Step 6: Location */}
            {step === 6 && (
              <>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t('survey2.locationQuestion')}</h3>
                <p className="text-sm text-gray-400 mb-5">{t('survey2.locationHint')}</p>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t('survey2.locationPlaceholder')}
                  autoFocus
                  className="w-full px-5 py-3.5 rounded-2xl border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#E83E73] transition-all duration-150"
                  style={{ borderColor: '#E5E7EB' }}
                />
              </>
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button
                onClick={() => goTo((step - 1) as Step)}
                className="px-6 py-3 rounded-2xl text-sm font-medium text-gray-500 border transition-all duration-150 hover:border-gray-400"
                style={{ borderColor: '#E5E7EB' }}
              >
                {t('survey2.back')}
              </button>
            )}
            {step < TOTAL - 1 ? (
              <button
                onClick={() => canAdvance() && goTo((step + 1) as Step)}
                disabled={!canAdvance()}
                className="flex-1 px-6 py-3 rounded-2xl text-sm font-semibold text-white transition-all duration-150 disabled:opacity-40"
                style={{ background: '#E83E73' }}
              >
                {t('survey2.next')}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={status === 'submitting'}
                className="flex-1 px-6 py-3 rounded-2xl text-sm font-semibold text-white transition-all duration-150 disabled:opacity-60"
                style={{ background: '#E83E73' }}
              >
                {status === 'submitting' ? t('survey2.submitting') : t('survey2.submit')}
              </button>
            )}
          </div>

          {status === 'error' && (
            <p className="text-sm text-red-500 text-center mt-4">{t('survey2.errorMessage')}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// --- Reusable sub-components ---

function SingleSelect({
  question,
  options,
  labels,
  value,
  onChange,
}: {
  question: string
  options: string[]
  labels: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <>
      <h3 className="text-lg font-bold text-gray-900 mb-5">{question}</h3>
      <div className="flex flex-col gap-2.5">
        {options.map((opt, i) => {
          const selected = value === (labels[i] ?? opt)
          return (
            <button
              key={opt}
              onClick={() => onChange(labels[i] ?? opt)}
              className="w-full text-left px-5 py-3.5 rounded-2xl border text-sm font-medium transition-all duration-150"
              style={{
                borderColor: selected ? '#E83E73' : '#E5E7EB',
                color: selected ? '#E83E73' : '#374151',
                background: selected ? '#FDF0F4' : 'transparent',
              }}
            >
              {labels[i] ?? opt}
            </button>
          )
        })}
      </div>
    </>
  )
}

function MultiSelect({
  question,
  hint,
  options,
  values,
  onToggle,
}: {
  question: string
  hint: string
  options: string[]
  values: string[]
  onToggle: (v: string) => void
}) {
  return (
    <>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{question}</h3>
      <p className="text-sm text-gray-400 mb-5">{hint}</p>
      <div className="flex flex-col gap-2.5">
        {options.map((opt) => {
          const selected = values.includes(opt)
          return (
            <button
              key={opt}
              onClick={() => onToggle(opt)}
              className="w-full text-left px-5 py-3.5 rounded-2xl border text-sm font-medium transition-all duration-150 flex items-center gap-3"
              style={{
                borderColor: selected ? '#E83E73' : '#E5E7EB',
                color: selected ? '#E83E73' : '#374151',
                background: selected ? '#FDF0F4' : 'transparent',
              }}
            >
              <span
                className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150"
                style={{
                  borderColor: selected ? '#E83E73' : '#D1D5DB',
                  background: selected ? '#E83E73' : 'transparent',
                }}
              >
                {selected && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              {opt}
            </button>
          )
        })}
      </div>
    </>
  )
}
