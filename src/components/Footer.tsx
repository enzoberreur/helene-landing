import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'

export default function Footer() {
  const { t, i18n } = useTranslation()
  const { pathname } = useLocation()
  const lang = pathname.split('/')[1] === 'fr' ? 'fr' : (pathname.split('/')[1] === 'en' ? 'en' : i18n.language)
  const prefix = `/${lang}`

  return (
    <footer className="border-t border-[#0A0A0A]/5">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <Link to={`${prefix}/`} className="flex items-center gap-3">
          <img src="/images/logo.svg" alt="Helene" className="w-7 h-7 object-contain" />
          <span className="font-semibold text-[13px] tracking-[0.14em] text-[#0A0A0A]">HELENE</span>
        </Link>

        <div className="flex items-center gap-8">
          <a href="#features" className="text-[13px] text-[#0A0A0A]/35 hover:text-[#0A0A0A]/60 transition-colors">
            {t('nav.features')}
          </a>
          <a href="#community" className="text-[13px] text-[#0A0A0A]/35 hover:text-[#0A0A0A]/60 transition-colors">
            {t('nav.community')}
          </a>
          <Link to={`${prefix}/about`} className="text-[13px] text-[#0A0A0A]/35 hover:text-[#0A0A0A]/60 transition-colors">
            {t('nav.about')}
          </Link>
        </div>

        <p className="text-[12px] text-[#0A0A0A]/30">{t('footer.copyright')}</p>
      </div>
    </footer>
  )
}
