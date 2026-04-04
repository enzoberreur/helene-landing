import { useState, useEffect } from 'react'

export function useWaitlistCount() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/waitlist-count')
      .then(r => r.json())
      .then((d: { count: number }) => setCount(d.count))
      .catch(() => setCount(140))
  }, [])

  const formatted = count !== null
    ? count.toLocaleString('fr-FR') + '+'
    : '...'

  return { count, formatted }
}
