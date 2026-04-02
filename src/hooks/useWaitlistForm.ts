import { useState } from 'react'
import type { SurveyAnswers } from '../components/SurveyModal'

type Status = 'idle' | 'loading' | 'survey' | 'submitting' | 'success' | 'error'

export function useWaitlistForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  // Step 1: user enters email → open survey modal (no API call yet)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || status === 'loading' || status === 'survey' || status === 'success') return
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
          timestamp: new Date().toISOString(),
          source: window.location.href,
        }),
      })

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
