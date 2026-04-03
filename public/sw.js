// Hélène Service Worker — daily check-in reminders

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

// Show notification
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {}
  event.waitUntil(
    self.registration.showNotification(data.title || 'Hélène', {
      body: data.body || 'How are you feeling today? Take 30 seconds to check in.',
      icon: '/images/app-icon-180.png',
      badge: '/images/app-icon-180.png',
      tag: 'daily-reminder',
      renotify: true,
      data: { url: '/app' },
    })
  )
})

// Open app on notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      const existing = clients.find((c) => c.url.includes('/app'))
      if (existing) return existing.focus()
      return self.clients.openWindow('/app')
    })
  )
})
