import { useState, useEffect } from 'react'

interface KPIs {
  waitlistTotal: number
  step2Completed: number
  step2Rate: number
  appUsers: number
  onboardingRate: number
  goals: Record<string, number>
  stages: Record<string, number>
  totalCheckIns: number
  checkInsThisWeek: number
  uniqueCheckInUsers: number
  avgCheckInsPerUser: number
  avgMood: number
  avgSleep: number
  avgEnergy: number
  dailyCheckins: Record<string, number>
  totalMRS: number
  avgMRS: number
  topSymptoms: [string, number][]
  totalPosts: number
  totalComments: number
  commentsPerPost: number
  totalEvents: number
}

const GOAL_LABELS: Record<string, string> = { understand: 'Understand', community: 'Community', track: 'Track symptoms', doctor: 'Doctor prep' }
const STAGE_LABELS: Record<string, string> = { regular: 'Regular', irregular: 'Irregular', post: 'Post-menopause', unsure: 'Unsure' }

export default function Dashboard() {
  const [pwd, setPwd] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<KPIs | null>(null)

  const fetchData = async (password: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/dashboard?pwd=${encodeURIComponent(password)}`)
      if (res.status === 401) { setError('Wrong password'); setLoading(false); return }
      const kpis = await res.json()
      if (kpis.error) { setError(kpis.error); setLoading(false); return }
      setData(kpis)
      setAuthenticated(true)
      localStorage.setItem('dashboard_pwd', password)
    } catch (e) {
      setError(String(e))
    }
    setLoading(false)
  }

  useEffect(() => {
    const saved = localStorage.getItem('dashboard_pwd')
    if (saved) fetchData(saved)
  }, [])

  const refresh = () => { const saved = localStorage.getItem('dashboard_pwd'); if (saved) fetchData(saved) }

  if (!authenticated) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 360, width: '100%', padding: 24 }}>
          <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>Hélène Dashboard</h1>
          <p style={{ color: '#666', fontSize: 14, marginBottom: 24, textAlign: 'center' }}>Admin access only</p>
          <input
            type="password" value={pwd} onChange={e => setPwd(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchData(pwd)}
            placeholder="Password" autoFocus
            style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: 'none', background: '#1a1a1a', color: '#fff', fontSize: 16, marginBottom: 12, boxSizing: 'border-box' }}
          />
          {error && <p style={{ color: '#E83E73', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{error}</p>}
          <button onClick={() => fetchData(pwd)} disabled={loading}
            style={{ width: '100%', padding: 14, borderRadius: 12, border: 'none', background: '#fff', color: '#0A0A0A', fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.5 : 1 }}>
            {loading ? 'Loading...' : 'Enter'}
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  const dailyData = Object.entries(data.dailyCheckins).sort((a, b) => a[0].localeCompare(b[0]))
  const maxDaily = Math.max(...dailyData.map(d => d[1]), 1)

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#fff', padding: '32px 24px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Hélène KPIs</h1>
            <p style={{ color: '#666', fontSize: 13, margin: '4px 0 0' }}>Last updated: {new Date().toLocaleString()}</p>
          </div>
          <button onClick={refresh} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #333', background: 'transparent', color: '#888', fontSize: 13, cursor: 'pointer' }}>
            Refresh
          </button>
        </div>

        {/* Acquisition */}
        <Section title="Acquisition" subtitle="Waitlist funnel">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <BigNumber value={data.waitlistTotal} label="Total signups" color="#4CAF50" />
            <BigNumber value={data.step2Completed} label="Step 2 completed" sub={`${data.step2Rate}% conversion`} color="#2196F3" />
            <BigNumber value={data.appUsers} label="App users" sub={`${data.onboardingRate}% of waitlist`} color="#9C27B0" />
          </div>
        </Section>

        {/* User profiles */}
        <Section title="User Profiles" subtitle="Who are our co-design women?">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Card title="Primary goals">
              {Object.entries(data.goals).map(([k, v]) => (
                <Bar key={k} label={GOAL_LABELS[k] ?? k} value={v} max={data.appUsers} color="#9C27B0" />
              ))}
              {Object.keys(data.goals).length === 0 && <Empty />}
            </Card>
            <Card title="Journey stage">
              {Object.entries(data.stages).map(([k, v]) => (
                <Bar key={k} label={STAGE_LABELS[k] ?? k} value={v} max={data.appUsers} color="#FF9800" />
              ))}
              {Object.keys(data.stages).length === 0 && <Empty />}
            </Card>
          </div>
        </Section>

        {/* Engagement */}
        <Section title="Engagement" subtitle="Are users coming back?">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 16 }}>
            <BigNumber value={data.totalCheckIns} label="Total check-ins" color="#4CAF50" />
            <BigNumber value={data.checkInsThisWeek} label="This week" color="#2196F3" />
            <BigNumber value={data.uniqueCheckInUsers} label="Active users" color="#9C27B0" />
            <BigNumber value={data.avgCheckInsPerUser} label="Avg per user" color="#FF9800" />
            <BigNumber value={data.avgMood} label="Avg mood" sub="/5" color="#E91E63" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Card title="Check-ins per day (last 14d)">
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80, marginTop: 8 }}>
                {dailyData.map(([date, count]) => (
                  <div key={date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '100%', height: `${(count / maxDaily) * 100}%`, minHeight: count > 0 ? 4 : 0, background: '#4CAF50', borderRadius: '4px 4px 0 0' }} />
                    <span style={{ fontSize: 8, color: '#555', marginTop: 4 }}>{date.slice(8)}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card title="Wellbeing averages">
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <MiniGauge label="Mood" value={data.avgMood} max={5} color="#E91E63" />
                <MiniGauge label="Sleep" value={data.avgSleep} max={5} color="#9C27B0" />
                <MiniGauge label="Energy" value={data.avgEnergy} max={5} color="#FF9800" />
              </div>
            </Card>
          </div>
        </Section>

        {/* Health */}
        <Section title="Health Outcomes" subtitle="Is the app helping?">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <BigNumber value={data.avgMRS} label="Avg MRS score" sub="/44" color="#F44336" />
              <BigNumber value={data.totalMRS} label="Assessments" color="#2196F3" />
            </div>
            <Card title="Top symptoms">
              {data.topSymptoms.map(([sym, count]) => (
                <Bar key={sym} label={sym} value={count} max={data.totalCheckIns} color="#E91E63" />
              ))}
              {data.topSymptoms.length === 0 && <Empty />}
            </Card>
          </div>
        </Section>

        {/* Community */}
        <Section title="Community" subtitle="Is it alive?">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <BigNumber value={data.totalPosts} label="Posts" color="#9C27B0" />
            <BigNumber value={data.totalComments} label="Comments" color="#2196F3" />
            <BigNumber value={data.commentsPerPost} label="Comments/post" color="#4CAF50" />
          </div>
        </Section>

        {/* Analytics */}
        <Section title="Product Analytics" subtitle="Total app events tracked">
          <BigNumber value={data.totalEvents} label="Total events" color="#FF9800" />
        </Section>
      </div>
    </div>
  )
}

// Components
function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 2px', color: '#fff' }}>{title}</h2>
      <p style={{ fontSize: 12, color: '#555', margin: '0 0 16px' }}>{subtitle}</p>
      {children}
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#111', borderRadius: 16, padding: 20, border: '1px solid #1a1a1a' }}>
      <p style={{ fontSize: 12, color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px' }}>{title}</p>
      {children}
    </div>
  )
}

function BigNumber({ value, label, sub, color }: { value: number; label: string; sub?: string; color: string }) {
  return (
    <div style={{ background: '#111', borderRadius: 16, padding: 20, border: '1px solid #1a1a1a' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontSize: 36, fontWeight: 800, color }}>{value}</span>
        {sub && <span style={{ fontSize: 14, color: '#555' }}>{sub}</span>}
      </div>
      <p style={{ fontSize: 12, color: '#666', margin: '4px 0 0' }}>{label}</p>
    </div>
  )
}

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: '#aaa' }}>{label}</span>
        <span style={{ fontSize: 12, color: '#666' }}>{value}</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: '#1a1a1a' }}>
        <div style={{ height: '100%', borderRadius: 3, background: color, width: `${Math.max(pct, value > 0 ? 4 : 0)}%`, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  )
}

function MiniGauge({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ position: 'relative', width: 60, height: 60, margin: '0 auto 8px' }}>
        <svg width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="26" fill="none" stroke="#1a1a1a" strokeWidth="4" />
          <circle cx="30" cy="30" r="26" fill="none" stroke={color} strokeWidth="4"
            strokeDasharray={`${pct * 1.63} 163`} strokeLinecap="round"
            transform="rotate(-90 30 30)" />
        </svg>
        <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 16, fontWeight: 700, color }}>{value}</span>
      </div>
      <span style={{ fontSize: 11, color: '#666' }}>{label}</span>
    </div>
  )
}

function Empty() {
  return <p style={{ fontSize: 12, color: '#444' }}>No data yet</p>
}
