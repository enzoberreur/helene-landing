import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import fr from './fr.json'

const SUPPORTED = ['en', 'fr'] as const
type Locale = (typeof SUPPORTED)[number]

// Resolve locale from URL path first, then browser language
function getInitialLocale(): Locale {
  const pathLang = window.location.pathname.split('/')[1]
  if (SUPPORTED.includes(pathLang as Locale)) return pathLang as Locale
  // No locale in URL — detect from browser
  return navigator.language.startsWith('fr') ? 'fr' : 'en'
}

export const initialLocale = getInitialLocale()

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: initialLocale,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export function setLocale(locale: Locale) {
  i18n.changeLanguage(locale)
}

export default i18n
