import { useTranslation } from 'react-i18next'
import { useRef, useEffect } from 'react'
import { useWaitlistForm } from '../hooks/useWaitlistForm'
import { useWaitlistCount } from '../hooks/useWaitlistCount'
import SurveyModal from './SurveyModal'

export default function Hero() {
  const { t } = useTranslation()
  const { email, setEmail, status, handleSubmit, handleSurveyComplete, handleSurveySkip } = useWaitlistForm()
  const { formatted: waitlistCount } = useWaitlistCount()
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const handleEnded = () => { v.currentTime = 0; v.play() }
    v.addEventListener('ended', handleEnded)
    return () => v.removeEventListener('ended', handleEnded)
  }, [])

  return (
    <section id="hero" className="relative min-h-screen flex flex-col">
      {/* Full-screen looping video montage */}
      <div className="absolute inset-0 bg-black">
        <video
          ref={videoRef}
          src="/images/hero-montage.mp4"
          autoPlay muted loop playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-end pb-16 sm:pb-24 lg:pb-32 pt-[120px]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 w-full">
          <div className="max-w-2xl flex flex-col gap-6">
            <h1
              className="text-[2.5rem] sm:text-[3.5rem] lg:text-[4.5rem] text-white leading-[1.06] animate-fade-in-up"
              style={{ letterSpacing: '-0.02em', fontFamily: "'Instrument Serif', serif" }}
            >
              {t('hero.headline1')}
              <br className="hidden sm:block" />
              {t('hero.headlineHighlight')}
              {t('hero.headline2')}
            </h1>

            <p
              className="text-[1rem] lg:text-[1.1rem] text-white/70 leading-[1.7] max-w-lg animate-fade-in-up"
              style={{ animationDelay: '120ms' }}
            >
              {t('hero.description')}
            </p>

            {status === 'survey' && (
              <SurveyModal onComplete={handleSurveyComplete} onSkip={handleSurveySkip} />
            )}

            <div className="animate-fade-in-up w-full max-w-md" style={{ animationDelay: '240ms' }} id="waitlist">
              {status === 'success' ? (
                <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-white">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm text-white">{t('hero.successTitle')}</p>
                    <p className="text-xs text-white/60">{t('hero.successMessage')}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder={t('hero.emailPlaceholder')}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    disabled={status === 'loading' || status === 'survey' || status === 'submitting'}
                    className="flex-1 px-5 py-3.5 rounded-full text-[14px] text-white placeholder-white/40 bg-white/10 backdrop-blur-sm border focus:outline-none focus:border-white/30 transition-all duration-200 disabled:opacity-60"
                    style={{ borderColor: status === 'error' ? '#f87171' : 'rgba(255,255,255,0.15)' }}
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading' || status === 'survey' || status === 'submitting'}
                    className="bg-white text-[#0A0A0A] px-7 py-3.5 rounded-full font-semibold text-[14px] whitespace-nowrap disabled:opacity-70 flex items-center justify-center gap-2 hover:bg-white/90 transition-colors"
                    style={{ minWidth: '140px' }}
                  >
                    {status === 'loading' ? (
                      <><svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" /></svg>{t('hero.joining')}</>
                    ) : t('hero.joinWaitlist')}
                  </button>
                  {status === 'error' && <p className="text-xs text-red-300 mt-1 px-2">{t('hero.errorMessage')}</p>}
                </form>
              )}
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: '360ms' }}>
              <p className="text-[13px] text-white/50">
                <span className="font-semibold text-white/70">{waitlistCount}</span>{' '}{t('hero.socialProof')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
