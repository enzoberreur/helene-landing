import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { setLocale } from '../i18n'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'
  const { t, i18n } = useTranslation()
  const isFr = i18n.language === 'fr'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const anchorHref = (hash: string) => (isHome ? hash : `/${hash}`)

  const toggleLang = () => setLocale(isFr ? 'en' : 'fr')

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-[0_1px_0_0_#f0f0f0]' : 'bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <img src="/images/logo.svg" alt="Helene" className="w-8 h-8 object-contain" />
          <span className="font-bold text-sm tracking-[0.18em] text-gray-900">HELENE</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          <a href={anchorHref('#features')} className="text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium">
            {t('nav.features')}
          </a>
          <a href={anchorHref('#community')} className="text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium">
            {t('nav.community')}
          </a>
          <Link
            to="/about"
            className={`text-sm font-medium transition-colors ${location.pathname === '/about' ? 'text-[#E83E73]' : 'text-gray-500 hover:text-gray-900'}`}
          >
            {t('nav.about')}
          </Link>
        </div>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-4">
          {/* Language toggle */}
          <button
            onClick={toggleLang}
            className="text-xs font-bold tracking-[0.12em] text-gray-400 hover:text-gray-700 transition-colors border border-gray-200 hover:border-gray-400 rounded-full px-3 py-1.5"
          >
            {t('lang.toggle')}
          </button>
          <a
            href={anchorHref('#waitlist')}
            className="inline-flex items-center bg-[#E83E73] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#d63566] transition-colors shadow-sm"
          >
            {t('nav.joinWaitlist')}
          </a>
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex flex-col items-center justify-center gap-[5px] w-9 h-9 -mr-1"
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-[1.5px] bg-gray-800 transition-all origin-center ${mobileOpen ? 'rotate-45 translate-y-[6.5px]' : ''}`} />
          <span className={`block w-5 h-[1.5px] bg-gray-800 transition-all ${mobileOpen ? 'opacity-0 scale-x-0' : ''}`} />
          <span className={`block w-5 h-[1.5px] bg-gray-800 transition-all origin-center ${mobileOpen ? '-rotate-45 -translate-y-[6.5px]' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-white border-t border-gray-100 px-6 pt-4 pb-6 flex flex-col gap-1">
          <a href={anchorHref('#features')} className="text-gray-700 font-medium py-2.5 text-sm border-b border-gray-50" onClick={() => setMobileOpen(false)}>
            {t('nav.features')}
          </a>
          <a href={anchorHref('#community')} className="text-gray-700 font-medium py-2.5 text-sm border-b border-gray-50" onClick={() => setMobileOpen(false)}>
            {t('nav.community')}
          </a>
          <Link to="/about" className="text-gray-700 font-medium py-2.5 text-sm border-b border-gray-50" onClick={() => setMobileOpen(false)}>
            {t('nav.about')}
          </Link>
          <div className="flex items-center gap-3 mt-3">
            <button onClick={toggleLang} className="text-xs font-bold tracking-[0.12em] text-gray-400 border border-gray-200 rounded-full px-3 py-1.5">
              {t('lang.toggle')}
            </button>
            <a href={anchorHref('#waitlist')} className="flex-1 bg-[#E83E73] text-white py-3 rounded-full text-sm font-semibold text-center" onClick={() => setMobileOpen(false)}>
              {t('nav.joinWaitlist')}
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}
