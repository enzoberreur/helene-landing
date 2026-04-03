import { useState } from 'react'
import { theme } from '../theme'
import { useApp } from '../WebApp'
import { useT } from '../i18n'

const categories = [
  { id: 'hrt', label: 'HRT', icon: '💊' },
  { id: 'supplement', label: 'Supplement', icon: '🌿' },
  { id: 'lifestyle', label: 'Lifestyle', icon: '🏃‍♀️' },
  { id: 'medication', label: 'Medication', icon: '💉' },
] as const

const statuses = ['started', 'stopped', 'adjusted', 'paused'] as const

export default function TreatmentLogView({ onClose }: { onClose: () => void }) {
  const t = useT()
  const { addTreatment } = useApp()
  const [category, setCategory] = useState<string>('hrt')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<string>('started')
  const [note, setNote] = useState('')

  const handleSave = () => {
    if (!name.trim()) return
    addTreatment({
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      category: category as 'hrt' | 'supplement' | 'lifestyle' | 'medication',
      name: name.trim(),
      status: status as 'started' | 'stopped' | 'adjusted' | 'paused',
      note,
    })
    onClose()
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 px-6" style={{ background: theme.background }}>
      <div style={{ height: 8 }} />

      <h2 className="text-2xl font-bold mb-6" style={{ color: theme.textPrimary }}>Log a treatment</h2>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: theme.textLight }}>Category</p>
        <div className="grid grid-cols-2 gap-2 mb-5">
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className="flex items-center gap-2 px-3.5 py-3 rounded-2xl text-sm"
              style={{
                background: category === c.id ? theme.lavenderFill : theme.surface,
                color: theme.textPrimary,
                fontWeight: category === c.id ? 600 : 400,
              }}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: theme.textLight }}>Name</p>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Estradiol, Magnesium, Yoga..."
          className="w-full px-4 py-3 rounded-2xl text-sm mb-5 focus:outline-none"
          style={{ background: theme.surface, color: theme.textPrimary }}
        />

        <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: theme.textLight }}>Status</p>
        <div className="flex gap-2 mb-5">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className="flex-1 py-2.5 rounded-xl text-xs font-medium"
              style={{
                background: status === s ? theme.lavenderFill : theme.surface,
                color: theme.textPrimary,
              }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: theme.textLight }}>Note (optional)</p>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Dosage, side effects, observations..."
          rows={3}
          className="w-full px-4 py-3 rounded-2xl text-sm focus:outline-none resize-none"
          style={{ background: theme.surface, color: theme.textPrimary }}
        />
      </div>

      <div className="pb-10 pt-4">
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className="w-full py-4 rounded-2xl text-white font-semibold transition-opacity disabled:opacity-30"
          style={{ background: theme.dark }}
        >
          {t('common.save')}
        </button>
        <button onClick={onClose} className="w-full text-center mt-3 text-sm" style={{ color: theme.textLight }}>{t('common.cancel')}</button>
      </div>
    </div>
  )
}
