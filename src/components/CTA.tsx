import { useTranslation } from 'react-i18next'
import { useInView } from '../hooks/useInView'
import { useWaitlistForm } from '../hooks/useWaitlistForm'
import SurveyModal from './SurveyModal'

export default function CTA() {
  const { t } = useTranslation()
  const { email, setEmail, status, handleSubmit, handleSurveyComplete, handleSurveySkip } = useWaitlistForm()
  const { ref, inView } = useInView(0.1)

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className={`py-16 lg:py-24 bg-white ${inView ? 'section-visible' : ''}`}>
      {status === 'survey' && (
        <SurveyModal onComplete={handleSurveyComplete} onSkip={handleSurveySkip} />
      )}
      <div className="max-w-7xl mx-auto px-6">
        <div className="reveal reveal-1 relative overflow-hidden rounded-[24px] px-8 py-16 lg:py-20 text-center" style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)' }}>
          <div className="pointer-events-none absolute" style={{ top: '-20%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle at center, rgba(232,62,115,0.25) 0%, transparent 65%)' }} />
          <div className="pointer-events-none absolute" style={{ bottom: '-20%', left: '-8%', width: '320px', height: '320px', background: 'radial-gradient(circle at center, rgba(232,62,115,0.18) 0%, transparent 65%)' }} />

          <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center gap-6">
            <h2 className="reveal reveal-2 text-4xl lg:text-[2.75rem] font-bold text-white leading-[1.1] tracking-tight">{t('cta.headline')}</h2>
            <p className="reveal reveal-3 text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{t('cta.description')}</p>

            <div className="reveal reveal-4 w-full max-w-md">
              {status === 'success' ? (
                <div className="flex items-center gap-3 px-5 py-4 rounded-2xl mx-auto" style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#22c55e' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm text-white">{t('cta.successTitle')}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{t('cta.successMessage')}</p>
                  </div>
                </div>
              ) : (
                <>
                  <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                    <input type="email" placeholder={t('cta.emailPlaceholder')} value={email} onChange={e => setEmail(e.target.value)} required disabled={status === 'loading' || status === 'survey'} className="flex-1 px-5 py-3.5 rounded-full text-sm text-white placeholder-white/40 focus:outline-none transition-all duration-200 border disabled:opacity-60" style={{ background: 'rgba(255,255,255,0.08)', borderColor: status === 'error' ? '#f87171' : 'rgba(255,255,255,0.12)' }} />
                    <button type="submit" disabled={status === 'loading' || status === 'survey'} className="bg-[#E83E73] text-white px-7 py-3.5 rounded-full font-semibold text-sm hover:bg-[#d63566] active:scale-[0.98] transition-all duration-200 whitespace-nowrap disabled:opacity-70 flex items-center justify-center gap-2" style={{ boxShadow: '0 8px 24px -4px rgba(232,62,115,0.4)', minWidth: '140px' }}>
                      {status === 'loading' ? (
                        <><svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" /></svg>{t('cta.joining')}</>
                      ) : t('cta.joinWaitlist')}
                    </button>
                  </form>
                  {status === 'error' && <p className="text-xs mt-2" style={{ color: '#fca5a5' }}>{t('cta.errorMessage')}</p>}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
