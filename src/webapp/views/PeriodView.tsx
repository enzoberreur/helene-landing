import { useState, useMemo } from 'react'
import { theme } from '../theme'
import { useApp } from '../WebApp'
import { useT } from '../i18n'
import type { PeriodEntry } from '../types'

const FLOW_OPTIONS = [
  { id: 'spotting', label: 'Spotting', color: '#F8C4D0', icon: '·' },
  { id: 'light', label: 'Light', color: '#F4A0B5', icon: '●' },
  { id: 'medium', label: 'Medium', color: '#E86B8A', icon: '●●' },
  { id: 'heavy', label: 'Heavy', color: '#D0607A', icon: '●●●' },
] as const

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000)
}

export default function PeriodView({ onClose }: { onClose: () => void }) {
  const t = useT()
  const { periods } = useApp()
  const [viewMonth, setViewMonth] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showLog, setShowLog] = useState(false)

  // Cycle stats
  const cycleLengths = useMemo(() => {
    const sorted = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate))
    const lengths: number[] = []
    for (let i = 1; i < sorted.length; i++) {
      lengths.push(daysBetween(sorted[i - 1].startDate, sorted[i].startDate))
    }
    return lengths
  }, [periods])

  const avgCycle = cycleLengths.length > 0 ? Math.round(cycleLengths.reduce((s, l) => s + l, 0) / cycleLengths.length) : null
  const lastPeriod = periods[0] ?? null

  // Predicted next period
  const predictedNext = useMemo(() => {
    if (!lastPeriod || !avgCycle) return null
    const next = new Date(lastPeriod.startDate)
    next.setDate(next.getDate() + avgCycle)
    return dateStr(next)
  }, [lastPeriod, avgCycle])

  // Calendar data
  const year = viewMonth.getFullYear()
  const month = viewMonth.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = dateStr(new Date())

  // Map dates to period entries
  const periodDates = useMemo(() => {
    const map: Record<string, { entry: PeriodEntry; dayIndex: number; flow: string }> = {}
    periods.forEach(p => {
      const start = new Date(p.startDate)
      const end = p.endDate ? new Date(p.endDate) : start
      let day = new Date(start)
      let idx = 0
      while (day <= end) {
        const ds = dateStr(day)
        map[ds] = { entry: p, dayIndex: idx, flow: p.flow[idx] ?? 'medium' }
        day.setDate(day.getDate() + 1)
        idx++
      }
    })
    return map
  }, [periods])

  const prevMonth = () => setViewMonth(new Date(year, month - 1, 1))
  const nextMonth = () => setViewMonth(new Date(year, month + 1, 1))

  const handleDateTap = (date: string) => {
    setSelectedDate(date)
    setShowLog(true)
  }

  if (showLog && selectedDate) {
    return <LogPeriodView date={selectedDate} existing={periodDates[selectedDate]?.entry} onClose={() => setShowLog(false)} onDone={() => { setShowLog(false) }} />
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 px-6" style={{ background: theme.background }}>
      <div className="flex-shrink-0" style={{ height: 8 }} />

      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-2xl font-bold" style={{ color: theme.textPrimary }}>{t('period.title')}</h2>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Prediction card */}
        {predictedNext && (
          <div className="rounded-3xl p-4 mb-4 flex items-center gap-3" style={{ background: theme.sageFill }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.5)' }}>
              <span className="text-lg">🔮</span>
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
                {t('period.next_expected', { date: new Date(predictedNext).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) })}
              </p>
              <p className="text-xs" style={{ color: theme.textSecondary }}>
                {t('period.based_on', { days: String(avgCycle) })}
              </p>
            </div>
          </div>
        )}

        {/* Stats row */}
        {periods.length > 0 && (
          <div className="flex gap-3 mb-4">
            <div className="flex-1 rounded-2xl p-3" style={{ background: theme.surface }}>
              <p className="text-xs" style={{ color: theme.textLight }}>{t('period.avg_cycle')}</p>
              <p className="text-xl font-bold" style={{ color: theme.textPrimary }}>{avgCycle ? `${avgCycle}d` : '—'}</p>
            </div>
            <div className="flex-1 rounded-2xl p-3" style={{ background: theme.surface }}>
              <p className="text-xs" style={{ color: theme.textLight }}>{t('period.logged')}</p>
              <p className="text-xl font-bold" style={{ color: theme.textPrimary }}>{periods.length}</p>
            </div>
            <div className="flex-1 rounded-2xl p-3" style={{ background: theme.surface }}>
              <p className="text-xs" style={{ color: theme.textLight }}>{t('period.last')}</p>
              <p className="text-xl font-bold" style={{ color: theme.textPrimary }}>
                {lastPeriod ? `${daysBetween(lastPeriod.startDate, today)}d ago` : '—'}
              </p>
            </div>
          </div>
        )}

        {/* Calendar */}
        <div className="rounded-3xl p-4 mb-4" style={{ background: theme.surface }}>
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: theme.background }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <p className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
              {MONTHS[month]} {year}
            </p>
            <button onClick={nextMonth} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: theme.background }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((d, i) => (
              <div key={i} className="text-center text-xs font-medium" style={{ color: theme.textLight }}>{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells before first day */}
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const period = periodDates[date]
              const isToday = date === today
              const isPredicted = date === predictedNext
              const flowColor = period ? (FLOW_OPTIONS.find(f => f.id === period.flow)?.color ?? theme.rose) : undefined

              return (
                <button
                  key={day}
                  onClick={() => handleDateTap(date)}
                  className="aspect-square rounded-full flex items-center justify-center text-xs relative"
                  style={{
                    background: period ? flowColor : isPredicted ? `${theme.rose}20` : 'transparent',
                    color: period ? '#fff' : isToday ? theme.rose : theme.textPrimary,
                    fontWeight: isToday || period ? 600 : 400,
                    border: isToday && !period ? `1.5px solid ${theme.rose}` : 'none',
                  }}
                >
                  {day}
                  {isPredicted && !period && (
                    <div className="absolute bottom-0.5 w-1 h-1 rounded-full" style={{ background: theme.rose }} />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-4 px-2">
          {FLOW_OPTIONS.map(f => (
            <div key={f.id} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: f.color }} />
              <span className="text-xs" style={{ color: theme.textLight }}>{t(`period.${f.id}`)}</span>
            </div>
          ))}
        </div>

        {/* Cycle history */}
        {cycleLengths.length > 0 && (
          <div className="rounded-3xl p-4 mb-4" style={{ background: theme.surface }}>
            <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: theme.textLight }}>{t('period.cycle_history')}</p>
            <div className="flex items-end gap-2" style={{ height: 60 }}>
              {cycleLengths.slice(-8).map((len, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end" style={{ height: '100%' }}>
                  <div
                    className="w-full rounded-t-lg"
                    style={{
                      height: `${Math.min(100, (len / 45) * 100)}%`,
                      background: Math.abs(len - (avgCycle ?? 28)) > 7 ? theme.peachFill : theme.lavenderFill,
                      minHeight: 4,
                    }}
                  />
                  <span className="text-xs mt-1" style={{ color: theme.textLight, fontSize: 9 }}>{len}d</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {periods.length === 0 && (
          <div className="rounded-3xl p-6 text-center" style={{ background: theme.surface }}>
            <p className="text-sm font-semibold mb-2" style={{ color: theme.textPrimary }}>{t('period.start_tracking')}</p>
            <p className="text-xs leading-relaxed mb-4" style={{ color: theme.textSecondary }}>
              {t('period.start_desc')}
            </p>
            <button
              onClick={() => handleDateTap(today)}
              className="px-6 py-3 rounded-2xl text-sm font-semibold text-white"
              style={{ background: theme.dark }}
            >
              {t('period.log_today')}
            </button>
          </div>
        )}

        <div style={{ height: 20 }} />
      </div>

      <div className="pb-10 pt-2 flex-shrink-0">
        <button onClick={onClose} className="w-full py-4 rounded-2xl font-semibold text-sm" style={{ background: theme.surface, color: theme.textSecondary }}>
          {t('common.done')}
        </button>
      </div>
    </div>
  )
}

// Log period sub-view
function LogPeriodView({ date, existing, onClose, onDone }: {
  date: string; existing?: PeriodEntry; onClose: () => void; onDone: () => void
}) {
  const t = useT()
  const { addPeriod, updatePeriod, deletePeriod } = useApp()
  const [flow, setFlow] = useState<string>('medium')
  const [endDate, setEndDate] = useState(existing?.endDate ?? '')
  const [notes, setNotes] = useState(existing?.notes ?? '')

  const handleSave = () => {
    if (existing) {
      // Add this date to the existing period's end
      const newEnd = date > (existing.endDate ?? existing.startDate) ? date : existing.endDate
      const dayCount = daysBetween(existing.startDate, newEnd ?? existing.startDate) + 1
      const newFlow = [...existing.flow]
      while (newFlow.length < dayCount) newFlow.push(flow as 'light' | 'medium' | 'heavy' | 'spotting')
      updatePeriod(existing.id, { endDate: newEnd, flow: newFlow, notes })
    } else {
      addPeriod({
        id: crypto.randomUUID(),
        startDate: date,
        endDate: endDate || null,
        flow: [flow as 'light' | 'medium' | 'heavy' | 'spotting'],
        notes,
      })
    }
    onDone()
  }

  const handleDelete = () => {
    if (existing) deletePeriod(existing.id)
    onDone()
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 px-6" style={{ background: theme.background }}>
      <div className="flex-shrink-0" style={{ height: 8 }} />

      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <button onClick={onClose} className="text-sm" style={{ color: theme.textSecondary }}>{t('common.cancel')}</button>
        <h3 className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
          {new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
        </h3>
        <button onClick={handleSave} className="text-sm font-semibold" style={{ color: theme.rose }}>{t('common.save')}</button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: theme.textLight }}>{t('period.flow')}</p>
        <div className="grid grid-cols-4 gap-2 mb-6">
          {FLOW_OPTIONS.map(f => (
            <button
              key={f.id}
              onClick={() => setFlow(f.id)}
              className="py-3 rounded-2xl text-center"
              style={{
                background: flow === f.id ? f.color : theme.surface,
                color: flow === f.id ? '#fff' : theme.textPrimary,
              }}
            >
              <p className="text-lg mb-0.5">{f.icon}</p>
              <p className="text-xs font-medium">{t(`period.${f.id}`)}</p>
            </button>
          ))}
        </div>

        {!existing && (
          <>
            <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: theme.textLight }}>{t('period.end_date')}</p>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              min={date}
              className="w-full px-4 py-3 rounded-2xl text-sm mb-6 focus:outline-none"
              style={{ background: theme.surface, color: theme.textPrimary }}
            />
          </>
        )}

        <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: theme.textLight }}>{t('period.notes')}</p>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder={t('period.notes_placeholder')}
          rows={3}
          className="w-full px-4 py-3 rounded-2xl text-sm focus:outline-none resize-none mb-4"
          style={{ background: theme.surface, color: theme.textPrimary }}
        />

        {existing && (
          <button onClick={handleDelete} className="w-full py-3 rounded-2xl text-sm font-semibold" style={{ background: theme.surface, color: theme.rose }}>
            {t('period.remove')}
          </button>
        )}
      </div>
    </div>
  )
}
