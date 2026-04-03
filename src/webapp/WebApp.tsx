import { useState, useEffect, useRef, createContext, useContext, useCallback } from 'react'
import { theme } from './theme'
import { useProfile, useCheckIns, useMRS, useTreatments, usePeriods, useChat } from './store'
import { registerServiceWorker, checkDailyReminder } from './notifications'
import { trackApp } from '../analytics'
import { detectLang, LangContext } from './i18n'
import type { AppLang } from './i18n'
import type { UserProfile, CheckInEntry, MRSEntry, TreatmentEntry, PeriodEntry, ChatMessage } from './types'
import OnboardingView from './views/OnboardingView'
import HomeView from './views/HomeView'
import CommunityView from './views/CommunityView'
import InsightsView from './views/InsightsView'
import AIView from './views/AIView'

// Context
interface AppState {
  profile: UserProfile
  setProfile: (fn: (p: UserProfile) => UserProfile) => void
  checkIns: CheckInEntry[]
  addCheckIn: (e: CheckInEntry) => void
  updateCheckIn: (id: string, u: Partial<CheckInEntry>) => void
  mrsEntries: MRSEntry[]
  addMRS: (e: MRSEntry) => void
  treatments: TreatmentEntry[]
  addTreatment: (e: TreatmentEntry) => void
  deleteTreatment: (id: string) => void
  periods: PeriodEntry[]
  addPeriod: (e: PeriodEntry) => void
  updatePeriod: (id: string, u: Partial<PeriodEntry>) => void
  deletePeriod: (id: string) => void
  chatMessages: ChatMessage[]
  addChatMessage: (m: ChatMessage) => void
  clearChat: () => void
  openModal: (content: React.ReactNode | null) => void
}

export const AppContext = createContext<AppState>(null!)
export const useApp = () => useContext(AppContext)

function useIsMobile() {
  const [v, setV] = useState(window.innerWidth <= 500)
  useEffect(() => {
    const check = () => setV(window.innerWidth <= 500)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return v
}

function useIsStandalone() {
  const [v, setV] = useState(false)
  useEffect(() => {
    setV(window.matchMedia('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true)
  }, [])
  return v
}

function useIsIOS() {
  const [v, setV] = useState(false)
  useEffect(() => {
    setV(/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))
  }, [])
  return v
}

function useWindowHeight() {
  const [h, setH] = useState(window.innerHeight)
  useEffect(() => {
    const update = () => setH(window.innerHeight)
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return h
}

export default function WebApp() {
  const { profile, setProfile } = useProfile()
  const { entries: checkIns, addEntry: addCheckIn, updateEntry: updateCheckIn } = useCheckIns()
  const { entries: mrsEntries, addEntry: addMRS } = useMRS()
  const { entries: treatments, addEntry: addTreatment, deleteEntry: deleteTreatment } = useTreatments()
  const { entries: periods, addEntry: addPeriod, updateEntry: updatePeriod, deleteEntry: deletePeriod } = usePeriods()
  const { messages: chatMessages, addMessage: addChatMessage, clearChat } = useChat()
  const [modal, setModal] = useState<React.ReactNode | null>(null)

  const isMobile = useIsMobile()
  const isStandalone = useIsStandalone()
  const isIOS = useIsIOS()
  const windowHeight = useWindowHeight()
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('helene_install_dismissed') === 'true')
  const [authenticated, setAuthenticated] = useState(() => localStorage.getItem('helene_access') === 'granted')

  const showInstallPrompt = isMobile && !isStandalone && !dismissed

  const openModal = useCallback((content: React.ReactNode | null) => setModal(content), [])

  const ctx: AppState = {
    profile, setProfile, checkIns, addCheckIn, updateCheckIn,
    mrsEntries, addMRS, treatments, addTreatment, deleteTreatment,
    periods, addPeriod, updatePeriod, deletePeriod,
    chatMessages, addChatMessage, clearChat, openModal,
  }

  // Register SW + check reminders + track app open
  useEffect(() => {
    registerServiceWorker()
    if (profile.onboardingComplete) {
      checkDailyReminder()
      trackApp.open()
    }
  }, [profile.onboardingComplete])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    document.body.style.height = '100dvh'
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'
    document.body.style.top = '0'
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
      document.body.style.height = ''
      document.body.style.position = ''
      document.body.style.width = ''
      document.body.style.top = ''
      document.documentElement.style.overflow = ''
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem('helene_install_dismissed', 'true')
    setDismissed(true)
  }

  const handleAccessCode = (code: string) => {
    const validCodes = ['HELENE2026', 'COBUILD', 'EARLACCESS']
    if (validCodes.includes(code.toUpperCase().trim())) {
      localStorage.setItem('helene_access', 'granted')
      setAuthenticated(true)
      return true
    }
    return false
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    // Capture email + name from invite link — persists to profile
    const emailParam = params.get('email')
    const nameParam = params.get('name')
    if (emailParam && !profile.userEmail) {
      setProfile(p => ({ ...p, userEmail: emailParam }))
    }
    if (nameParam && !profile.firstName) {
      setProfile(p => ({ ...p, firstName: nameParam }))
    }

    // Auto-auth with code
    if (!authenticated) {
      const code = params.get('code')
      if (code && handleAccessCode(code)) {
        window.history.replaceState({}, '', '/app')
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const appLang: AppLang = (profile.lang as AppLang) || detectLang()

  if (!authenticated) return <LangContext.Provider value={appLang}><AccessGate onSubmit={handleAccessCode} /></LangContext.Provider>

  // Day 7 / Day 14 feedback survey
  const accountDays = Math.floor((Date.now() - new Date(profile.accountCreatedAt).getTime()) / 86400000)
  const dismissedSurveys = JSON.parse(localStorage.getItem('helene_dismissed_surveys') || '[]') as string[]
  const surveyToShow = profile.onboardingComplete && profile.communityPseudonym
    ? (accountDays >= 14 && !dismissedSurveys.includes('day14') ? 'day14'
      : accountDays >= 7 && !dismissedSurveys.includes('day7') ? 'day7'
      : accountDays >= 3 && !dismissedSurveys.includes('day3') ? 'day3'
      : accountDays >= 1 && !dismissedSurveys.includes('day1') ? 'day1'
      : null)
    : null

  const dismissSurvey = (id: string) => {
    const updated = [...dismissedSurveys, id]
    localStorage.setItem('helene_dismissed_surveys', JSON.stringify(updated))
    // Force re-render
    window.dispatchEvent(new Event('storage'))
  }

  const appContent = (
    <>
      {!profile.onboardingComplete ? (
        <OnboardingView />
      ) : !profile.communityPseudonym ? (
        <PseudonymSetup />
      ) : (
        <>
          <AppShell modal={modal} setModal={setModal} />
          {surveyToShow && <FeedbackSurvey surveyId={surveyToShow} onDismiss={() => dismissSurvey(surveyToShow)} userEmail={profile.userEmail} />}
        </>
      )}
    </>
  )

  return (
    <LangContext.Provider value={appLang}>
    <AppContext.Provider value={ctx}>
      {showInstallPrompt ? (
        <InstallPrompt isIOS={isIOS} onContinue={handleDismiss} />
      ) : isMobile ? (
        <div className="flex flex-col" style={{ height: '100dvh', background: theme.background }}>
          <div style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }} />
          <div className="flex flex-col flex-1 overflow-hidden">{appContent}</div>
        </div>
      ) : (
        <div className="flex items-center justify-center" style={{ height: '100dvh', background: '#1a1a1a', overflow: 'hidden' }}>
          <div
            className="relative overflow-hidden flex flex-col"
            style={{
              width: 393,
              height: Math.min(852, windowHeight - 40),
              borderRadius: 44,
              background: theme.background,
              boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ height: 54, flexShrink: 0 }} />
            <div className="flex flex-col flex-1 overflow-hidden">{appContent}</div>
          </div>
        </div>
      )}
    </AppContext.Provider>
    </LangContext.Provider>
  )
}

// Pseudonym setup — required before using community
function PseudonymSetup() {
  const { setProfile } = useApp()
  const [pseudonym, setPseudonym] = useState('')

  const handleContinue = () => {
    if (!pseudonym.trim()) return
    setProfile(p => ({
      ...p,
      communityPseudonym: pseudonym.trim(),
      communityAvatarSeed: Math.floor(Math.random() * 1000),
    }))
  }

  const suggestions = ['MoonWalker', 'SilverLining', 'WarmWave', 'ClearSkies', 'QuietStorm', 'SunriseGal', 'NightOwl']
  const randomSuggestions = suggestions.sort(() => Math.random() - 0.5).slice(0, 3)

  return (
    <div className="flex flex-col flex-1 px-6 items-center justify-center" style={{ background: theme.background }}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ background: theme.lavenderFill }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={theme.textPrimary} strokeWidth="1.5" strokeLinecap="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: theme.textPrimary }}>Choose a pseudonym</h2>
      <p className="text-sm text-center mb-8 leading-relaxed" style={{ color: theme.textSecondary, maxWidth: 280 }}>
        This is how you'll appear in the community. Your real name stays private — share openly, without worrying.
      </p>

      <input
        type="text"
        value={pseudonym}
        onChange={e => setPseudonym(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleContinue()}
        placeholder="Your pseudonym"
        autoFocus
        className="w-full px-5 py-4 rounded-2xl text-center text-lg focus:outline-none mb-3"
        style={{ background: theme.surface, color: theme.textPrimary }}
      />

      <div className="flex gap-2 mb-8">
        {randomSuggestions.map(s => (
          <button key={s} onClick={() => setPseudonym(s)} className="px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ background: theme.surface, color: theme.textSecondary }}>
            {s}
          </button>
        ))}
      </div>

      <button
        onClick={handleContinue}
        disabled={!pseudonym.trim()}
        className="w-full py-4 rounded-2xl text-white font-semibold disabled:opacity-30"
        style={{ background: theme.dark }}
      >
        Continue
      </button>
    </div>
  )
}

// Install prompt
let deferredPrompt: Event | null = null
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e })
}

function InstallPrompt({ isIOS, onContinue }: { isIOS: boolean; onContinue: () => void }) {
  const [installing, setInstalling] = useState(false)
  const canInstallNatively = !isIOS && deferredPrompt !== null

  const handleNativeInstall = async () => {
    if (!deferredPrompt) return
    setInstalling(true)
    const prompt = deferredPrompt as unknown as { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }
    await prompt.prompt()
    const result = await prompt.userChoice
    if (result.outcome === 'accepted') deferredPrompt = null
    setInstalling(false)
  }

  return (
    <div className="flex flex-col items-center justify-between px-8 py-12" style={{ height: '100dvh', background: theme.background }}>
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <img src="/images/logo.svg" alt="Hélène" className="h-10 mb-10" />
        <h1 className="text-2xl font-bold mb-2" style={{ color: theme.textPrimary }}>Welcome to Hélène</h1>
        <p className="text-sm leading-relaxed mb-10" style={{ color: theme.textSecondary, maxWidth: 280 }}>
          Add Hélène to your home screen so it feels like a real app — fullscreen, always one tap away.
        </p>
        {canInstallNatively ? (
          <button onClick={handleNativeInstall} disabled={installing} className="w-full py-4 rounded-2xl text-white font-semibold mb-4" style={{ background: theme.dark }}>
            {installing ? 'Installing...' : 'Install Hélène'}
          </button>
        ) : isIOS ? (
          <div className="w-full rounded-3xl p-5 text-left" style={{ background: theme.surface }}>
            <Step n={1} fill={theme.lavenderFill} title={<>Tap <ShareIcon /> at the bottom of your screen</>} sub="The square with the arrow pointing up" />
            <Step n={2} fill={theme.marigoldFill} title={<>Tap "Add to Home Screen" <AddIcon /></>} sub="Scroll down in the share menu to find it" />
            <Step n={3} fill={theme.mintFill} title={<>Tap "Add" — done!</>} sub="Hélène will appear on your home screen" last />
          </div>
        ) : (
          <div className="w-full rounded-3xl p-5 text-left" style={{ background: theme.surface }}>
            <Step n={1} fill={theme.lavenderFill} title={<>Tap the <strong>menu ⋮</strong> in your browser</>} />
            <Step n={2} fill={theme.marigoldFill} title={<>Tap <strong>"Install app"</strong></>} last />
          </div>
        )}
      </div>
      <div className="w-full">
        <button onClick={onContinue} className="w-full py-4 rounded-2xl font-semibold text-sm" style={{ background: theme.surface, color: theme.textSecondary }}>
          Continue without installing
        </button>
      </div>
    </div>
  )
}

function Step({ n, fill, title, sub, last }: { n: number; fill: string; title: React.ReactNode; sub?: string; last?: boolean }) {
  return (
    <div className={`flex items-start gap-3 ${last ? '' : 'mb-5'}`}>
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: fill, color: theme.textPrimary }}>{n}</div>
      <div>
        <p className="text-sm font-medium" style={{ color: theme.textPrimary }}>{title}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: theme.textLight }}>{sub}</p>}
      </div>
    </div>
  )
}

function ShareIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.rose} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block align-middle ml-0.5"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
}

function AddIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.rose} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block"><rect x="3" y="3" width="18" height="18" rx="4" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
}

function AccessGate({ onSubmit }: { onSubmit: (code: string) => boolean }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  const handleSubmit = () => { if (!onSubmit(code)) { setError(true); setTimeout(() => setError(false), 2000) } }

  return (
    <div className="flex flex-col items-center justify-center px-8" style={{ height: '100dvh', background: theme.background }}>
      <img src="/images/logo.svg" alt="Hélène" className="h-10 mb-10" />
      <h1 className="text-2xl font-bold mb-2 text-center" style={{ color: theme.textPrimary }}>This app is invite-only</h1>
      <p className="text-sm text-center mb-8" style={{ color: theme.textSecondary }}>Enter the access code from your invitation email.</p>
      <input type="text" value={code} onChange={e => { setCode(e.target.value); setError(false) }} onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        placeholder="Access code" autoFocus
        className="w-full px-5 py-4 rounded-2xl text-center text-lg font-semibold tracking-widest focus:outline-none mb-4"
        style={{ background: theme.surface, color: theme.textPrimary, border: error ? `2px solid ${theme.rose}` : '2px solid transparent' }} />
      {error && <p className="text-sm mb-4" style={{ color: theme.rose }}>Invalid code. Check your email.</p>}
      <button onClick={handleSubmit} disabled={!code.trim()} className="w-full py-4 rounded-2xl text-white font-semibold disabled:opacity-30" style={{ background: theme.dark }}>Enter</button>
    </div>
  )
}

// Tab icons
function TabIcon({ name, active }: { name: string; active: boolean }) {
  const color = active ? '#ffffff' : 'rgba(255,255,255,0.4)'
  const w = active ? 2 : 1.5
  const props = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: w, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (name) {
    case 'home': return <svg {...props}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />{active && <path d="M9 22V12h6v10" />}</svg>
    case 'community': return <svg {...props}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />{active && <><path d="M8 10h8" /><path d="M8 14h4" /></>}</svg>
    case 'insights': return <svg {...props}><path d="M3 3v18h18" /><path d="M7 16l4-4 4 4 5-7" /></svg>
    case 'ai': return <svg {...props}><path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74z" /></svg>
    default: return null
  }
}

// In-app feedback survey — day 7 and day 14
function FeedbackSurvey({ surveyId, onDismiss, userEmail }: { surveyId: string; onDismiss: () => void; userEmail: string }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>(['', '', ''])
  const [submitted, setSubmitted] = useState(false)

  const config: Record<string, { title: string; subtitle: string; questions: string[] }> = {
    day1: {
      title: 'Your first impression',
      subtitle: "You've just started. One quick question — we're listening.",
      questions: [
        "What was your first reaction when you opened Hélène?",
        "Was anything confusing or unclear?",
        "What would make you come back tomorrow?",
      ],
    },
    day3: {
      title: 'Three days in',
      subtitle: "You've had a few days to explore. We'd love to know what you think.",
      questions: [
        "What have you used the most so far?",
        "What feels unnecessary or in the way?",
        "What would make Hélène feel essential to your day?",
      ],
    },
    day7: {
      title: 'One week with Hélène',
      subtitle: "3 quick questions — your answers directly shape what we build next.",
      questions: [
        "What's the most useful thing you've found so far?",
        "What's frustrating or confusing?",
        "What's the one thing you wish Hélène could do?",
      ],
    },
    day14: {
      title: 'Two weeks in',
      subtitle: "You're one of our most engaged users. This feedback matters a lot.",
      questions: [
        "What keeps you coming back?",
        "What almost made you stop using it?",
        "If you could change one thing about Hélène, what would it be?",
      ],
    },
  }

  const { title, subtitle, questions } = config[surveyId] ?? config.day7

  const setAnswer = (value: string) => {
    const next = [...answers]
    next[step] = value
    setAnswers(next)
  }

  const handleSubmit = () => {
    // Save feedback locally + could POST to API
    const feedback = {
      surveyId,
      email: userEmail,
      timestamp: new Date().toISOString(),
      q1: answers[0],
      q2: answers[1],
      q3: answers[2],
    }
    const existing = JSON.parse(localStorage.getItem('helene_survey_responses') || '[]')
    existing.push(feedback)
    localStorage.setItem('helene_survey_responses', JSON.stringify(existing))
    trackApp.surveyResponse(surveyId, answers)
    setSubmitted(true)
    setTimeout(onDismiss, 2000)
  }

  return (
    <div className="absolute inset-0 z-[60] flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div
        className="w-full rounded-t-3xl px-6 pt-6 pb-8"
        style={{ background: theme.background, maxHeight: '80%', animation: 'slideUp 0.3s ease' }}
      >
        {submitted ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: theme.mintFill }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.textPrimary} strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
            </div>
            <p className="text-lg font-bold" style={{ color: theme.textPrimary }}>Thank you</p>
            <p className="text-sm mt-1" style={{ color: theme.textSecondary }}>This is exactly what helps us build better.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-lg font-bold" style={{ color: theme.textPrimary }}>{title}</p>
                <p className="text-xs" style={{ color: theme.textSecondary }}>{step + 1}/3</p>
              </div>
              <button onClick={onDismiss} className="text-xs" style={{ color: theme.textLight }}>Later</button>
            </div>

            <p className="text-sm mb-1" style={{ color: theme.textSecondary }}>
              {step === 0 && subtitle}
            </p>

            <p className="text-sm font-semibold mb-3" style={{ color: theme.textPrimary }}>{questions[step]}</p>

            <textarea
              value={answers[step]}
              onChange={e => setAnswer(e.target.value)}
              placeholder="Your thoughts..."
              rows={3}
              autoFocus
              className="w-full px-4 py-3 rounded-2xl text-sm focus:outline-none resize-none mb-4"
              style={{ background: theme.surface, color: theme.textPrimary }}
            />

            <div className="flex gap-2">
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)} className="flex-1 py-3 rounded-2xl text-sm font-medium"
                  style={{ background: theme.surface, color: theme.textSecondary }}>Back</button>
              )}
              <button
                onClick={() => step < 2 ? setStep(s => s + 1) : handleSubmit()}
                disabled={!answers[step].trim()}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white disabled:opacity-30"
                style={{ background: theme.dark }}
              >
                {step < 2 ? 'Next' : 'Send'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Swipeable modal overlay — swipe/drag down on the handle to dismiss
function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const [translateY, setTranslateY] = useState(0)
  const [dismissing, setDismissing] = useState(false)
  const dragging = useRef(false)
  const startY = useRef(0)
  const currentY = useRef(0)

  const onStart = (clientY: number) => {
    startY.current = clientY
    currentY.current = 0
    dragging.current = true
  }
  const onMove = (clientY: number) => {
    if (!dragging.current) return
    const dy = clientY - startY.current
    if (dy > 0) {
      currentY.current = dy
      setTranslateY(dy)
    }
  }
  const onEnd = () => {
    dragging.current = false
    if (currentY.current > 120) {
      // Animate fully off screen, then close
      setDismissing(true)
      setTranslateY(window.innerHeight)
      setTimeout(onClose, 250)
    } else {
      setTranslateY(0)
    }
  }

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col min-h-0 overflow-hidden"
      style={{
        background: theme.background,
        animation: !dismissing && translateY === 0 ? 'slideUp 0.25s ease' : undefined,
        transform: `translateY(${translateY}px)`,
        transition: dragging.current ? 'none' : 'transform 0.3s ease, opacity 0.3s ease',
        opacity: dismissing ? 0 : translateY > 0 ? Math.max(0.5, 1 - translateY / 400) : 1,
        borderTopLeftRadius: translateY > 0 ? 16 : 0,
        borderTopRightRadius: translateY > 0 ? 16 : 0,
      }}
    >
      {/* Drag handle — works with touch AND mouse */}
      <div
        className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing select-none flex-shrink-0"
        onTouchStart={e => onStart(e.touches[0].clientY)}
        onTouchMove={e => onMove(e.touches[0].clientY)}
        onTouchEnd={onEnd}
        onMouseDown={e => {
          onStart(e.clientY)
          const moveHandler = (ev: MouseEvent) => onMove(ev.clientY)
          const upHandler = () => {
            onEnd()
            window.removeEventListener('mousemove', moveHandler)
            window.removeEventListener('mouseup', upHandler)
          }
          window.addEventListener('mousemove', moveHandler)
          window.addEventListener('mouseup', upHandler)
        }}
      >
        <div className="w-9 h-1 rounded-full" style={{ background: theme.separator }} />
      </div>
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {children}
      </div>
    </div>
  )
}

// App shell with tab navigation, modal system, and transitions
function AppShell({ modal, setModal }: { modal: React.ReactNode | null; setModal: (v: React.ReactNode | null) => void }) {
  const [tab, setTab] = useState(0)
  const tabs = [{ name: 'home' }, { name: 'community' }, { name: 'insights' }, { name: 'ai' }]

  return (
    <div className="flex flex-col flex-1 relative overflow-hidden" style={{ background: theme.background }}>
      {/* Screen content with fade transition */}
      {tab === 3 ? (
        /* AI tab: flex layout so messages scroll, input stays at bottom */
        <div className="flex-1 flex flex-col min-h-0" style={{ paddingBottom: 80, animation: 'fadeIn 0.2s ease' }}>
          <AIView />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ paddingBottom: 100 }}>
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            {tab === 0 && <HomeView onOpenModal={setModal} />}
            {tab === 1 && <CommunityView />}
            {tab === 2 && <InsightsView />}
          </div>
        </div>
      )}

      {/* Floating tab bar */}
      <div className="absolute left-0 right-0 flex justify-center px-12" style={{ bottom: 'max(env(safe-area-inset-bottom, 8px), 8px)', zIndex: 40 }}>
        <div className="flex items-center rounded-full px-2 py-3" style={{ background: theme.dark, boxShadow: '0 20px 50px -10px rgba(0,0,0,0.4)' }}>
          {tabs.map((t, i) => (
            <button key={i} onClick={() => { setTab(i); trackApp.tabSwitch(t.name) }} className="flex-1 flex items-center justify-center px-4 py-1" style={{ minWidth: 56 }}>
              <TabIcon name={t.name} active={tab === i} />
            </button>
          ))}
        </div>
      </div>

      {/* Modal overlay with slide-up animation + swipe-to-dismiss */}
      {modal && (
        <ModalOverlay onClose={() => setModal(null)}>
          {modal}
        </ModalOverlay>
      )}

      {/* CSS animations */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
  )
}

