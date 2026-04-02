import { useTranslation } from 'react-i18next'
import { useInView } from '../hooks/useInView'
import { useState, useEffect, useRef, useCallback } from 'react'
import { ChatShowcase, DashboardShowcase, CommunityShowcase } from './PhoneDemos'

const TAB_DURATION = 6000

const showcases = [<ChatShowcase />, <DashboardShowcase />, <CommunityShowcase />]
const tabKeys = ['f1', 'f2', 'f3']

export default function Features() {
  const { t } = useTranslation()
  const { ref, inView } = useInView(0.06)
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [cycle, setCycle] = useState(0) // forces CSS restart
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const scheduleNext = useCallback(() => {
    clearTimeout(timerRef.current)
    if (paused) return
    timerRef.current = setTimeout(() => {
      setActive(prev => (prev + 1) % tabKeys.length)
      setCycle(c => c + 1)
    }, TAB_DURATION)
  }, [paused])

  useEffect(() => {
    scheduleNext()
    return () => clearTimeout(timerRef.current)
  }, [active, scheduleNext])

  const selectTab = (i: number) => {
    setActive(i)
    setCycle(c => c + 1)
  }

  return (
    <section id="features" className="py-32 lg:py-44 bg-white">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
        {/* Section header */}
        <div
          ref={ref as React.RefObject<HTMLDivElement>}
          className={`max-w-2xl mb-20 lg:mb-28 ${inView ? 'section-visible' : ''}`}
        >
          <span className="reveal reveal-1 inline-block text-[11px] font-semibold tracking-[0.2em] uppercase text-[#0A0A0A]/30 mb-5">
            {t('features.sectionLabel')}
          </span>
          <h2
            className="reveal reveal-2 text-[2.25rem] lg:text-[3rem] font-semibold text-[#0A0A0A] leading-[1.08]"
            style={{ letterSpacing: '-0.03em' }}
          >
            {t('features.sectionHeadline')}
          </h2>
          <p className="reveal reveal-3 text-[16px] text-[#0A0A0A]/40 leading-[1.7] mt-5 max-w-lg">
            {t('features.sectionSubtitle')}
          </p>
        </div>

        {/* Tabs + showcase */}
        <div
          className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Left: tabs */}
          <div className="flex flex-col">
            {tabKeys.map((key, i) => {
              const isActive = i === active
              return (
                <button
                  key={key}
                  onClick={() => selectTab(i)}
                  className="text-left w-full"
                >
                  {/* Progress bar */}
                  <div className="h-[1px] bg-[#0A0A0A]/[0.06] w-full relative overflow-hidden">
                    {isActive && (
                      <div
                        key={`bar-${cycle}`}
                        className="absolute inset-y-0 left-0 bg-[#0A0A0A] tab-progress"
                        style={{
                          animationDuration: `${TAB_DURATION}ms`,
                          animationPlayState: paused ? 'paused' : 'running',
                        }}
                      />
                    )}
                    {i < active && <div className="absolute inset-0 bg-[#0A0A0A]" />}
                  </div>

                  <div className={`py-6 lg:py-7 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-25 hover:opacity-40'}`}>
                    <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#0A0A0A]/40">
                      {t(`features.${key}.tag`)}
                    </span>
                    <h3
                      className="text-[1.1rem] lg:text-[1.3rem] font-semibold text-[#0A0A0A] leading-[1.3] mt-2"
                      style={{ letterSpacing: '-0.01em' }}
                    >
                      {t(`features.${key}.headline`)}
                    </h3>

                    {/* Expandable content */}
                    <div
                      className="grid transition-all duration-500 ease-out"
                      style={{ gridTemplateRows: isActive ? '1fr' : '0fr' }}
                    >
                      <div className="overflow-hidden">
                        <p className="text-[14px] text-[#0A0A0A]/40 leading-[1.7] mt-3 max-w-md">
                          {t(`features.${key}.description`)}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
            <div className="h-[1px] bg-[#0A0A0A]/[0.06]" />
          </div>

          {/* Right: phone showcase */}
          <div className="flex justify-center lg:sticky lg:top-32">
            <div key={active} style={{ animation: 'featureIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
              {showcases[active]}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
