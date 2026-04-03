import { useState, useMemo } from 'react'
import { theme } from '../theme'
import { useApp } from '../WebApp'
import { useT } from '../i18n'
import { moodFills, mrsScores, symptomsList } from '../types'

type Range = '7D' | '30D' | '3M' | 'All'

export default function InsightsView() {
  const t = useT()
  const { checkIns, mrsEntries } = useApp()
  const [range, setRange] = useState<Range>('7D')

  const now = Date.now()
  const rangeDays = range === '7D' ? 7 : range === '30D' ? 30 : range === '3M' ? 90 : 9999
  const cutoff = now - rangeDays * 86400000

  const filtered = useMemo(() =>
    checkIns.filter(e => new Date(e.date).getTime() >= cutoff).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [checkIns, cutoff]
  )

  const prevCutoff = cutoff - rangeDays * 86400000
  const prevFiltered = useMemo(() =>
    checkIns.filter(e => { const t = new Date(e.date).getTime(); return t >= prevCutoff && t < cutoff }),
    [checkIns, prevCutoff, cutoff]
  )

  // Stats
  const avgMood = filtered.length ? (filtered.reduce((s, e) => s + e.mood, 0) / filtered.length).toFixed(1) : '—'
  const prevAvgMood = prevFiltered.length ? (prevFiltered.reduce((s, e) => s + e.mood, 0) / prevFiltered.length) : null

  // Streak
  const streak = useMemo(() => {
    let count = 0
    const today = new Date()
    for (let i = 0; i < 365; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().slice(0, 10)
      if (checkIns.some(e => e.date.slice(0, 10) === dateStr)) count++
      else break
    }
    return count
  }, [checkIns])

  // Symptom frequency
  const symptomFreq = useMemo(() => {
    const freq: Record<string, number> = {}
    filtered.forEach(e => e.symptoms.forEach(s => { freq[s] = (freq[s] || 0) + 1 }))
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 6)
  }, [filtered])

  // Sleep/Energy/Stress averages
  const avg = (field: 'sleepQuality' | 'energyLevel' | 'stressLevel') => {
    const vals = filtered.filter(e => e[field] > 0)
    return vals.length ? (vals.reduce((s, e) => s + e[field], 0) / vals.length).toFixed(1) : '—'
  }

  // Mood by day of week
  const weekdayMood = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const buckets: Record<number, number[]> = {}
    filtered.forEach(e => {
      const day = new Date(e.date).getDay()
      if (!buckets[day]) buckets[day] = []
      buckets[day].push(e.mood)
    })
    return days.map((label, i) => ({
      label,
      avg: buckets[i] ? buckets[i].reduce((s, v) => s + v, 0) / buckets[i].length : 0,
    }))
  }, [filtered])

  // Latest MRS
  const latestMRS = mrsEntries[0] ? mrsScores(mrsEntries[0]) : null

  return (
    <div className="px-6 pt-2">
      <h1 className="text-2xl font-bold mb-4" style={{ color: theme.textPrimary }}>{t('insights.title')}</h1>

      {/* Range selector */}
      <div className="flex gap-2 mb-5">
        {(['7D', '30D', '3M', 'All'] as Range[]).map(r => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className="flex-1 py-2 rounded-xl text-xs font-semibold"
            style={{ background: range === r ? theme.dark : theme.surface, color: range === r ? '#fff' : theme.textSecondary }}
          >
            {r}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl p-6 text-center" style={{ background: theme.surface }}>
          <p className="text-sm" style={{ color: theme.textSecondary }}>{t('insights.empty')}</p>
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <StatCard label={t('insights.checkins')} value={String(filtered.length)} />
            <StatCard label={t('insights.avg_mood')} value={avgMood} delta={prevAvgMood ? Number(avgMood) - prevAvgMood : undefined} />
            <StatCard label={t('insights.streak')} value={`${streak}d`} />
          </div>

          {/* Mood trend (simplified bar chart) */}
          <div className="rounded-3xl p-4 mb-4" style={{ background: theme.surface }}>
            <p className="text-xs font-semibold mb-3" style={{ color: theme.textPrimary }}>{t('insights.mood_trend')}</p>
            <div className="flex items-end gap-1" style={{ height: 100 }}>
              {filtered.slice(-14).map((e, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end" style={{ height: '100%' }}>
                  <div
                    className="w-full rounded-t-lg transition-all"
                    style={{ height: `${(e.mood / 5) * 100}%`, background: moodFills[e.mood], minHeight: 4 }}
                  />
                  <span className="text-xs mt-1" style={{ color: theme.textLight, fontSize: 8 }}>
                    {new Date(e.date).getDate()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Wellbeing averages */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <WellbeingCard label="Sleep" icon="🌙" value={avg('sleepQuality')} fill={theme.lavenderFill} />
            <WellbeingCard label="Energy" icon="⚡" value={avg('energyLevel')} fill={theme.marigoldFill} />
            <WellbeingCard label="Stress" icon="💨" value={avg('stressLevel')} fill={theme.sageFill} />
          </div>

          {/* Weekday pattern */}
          <div className="rounded-3xl p-4 mb-4" style={{ background: theme.surface }}>
            <p className="text-xs font-semibold mb-3" style={{ color: theme.textPrimary }}>{t('insights.mood_by_day')}</p>
            <div className="flex items-end gap-1.5" style={{ height: 80 }}>
              {weekdayMood.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end" style={{ height: '100%' }}>
                  <div
                    className="w-full rounded-t-lg"
                    style={{ height: d.avg > 0 ? `${(d.avg / 5) * 100}%` : 0, background: theme.lavenderFill, minHeight: d.avg > 0 ? 4 : 0 }}
                  />
                  <span className="text-xs mt-1" style={{ color: theme.textLight, fontSize: 9 }}>{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Symptom frequency */}
          {symptomFreq.length > 0 && (
            <div className="rounded-3xl p-4 mb-4" style={{ background: theme.surface }}>
              <p className="text-xs font-semibold mb-3" style={{ color: theme.textPrimary }}>{t('insights.top_symptoms')}</p>
              {symptomFreq.map(([id, count]) => {
                const label = symptomsList.find(s => s.id === id)?.label ?? id
                const pct = (count / filtered.length) * 100
                return (
                  <div key={id} className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: theme.textPrimary }}>{label}</span>
                      <span style={{ color: theme.textLight }}>{count}x</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: theme.separator }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: theme.sageFill }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* MRS score */}
          {latestMRS && (
            <div className="rounded-3xl p-4 mb-4" style={{ background: theme.surface }}>
              <p className="text-xs font-semibold mb-2" style={{ color: theme.textPrimary }}>{t('insights.latest_mrs')}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold" style={{ color: theme.textPrimary }}>{latestMRS.total}</span>
                <span className="text-sm font-semibold" style={{ color: theme.rose }}>{latestMRS.severity}</span>
              </div>
              <p className="text-xs mt-1" style={{ color: theme.textLight }}>{new Date(mrsEntries[0].date).toLocaleDateString()}</p>
            </div>
          )}
        </>
      )}

      <div style={{ height: 40 }} />
    </div>
  )
}

function StatCard({ label, value, delta }: { label: string; value: string; delta?: number }) {
  return (
    <div className="rounded-2xl p-3" style={{ background: theme.surface }}>
      <p className="text-xs mb-1" style={{ color: theme.textLight }}>{label}</p>
      <p className="text-xl font-bold" style={{ color: theme.textPrimary }}>{value}</p>
      {delta !== undefined && (
        <p className="text-xs" style={{ color: delta >= 0 ? '#4CAF50' : theme.rose }}>
          {delta >= 0 ? '↑' : '↓'} {Math.abs(delta).toFixed(1)}
        </p>
      )}
    </div>
  )
}

function WellbeingCard({ label, icon, value, fill }: { label: string; icon: string; value: string; fill: string }) {
  return (
    <div className="rounded-2xl p-3" style={{ background: theme.surface }}>
      <div className="flex items-center gap-1 mb-1">
        <span className="text-xs">{icon}</span>
        <span className="text-xs" style={{ color: theme.textLight }}>{label}</span>
      </div>
      <p className="text-xl font-bold" style={{ color: theme.textPrimary }}>{value}</p>
      <div className="h-1.5 rounded-full mt-1.5" style={{ background: theme.separator }}>
        <div className="h-full rounded-full" style={{ width: value !== '—' ? `${(Number(value) / 5) * 100}%` : '0%', background: fill }} />
      </div>
    </div>
  )
}
