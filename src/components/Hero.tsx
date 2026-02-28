import { useTranslation } from 'react-i18next'
import { useWaitlistForm } from '../hooks/useWaitlistForm'
import SurveyModal from './SurveyModal'

const AVATAR_COLORS = ['#F4A261', '#2A9D8F', '#E76F51', '#457B9D']

function PhoneMockup({ src, alt, className, style }: { src: string; alt: string; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={className} style={{ width: '230px', borderRadius: '36px', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.9)', background: '#fff', boxShadow: '0 24px 64px -8px rgba(232, 62, 115, 0.22), 0 12px 28px -4px rgba(0,0,0,0.10)', ...style }}>
      <img src={src} alt={alt} className="w-full h-auto block" />
    </div>
  )
}

export default function Hero() {
  const { t } = useTranslation()
  const { email, setEmail, status, handleSubmit, handleSurveyComplete, handleSurveySkip } = useWaitlistForm()

  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-white">
      <div className="pointer-events-none absolute" style={{ top: '-10%', right: '-8%', width: '680px', height: '680px', background: 'radial-gradient(circle at center, rgba(232,62,115,0.09) 0%, transparent 65%)' }} />
      <div className="pointer-events-none absolute" style={{ bottom: '-15%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle at center, rgba(232,62,115,0.06) 0%, transparent 65%)' }} />

      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-24 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="flex flex-col gap-6 max-w-[540px] w-full">
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full w-fit text-sm font-semibold animate-fade-in-up" style={{ background: '#FDF0F4', color: '#E83E73', animationDelay: '0ms' }}>
              <span className="w-2 h-2 rounded-full bg-[#E83E73]" style={{ animation: 'pulse-dot 2s ease-in-out infinite' }} />
              {t('hero.badge')}
            </div>

            {/* Headline */}
            <h1 className="text-[2rem] sm:text-[2.75rem] lg:text-[3.25rem] font-bold text-gray-900 leading-[1.08] tracking-tight animate-fade-in-up" style={{ animationDelay: '80ms' }}>
              {t('hero.headline1')}<span className="text-[#E83E73]">{t('hero.headlineHighlight')}</span>{t('hero.headline2')}
            </h1>

            {/* Description */}
            <p className="text-[1.05rem] text-gray-500 leading-relaxed animate-fade-in-up" style={{ animationDelay: '160ms' }}>
              {t('hero.description')}
            </p>

            {/* Form */}
            {status === 'survey' && (
              <SurveyModal onComplete={handleSurveyComplete} onSkip={handleSurveySkip} />
            )}

            <div className="animate-fade-in-up" style={{ animationDelay: '240ms' }} id="waitlist">
              {status === 'success' ? (
                <div className="flex items-center gap-3 px-5 py-4 rounded-2xl" style={{ background: '#F0FDF4', border: '1.5px solid #86efac' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#22c55e' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: '#15803d' }}>{t('hero.successTitle')}</p>
                    <p className="text-xs" style={{ color: '#16a34a' }}>{t('hero.successMessage')}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                  <input type="email" placeholder={t('hero.emailPlaceholder')} value={email} onChange={e => setEmail(e.target.value)} required disabled={status === 'loading' || status === 'survey'} className="flex-1 px-5 py-3.5 rounded-full border border-gray-200 text-gray-900 text-sm placeholder-gray-400 bg-white focus:outline-none transition-all duration-200 disabled:opacity-60" style={{ borderColor: status === 'error' ? '#f87171' : undefined }} />
                  <button type="submit" disabled={status === 'loading' || status === 'survey'} className="bg-[#E83E73] text-white px-7 py-3.5 rounded-full font-semibold text-sm hover:bg-[#d63566] active:scale-[0.98] transition-all duration-200 whitespace-nowrap disabled:opacity-70 flex items-center justify-center gap-2" style={{ boxShadow: '0 8px 24px -4px rgba(232,62,115,0.35)', minWidth: '140px' }}>
                    {status === 'loading' ? (
                      <><svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" /></svg>{t('hero.joining')}</>
                    ) : t('hero.joinWaitlist')}
                  </button>
                  {status === 'error' && <p className="text-xs text-red-500 mt-1 px-2">{t('hero.errorMessage')}</p>}
                </form>
              )}
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: '320ms' }}>
              <div className="flex -space-x-2.5">
                {AVATAR_COLORS.map((color, i) => (
                  <div key={i} className="w-9 h-9 rounded-full border-[2.5px] border-white flex-shrink-0" style={{ backgroundColor: color, zIndex: 4 - i }} />
                ))}
              </div>
              <p className="text-sm text-gray-500 leading-snug">
                <span className="font-semibold text-gray-800">{t('hero.socialCount')}</span>{' '}{t('hero.socialProof')}
              </p>
            </div>
          </div>

          {/* Phone mockups — desktop only */}
          <div className="hidden lg:flex justify-end items-center">
            <div className="relative" style={{ width: '460px', height: '520px' }}>
              <div className="absolute phone-back" style={{ left: '0px', top: '30px', transform: 'rotate(-4deg)', zIndex: 1 }}>
                <PhoneMockup src="/images/app-dashboard.png" alt="Helene dashboard" style={{ boxShadow: '0 20px 56px -8px rgba(0,0,0,0.14), 0 8px 16px -4px rgba(0,0,0,0.08)' }} />
              </div>
              <div className="absolute phone-front" style={{ right: '0px', top: '0px', transform: 'rotate(3deg)', zIndex: 2 }}>
                <PhoneMockup src="/images/app-chat.png" alt="Helene companion chat" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
