import { useTranslation } from 'react-i18next'
import { useInView } from '../hooks/useInView'

const FEATURE_ICONS = [
  // Microphone — voice check-in
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>,
  // Bar chart — insights
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>,
  // People — community
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>,
]

const FEATURE_ACCENTS = [
  { color: '#E83E73', bg: '#FDF0F4' },
  { color: '#2D9D6E', bg: '#E8F5EE' },
  { color: '#7B5CF5', bg: '#F0EEFF' },
]

function HighlightIcon({ color }: { color: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export default function Features() {
  const { t } = useTranslation()
  const { ref, inView } = useInView(0.06)

  const features = ['f1', 'f2', 'f3'] as const

  return (
    <section
      id="features"
      ref={ref as React.RefObject<HTMLElement>}
      className={`py-24 lg:py-32 ${inView ? 'section-visible' : ''}`}
      style={{ background: '#FAFAFA' }}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20 max-w-2xl mx-auto">
          <span className="reveal reveal-1 inline-block text-xs font-bold tracking-[0.2em] uppercase text-[#E83E73] mb-4">
            {t('features.sectionLabel')}
          </span>
          <h2 className="reveal reveal-2 text-4xl lg:text-[2.75rem] font-bold text-gray-900 leading-[1.1] tracking-tight mt-3">
            {t('features.sectionHeadline')}
          </h2>
          <p className="reveal reveal-3 text-base text-gray-500 leading-relaxed mt-5 max-w-lg mx-auto">
            {t('features.sectionSubtitle')}
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((key, i) => {
            const accent = FEATURE_ACCENTS[i]
            const highlights = ['h1', 'h2', 'h3'] as const
            return (
              <div
                key={key}
                className={`reveal reveal-${i + 4} group relative bg-white rounded-[24px] p-8 lg:p-9 flex flex-col gap-7 transition-all duration-300 hover:-translate-y-1`}
                style={{ boxShadow: '0 2px 20px -2px rgba(0,0,0,0.07), 0 1px 4px -1px rgba(0,0,0,0.04)' }}
              >
                {/* Ghost number */}
                <div className="absolute top-6 right-7 font-bold select-none pointer-events-none leading-none" style={{ fontSize: '72px', color: accent.color, opacity: 0.07, lineHeight: 1 }}>
                  {String(i + 1).padStart(2, '0')}
                </div>

                {/* Icon + tag */}
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105" style={{ background: accent.bg, color: accent.color }}>
                    {FEATURE_ICONS[i]}
                  </div>
                  <span className="text-[10px] font-bold tracking-[0.18em] uppercase" style={{ color: accent.color }}>
                    {t(`features.${key}.tag`)}
                  </span>
                </div>

                {/* Headline */}
                <h3 className="text-[1.2rem] font-bold text-gray-900 leading-[1.3] tracking-tight">
                  {t(`features.${key}.headline`)}
                </h3>

                {/* Description */}
                <p className="text-[0.875rem] text-gray-500 leading-relaxed flex-1">
                  {t(`features.${key}.description`)}
                </p>

                {/* Divider */}
                <div className="w-full h-px" style={{ background: 'linear-gradient(to right, transparent, #e5e7eb, transparent)' }} />

                {/* Highlights */}
                <div className="flex flex-col gap-3">
                  {highlights.map(h => (
                    <div key={h} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-[1px]" style={{ background: accent.bg }}>
                        <HighlightIcon color={accent.color} />
                      </div>
                      <span className="text-[0.8rem] text-gray-600 leading-snug font-medium">
                        {t(`features.${key}.${h}`)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Trust line */}
        <p className="reveal reveal-5 text-center text-xs text-gray-400 mt-12 tracking-wide">
          {t('features.trustLine')}
        </p>
      </div>
    </section>
  )
}
