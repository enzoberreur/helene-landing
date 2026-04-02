import { useTranslation } from 'react-i18next'
import { useInView } from '../hooks/useInView'

export default function Community() {
  const { t } = useTranslation()
  const { ref, inView } = useInView(0.08)

  const items = [
    { titleKey: 'community.r1title', descKey: 'community.r1desc' },
    { titleKey: 'community.r2title', descKey: 'community.r2desc' },
    { titleKey: 'community.r3title', descKey: 'community.r3desc' },
  ]

  return (
    <section id="community" className="py-32 lg:py-44 bg-white">
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className={`max-w-[1200px] mx-auto px-6 lg:px-12 ${inView ? 'section-visible' : ''}`}
      >
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Image */}
          <div className="reveal reveal-1 rounded-[24px] overflow-hidden order-2 lg:order-1" style={{ aspectRatio: '4/5' }}>
            <img
              src="/images/community.jpg"
              alt="Woman taking time for herself"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Text */}
          <div className="flex flex-col gap-6 order-1 lg:order-2">
            <span className="reveal reveal-1 inline-block text-[11px] font-semibold tracking-[0.2em] uppercase text-[#0A0A0A]/30">
              {t('community.label')}
            </span>

            <h2
              className="reveal reveal-2 text-[2.25rem] lg:text-[3rem] font-semibold text-[#0A0A0A] leading-[1.08]"
              style={{ letterSpacing: '-0.03em' }}
            >
              {t('community.headline')}
            </h2>

            <p className="reveal reveal-3 text-[16px] text-[#0A0A0A]/40 leading-[1.7] max-w-md">
              {t('community.description')}
            </p>

            <div className="flex flex-col gap-5 mt-4">
              {items.map((item, i) => (
                <div key={item.titleKey} className={`reveal reveal-${i + 4}`}>
                  <h4 className="font-semibold text-[#0A0A0A] text-[15px] mb-1">{t(item.titleKey)}</h4>
                  <p className="text-[14px] text-[#0A0A0A]/35 leading-relaxed">{t(item.descKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
