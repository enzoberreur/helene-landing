import { theme } from '../theme'
import { useApp } from '../WebApp'
import { isToday, moodLabels, moodDescriptions, moodFills, moodIcons, symptomsList, triggersList } from '../types'
import CheckInView from './CheckInView'
import ProfileView from './ProfileView'
import AssessmentView from './AssessmentView'
import TreatmentLogView from './TreatmentLogView'
import CalmToolsView from './CalmToolsView'
import DoctorReportView from './DoctorReportView'
import ArticleView from './ArticleView'

interface Props {
  onOpenModal: (content: React.ReactNode | null) => void
}

export default function HomeView({ onOpenModal }: Props) {
  const { profile, checkIns, treatments, mrsEntries, deleteTreatment } = useApp()

  const todayEntry = checkIns.find(e => isToday(e.date))

  const accountAge = Date.now() - new Date(profile.accountCreatedAt).getTime()
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  weekStart.setHours(0, 0, 0, 0)
  const hasMRSThisWeek = mrsEntries.some(e => new Date(e.date) >= weekStart)
  const assessmentDue = accountAge > 7 * 86400000 && !hasMRSThisWeek

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const openCheckIn = (editId?: string) => {
    onOpenModal(<CheckInView existingEntryId={editId ?? null} onClose={() => onOpenModal(null)} />)
  }
  const openSettings = () => onOpenModal(<ProfileView onClose={() => onOpenModal(null)} />)
  const openAssessment = () => onOpenModal(<AssessmentView onClose={() => onOpenModal(null)} />)
  const openTreatmentLog = () => onOpenModal(<TreatmentLogView onClose={() => onOpenModal(null)} />)
  const openCalm = () => onOpenModal(<CalmToolsView onClose={() => onOpenModal(null)} />)
  const openDoctorReport = () => onOpenModal(<DoctorReportView onClose={() => onOpenModal(null)} />)
  const openArticle = (id: string) => onOpenModal(<ArticleView articleId={id} onClose={() => onOpenModal(null)} />)

  const symptomLabel = (id: string) => symptomsList.find(s => s.id === id)?.label ?? id
  const triggerLabel = (id: string) => triggersList.find(t => t.id === id)?.label ?? id

  // --- This Week insight ---
  const last7 = checkIns.filter(e => new Date(e.date).getTime() > Date.now() - 7 * 86400000)
  const weekInsight = (() => {
    if (last7.length < 2) return null
    const avgMood = (last7.reduce((s, e) => s + e.mood, 0) / last7.length).toFixed(1)
    const symFreq: Record<string, number> = {}
    last7.forEach(e => e.symptoms.forEach(s => { symFreq[s] = (symFreq[s] || 0) + 1 }))
    const topSym = Object.entries(symFreq).sort((a, b) => b[1] - a[1]).slice(0, 2)
    const sleepEntries = last7.filter(e => e.sleepQuality > 0)
    const avgSleep = sleepEntries.length ? (sleepEntries.reduce((s, e) => s + e.sleepQuality, 0) / sleepEntries.length).toFixed(1) : null

    let text = `${last7.length} check-ins this week. Avg mood: ${avgMood}/5.`
    if (avgSleep) text += ` Sleep: ${avgSleep}/5.`
    if (topSym.length > 0) {
      const labels = topSym.map(([id, c]) => `${symptomLabel(id)} (${c}x)`).join(', ')
      text += ` Top symptoms: ${labels}.`
    }
    return text
  })()

  // --- Guided first week ---
  const accountDays = Math.floor(accountAge / 86400000)
  const guidedTip = (() => {
    if (checkIns.length === 0 && accountDays <= 1) return { title: "Day 1 — Just check in", text: "Tap the card below to log how you feel. It takes 30 seconds. That's all for today.", icon: "👋" }
    if (checkIns.length >= 1 && checkIns.length < 3 && accountDays <= 3) return { title: "Keep going", text: "You've logged your first check-in. Try adding symptoms tomorrow — that's where patterns start to show.", icon: "🌱" }
    if (checkIns.length >= 3 && checkIns.length < 7 && accountDays <= 5) return { title: "Patterns emerging", text: "With 3+ check-ins, the Insights tab is starting to have real data. Take a look.", icon: "📊" }
    if (checkIns.length >= 7 && accountDays <= 10) return { title: "One week of data", text: "The Doctor Report now has substance. Try generating it — you'll be surprised how much your data says.", icon: "🩺" }
    return null
  })()

  return (
    <div className="px-6 pt-2">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-sm" style={{ color: theme.textSecondary }}>{dateStr}</p>
          <h1 className="text-3xl mt-1" style={{ color: theme.textPrimary }}>
            {profile.firstName ? `Hello, ${profile.firstName}.` : 'Hello.'}
          </h1>
          <h1 className="text-3xl" style={{ color: theme.textPrimary }}>
            How do you <span className="font-bold">feel today?</span>
          </h1>
        </div>
        <button
          onClick={openSettings}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: theme.surface }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.textPrimary} strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>
      </div>

      {/* Guided first week tip */}
      {guidedTip && (
        <div className="rounded-3xl p-4 mb-4 flex items-start gap-3" style={{ background: theme.lavenderFill }}>
          <span className="text-xl">{guidedTip.icon}</span>
          <div>
            <p className="text-sm font-bold mb-0.5" style={{ color: theme.textPrimary }}>{guidedTip.title}</p>
            <p className="text-xs leading-relaxed" style={{ color: theme.textSecondary }}>{guidedTip.text}</p>
          </div>
        </div>
      )}

      {/* This week insight */}
      {weekInsight && !guidedTip && (
        <div className="rounded-3xl p-4 mb-4" style={{ background: theme.surface }}>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: theme.mintFill }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.textPrimary} strokeWidth="2" strokeLinecap="round"><path d="M3 3v18h18" /><path d="M7 16l4-4 4 4 5-7" /></svg>
            </div>
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: theme.textLight }}>THIS WEEK</p>
              <p className="text-sm leading-relaxed" style={{ color: theme.textPrimary }}>{weekInsight}</p>
            </div>
          </div>
        </div>
      )}

      {/* Today's check-in card or prompt */}
      {todayEntry ? (
        <div className="rounded-3xl overflow-hidden mb-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="relative p-5" style={{ background: moodFills[todayEntry.mood] || theme.peachFill }}>
            <span className="absolute right-2 bottom-2 text-7xl opacity-20">{moodIcons[todayEntry.mood]}</span>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium opacity-50" style={{ color: theme.textPrimary }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1"><path d="M20 6L9 17l-5-5" /></svg>
                Today's check-in
              </span>
              <button
                onClick={() => openCheckIn(todayEntry.id)}
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: 'rgba(255,255,255,0.45)', color: theme.textPrimary }}
              >
                Edit
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.38)' }}>
                <span className="text-2xl">{moodIcons[todayEntry.mood]}</span>
              </div>
              <div>
                <p className="text-xl font-bold" style={{ color: theme.textPrimary }}>{moodLabels[todayEntry.mood]}</p>
                <p className="text-xs opacity-50" style={{ color: theme.textPrimary }}>{moodDescriptions[todayEntry.mood]}</p>
              </div>
            </div>
            {(todayEntry.sleepQuality > 0 || todayEntry.energyLevel > 0 || todayEntry.stressLevel > 0) && (
              <div className="flex gap-1.5 mt-3">
                {todayEntry.sleepQuality > 0 && <Badge label="Sleep" value={todayEntry.sleepQuality} />}
                {todayEntry.energyLevel > 0 && <Badge label="Energy" value={todayEntry.energyLevel} />}
                {todayEntry.stressLevel > 0 && <Badge label="Stress" value={todayEntry.stressLevel} />}
              </div>
            )}
          </div>
          {(todayEntry.symptoms.length > 0 || todayEntry.triggers.length > 0 || todayEntry.note) && (
            <div className="p-4" style={{ background: theme.surface }}>
              {todayEntry.symptoms.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {todayEntry.symptoms.map(s => (
                    <span key={s} className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: theme.sageFill, color: theme.textSecondary }}>{symptomLabel(s)}</span>
                  ))}
                </div>
              )}
              {todayEntry.triggers.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {todayEntry.triggers.map(t => (
                    <span key={t} className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: theme.marigoldFill, color: theme.textSecondary }}>{triggerLabel(t)}</span>
                  ))}
                </div>
              )}
              {todayEntry.note && <p className="text-sm italic" style={{ color: theme.textSecondary }}>"{todayEntry.note}"</p>}
            </div>
          )}
        </div>
      ) : (
        <button onClick={() => openCheckIn()} className="w-full flex items-center justify-between px-5 py-4 rounded-3xl mb-5" style={{ background: theme.surface }}>
          <span className="text-base" style={{ color: theme.textLight }}>Your reflection...</span>
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: theme.dark }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M7 17L17 7M17 7H7M17 7v10" /></svg>
          </div>
        </button>
      )}

      {assessmentDue && (
        <button onClick={openAssessment} className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-3xl mb-5" style={{ background: theme.surface }}>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: theme.marigoldFill }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.textPrimary} strokeWidth="2" strokeLinecap="round"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold" style={{ color: theme.textPrimary }}>Weekly check-up ready</p>
            <p className="text-xs" style={{ color: theme.textSecondary }}>11 questions · ~3 min</p>
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: theme.dark }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M7 17L17 7M17 7H7M17 7v10" /></svg>
          </div>
        </button>
      )}

      {/* Treatments */}
      <div className="rounded-3xl p-5 mb-5" style={{ background: theme.surface }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold" style={{ color: theme.textPrimary }}>Treatments & Changes</p>
          <button onClick={openTreatmentLog} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: theme.dark }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          </button>
        </div>
        {treatments.length === 0 ? (
          <p className="text-sm" style={{ color: theme.textLight }}>Tap + to log your first treatment or lifestyle change.</p>
        ) : (
          <div>
            {treatments.slice(0, 5).map(t => (
              <div key={t.id} className="flex items-center justify-between py-2.5 border-b last:border-0" style={{ borderColor: theme.separator }}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: theme.textPrimary }}>{t.name}</p>
                  <p className="text-xs" style={{ color: theme.textSecondary }}>{new Date(t.date).toLocaleDateString()}</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full mx-2" style={{
                  background: t.status === 'started' ? theme.sageFill : t.status === 'stopped' ? theme.peachFill : t.status === 'adjusted' ? theme.marigoldFill : theme.lavenderFill,
                  color: theme.textPrimary,
                }}>{t.status.charAt(0).toUpperCase() + t.status.slice(1)}</span>
                <button onClick={() => deleteTreatment(t.id)} className="p-1.5 rounded-lg" style={{ color: theme.textLight }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" /></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <button onClick={openCalm} className="text-left">
          <ActionCard title="Quick calm tools" subtitle="Breathing · 1–5 min" fill={theme.peachFill} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round"><path d="M17.7 7.7A7.5 7.5 0 103 12h10.5" /></svg>} />
        </button>
        <button onClick={openDoctorReport} className="text-left">
          <ActionCard title="Prepare for your doctor" subtitle="Generate report" fill={theme.mintFill} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round"><path d="M4.8 2.3A2 2 0 106 5H4a2 2 0 10.8-2.7M8 5v1a6 6 0 006 6v0a6 6 0 006-6V5" /><path d="M14 18v4M10 18v4" /></svg>} />
        </button>
      </div>

      {/* For You */}
      <div className="mb-5">
        <p className="text-sm font-semibold mb-3" style={{ color: theme.textPrimary }}>For you</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <button onClick={() => openArticle('understanding-body')} className="text-left">
            <ArticleCard title="Understanding your body" subtitle="Learn what's happening" fill={theme.lavenderFill} illustration="body" />
          </button>
          <button onClick={() => openArticle('track-patterns')} className="text-left">
            <ArticleCard title="Track your patterns" subtitle="Spot what changes" fill={theme.marigoldFill} illustration="wave" />
          </button>
        </div>
        <button onClick={() => openArticle('sleep-menopause')} className="text-left w-full">
          <ArticleCard title="Sleep disruption affects 68% of us" subtitle="Did you know? Tap to learn more" fill={theme.sageFill} illustration="moon" />
        </button>
      </div>

      <div style={{ height: 40 }} />
    </div>
  )
}

function Badge({ label, value }: { label: string; value: number }) {
  return (
    <span className="text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1" style={{ background: 'rgba(255,255,255,0.4)', color: 'rgba(36,32,24,0.7)' }}>
      {label} {value}/5
    </span>
  )
}

function ActionCard({ title, subtitle, fill, icon }: { title: string; subtitle: string; fill: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-3xl overflow-hidden relative" style={{ background: fill, height: 175 }}>
      <div className="absolute top-3 left-3 w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.5)' }}>
        {icon}
      </div>
      <div className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.35)' }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={theme.textPrimary} strokeWidth="3" strokeLinecap="round"><path d="M7 17L17 7M17 7H7M17 7v10" /></svg>
      </div>
      <div className="absolute bottom-2 left-2 right-2 p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.5)' }}>
        <p className="text-sm font-bold" style={{ color: theme.textPrimary }}>{title}</p>
        <p className="text-xs" style={{ color: theme.textSecondary }}>{subtitle}</p>
      </div>
    </div>
  )
}

function ArticleCard({ title, subtitle, fill, illustration }: { title: string; subtitle: string; fill: string; illustration?: 'body' | 'wave' | 'moon' }) {
  return (
    <div className="rounded-3xl overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div className="h-28 relative flex items-center justify-center overflow-hidden" style={{ background: fill }}>
        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, transparent, rgba(255,255,255,0.18))' }} />
        {illustration === 'body' && <BodyIllustration />}
        {illustration === 'wave' && <WaveIllustration />}
        {illustration === 'moon' && <MoonIllustration />}
      </div>
      <div className="p-3 flex items-center justify-between" style={{ background: theme.surface }}>
        <div className="flex-1">
          <p className="text-sm font-bold" style={{ color: theme.textPrimary }}>{title}</p>
          <p className="text-xs" style={{ color: theme.textSecondary }}>{subtitle}</p>
        </div>
        <div className="w-6 h-6 rounded-full flex items-center justify-center ml-2" style={{ background: theme.background }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={theme.textPrimary} strokeWidth="3" strokeLinecap="round"><path d="M7 17L17 7M17 7H7M17 7v10" /></svg>
        </div>
      </div>
    </div>
  )
}

// Canvas-style SVG illustrations matching iOS
function BodyIllustration() {
  return (
    <svg width="120" height="100" viewBox="0 0 120 100">
      <circle cx="60" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <circle cx="60" cy="50" r="28" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      <circle cx="60" cy="50" r="16" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
      <circle cx="60" cy="50" r="5" fill="rgba(255,255,255,0.55)" />
      <circle cx="90" cy="28" r="2.5" fill="rgba(255,255,255,0.55)" />
      <circle cx="32" cy="64" r="2" fill="rgba(255,255,255,0.4)" />
      <circle cx="40" cy="24" r="3" fill="rgba(255,255,255,0.45)" />
      <circle cx="84" cy="72" r="2" fill="rgba(255,255,255,0.3)" />
    </svg>
  )
}

function WaveIllustration() {
  return (
    <svg width="120" height="100" viewBox="0 0 120 100">
      <path d="M0 30 Q15 20, 30 30 T60 30 T90 30 T120 30" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" />
      <path d="M0 50 Q15 40, 30 50 T60 50 T90 50 T120 50" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
      <path d="M0 70 Q15 62, 30 70 T60 70 T90 70 T120 70" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" />
      <circle cx="20" cy="20" r="3.5" fill="rgba(255,255,255,0.8)" />
      <circle cx="60" cy="25" r="3" fill="rgba(255,255,255,0.7)" />
      <circle cx="85" cy="38" r="3.5" fill="rgba(255,255,255,0.65)" />
      <circle cx="42" cy="58" r="3" fill="rgba(255,255,255,0.55)" />
    </svg>
  )
}

function MoonIllustration() {
  return (
    <svg width="120" height="100" viewBox="0 0 120 100">
      {/* Stars */}
      <circle cx="30" cy="26" r="2" fill="rgba(255,255,255,0.8)" />
      <circle cx="88" cy="18" r="1.5" fill="rgba(255,255,255,0.6)" />
      <circle cx="92" cy="60" r="2.5" fill="rgba(255,255,255,0.7)" />
      <circle cx="26" cy="64" r="1.5" fill="rgba(255,255,255,0.5)" />
      <circle cx="68" cy="84" r="2" fill="rgba(255,255,255,0.6)" />
      <circle cx="42" cy="78" r="1.5" fill="rgba(255,255,255,0.4)" />
      {/* Crescent moon */}
      <clipPath id="moon-clip"><circle cx="54" cy="50" r="18" /></clipPath>
      <circle cx="54" cy="50" r="18" fill="rgba(255,255,255,0.65)" />
      <circle cx="64" cy="44" r="16" fill="currentColor" style={{ color: theme.sageFill }} />
    </svg>
  )
}
