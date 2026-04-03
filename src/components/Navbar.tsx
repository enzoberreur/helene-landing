import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { t, i18n } = useTranslation()

  // Extract locale prefix from URL
  const lang = location.pathname.split('/')[1] === 'fr' ? 'fr' : (location.pathname.split('/')[1] === 'en' ? 'en' : i18n.language)
  const prefix = `/${lang}`
  const pathWithoutPrefix = location.pathname.replace(prefix, '')
  const isHome = pathWithoutPrefix === '/' || pathWithoutPrefix === ''

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const anchorHref = (hash: string) => isHome ? hash : `${prefix}/${hash}`

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-[0_1px_0_0_rgba(0,0,0,0.05)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 h-[72px] flex items-center justify-between">
        {/* Logo */}
        <Link to={`${prefix}/`} className="flex items-center gap-3 flex-shrink-0">
          <img
            src="/images/logo.svg"
            alt="Helene"
            className={`w-8 h-8 object-contain transition-all duration-500 ${
              scrolled ? '' : 'brightness-0 invert'
            }`}
          />
          <span
            className={`font-semibold text-[15px] tracking-[0.14em] transition-colors duration-500 ${
              scrolled ? 'text-gray-900' : 'text-white'
            }`}
          >
            HELENE
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-10">
          <a
            href={anchorHref('#features')}
            className={`text-[14px] transition-colors duration-300 font-normal ${
              scrolled ? 'text-gray-500 hover:text-gray-900' : 'text-white/70 hover:text-white'
            }`}
          >
            {t('nav.features')}
          </a>
          <a
            href={anchorHref('#community')}
            className={`text-[14px] transition-colors duration-300 font-normal ${
              scrolled ? 'text-gray-500 hover:text-gray-900' : 'text-white/70 hover:text-white'
            }`}
          >
            {t('nav.community')}
          </a>
          <Link
            to={`${prefix}/about`}
            className={`text-[14px] transition-colors duration-300 font-normal ${
              scrolled
                ? location.pathname.endsWith('/about') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
                : 'text-white/70 hover:text-white'
            }`}
          >
            {t('nav.about')}
          </Link>
        </div>

        {/* Desktop right */}
        <div className="hidden md:flex items-center">
          <a
            href={anchorHref('#waitlist')}
            className={`px-6 py-2.5 rounded-full text-[13px] font-semibold tracking-wide transition-all duration-300 ${
              scrolled
                ? 'bg-[#0A0A0A] text-white hover:bg-[#1a1a1a]'
                : 'bg-white text-[#0A0A0A] hover:bg-white/90'
            }`}
          >
            {t('nav.joinWaitlist')}
          </a>
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex flex-col items-center justify-center gap-[5px] w-9 h-9"
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-[1.5px] transition-all origin-center ${scrolled ? 'bg-gray-800' : 'bg-white'} ${mobileOpen ? 'rotate-45 translate-y-[6.5px]' : ''}`} />
          <span className={`block w-5 h-[1.5px] transition-all ${scrolled ? 'bg-gray-800' : 'bg-white'} ${mobileOpen ? 'opacity-0 scale-x-0' : ''}`} />
          <span className={`block w-5 h-[1.5px] transition-all origin-center ${scrolled ? 'bg-gray-800' : 'bg-white'} ${mobileOpen ? '-rotate-45 -translate-y-[6.5px]' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-white/95 backdrop-blur-xl border-t border-gray-100/50 px-6 pt-4 pb-6 flex flex-col gap-1">
          <a href={anchorHref('#features')} className="text-gray-700 font-normal py-3 text-[15px]" onClick={() => setMobileOpen(false)}>
            {t('nav.features')}
          </a>
          <a href={anchorHref('#community')} className="text-gray-700 font-normal py-3 text-[15px]" onClick={() => setMobileOpen(false)}>
            {t('nav.community')}
          </a>
          <Link to={`${prefix}/about`} className="text-gray-700 font-normal py-3 text-[15px]" onClick={() => setMobileOpen(false)}>
            {t('nav.about')}
          </Link>
          <div className="mt-3">
            <a href={anchorHref('#waitlist')} className="block bg-[#0A0A0A] text-white py-3 rounded-full text-[14px] font-semibold text-center" onClick={() => setMobileOpen(false)}>
              {t('nav.joinWaitlist')}
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}
