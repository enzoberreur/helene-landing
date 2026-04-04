import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useRef, useEffect } from 'react'
import Footer from '../components/Footer'
import { useInView } from '../hooks/useInView'
import { useWaitlistCount } from '../hooks/useWaitlistCount'

function Section({ children, className = '', bg = 'bg-white' }: { children: React.ReactNode; className?: string; bg?: string }) {
  const { ref, inView } = useInView(0.08)
  return (
    <section ref={ref as React.RefObject<HTMLElement>} className={`${inView ? 'section-visible' : ''} ${bg} ${className}`}>
      {children}
    </section>
  )
}

function LinkedInIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

const TEAM = [
  { name: 'Sara Ben Abdelkader', role: 'Co-Founder', bioKey: 'sara', photo: '/images/sara.jpeg', linkedin: 'https://www.linkedin.com/in/sara-ben-abdelkader/' },
  { name: 'Enzo Berreur', role: 'Co-Founder', bioKey: 'enzo', photo: '/images/enzo.jpeg', linkedin: 'https://www.linkedin.com/in/enzo-berreur/' },
  { name: 'Eléa Nizam', role: 'Co-Founder', bioKey: 'elea', photo: '/images/elea.jpeg', linkedin: 'https://www.linkedin.com/in/elea-nizam/' },
  { name: 'Camil Nitelhadj', role: 'Co-Founder', bioKey: 'camil', photo: '/images/camil.jpeg', linkedin: 'https://www.linkedin.com/in/camilnitelhadj/' },
]

const BIOS: Record<string, { en: string; fr: string }> = {
  sara:  { en: 'The vision behind Hélène. Sara witnessed two completely different faces of menopause in her own family, and decided to do something about it.', fr: 'La vision derrière Hélène. Sara a observé deux vécus radicalement différents de la ménopause dans sa propre famille, et a décidé d\'agir.' },
  enzo:  { en: 'Leads product and engineering. Passionate about building technology that genuinely changes how people understand their health.', fr: 'Pilote le produit et la tech. Passionné par les outils qui changent vraiment la façon dont on comprend sa santé.' },
  elea:  { en: 'Shapes user experience and product strategy, ensuring every feature feels human, intuitive, and genuinely useful.', fr: 'Façonne l\'expérience et la stratégie produit pour que chaque fonctionnalité soit humaine, intuitive et vraiment utile.' },
  camil: { en: 'Drives the data and model layer, turning daily check-ins into meaningful, personalised insights.', fr: 'Pilote la couche données et modèles, transformant les bilans quotidiens en insights personnalisés.' },
}

const STATS = ['stat1', 'stat2', 'stat3', 'stat4'] as const

export default function About() {
  const { t, i18n } = useTranslation()
  const { formatted: waitlistCount } = useWaitlistCount()
  const lang = i18n.language === 'fr' ? 'fr' : 'en'
  const { pathname } = useLocation()
  const prefix = pathname.startsWith('/fr') ? '/fr' : '/en'
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const handleEnded = () => { v.currentTime = 0; v.play() }
    v.addEventListener('ended', handleEnded)
    return () => v.removeEventListener('ended', handleEnded)
  }, [])

  return (
    <div className="bg-white">

      {/* ── Hero (video background, same as landing) ── */}
      <section className="relative min-h-[70vh] flex flex-col justify-end">
        <div className="absolute inset-0 bg-black">
          <video
            ref={videoRef}
            src="/images/hero-montage.mp4"
            autoPlay muted loop playsInline preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative z-10 pb-16 sm:pb-20 lg:pb-28 pt-[120px]">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
            <div className="max-w-2xl">
              <span className="animate-fade-in-up inline-block text-[11px] font-semibold tracking-[0.2em] uppercase text-white/40 mb-5">
                {t('about.heroLabel')}
              </span>
              <h1
                className="animate-fade-in-up text-[2.5rem] lg:text-[3.5rem] text-white leading-[1.06]"
                style={{ animationDelay: '80ms', letterSpacing: '-0.02em', fontFamily: "'Instrument Serif', serif" }}
              >
                {t('about.heroHeadline1')}{t('about.heroHeadlineHighlight')}
              </h1>
              <p
                className="animate-fade-in-up text-[1rem] lg:text-[1.1rem] text-white/60 leading-[1.7] mt-6 max-w-lg"
                style={{ animationDelay: '160ms' }}
              >
                {t('about.heroDescription')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Story ── */}
      <Section className="py-32 lg:py-44">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="reveal reveal-1">
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#0A0A0A]/30 mb-4 block">{t('about.storyLabel1')}</span>
              <p className="text-[15px] text-[#0A0A0A]/60 leading-[1.8]">{t('about.storyCard1p1')}</p>
              <p className="text-[15px] text-[#0A0A0A] leading-[1.8] mt-4 font-medium">{t('about.storyCard1p2')}</p>
            </div>
            <div className="reveal reveal-2">
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#0A0A0A]/30 mb-4 block">{t('about.storyLabel2')}</span>
              <p className="text-[15px] text-[#0A0A0A]/60 leading-[1.8]">{t('about.storyCard2p1')}</p>
              <p className="text-[15px] text-[#0A0A0A] leading-[1.8] mt-4 font-medium">{t('about.storyCard2p2')}</p>
            </div>
          </div>
          <div className="reveal reveal-3 mt-16 max-w-xl mx-auto text-center">
            <p className="text-[1.25rem] lg:text-[1.5rem] font-semibold text-[#0A0A0A] leading-[1.3]" style={{ letterSpacing: '-0.02em' }}>
              {t('about.storyResolution')}
            </p>
            <p className="text-[15px] text-[#0A0A0A]/40 leading-[1.7] mt-5">{t('about.storyClosing')}</p>
            <p className="text-[13px] font-semibold text-[#0A0A0A]/30 mt-6">{t('about.storySig')}</p>
          </div>
        </div>
      </Section>

      {/* ── Stats ── */}
      <Section className="py-32 lg:py-40" bg="bg-[#fafafa]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
          <span className="reveal reveal-1 block text-[11px] font-semibold tracking-[0.2em] uppercase text-[#0A0A0A]/30 mb-16 lg:mb-20">
            {t('about.statsLabel')}
          </span>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-14 gap-x-8 lg:gap-8">
            {STATS.map((key, i) => (
              <div key={key} className={`reveal reveal-${i + 2}`}>
                <div className="text-[3rem] lg:text-[4rem] font-semibold text-[#0A0A0A] leading-none mb-3" style={{ letterSpacing: '-0.03em' }}>
                  {t(`about.${key}value`)}
                </div>
                <div className="text-[12px] font-semibold text-[#0A0A0A]/40 mb-2 uppercase tracking-wider">
                  {t(`about.${key}label`)}
                </div>
                <p className="text-[13px] text-[#0A0A0A]/25 leading-relaxed max-w-[220px]">
                  {t(`about.${key}desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Mission ── */}
      <Section className="py-32 lg:py-44">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
          <div className="max-w-xl">
            <span className="reveal reveal-1 inline-block text-[11px] font-semibold tracking-[0.2em] uppercase text-[#0A0A0A]/30 mb-5">{t('about.missionLabel')}</span>
            <h2
              className="reveal reveal-2 text-[2.25rem] lg:text-[3rem] font-semibold text-[#0A0A0A] leading-[1.08]"
              style={{ letterSpacing: '-0.03em' }}
            >
              {t('about.missionHeadline')}
            </h2>
            <p className="reveal reveal-3 text-[16px] text-[#0A0A0A]/40 leading-[1.7] mt-5 max-w-lg">{t('about.missionDescription')}</p>
          </div>
        </div>
      </Section>

      {/* ── Values ── */}
      <Section className="py-32 lg:py-44" bg="bg-[#fafafa]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
          <span className="reveal reveal-1 inline-block text-[11px] font-semibold tracking-[0.2em] uppercase text-[#0A0A0A]/30 mb-5">{t('about.valuesLabel')}</span>
          <h2
            className="reveal reveal-2 text-[2.25rem] lg:text-[3rem] font-semibold text-[#0A0A0A] leading-[1.08] mb-16"
            style={{ letterSpacing: '-0.03em' }}
          >
            {t('about.valuesHeadline')}
          </h2>
          <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
            <div className="reveal reveal-3">
              <h3 className="text-[1rem] font-semibold text-[#0A0A0A] mb-3">{t('about.v1title')}</h3>
              <p className="text-[14px] text-[#0A0A0A]/40 leading-[1.7]">{t('about.v1body')}</p>
            </div>
            <div className="reveal reveal-4">
              <h3 className="text-[1rem] font-semibold text-[#0A0A0A] mb-3">{t('about.v2title')}</h3>
              <p className="text-[14px] text-[#0A0A0A]/40 leading-[1.7]">{t('about.v2body')}</p>
            </div>
            <div className="reveal reveal-5">
              <h3 className="text-[1rem] font-semibold text-[#0A0A0A] mb-3">{t('about.v3title')}</h3>
              <p className="text-[14px] text-[#0A0A0A]/40 leading-[1.7]">{t('about.v3body')}</p>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Team ── */}
      <Section className="py-32 lg:py-44">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
          <span className="reveal reveal-1 inline-block text-[11px] font-semibold tracking-[0.2em] uppercase text-[#0A0A0A]/30 mb-5">{t('about.teamLabel')}</span>
          <h2
            className="reveal reveal-2 text-[2.25rem] lg:text-[3rem] font-semibold text-[#0A0A0A] leading-[1.08]"
            style={{ letterSpacing: '-0.03em' }}
          >
            {t('about.teamHeadline')}
          </h2>
          <p className="reveal reveal-3 text-[16px] text-[#0A0A0A]/40 leading-[1.7] mt-5 max-w-lg mb-16">{t('about.teamDescription')}</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            {TEAM.map((m, i) => (
              <div key={m.name} className={`reveal reveal-${i + 4}`}>
                <div className="w-16 h-16 rounded-full overflow-hidden mb-4">
                  <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-[15px] font-semibold text-[#0A0A0A]">{m.name}</h3>
                <p className="text-[12px] text-[#0A0A0A]/30 font-medium mt-0.5">{m.role}</p>
                <p className="text-[13px] text-[#0A0A0A]/40 leading-[1.6] mt-3">{BIOS[m.bioKey][lang]}</p>
                <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[12px] text-[#0A0A0A]/25 hover:text-[#0077B5] transition-colors mt-3">
                  <LinkedInIcon /> LinkedIn
                </a>
              </div>
            ))}
          </div>

          <p className="reveal reveal-5 text-[14px] text-[#0A0A0A]/30 mt-16">
            {t('about.advisorText')}{' '}
            <a href="mailto:hello@helene.care" className="font-semibold text-[#0A0A0A]/50 underline underline-offset-2 hover:text-[#0A0A0A]">{t('about.advisorCTA')}</a>
          </p>
        </div>
      </Section>

      {/* ── CTA ── */}
      <Section className="py-32 lg:py-44" bg="bg-[#fafafa]">
        <div className="max-w-xl mx-auto px-6 lg:px-12 text-center">
          <h2
            className="reveal reveal-1 text-[2.25rem] lg:text-[3rem] font-semibold text-[#0A0A0A] leading-[1.08]"
            style={{ letterSpacing: '-0.03em' }}
          >
            {t('about.closingHeadline')}
          </h2>
          <p className="reveal reveal-2 text-[16px] text-[#0A0A0A]/40 leading-[1.7] mt-5">{t('about.closingDescription', { count: waitlistCount } as Record<string, string>)}</p>
          <div className="reveal reveal-3 mt-8">
            <Link
              to={`${prefix}/#waitlist`}
              className="inline-block bg-[#0A0A0A] text-white px-8 py-4 rounded-full font-semibold text-[14px] hover:bg-[#1a1a1a] transition-colors"
            >
              {t('about.closingCTA')}
            </Link>
          </div>
        </div>
      </Section>

      <Footer />
    </div>
  )
}
