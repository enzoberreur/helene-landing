import { theme } from '../theme'
import { useApp } from '../WebApp'
import { mrsScores, symptomsList } from '../types'

export default function DoctorReportView({ onClose }: { onClose: () => void }) {
  const { profile, checkIns, mrsEntries, treatments } = useApp()

  const now = Date.now()
  const cutoff30 = now - 30 * 86400000
  const cutoff60 = now - 60 * 86400000
  const recent = checkIns.filter(e => new Date(e.date).getTime() >= cutoff30)
  const prev = checkIns.filter(e => { const t = new Date(e.date).getTime(); return t >= cutoff60 && t < cutoff30 })

  const avgOf = (entries: typeof checkIns, key: 'mood' | 'sleepQuality' | 'energyLevel' | 'stressLevel', filterZero = false) => {
    const vals = filterZero ? entries.filter(e => e[key] > 0) : entries
    if (vals.length === 0) return 0
    return vals.reduce((s, e) => s + e[key], 0) / vals.length
  }

  const avgMood = avgOf(recent, 'mood')
  const avgSleep = avgOf(recent, 'sleepQuality', true)
  const avgEnergy = avgOf(recent, 'energyLevel', true)
  const avgStress = avgOf(recent, 'stressLevel', true)
  const prevMood = avgOf(prev, 'mood')
  const prevSleep = avgOf(prev, 'sleepQuality', true)
  const prevEnergy = avgOf(prev, 'energyLevel', true)
  const prevStress = avgOf(prev, 'stressLevel', true)

  // Streak
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    if (checkIns.some(e => e.date.slice(0, 10) === dateStr)) streak++
    else break
  }

  // Top symptoms
  const symFreq: Record<string, number> = {}
  recent.forEach(e => e.symptoms.forEach(s => { symFreq[s] = (symFreq[s] || 0) + 1 }))
  const topSymptoms = Object.entries(symFreq).sort((a, b) => b[1] - a[1]).slice(0, 5)

  // Latest MRS
  const latestMRS = mrsEntries[0] ? mrsScores(mrsEntries[0]) : null

  // Smart questions
  const questions: string[] = []
  const topIds = new Set(topSymptoms.map(([id]) => id))
  if (topIds.has('hotflashes')) questions.push('My hot flashes occur frequently — what are the safest treatment options for me?')
  if (topIds.has('sleep')) questions.push(`Sleep is one of my top symptoms${avgSleep > 0 ? ` (avg ${avgSleep.toFixed(1)}/5)` : ''}. What evidence-based interventions would you suggest?`)
  if (topIds.has('anxiety') || topIds.has('moodswings')) questions.push('I experience frequent mood swings or anxiety. Is this hormonal, and what can I do about it?')
  if (topIds.has('fatigue')) questions.push('I regularly feel fatigued. Could this be related to hormonal changes, and what should I check?')
  if (topIds.has('brainfog')) questions.push('I often experience brain fog. Is this expected at my menopause stage, and is there relief?')
  if (topIds.has('jointpain')) questions.push('I log joint pain regularly — is this connected to oestrogen decline, and what would help?')
  if (avgSleep > 0 && avgSleep < 2.5) questions.push(`My average sleep quality has been poor (${avgSleep.toFixed(1)}/5). What sleep strategies do you recommend?`)
  if (avgStress > 0 && avgStress < 2.5) questions.push('My stress levels are consistently high. What options exist beyond lifestyle changes?')
  if (avgEnergy > 0 && avgEnergy < 2.5) questions.push(`My energy is very low on average (${avgEnergy.toFixed(1)}/5). Should we rule out thyroid issues or anaemia?`)
  if (latestMRS && latestMRS.total >= 9) questions.push(`My MRS score is ${latestMRS.total}/44 (${latestMRS.severity}). Does this warrant a treatment review?`)
  if (latestMRS && latestMRS.urogenital >= 5) questions.push('My urogenital score is elevated. What local treatments exist that are safe and effective?')
  treatments.filter(t => t.status === 'started').slice(0, 2).forEach(t => {
    questions.push(`I started ${t.name} — what side effects should I watch for and how long before I see results?`)
  })
  if (profile.hrtStatus === 'considering') questions.push('I am considering HRT — given my history, am I a good candidate and what type would suit me?')
  questions.push('Based on this health summary, are there any lifestyle changes I should prioritise?')
  if (questions.length < 3) questions.push('What follow-up tests or monitoring would you recommend at this stage?')

  const symLabel = (id: string) => symptomsList.find(s => s.id === id)?.label ?? id
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const delta = (curr: number, prev: number) => {
    if (prev === 0 || curr === 0) return null
    const d = curr - prev
    if (Math.abs(d) < 0.1) return null
    return d
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 px-6" style={{ background: theme.background }}>
      <div className="flex-shrink-0" style={{ height: 8 }} />

      <h2 className="text-2xl font-bold mb-1 flex-shrink-0" style={{ color: theme.textPrimary }}>Health Summary</h2>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Header */}
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
            {profile.firstName ? `${profile.firstName}'s Summary` : 'Health Summary'}
          </p>
          <p className="text-xs" style={{ color: theme.textLight }}>Generated {dateStr}</p>
        </div>

        {/* Overview */}
        <Card title="Overview">
          <div className="flex gap-3">
            <StatPill value={String(checkIns.length)} label="check-ins" fill={theme.lavenderFill} />
            <StatPill value={avgMood > 0 ? avgMood.toFixed(1) : '—'} label="avg mood" fill={theme.marigoldFill} />
            <StatPill value={`${streak}d`} label="streak" fill={theme.sageFill} />
          </div>
        </Card>

        {/* Symptom Highlights */}
        <Card title="Symptom Highlights (last 30 days)">
          {topSymptoms.length === 0 ? (
            <p className="text-sm" style={{ color: theme.textLight }}>No symptoms logged in the last 30 days.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {topSymptoms.map(([id, count]) => (
                <span key={id} className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: theme.sageFill, color: theme.textPrimary }}>
                  {symLabel(id)} · {count}x
                </span>
              ))}
            </div>
          )}
        </Card>

        {/* Wellbeing */}
        <Card title="Wellbeing — Last 30 Days">
          <WellbeingRow label="Mood" icon="😊" value={avgMood} d={delta(avgMood, prevMood)} />
          {avgSleep > 0 && <WellbeingRow label="Sleep" icon="🌙" value={avgSleep} d={delta(avgSleep, prevSleep)} />}
          {avgEnergy > 0 && <WellbeingRow label="Energy" icon="⚡" value={avgEnergy} d={delta(avgEnergy, prevEnergy)} />}
          {avgStress > 0 && <WellbeingRow label="Stress" icon="💨" value={avgStress} d={delta(avgStress, prevStress)} unit="/5 (5=calm)" />}
        </Card>

        {/* MRS */}
        {latestMRS && (
          <Card title="Menopause Rating Scale">
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-bold" style={{ color: theme.textPrimary }}>{latestMRS.total}</span>
              <span className="text-sm" style={{ color: theme.textLight }}>/ 44</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full ml-auto" style={{
                background: latestMRS.total <= 4 ? theme.sageFill : latestMRS.total <= 8 ? theme.marigoldFill : latestMRS.total <= 15 ? theme.peachFill : `${theme.rose}4D`,
                color: theme.textPrimary,
              }}>{latestMRS.severity}</span>
            </div>
            <MiniBar label="Body" score={latestMRS.somatic} max={16} fill={theme.peachFill} />
            <MiniBar label="Emotional" score={latestMRS.psychological} max={16} fill={theme.lavenderFill} />
            <MiniBar label="Intimate" score={latestMRS.urogenital} max={12} fill={theme.sageFill} />
          </Card>
        )}

        {/* Treatments */}
        {treatments.length > 0 && (
          <Card title="Treatment & Lifestyle Changes">
            {treatments.slice(0, 5).map(t => (
              <div key={t.id} className="flex items-start gap-2 mb-2">
                <span className="text-sm" style={{ color: theme.textLight }}>•</span>
                <div>
                  <p className="text-sm font-medium" style={{ color: theme.textPrimary }}>{t.status.charAt(0).toUpperCase() + t.status.slice(1)}: {t.name}</p>
                  <p className="text-xs" style={{ color: theme.textLight }}>{new Date(t.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </Card>
        )}

        {/* Smart Questions */}
        <Card title="Questions for Your Doctor">
          <p className="text-xs font-medium mb-3" style={{ color: theme.textLight }}>Generated from your data</p>
          {questions.map((q, i) => (
            <div key={i} className="flex items-start gap-2 mb-3">
              <span className="text-sm flex-shrink-0" style={{ color: theme.textSecondary }}>→</span>
              <p className="text-sm leading-relaxed" style={{ color: theme.textPrimary }}>{q}</p>
            </div>
          ))}
        </Card>

        <div style={{ height: 20 }} />
      </div>

      <div className="pb-10 pt-4">
        <button onClick={onClose} className="w-full py-4 rounded-2xl text-white font-semibold" style={{ background: theme.dark }}>Done</button>
      </div>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl p-5 mb-4" style={{ background: theme.surface }}>
      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: theme.textSecondary }}>{title}</p>
      {children}
    </div>
  )
}

function StatPill({ value, label, fill }: { value: string; label: string; fill: string }) {
  return (
    <div className="flex-1 rounded-2xl py-3 flex flex-col items-center" style={{ background: fill }}>
      <span className="text-xl font-bold" style={{ color: theme.textPrimary }}>{value}</span>
      <span className="text-xs" style={{ color: theme.textSecondary }}>{label}</span>
    </div>
  )
}

function WellbeingRow({ label, icon, value, d, unit = '/5' }: { label: string; icon: string; value: number; d: number | null; unit?: string }) {
  return (
    <div className="flex items-center gap-2 py-1.5">
      <span className="text-xs">{icon}</span>
      <span className="text-sm font-medium w-14" style={{ color: theme.textPrimary }}>{label}</span>
      <span className="flex-1" />
      <span className="text-sm font-semibold" style={{ color: theme.textPrimary }}>{value > 0 ? `${value.toFixed(1)}${unit}` : '—'}</span>
      {d !== null && (
        <span className="text-xs font-bold" style={{ color: d > 0 ? '#4CAF50' : theme.rose }}>
          {d > 0 ? '↑' : '↓'}
        </span>
      )}
    </div>
  )
}

function MiniBar({ label, score, max, fill }: { label: string; score: number; max: number; fill: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="text-xs font-medium w-16" style={{ color: theme.textSecondary }}>{label}</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: theme.background }}>
        <div className="h-full rounded-full" style={{ width: max > 0 ? `${(score / max) * 100}%` : '0%', background: fill, minWidth: score > 0 ? 6 : 0 }} />
      </div>
      <span className="text-xs font-semibold w-8 text-right" style={{ color: theme.textLight }}>{score}/{max}</span>
    </div>
  )
}
