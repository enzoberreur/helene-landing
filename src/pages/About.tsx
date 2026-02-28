import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Ear, FlaskConical, Compass } from 'lucide-react'
import Footer from '../components/Footer'
import { useInView } from '../hooks/useInView'

// ─── Section wrapper ───────────────────────────────────────────────────────────
function RevealSection({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const { ref, inView } = useInView(0.08)
  return (
    <section ref={ref as React.RefObject<HTMLElement>} className={`${inView ? 'section-visible' : ''} ${className}`} style={style}>
      {children}
    </section>
  )
}

// ─── LinkedIn icon ─────────────────────────────────────────────────────────────
function LinkedInIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

// ─── Team data ─────────────────────────────────────────────────────────────────
const TEAM = [
  { name: 'Sara Ben Abdelkader', role: 'Co-Founder', bioKey: 'sara', photo: '/images/sara.jpeg', linkedin: 'https://www.linkedin.com/in/sara-ben-abdelkader/', color: '#E83E73' },
  { name: 'Enzo Berreur',        role: 'Co-Founder', bioKey: 'enzo', photo: '/images/enzo.jpeg', linkedin: 'https://www.linkedin.com/in/enzo-berreur/',            color: '#2D9D6E' },
  { name: 'Eléa Nizam',          role: 'Co-Founder', bioKey: 'elea', photo: '/images/elea.jpeg', linkedin: 'https://www.linkedin.com/in/elea-nizam/',               color: '#7B5CF5' },
  { name: 'Camil Nitelhadj',     role: 'Co-Founder', bioKey: 'camil', photo: '/images/camil.jpeg', linkedin: 'https://www.linkedin.com/in/camilnitelhadj/',        color: '#D97706' },
]

const TEAM_BIOS: Record<string, { en: string; fr: string }> = {
  sara:  { en: 'The vision behind Helene. Sara witnessed two completely different faces of menopause in her own family — and decided to do something about it.', fr: 'La vision derrière Helene. Sara a observé deux vécus radicalement différents de la ménopause au sein de sa propre famille — et a décidé d\'agir.' },
  enzo:  { en: 'Leads product and engineering. Passionate about building technology that genuinely changes how people understand their health.', fr: 'Pilote le produit et l\'ingénierie. Passionné par la construction de technologies qui changent réellement la façon dont les gens comprennent leur santé.' },
  elea:  { en: 'Shapes user experience and product strategy, ensuring every feature feels human, intuitive, and genuinely useful to women.', fr: 'Façonne l\'expérience utilisateur et la stratégie produit, pour que chaque fonctionnalité soit humaine, intuitive et vraiment utile.' },
  camil: { en: 'Drives the data and model layer — turning daily check-ins into meaningful, personalised insight for every woman.', fr: 'Pilote la couche données et modèles — transformant les bilans quotidiens en insights personnalisés et significatifs.' },
}

// ─── Values with distinctive icons ────────────────────────────────────────────
const VALUES = [
  { Icon: Ear,         accent: '#E83E73', bg: '#FDF0F4', titleKey: 'about.v1title', bodyKey: 'about.v1body' },
  { Icon: FlaskConical, accent: '#2D9D6E', bg: '#E8F5EE', titleKey: 'about.v2title', bodyKey: 'about.v2body' },
  { Icon: Compass,     accent: '#7B5CF5', bg: '#F0EEFF', titleKey: 'about.v3title', bodyKey: 'about.v3body' },
]

// ─── Stats ─────────────────────────────────────────────────────────────────────
const STAT_KEYS = ['stat1', 'stat2', 'stat3', 'stat4'] as const

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function About() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'fr' ? 'fr' : 'en'

  return (
    <div className="bg-white">

      {/* Hero */}
      <div className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="pointer-events-none absolute" style={{ top: '-10%', right: '-5%', width: '600px', height: '600px', background: 'radial-gradient(circle at center, rgba(232,62,115,0.07) 0%, transparent 65%)' }} />
        <div className="pointer-events-none absolute" style={{ bottom: '-10%', left: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle at center, rgba(232,62,115,0.05) 0%, transparent 65%)' }} />
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="animate-fade-in-up inline-block text-xs font-bold tracking-[0.2em] uppercase text-[#E83E73] mb-6" style={{ animationDelay: '0ms' }}>
            {t('about.heroLabel')}
          </span>
          <h1 className="animate-fade-in-up text-5xl lg:text-[4rem] font-bold text-gray-900 leading-[1.06] tracking-tight" style={{ animationDelay: '80ms' }}>
            {t('about.heroHeadline1')}<span className="text-[#E83E73]">{t('about.heroHeadlineHighlight')}</span>
          </h1>
          <p className="animate-fade-in-up text-lg text-gray-500 leading-relaxed mt-8 max-w-2xl mx-auto" style={{ animationDelay: '160ms' }}>
            {t('about.heroDescription')}
          </p>
        </div>
      </div>

      {/* Story */}
      <RevealSection className="py-20 lg:py-28" style={{ background: '#FAFAFA' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="reveal reveal-1 bg-white rounded-[24px] p-9 relative overflow-hidden" style={{ boxShadow: '0 2px 20px -2px rgba(0,0,0,0.07)' }}>
              <div className="absolute top-0 left-0 w-1 h-full rounded-l-[24px]" style={{ background: '#E83E73' }} />
              <div className="text-xs font-bold tracking-[0.18em] uppercase mb-5" style={{ color: '#E83E73' }}>{t('about.storyLabel1')}</div>
              <p className="text-gray-700 text-[1.05rem] leading-relaxed">{t('about.storyCard1p1')}</p>
              <p className="text-gray-700 text-[1.05rem] leading-relaxed mt-4"><span className="font-semibold text-gray-900">{t('about.storyCard1p2')}</span></p>
            </div>
            <div className="reveal reveal-2 bg-white rounded-[24px] p-9 relative overflow-hidden" style={{ boxShadow: '0 2px 20px -2px rgba(0,0,0,0.07)' }}>
              <div className="absolute top-0 left-0 w-1 h-full rounded-l-[24px]" style={{ background: '#7B5CF5' }} />
              <div className="text-xs font-bold tracking-[0.18em] uppercase mb-5" style={{ color: '#7B5CF5' }}>{t('about.storyLabel2')}</div>
              <p className="text-gray-700 text-[1.05rem] leading-relaxed">{t('about.storyCard2p1')}</p>
              <p className="text-gray-700 text-[1.05rem] leading-relaxed mt-4"><span className="font-semibold text-gray-900">{t('about.storyCard2p2')}</span></p>
            </div>
          </div>
          <div className="reveal reveal-3 mt-12 max-w-2xl mx-auto text-center">
            <p className="text-xl lg:text-2xl font-semibold text-gray-900 leading-relaxed">{t('about.storyResolution')}</p>
            <p className="text-gray-500 leading-relaxed mt-5 text-base">{t('about.storyClosing')}</p>
            <p className="text-sm font-semibold mt-5" style={{ color: '#E83E73' }}>{t('about.storySig')}</p>
          </div>
        </div>
      </RevealSection>

      {/* Stats */}
      <RevealSection className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative overflow-hidden rounded-[28px] px-8 py-16 lg:py-20" style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)' }}>
            <div className="pointer-events-none absolute" style={{ top: '-30%', right: '-8%', width: '400px', height: '400px', background: 'radial-gradient(circle at center, rgba(232,62,115,0.2) 0%, transparent 65%)' }} />
            <div className="pointer-events-none absolute" style={{ bottom: '-30%', left: '-5%', width: '300px', height: '300px', background: 'radial-gradient(circle at center, rgba(123,92,245,0.15) 0%, transparent 65%)' }} />
            <div className="relative z-10">
              <p className="reveal reveal-1 text-center text-xs font-bold tracking-[0.2em] uppercase mb-12" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('about.statsLabel')}</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
                {STAT_KEYS.map((key, i) => (
                  <div key={key} className={`reveal reveal-${i + 2} text-center`}>
                    <div className="text-5xl lg:text-6xl font-bold text-white leading-none mb-3">{t(`about.${key}value`)}</div>
                    <div className="text-sm font-semibold mb-1" style={{ color: '#E83E73' }}>{t(`about.${key}label`)}</div>
                    <div className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{t(`about.${key}desc`)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* Mission */}
      <RevealSection className="py-20 lg:py-24" style={{ background: '#FAFAFA' }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="reveal reveal-1 inline-block text-xs font-bold tracking-[0.2em] uppercase text-[#E83E73] mb-5">{t('about.missionLabel')}</span>
          <h2 className="reveal reveal-2 text-4xl lg:text-5xl font-bold text-gray-900 leading-[1.1] tracking-tight">{t('about.missionHeadline')}</h2>
          <p className="reveal reveal-3 text-base text-gray-500 leading-relaxed mt-7 max-w-2xl mx-auto">{t('about.missionDescription')}</p>
        </div>
      </RevealSection>

      {/* Values */}
      <RevealSection className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="reveal reveal-1 inline-block text-xs font-bold tracking-[0.2em] uppercase text-[#E83E73] mb-4">{t('about.valuesLabel')}</span>
            <h2 className="reveal reveal-2 text-4xl font-bold text-gray-900 leading-tight tracking-tight mt-3">{t('about.valuesHeadline')}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {VALUES.map(({ Icon, accent, bg, titleKey, bodyKey }, i) => (
              <div key={titleKey} className={`reveal reveal-${i + 3} bg-white rounded-[24px] p-8 lg:p-9`} style={{ boxShadow: '0 2px 20px -2px rgba(0,0,0,0.07)' }}>
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-6" style={{ background: bg, color: accent }}>
                  <Icon size={22} strokeWidth={1.8} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 leading-snug mb-3 tracking-tight">{t(titleKey)}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{t(bodyKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* Team */}
      <RevealSection className="py-20 lg:py-28" style={{ background: '#FAFAFA' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="reveal reveal-1 inline-block text-xs font-bold tracking-[0.2em] uppercase text-[#E83E73] mb-4">{t('about.teamLabel')}</span>
            <h2 className="reveal reveal-2 text-4xl font-bold text-gray-900 leading-tight tracking-tight mt-3">{t('about.teamHeadline')}</h2>
            <p className="reveal reveal-3 text-base text-gray-500 leading-relaxed mt-5 max-w-xl mx-auto">{t('about.teamDescription')}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((member, i) => (
              <div key={member.name} className={`reveal reveal-${i + 4} bg-white rounded-[24px] p-7 flex flex-col items-center text-center`} style={{ boxShadow: '0 2px 20px -2px rgba(0,0,0,0.07)' }}>
                {/* Photo */}
                <div className="w-20 h-20 rounded-full overflow-hidden mb-5 flex-shrink-0 ring-2 ring-white" style={{ boxShadow: `0 0 0 3px ${member.color}33` }}>
                  <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-bold text-gray-900 text-[0.95rem] leading-snug mb-1">{member.name}</h3>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] mb-4" style={{ color: member.color }}>{member.role}</p>
                <p className="text-xs text-gray-500 leading-relaxed flex-1">{TEAM_BIOS[member.bioKey][lang]}</p>
                <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-[#0077B5] transition-colors">
                  <LinkedInIcon />
                  LinkedIn
                </a>
              </div>
            ))}
          </div>

          {/* Advisor callout */}
          <div className="reveal reveal-5 mt-10 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl text-sm" style={{ background: '#FDF0F4', border: '1.5px solid #fce0ec' }}>
              <span className="text-lg">🩺</span>
              <span className="text-gray-600">
                {t('about.advisorText')}{' '}
                <a href="mailto:hello@helene.app" className="font-semibold underline underline-offset-2" style={{ color: '#E83E73' }}>{t('about.advisorCTA')}</a>
              </span>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* Closing CTA */}
      <RevealSection className="py-20 lg:py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="reveal reveal-1 text-4xl font-bold text-gray-900 leading-tight tracking-tight">{t('about.closingHeadline')}</h2>
          <p className="reveal reveal-2 text-base text-gray-500 leading-relaxed mt-5">{t('about.closingDescription')}</p>
          <div className="reveal reveal-3 mt-8">
            <Link to="/#waitlist" className="inline-flex items-center bg-[#E83E73] text-white px-8 py-4 rounded-full font-semibold text-sm hover:bg-[#d63566] active:scale-[0.98] transition-all duration-200" style={{ boxShadow: '0 8px 24px -4px rgba(232,62,115,0.35)' }}>
              {t('about.closingCTA')}
            </Link>
          </div>
        </div>
      </RevealSection>

      <Footer />
    </div>
  )
}
