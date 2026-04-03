import { useState } from 'react'
import { theme } from '../theme'
import { useApp } from '../WebApp'
import { requestNotificationPermission } from '../notifications'

const STEPS = 9

export default function OnboardingView() {
  const { setProfile } = useApp()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({
    journeyStage: '', ageRange: '', symptoms: [] as string[],
    hrtStatus: '', exerciseFrequency: '', smokingStatus: 'never',
    alcoholFrequency: 'rarely', caffeineIntake: 'moderate',
    primaryGoal: '', medicalFollowUp: '', firstName: '',
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
    // Ask for notification permission after onboarding
    requestNotificationPermission()
  }

  const canContinue = (): boolean => {
    switch (step) {
      case 0: return !!answers.journeyStage
      case 1: return !!answers.ageRange
      case 2: return answers.symptoms.length > 0
      case 3: return !!answers.hrtStatus
      case 4: return !!answers.exerciseFrequency
      case 5: return true // habits are pre-filled
      case 6: return !!answers.primaryGoal
      case 7: return !!answers.medicalFollowUp
      case 8: return answers.firstName.trim().length > 0
      default: return false
    }
  }

  const OptionBtn = ({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3.5 rounded-2xl border text-sm font-medium transition-all"
      style={{
        borderColor: selected ? theme.rose : theme.separator,
        background: selected ? theme.lavenderFill : 'transparent',
        color: theme.textPrimary,
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
          <StepWrapper title="Where are you in your journey?" subtitle="This helps us personalise everything for you.">
            <div className="flex flex-col gap-2.5">
              <OptionBtn label="My periods are still regular" selected={answers.journeyStage === 'regular'} onClick={() => set('journeyStage', 'regular')} />
              <OptionBtn label="They've become irregular" selected={answers.journeyStage === 'irregular'} onClick={() => set('journeyStage', 'irregular')} />
              <OptionBtn label="They've stopped" selected={answers.journeyStage === 'post'} onClick={() => set('journeyStage', 'post')} />
              <OptionBtn label="I'm not sure" selected={answers.journeyStage === 'unsure'} onClick={() => set('journeyStage', 'unsure')} />
            </div>
          </StepWrapper>
        )}

        {step === 1 && (
          <StepWrapper title="What's your age range?" subtitle="Perimenopause affects different ages differently.">
            <div className="flex flex-col gap-2.5">
              {['Under 40', '40–44', '45–50', '51–55', '55+'].map((label, i) => {
                const val = ['under40', '40-44', '45-50', '51-55', '55+'][i]
                return <OptionBtn key={val} label={label} selected={answers.ageRange === val} onClick={() => set('ageRange', val)} />
              })}
            </div>
          </StepWrapper>
        )}

        {step === 2 && (
          <StepWrapper title="What symptoms have you noticed?" subtitle="Select all that apply.">
            <div className="grid grid-cols-2 gap-2">
              {['Sleep issues', 'Anxiety', 'Fatigue', 'Hot flashes', 'Brain fog', 'Mood swings', 'Weight changes', 'Joint pain', 'Low libido', 'Dryness'].map(s => (
                <ChipBtn key={s} label={s} selected={answers.symptoms.includes(s)} onClick={() => toggleSymptom(s)} />
              ))}
            </div>
          </StepWrapper>
        )}

        {step === 3 && (
          <StepWrapper title="Are you on any hormonal treatment?" subtitle="This helps us understand your situation.">
            <div className="flex flex-col gap-2.5">
              <OptionBtn label="No, nothing" selected={answers.hrtStatus === 'none'} onClick={() => set('hrtStatus', 'none')} />
              <OptionBtn label="Yes, HRT" selected={answers.hrtStatus === 'hrt'} onClick={() => set('hrtStatus', 'hrt')} />
              <OptionBtn label="Natural / herbal remedies" selected={answers.hrtStatus === 'natural'} onClick={() => set('hrtStatus', 'natural')} />
              <OptionBtn label="I'm considering it" selected={answers.hrtStatus === 'considering'} onClick={() => set('hrtStatus', 'considering')} />
            </div>
          </StepWrapper>
        )}

        {step === 4 && (
          <StepWrapper title="How often do you exercise?" subtitle="Movement can significantly impact symptoms.">
            <div className="flex flex-col gap-2.5">
              <OptionBtn label="Rarely" selected={answers.exerciseFrequency === 'rarely'} onClick={() => set('exerciseFrequency', 'rarely')} />
              <OptionBtn label="Sometimes (1-2x/week)" selected={answers.exerciseFrequency === 'sometimes'} onClick={() => set('exerciseFrequency', 'sometimes')} />
              <OptionBtn label="Regularly (3-4x/week)" selected={answers.exerciseFrequency === 'regularly'} onClick={() => set('exerciseFrequency', 'regularly')} />
              <OptionBtn label="Daily" selected={answers.exerciseFrequency === 'daily'} onClick={() => set('exerciseFrequency', 'daily')} />
            </div>
          </StepWrapper>
        )}

        {step === 5 && (
          <StepWrapper title="A few daily habits" subtitle="These can influence your symptoms — no judgment.">
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: theme.textLight }}>Smoking</p>
                <div className="flex gap-2">
                  {[['Never', 'never'], ['Former', 'former'], ['Current', 'current']].map(([l, v]) => (
                    <ChipBtn key={v} label={l} selected={answers.smokingStatus === v} onClick={() => set('smokingStatus', v)} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: theme.textLight }}>Alcohol</p>
                <div className="flex gap-2">
                  {[['Rarely', 'rarely'], ['Occasionally', 'occasionally'], ['Regularly', 'regularly']].map(([l, v]) => (
                    <ChipBtn key={v} label={l} selected={answers.alcoholFrequency === v} onClick={() => set('alcoholFrequency', v)} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: theme.textLight }}>Caffeine</p>
                <div className="flex gap-2">
                  {[['None', 'none'], ['Low', 'low'], ['Moderate', 'moderate'], ['High', 'high']].map(([l, v]) => (
                    <ChipBtn key={v} label={l} selected={answers.caffeineIntake === v} onClick={() => set('caffeineIntake', v)} />
                  ))}
                </div>
              </div>
            </div>
          </StepWrapper>
        )}

        {step === 6 && (
          <StepWrapper title="What matters most to you right now?" subtitle="We'll tailor your experience.">
            <div className="flex flex-col gap-2.5">
              <OptionBtn label="Understanding what's happening to me" selected={answers.primaryGoal === 'understand'} onClick={() => set('primaryGoal', 'understand')} />
              <OptionBtn label="Connecting with other women" selected={answers.primaryGoal === 'community'} onClick={() => set('primaryGoal', 'community')} />
              <OptionBtn label="Tracking my symptoms" selected={answers.primaryGoal === 'track'} onClick={() => set('primaryGoal', 'track')} />
              <OptionBtn label="Preparing for my doctor" selected={answers.primaryGoal === 'doctor'} onClick={() => set('primaryGoal', 'doctor')} />
            </div>
          </StepWrapper>
        )}

        {step === 7 && (
          <StepWrapper title="Do you have medical support?" subtitle="A doctor or specialist following your transition?">
            <div className="flex flex-col gap-2.5">
              <OptionBtn label="Yes, regularly" selected={answers.medicalFollowUp === 'yes'} onClick={() => set('medicalFollowUp', 'yes')} />
              <OptionBtn label="Sometimes" selected={answers.medicalFollowUp === 'sometimes'} onClick={() => set('medicalFollowUp', 'sometimes')} />
              <OptionBtn label="No" selected={answers.medicalFollowUp === 'no'} onClick={() => set('medicalFollowUp', 'no')} />
            </div>
          </StepWrapper>
        )}

        {step === 8 && (
          <StepWrapper title="What's your first name?" subtitle="So Hélène can talk to you like a person.">
            <input
              type="text"
              value={answers.firstName}
              onChange={e => set('firstName', e.target.value)}
              placeholder="Your first name"
              autoFocus
              className="w-full px-5 py-4 rounded-2xl text-lg focus:outline-none"
              style={{ background: theme.surface, color: theme.textPrimary, border: 'none' }}
            />
          </StepWrapper>
        )}
      </div>

      {/* Action button */}
      <div className="pb-10 pt-4">
        <button
          onClick={() => step === STEPS - 1 ? finish() : setStep(s => s + 1)}
          disabled={!canContinue()}
          className="w-full py-4 rounded-2xl text-white font-semibold transition-opacity disabled:opacity-30"
          style={{ background: theme.dark }}
        >
          {step === STEPS - 1 ? "Let's begin" : 'Continue'}
        </button>
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
