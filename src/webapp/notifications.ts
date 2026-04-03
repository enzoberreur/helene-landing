// Register service worker and schedule daily reminders

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return
  try {
    await navigator.serviceWorker.register('/sw.js')
  } catch {
    // SW registration failed — not critical
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false

  const result = await Notification.requestPermission()
  return result === 'granted'
}

// Schedule a daily local notification reminder
// Since we can't use push without a server, we use a simple approach:
// check on each app open if we should show a reminder
export function checkDailyReminder() {
  const lastCheckIn = localStorage.getItem('helene_last_checkin_date')
  const today = new Date().toISOString().slice(0, 10)
  const lastReminder = localStorage.getItem('helene_last_reminder')

  // If already checked in today, or already reminded today, skip
  if (lastCheckIn === today || lastReminder === today) return

  // If it's after 6pm and no check-in today, show a gentle nudge
  const hour = new Date().getHours()
  if (hour >= 18 && Notification.permission === 'granted') {
    const messages = [
      "How was your day? A quick check-in keeps your picture complete.",
      "30 seconds to log how you feel. Your future self will thank you.",
      "You haven't checked in today. Even just a mood rating helps.",
      "Your body is telling a story. Let's capture today's chapter.",
    ]
    const msg = messages[Math.floor(Math.random() * messages.length)]

    new Notification('Hélène', {
      body: msg,
      icon: '/images/app-icon-180.png',
      tag: 'daily-reminder',
    })

    localStorage.setItem('helene_last_reminder', today)
  }
}

// Call this after a successful check-in
export function markCheckedInToday() {
  localStorage.setItem('helene_last_checkin_date', new Date().toISOString().slice(0, 10))
}
