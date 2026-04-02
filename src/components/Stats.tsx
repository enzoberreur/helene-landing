import { useTranslation } from 'react-i18next'
import { useInView } from '../hooks/useInView'

export default function Stats() {
  const { t } = useTranslation()
  const { ref, inView } = useInView(0.15)

  const stats = [
    { valueKey: 'about.stat1value', labelKey: 'about.stat1label', descKey: 'about.stat1desc' },
    { valueKey: 'about.stat2value', labelKey: 'about.stat2label', descKey: 'about.stat2desc' },
    { valueKey: 'about.stat3value', labelKey: 'about.stat3label', descKey: 'about.stat3desc' },
    { valueKey: 'about.stat4value', labelKey: 'about.stat4label', descKey: 'about.stat4desc' },
  ]

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className={`py-32 lg:py-40 ${inView ? 'section-visible' : ''}`}
      style={{ background: '#fafafa' }}
    >
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
        <span className="reveal reveal-1 block text-[11px] font-semibold tracking-[0.2em] uppercase text-[#0A0A0A]/30 mb-16 lg:mb-20">
          {t('about.statsLabel')}
        </span>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-14 gap-x-8 lg:gap-8">
          {stats.map((stat, i) => (
            <div key={stat.valueKey} className={`reveal reveal-${i + 2}`}>
              <div
                className="text-[3rem] lg:text-[4rem] font-semibold text-[#0A0A0A] leading-none mb-3"
                style={{ letterSpacing: '-0.03em' }}
              >
                {t(stat.valueKey)}
              </div>
              <div className="text-[12px] font-semibold text-[#0A0A0A]/40 mb-2 uppercase tracking-wider">
                {t(stat.labelKey)}
              </div>
              <p className="text-[13px] text-[#0A0A0A]/25 leading-relaxed max-w-[220px]">
                {t(stat.descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
