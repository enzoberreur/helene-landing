import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

/**
 * Syncs i18n language with the URL prefix (/fr/ or /en/).
 * Call this once inside the router context.
 */
export function useLocaleSync() {
  const { pathname } = useLocation()
  const { i18n } = useTranslation()

  useEffect(() => {
    const lang = pathname.split('/')[1]
    if ((lang === 'fr' || lang === 'en') && lang !== i18n.language) {
      i18n.changeLanguage(lang)
    }
  }, [pathname, i18n])
}
