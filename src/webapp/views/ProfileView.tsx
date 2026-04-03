import { useState } from 'react'
import { theme } from '../theme'
import { useApp } from '../WebApp'

function FeedbackInProfile() {
  const { profile } = useApp()
  const [open, setOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [sent, setSent] = useState(false)

  const handleSend = () => {
    if (!feedback.trim()) return
    const existing = JSON.parse(localStorage.getItem('helene_feedback') || '[]') as string[]
    existing.push(`[${new Date().toISOString()}] ${profile.communityPseudonym || profile.firstName}: ${feedback}`)
    localStorage.setItem('helene_feedback', JSON.stringify(existing))
    setSent(true)
    setTimeout(() => { setOpen(false); setSent(false); setFeedback('') }, 2000)
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
        style={{ background: theme.surface, color: theme.textPrimary }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
        Send feedback to the team
      </button>
    )
  }

  return (
    <div className="rounded-3xl p-4" style={{ background: theme.surface }}>
      {sent ? (
        <p className="text-sm text-center py-3" style={{ color: theme.textPrimary }}>Thank you!</p>
      ) : (
        <>
          <textarea value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Bug, idea, feeling — anything helps..."
            rows={3} autoFocus className="w-full px-4 py-3 rounded-2xl text-sm focus:outline-none resize-none mb-3"
            style={{ background: theme.background, color: theme.textPrimary }} />
          <div className="flex gap-2">
            <button onClick={() => setOpen(false)} className="flex-1 py-2.5 rounded-xl text-xs font-medium" style={{ background: theme.background, color: theme.textSecondary }}>Cancel</button>
            <button onClick={handleSend} disabled={!feedback.trim()} className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white disabled:opacity-30" style={{ background: theme.dark }}>Send</button>
          </div>
        </>
      )}
    </div>
  )
}

export default function ProfileView({ onClose }: { onClose: () => void }) {
  const { profile, setProfile } = useApp()

  const goalLabels: Record<string, string> = {
    understand: 'Understanding what\'s happening',
    community: 'Connecting with other women',
    track: 'Tracking my symptoms',
    doctor: 'Preparing for my doctor',
  }

  const stageLabels: Record<string, string> = {
    regular: 'Periods still regular',
    irregular: 'Periods have become irregular',
    post: 'Periods have stopped',
    unsure: 'Not sure',
  }

  const handleSignOut = () => {
    setProfile(() => ({
      firstName: '',
      journeyStage: '',
      ageRange: '',
      hrtStatus: '',
      exerciseFrequency: '',
      smokingStatus: 'never',
      alcoholFrequency: 'rarely',
      caffeineIntake: 'moderate',
      selectedSymptoms: [],
      primaryGoal: '',
      medicalFollowUp: '',
      communityPseudonym: '',
      communityAvatarSeed: Math.floor(Math.random() * 1000),
      accountCreatedAt: new Date().toISOString(),
      onboardingComplete: false,
    }))
    localStorage.clear()
    onClose()
  }

  const initial = profile.firstName ? profile.firstName.charAt(0).toUpperCase() : '?'

  return (
    <div className="flex flex-col flex-1 min-h-0 px-6" style={{ background: theme.background }}>
      <div style={{ height: 8 }} />

      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Avatar + Name */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-2"
            style={{ background: theme.lavenderFill, color: theme.textPrimary }}
          >
            {initial}
          </div>
          <p className="text-lg font-bold" style={{ color: theme.textPrimary }}>{profile.firstName || 'User'}</p>
          <p className="text-xs" style={{ color: theme.textSecondary }}>{stageLabels[profile.journeyStage] || profile.journeyStage}</p>
        </div>

        {/* My Journey */}
        <div className="rounded-3xl p-4 mb-4" style={{ background: theme.surface }}>
          <p className="text-xs font-semibold mb-3 uppercase tracking-wide" style={{ color: theme.textLight }}>My Journey</p>
          <InfoRow label="Goal" value={goalLabels[profile.primaryGoal] || profile.primaryGoal} />
          <InfoRow label="Medical follow-up" value={profile.medicalFollowUp || '—'} />
          <InfoRow label="HRT status" value={profile.hrtStatus || '—'} />
          <InfoRow label="Age range" value={profile.ageRange || '—'} />
        </div>

        {/* My Symptoms */}
        {profile.selectedSymptoms.length > 0 && (
          <div className="rounded-3xl p-4 mb-4" style={{ background: theme.surface }}>
            <p className="text-xs font-semibold mb-3 uppercase tracking-wide" style={{ color: theme.textLight }}>My Symptoms</p>
            <div className="flex flex-wrap gap-2">
              {profile.selectedSymptoms.map(s => (
                <span key={s} className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: theme.lavenderFill, color: theme.textPrimary }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Community Identity */}
        <div className="rounded-3xl p-4 mb-4" style={{ background: theme.surface }}>
          <p className="text-xs font-semibold mb-3 uppercase tracking-wide" style={{ color: theme.textLight }}>Community Identity</p>
          <p className="text-sm" style={{ color: theme.textPrimary }}>
            {profile.communityPseudonym || profile.firstName || 'Not set up yet'}
          </p>
        </div>

        {/* Feedback */}
        <div className="mb-4">
          <FeedbackInProfile />
        </div>

        {/* Actions */}
        <button
          onClick={handleSignOut}
          className="w-full py-3 rounded-2xl text-sm font-semibold mb-3"
          style={{ background: theme.surface, color: theme.rose }}
        >
          Sign out & clear data
        </button>
      </div>

      <div className="pb-10 pt-4">
        <button onClick={onClose} className="w-full py-4 rounded-2xl text-white font-semibold" style={{ background: theme.dark }}>
          Done
        </button>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b last:border-0" style={{ borderColor: theme.separator }}>
      <span className="text-sm" style={{ color: theme.textSecondary }}>{label}</span>
      <span className="text-sm font-medium" style={{ color: theme.textPrimary }}>{value}</span>
    </div>
  )
}
