import { useState } from 'react'
import { theme } from '../theme'
import { useApp } from '../WebApp'
import { useT } from '../i18n'
import { requestNotificationPermission } from '../notifications'
import { trackApp } from '../../analytics'

const STEPS = 9

export default function OnboardingView() {
  const t = useT()
  const { profile, setProfile } = useApp()
  const [step, setStep] = useState(0)

  // Pre-fill name from URL param (captured in WebApp) or profile
  const nameFromUrl = new URLSearchParams(window.location.search).get('name') ?? ''
  const prefillName = profile.firstName || nameFromUrl

  const [answers, setAnswers] = useState({
    journeyStage: '', ageRange: '', symptoms: [] as string[],
    hrtStatus: '', exerciseFrequency: '', smokingStatus: '',
    alcoholFrequency: '', caffeineIntake: '',
    primaryGoal: '', medicalFollowUp: '', firstName: prefillName,
  })

  const set = (key: string, value: string | string[]) =>
    setAnswers(prev => ({ ...prev, [key]: value }))

  const toggleSymptom = (s: string) =>
    setAnswers(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(s) ? prev.symptoms.filter(x => x !== s) : [...prev.symptoms, s]
    }))

  const finish = () => {
    setProfile(p => ({
      ...p,
      firstName: answers.firstName,
      journeyStage: answers.journeyStage,
      ageRange: answers.ageRange,
      selectedSymptoms: answers.symptoms,
      hrtStatus: answers.hrtStatus,
      exerciseFrequency: answers.exerciseFrequency,
      smokingStatus: answers.smokingStatus,
      alcoholFrequency: answers.alcoholFrequency,
      caffeineIntake: answers.caffeineIntake,
      primaryGoal: answers.primaryGoal,
      medicalFollowUp: answers.medicalFollowUp,
      onboardingComplete: true,
      accountCreatedAt: new Date().toISOString(),
    }))
    // Sync onboarding to Notion
    const email = profile.userEmail
    if (email) {
      fetch('/api/app-sync?action=onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, ...answers }),
      }).catch(() => {})
    }
    trackApp.onboardingComplete()
    requestNotificationPermission()
  }

  const canContinue = (): boolean => {
    switch (step) {
      case 0: return !!answers.journeyStage
      case 1: return !!answers.ageRange
      case 2: return answers.symptoms.length > 0
      case 3: return !!answers.hrtStatus
      case 4: return !!answers.exerciseFrequency
      case 5: return !!answers.smokingStatus && !!answers.alcoholFrequency && !!answers.caffeineIntake
      case 6: return !!answers.primaryGoal
      case 7: return !!answers.medicalFollowUp
      case 8: return answers.firstName.trim().length > 0
      default: return false
    }
  }

  const OptionBtn = ({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className="w-full text-left px-5 py-4 rounded-2xl text-sm font-medium transition-all"
      style={{
        background: selected ? theme.lavenderFill : theme.surface,
        color: theme.textPrimary,
        fontWeight: selected ? 600 : 400,
      }}
    >
      {label}
    </button>
  )

  const ChipBtn = ({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className="px-4 py-3 rounded-2xl text-sm font-medium transition-all"
      style={{
        background: selected ? theme.lavenderFill : theme.surface,
        color: theme.textPrimary,
      }}
    >
      {label}
    </button>
  )

  return (
    <div className="flex flex-col flex-1 px-6">
      {/* Progress */}
      <div className="flex items-center gap-1.5 mb-6">
        {Array.from({ length: STEPS }).map((_, i) => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all" style={{ background: i <= step ? theme.dark : theme.separator }} />
        ))}
        <span className="text-xs font-medium ml-2 tabular-nums" style={{ color: theme.textLight }}>{step + 1}/{STEPS}</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {step === 0 && (
          <StepWrapper title={t('onboard.journey')} subtitle={t('onboard.journey_sub')}>
            <div className="flex flex-col gap-2.5">
              <OptionBtn label={t('onboard.regular')} selected={answers.journeyStage === 'regular'} onClick={() => set('journeyStage', 'regular')} />
              <OptionBtn label={t('onboard.irregular')} selected={answers.journeyStage === 'irregular'} onClick={() => set('journeyStage', 'irregular')} />
              <OptionBtn label={t('onboard.post')} selected={answers.journeyStage === 'post'} onClick={() => set('journeyStage', 'post')} />
              <OptionBtn label={t('onboard.unsure')} selected={answers.journeyStage === 'unsure'} onClick={() => set('journeyStage', 'unsure')} />
            </div>
          </StepWrapper>
        )}

        {step === 1 && (
          <StepWrapper title={t('onboard.age')} subtitle={t('onboard.age_sub')}>
            <div className="flex flex-col gap-2.5">
              {['Under 40', '40–44', '45–50', '51–55', '55+'].map((label, i) => {
                const val = ['under40', '40-44', '45-50', '51-55', '55+'][i]
                return <OptionBtn key={val} label={label} selected={answers.ageRange === val} onClick={() => set('ageRange', val)} />
              })}
            </div>
          </StepWrapper>
        )}

        {step === 2 && (
          <StepWrapper title={t('onboard.symptoms')} subtitle={t('onboard.symptoms_sub')}>
            <div className="grid grid-cols-2 gap-2">
              {['sleep', 'anxiety', 'fatigue', 'hotflashes', 'brainfog', 'moodswings', 'weight', 'jointpain', 'libido', 'dryness'].map(s => (
                <ChipBtn key={s} label={t(`onboard.sym.${s}`)} selected={answers.symptoms.includes(s)} onClick={() => toggleSymptom(s)} />
              ))}
            </div>
          </StepWrapper>
        )}

        {step === 3 && (
          <StepWrapper title={t('onboard.hrt')} subtitle={t('onboard.hrt_sub')}>
            <div className="flex flex-col gap-2.5">
              <OptionBtn label={t('onboard.hrt.none')} selected={answers.hrtStatus === 'none'} onClick={() => set('hrtStatus', 'none')} />
              <OptionBtn label={t('onboard.hrt.yes')} selected={answers.hrtStatus === 'hrt'} onClick={() => set('hrtStatus', 'hrt')} />
              <OptionBtn label={t('onboard.hrt.natural')} selected={answers.hrtStatus === 'natural'} onClick={() => set('hrtStatus', 'natural')} />
              <OptionBtn label={t('onboard.hrt.considering')} selected={answers.hrtStatus === 'considering'} onClick={() => set('hrtStatus', 'considering')} />
            </div>
          </StepWrapper>
        )}

        {step === 4 && (
          <StepWrapper title={t('onboard.exercise')} subtitle={t('onboard.exercise_sub')}>
            <div className="flex flex-col gap-2.5">
              <OptionBtn label={t('onboard.ex.rarely')} selected={answers.exerciseFrequency === 'rarely'} onClick={() => set('exerciseFrequency', 'rarely')} />
              <OptionBtn label={t('onboard.ex.sometimes')} selected={answers.exerciseFrequency === 'sometimes'} onClick={() => set('exerciseFrequency', 'sometimes')} />
              <OptionBtn label={t('onboard.ex.regularly')} selected={answers.exerciseFrequency === 'regularly'} onClick={() => set('exerciseFrequency', 'regularly')} />
              <OptionBtn label={t('onboard.ex.daily')} selected={answers.exerciseFrequency === 'daily'} onClick={() => set('exerciseFrequency', 'daily')} />
            </div>
          </StepWrapper>
        )}

        {step === 5 && (
          <StepWrapper title={t('onboard.habits')} subtitle={t('onboard.habits_sub')}>
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: theme.textLight }}>{t('onboard.smoking')}</p>
                <div className="flex gap-2">
                  {['never', 'former', 'current'].map(v => (
                    <ChipBtn key={v} label={t(`onboard.h.${v}`)} selected={answers.smokingStatus === v} onClick={() => set('smokingStatus', v)} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: theme.textLight }}>{t('onboard.alcohol')}</p>
                <div className="flex gap-2">
                  {['rarely', 'occasionally', 'regularly'].map(v => (
                    <ChipBtn key={v} label={t(`onboard.h.${v}`)} selected={answers.alcoholFrequency === v} onClick={() => set('alcoholFrequency', v)} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: theme.textLight }}>{t('onboard.caffeine')}</p>
                <div className="flex gap-2">
                  {['none', 'low', 'moderate', 'high'].map(v => (
                    <ChipBtn key={v} label={t(`onboard.h.${v}`)} selected={answers.caffeineIntake === v} onClick={() => set('caffeineIntake', v)} />
                  ))}
                </div>
              </div>
            </div>
          </StepWrapper>
        )}

        {step === 6 && (
          <StepWrapper title={t('onboard.goal')} subtitle={t('onboard.goal_sub')}>
            <div className="flex flex-col gap-2.5">
              <OptionBtn label={t('onboard.goal.understand')} selected={answers.primaryGoal === 'understand'} onClick={() => set('primaryGoal', 'understand')} />
              <OptionBtn label={t('onboard.goal.community')} selected={answers.primaryGoal === 'community'} onClick={() => set('primaryGoal', 'community')} />
              <OptionBtn label={t('onboard.goal.track')} selected={answers.primaryGoal === 'track'} onClick={() => set('primaryGoal', 'track')} />
              <OptionBtn label={t('onboard.goal.doctor')} selected={answers.primaryGoal === 'doctor'} onClick={() => set('primaryGoal', 'doctor')} />
            </div>
          </StepWrapper>
        )}

        {step === 7 && (
          <StepWrapper title={t('onboard.medical')} subtitle={t('onboard.medical_sub')}>
            <div className="flex flex-col gap-2.5">
              <OptionBtn label={t('onboard.med.yes')} selected={answers.medicalFollowUp === 'yes'} onClick={() => set('medicalFollowUp', 'yes')} />
              <OptionBtn label={t('onboard.med.sometimes')} selected={answers.medicalFollowUp === 'sometimes'} onClick={() => set('medicalFollowUp', 'sometimes')} />
              <OptionBtn label={t('onboard.med.no')} selected={answers.medicalFollowUp === 'no'} onClick={() => set('medicalFollowUp', 'no')} />
            </div>
          </StepWrapper>
        )}

        {step === 8 && (
          <StepWrapper title={t('onboard.name')} subtitle={t('onboard.name_sub')}>
            <input
              type="text"
              value={answers.firstName}
              onChange={e => set('firstName', e.target.value)}
              placeholder={t('onboard.name_placeholder')}
              autoFocus
              className="w-full px-5 py-4 rounded-2xl text-lg focus:outline-none"
              style={{ background: theme.surface, color: theme.textPrimary, border: 'none' }}
            />
          </StepWrapper>
        )}
      </div>

      {/* Action buttons */}
      <div className="pb-10 pt-4">
        <button
          onClick={() => step === STEPS - 1 ? finish() : setStep(s => s + 1)}
          disabled={!canContinue()}
          className="w-full py-4 rounded-2xl text-white font-semibold transition-opacity disabled:opacity-30"
          style={{ background: theme.dark }}
        >
          {step === STEPS - 1 ? t('onboard.begin') : t('checkin.continue')}
        </button>
        {step > 0 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="w-full text-center mt-3 text-sm"
            style={{ color: theme.textLight }}
          >
            {t('common.back')}
          </button>
        )}
      </div>
    </div>
  )
}

function StepWrapper({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <>
      <h2 className="text-2xl font-bold mb-1" style={{ color: theme.textPrimary, lineHeight: 1.2 }}>{title}</h2>
      <p className="text-sm mb-6" style={{ color: theme.textSecondary }}>{subtitle}</p>
      {children}
    </>
  )
}
