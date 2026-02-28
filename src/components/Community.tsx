import { useTranslation } from 'react-i18next'
import { useInView } from '../hooks/useInView'

export default function Community() {
  const { t } = useTranslation()
  const { ref, inView } = useInView(0.08)

  const items = [
    { titleKey: 'community.r1title', descKey: 'community.r1desc', icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>) },
    { titleKey: 'community.r2title', descKey: 'community.r2desc', icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>) },
    { titleKey: 'community.r3title', descKey: 'community.r3desc', icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>) },
  ]

  return (
    <section id="community" ref={ref as React.RefObject<HTMLElement>} className={`py-24 lg:py-32 bg-white ${inView ? 'section-visible' : ''}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Phone mockup */}
          <div className="reveal reveal-1 flex justify-center lg:justify-start order-2 lg:order-1">
            <div style={{ width: '280px', borderRadius: '40px', overflow: 'hidden', boxShadow: '0 32px 80px -8px rgba(232,62,115,0.18), 0 16px 32px -4px rgba(0,0,0,0.10)', border: '2px solid rgba(255,255,255,0.9)' }}>
              <img src="/images/app-community.png" alt="Helene community" className="w-full h-auto block" />
            </div>
          </div>

          {/* Text */}
          <div className="flex flex-col gap-6 order-1 lg:order-2">
            <span className="reveal reveal-1 inline-block text-xs font-bold tracking-[0.2em] uppercase text-[#E83E73]">{t('community.label')}</span>
            <h2 className="reveal reveal-2 text-4xl lg:text-[2.75rem] font-bold text-gray-900 leading-[1.1] tracking-tight">{t('community.headline')}</h2>
            <p className="reveal reveal-3 text-base text-gray-500 leading-relaxed">{t('community.description')}</p>
            <div className="flex flex-col gap-5 mt-2">
              {items.map((item, i) => (
                <div key={item.titleKey} className={`reveal reveal-${i + 4} flex items-start gap-4`}>
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#FDF0F4', color: '#E83E73' }}>
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-[0.95rem] mb-0.5">{t(item.titleKey)}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">{t(item.descKey)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
