import { useTranslation } from 'react-i18next'
import { useInView } from '../hooks/useInView'
import { useWaitlistForm } from '../hooks/useWaitlistForm'
import SurveyModal from './SurveyModal'

export default function CTA() {
  const { t } = useTranslation()
  const { email, setEmail, status, handleSubmit, handleSurveyComplete, handleSurveySkip } = useWaitlistForm()
  const { ref, inView } = useInView(0.1)

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className={`py-32 lg:py-44 bg-white ${inView ? 'section-visible' : ''}`}
    >
      {status === 'survey' && (
        <SurveyModal onComplete={handleSurveyComplete} onSkip={handleSurveySkip} />
      )}

      <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
        <div className="max-w-xl mx-auto text-center flex flex-col items-center gap-6">
          <h2
            className="reveal reveal-1 text-[2.25rem] lg:text-[3rem] font-semibold text-[#0A0A0A] leading-[1.08]"
            style={{ letterSpacing: '-0.03em' }}
          >
            {t('cta.headline')}
          </h2>
          <p className="reveal reveal-2 text-[16px] text-[#0A0A0A]/40 leading-[1.7]">
            {t('cta.description')}
          </p>

          <div className="reveal reveal-3 w-full max-w-md mt-4">
            {status === 'success' ? (
              <div className="flex items-center gap-3 px-5 py-4 rounded-2xl border border-[#0A0A0A]/[0.06]">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-[#0A0A0A]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-[14px] text-[#0A0A0A]">{t('cta.successTitle')}</p>
                  <p className="text-[12px] text-[#0A0A0A]/35">{t('cta.successMessage')}</p>
                </div>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder={t('cta.emailPlaceholder')}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    disabled={status === 'loading' || status === 'survey' || status === 'submitting'}
                    className="flex-1 px-5 py-3.5 rounded-full text-[14px] text-[#0A0A0A] placeholder-[#0A0A0A]/25 focus:outline-none transition-all duration-200 border border-[#0A0A0A]/[0.08] focus:border-[#0A0A0A]/20 disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading' || status === 'survey' || status === 'submitting'}
                    className="bg-[#0A0A0A] text-white px-7 py-3.5 rounded-full font-semibold text-[14px] whitespace-nowrap disabled:opacity-70 flex items-center justify-center gap-2 hover:bg-[#1a1a1a] transition-colors"
                    style={{ minWidth: '140px' }}
                  >
                    {status === 'loading' ? (
                      <><svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" /></svg>{t('cta.joining')}</>
                    ) : t('cta.joinWaitlist')}
                  </button>
                </form>
                {status === 'error' && <p className="text-xs text-red-500 mt-2">{t('cta.errorMessage')}</p>}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
