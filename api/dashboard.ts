export const config = { runtime: 'edge' }

const NOTION_VERSION = '2022-06-28'

function headers(token: string) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'Notion-Version': NOTION_VERSION }
}

function cors() {
  return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' }
}

async function countDB(token: string, dbId: string, filter?: Record<string, unknown>): Promise<number> {
  let total = 0, cursor: string | undefined
  while (true) {
    const body: Record<string, unknown> = { page_size: 100 }
    if (cursor) body.start_cursor = cursor
    if (filter) body.filter = filter
    const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: 'POST', headers: headers(token), body: JSON.stringify(body),
    })
    const data = await res.json() as { results: unknown[]; has_more: boolean; next_cursor: string | null }
    total += data.results.length
    if (!data.has_more) break
    cursor = data.next_cursor ?? undefined
  }
  return total
}

async function queryDB(token: string, dbId: string, pageSize = 100): Promise<Array<{ id: string; properties: Record<string, unknown>; created_time: string }>> {
  const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
    method: 'POST', headers: headers(token),
    body: JSON.stringify({ page_size: pageSize, sorts: [{ timestamp: 'created_time', direction: 'descending' }] }),
  })
  const data = await res.json() as { results: Array<{ id: string; properties: Record<string, unknown>; created_time: string }> }
  return data.results ?? []
}

function getText(prop: Record<string, unknown>): string {
  const rt = prop?.rich_text as Array<{ plain_text: string }> | undefined
  const t = prop?.title as Array<{ plain_text: string }> | undefined
  return rt?.[0]?.plain_text ?? t?.[0]?.plain_text ?? ''
}

function getNum(prop: Record<string, unknown>): number {
  return (prop?.number as number) ?? 0
}

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors() })

  // Admin auth
  const url = new URL(request.url)
  const pwd = url.searchParams.get('pwd')
  if (pwd !== (process.env.DASHBOARD_PASSWORD ?? 'helene-admin-2026')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json', ...cors() } })
  }

  const T = process.env.NOTION_TOKEN!
  const WAITLIST = process.env.NOTION_DATABASE_ID ?? '328ed039-c05c-8005-b7e4-eaa71aeac4b9'
  const CHECKINS = process.env.APP_CHECKINS_DB ?? '9ed39509b1d8408695e74807ee44e542'
  const MRS = process.env.APP_MRS_DB ?? '5176d5bd648348d088844d51628322c8'
  const TREATMENTS = process.env.APP_TREATMENTS_DB ?? '98d0dd9b0cfa4dfc80d4e83fd04b3bd2'
  const PROFILES = process.env.APP_PROFILES_DB ?? '13bf54d5fc08441ab8d5d4b577811a7e'
  const POSTS = process.env.COMMUNITY_POSTS_DB ?? 'f50162e75a244e3381aad4059f19d061'
  const COMMENTS = process.env.COMMUNITY_COMMENTS_DB ?? 'd55cb22f242548e4878ca98229de3237'
  const ANALYTICS = process.env.ANALYTICS_DB ?? '45950529036e43bea90c49ef9fb1de29'

  try {
    // Fetch all data in parallel
    const [
      waitlistCount, step2Count, profileCount, postCount, commentCount,
      checkInRows, mrsRows, profileRows, analyticsCount,
    ] = await Promise.all([
      countDB(T, WAITLIST),
      countDB(T, WAITLIST, { property: 'Step 2 Completed', checkbox: { equals: true } }),
      countDB(T, PROFILES),
      countDB(T, POSTS),
      countDB(T, COMMENTS),
      queryDB(T, CHECKINS, 100),
      queryDB(T, MRS, 50),
      queryDB(T, PROFILES, 100),
      countDB(T, ANALYTICS),
    ])

    // Check-in stats
    const moods = checkInRows.map(r => getNum(r.properties.Mood as Record<string, unknown>)).filter(m => m > 0)
    const sleeps = checkInRows.map(r => getNum(r.properties.Sleep as Record<string, unknown>)).filter(s => s > 0)
    const energys = checkInRows.map(r => getNum(r.properties.Energy as Record<string, unknown>)).filter(e => e > 0)
    const avgMood = moods.length ? (moods.reduce((a, b) => a + b, 0) / moods.length) : 0
    const avgSleep = sleeps.length ? (sleeps.reduce((a, b) => a + b, 0) / sleeps.length) : 0
    const avgEnergy = energys.length ? (energys.reduce((a, b) => a + b, 0) / energys.length) : 0

    // Check-ins per unique user
    const checkInUsers = new Set(checkInRows.map(r => getText(r.properties['User Email'] as Record<string, unknown>)).filter(Boolean))
    const avgCheckInsPerUser = checkInUsers.size > 0 ? (checkInRows.length / checkInUsers.size) : 0

    // Check-ins last 7 days
    const weekAgo = Date.now() - 7 * 86400000
    const checkInsThisWeek = checkInRows.filter(r => new Date(r.created_time).getTime() > weekAgo).length

    // MRS stats
    const mrsScores = mrsRows.map(r => getNum(r.properties['Total Score'] as Record<string, unknown>)).filter(s => s > 0)
    const avgMRS = mrsScores.length ? (mrsScores.reduce((a, b) => a + b, 0) / mrsScores.length) : 0

    // Profile stats
    const goals: Record<string, number> = {}
    const stages: Record<string, number> = {}
    profileRows.forEach(r => {
      const goal = getText(r.properties['Primary Goal'] as Record<string, unknown>)
      const stage = getText(r.properties['Journey Stage'] as Record<string, unknown>)
      if (goal) goals[goal] = (goals[goal] || 0) + 1
      if (stage) stages[stage] = (stages[stage] || 0) + 1
    })

    // Top symptoms from check-ins
    const symFreq: Record<string, number> = {}
    checkInRows.forEach(r => {
      const syms = getText(r.properties.Symptoms as Record<string, unknown>)
      syms.split(',').map(s => s.trim()).filter(Boolean).forEach(s => { symFreq[s] = (symFreq[s] || 0) + 1 })
    })
    const topSymptoms = Object.entries(symFreq).sort((a, b) => b[1] - a[1]).slice(0, 6)

    // Check-ins by day (last 14 days)
    const dailyCheckins: Record<string, number> = {}
    for (let i = 0; i < 14; i++) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
      dailyCheckins[d] = 0
    }
    checkInRows.forEach(r => {
      const d = r.created_time.slice(0, 10)
      if (dailyCheckins[d] !== undefined) dailyCheckins[d]++
    })

    const kpis = {
      // Acquisition
      waitlistTotal: waitlistCount,
      step2Completed: step2Count,
      step2Rate: waitlistCount > 0 ? Math.round((step2Count / waitlistCount) * 100) : 0,

      // App users
      appUsers: profileCount,
      onboardingRate: waitlistCount > 0 ? Math.round((profileCount / waitlistCount) * 100) : 0,
      goals,
      stages,

      // Engagement
      totalCheckIns: checkInRows.length,
      checkInsThisWeek,
      uniqueCheckInUsers: checkInUsers.size,
      avgCheckInsPerUser: Math.round(avgCheckInsPerUser * 10) / 10,
      avgMood: Math.round(avgMood * 10) / 10,
      avgSleep: Math.round(avgSleep * 10) / 10,
      avgEnergy: Math.round(avgEnergy * 10) / 10,
      dailyCheckins,

      // Health
      totalMRS: mrsRows.length,
      avgMRS: Math.round(avgMRS * 10) / 10,
      topSymptoms,

      // Community
      totalPosts: postCount,
      totalComments: commentCount,
      commentsPerPost: postCount > 0 ? Math.round((commentCount / postCount) * 10) / 10 : 0,

      // Analytics
      totalEvents: analyticsCount,
    }

    return new Response(JSON.stringify(kpis), {
      headers: { 'Content-Type': 'application/json', ...cors(), 'Cache-Control': 'public, s-maxage=300' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { 'Content-Type': 'application/json', ...cors() } })
  }
}
