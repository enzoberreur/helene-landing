import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { SurveyAnswers } from '../components/SurveyModal'
import { trackLanding } from '../analytics'

type Status = 'idle' | 'loading' | 'survey' | 'submitting' | 'success' | 'error'

export function useWaitlistForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const { i18n } = useTranslation()

  // Step 1: user enters email → open survey modal (no API call yet)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || status === 'loading' || status === 'survey' || status === 'success') return
    trackLanding.clickWaitlist()
    setStatus('survey')
  }

  // Step 2: survey completed → now submit everything to API
  const handleSurveyComplete = async (answers: SurveyAnswers) => {
    setStatus('submitting')

    try {
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          firstName: answers.firstName,
          age: answers.age,
          periodStatus: answers.periodStatus,
          locale: i18n.language,
          timestamp: new Date().toISOString(),
          source: window.location.href,
        }),
      })

      trackLanding.signupComplete()
      setStatus('success')
      setEmail('')
    } catch {
      setStatus('error')
      setEmail('')
    }
  }

  const handleSurveySkip = () => {
    // Reset back to idle — they must complete to sign up
    setStatus('idle')
  }

  const reset = () => {
    setStatus('idle')
    setEmail('')
  }

  return { email, setEmail, status, handleSubmit, handleSurveyComplete, handleSurveySkip, reset }
}
