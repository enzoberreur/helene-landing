import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="bg-white" style={{ borderTop: '1px solid #F0F0F0' }}>
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <a href="/" className="flex items-center gap-2.5">
          <img src="/images/logo.svg" alt="Helene" className="w-7 h-7 object-contain" />
          <span className="font-bold text-sm tracking-[0.18em] text-gray-900">HELENE</span>
        </a>
        <p className="text-xs text-gray-400">{t('footer.copyright')}</p>
      </div>
    </footer>
  )
}
