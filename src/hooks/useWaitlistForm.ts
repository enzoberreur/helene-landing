import { useRef, useState } from 'react'
import type { SurveyAnswers } from '../components/SurveyModal'

type Status = 'idle' | 'loading' | 'survey' | 'success' | 'error'

export function useWaitlistForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const pageIdRef = useRef<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || status === 'loading' || status === 'survey' || status === 'success') return

    setStatus('loading')

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          timestamp: new Date().toISOString(),
          source: window.location.href,
        }),
      })

      const data = await res.json() as { pageId?: string }
      pageIdRef.current = data.pageId ?? null

      setStatus('survey')
    } catch {
      setStatus('error')
    }
  }

  const handleSurveyComplete = async (answers: SurveyAnswers) => {
    // Close modal immediately — prevents double submissions from rapid clicks
    setStatus('success')
    const pageId = pageIdRef.current
    setEmail('')
    pageIdRef.current = null

    fetch('/api/waitlist', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pageId,
        symptom: answers.q1,
        impact: answers.q2,
        need: answers.q3,
        wtp: answers.q4,
      }),
    }).catch(() => {
      // Survey failure is silent — email was already saved
    })
  }

  const handleSurveySkip = () => {
    setStatus('success')
    setEmail('')
    pageIdRef.current = null
  }

  const reset = () => {
    setStatus('idle')
    setEmail('')
    pageIdRef.current = null
  }

  return { email, setEmail, status, handleSubmit, handleSurveyComplete, handleSurveySkip, reset }
}
