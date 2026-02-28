import { useState } from 'react'
import type { SurveyAnswers } from '../components/SurveyModal'

type Status = 'idle' | 'loading' | 'survey' | 'success' | 'error'

async function postToSheet(url: string | undefined, body: object) {
  if (!url) {
    console.warn('[Waitlist] VITE_APPS_SCRIPT_URL is not set. Data not submitted.')
    return
  }
  // POST with text/plain avoids CORS preflight.
  // mode: no-cors means we can't read the response — we assume success (optimistic UI).
  await fetch(url, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(body),
  })
}

export function useWaitlistForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || status === 'loading' || status === 'survey' || status === 'success') return

    setStatus('loading')

    try {
      await postToSheet(import.meta.env.VITE_APPS_SCRIPT_URL, {
        email,
        timestamp: new Date().toISOString(),
        source: window.location.href,
      })
      // Email saved — now show survey (don't clear email yet, needed for survey row)
      setStatus('survey')
    } catch {
      setStatus('error')
    }
  }

  const handleSurveyComplete = async (answers: SurveyAnswers) => {
    // Close modal immediately — prevents double submissions from rapid clicks
    setStatus('success')
    const savedEmail = email
    setEmail('')

    postToSheet(import.meta.env.VITE_APPS_SCRIPT_URL, {
      email: savedEmail,
      survey: true,
      timestamp: new Date().toISOString(),
      symptom: answers.q1,
      impact: answers.q2,
      need: answers.q3,
      wtp: answers.q4,
    }).catch(() => {
      // Survey failure is silent — email was already saved
    })
  }

  const handleSurveySkip = () => {
    setStatus('success')
    setEmail('')
  }

  const reset = () => {
    setStatus('idle')
    setEmail('')
  }

  return { email, setEmail, status, handleSubmit, handleSurveyComplete, handleSurveySkip, reset }
}
