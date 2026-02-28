import { useState } from 'react'

type Status = 'idle' | 'loading' | 'success' | 'error'

export function useWaitlistForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || status === 'loading' || status === 'success') return

    setStatus('loading')

    try {
      const url = import.meta.env.VITE_APPS_SCRIPT_URL

      if (!url) {
        // No URL configured yet — still show success in dev
        console.warn('[Waitlist] VITE_APPS_SCRIPT_URL is not set. Email not submitted.')
      } else {
        // POST with text/plain avoids CORS preflight.
        // mode: no-cors means the request reaches the server but we can't
        // read the response — we assume success (optimistic UI).
        await fetch(url, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({
            email,
            timestamp: new Date().toISOString(),
            source: window.location.href,
          }),
        })
      }

      setStatus('success')
      setEmail('')
    } catch {
      setStatus('error')
    }
  }

  const reset = () => {
    setStatus('idle')
    setEmail('')
  }

  return { email, setEmail, status, handleSubmit, reset }
}
