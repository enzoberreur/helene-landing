import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import fr from './fr.json'

// Resolve initial locale synchronously so first render is correct
function getInitialLocale(): 'en' | 'fr' {
  const saved = localStorage.getItem('helene_locale')
  if (saved === 'fr' || saved === 'en') return saved
  return navigator.language.startsWith('fr') ? 'fr' : 'en'
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: getInitialLocale(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

// After mount, override with country-based detection (Vercel edge)
export async function detectAndApplyLocale(): Promise<void> {
  if (localStorage.getItem('helene_locale')) return // user already has a preference
  try {
    const res = await fetch('/api/locale')
    if (!res.ok) return
    const { locale } = (await res.json()) as { locale: 'en' | 'fr' }
    if (locale !== i18n.language) {
      i18n.changeLanguage(locale)
    }
    localStorage.setItem('helene_locale', locale)
  } catch {
    // Silently fall back to browser language (already set)
  }
}

export function setLocale(locale: 'en' | 'fr') {
  i18n.changeLanguage(locale)
  localStorage.setItem('helene_locale', locale)
}

export default i18n
