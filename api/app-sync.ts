export const config = { runtime: 'edge' }

const NOTION_VERSION = '2022-06-28'

function notionHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Notion-Version': NOTION_VERSION,
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  })
}

function richText(value: string) {
  return [{ text: { content: value ?? '' } }]
}

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() })
  }

  const NOTION_TOKEN = process.env.NOTION_TOKEN
  const CHECKINS_DB = process.env.APP_CHECKINS_DB ?? '9ed39509b1d8408695e74807ee44e542'
  const MRS_DB = process.env.APP_MRS_DB ?? '5176d5bd648348d088844d51628322c8'
  const TREATMENTS_DB = process.env.APP_TREATMENTS_DB ?? '98d0dd9b0cfa4dfc80d4e83fd04b3bd2'

  if (!NOTION_TOKEN) {
    return json({ error: 'Notion not configured' }, 500)
  }

  const url = new URL(request.url)
  const action = url.searchParams.get('action')

  // Sync a check-in
  if (request.method === 'POST' && action === 'checkin') {
    const { email, date, mood, sleep, energy, stress, symptoms, triggers, note } = await request.json()

    const res = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: notionHeaders(NOTION_TOKEN),
      body: JSON.stringify({
        parent: { database_id: CHECKINS_DB },
        properties: {
          Entry: { title: richText(`${email} — ${new Date(date).toLocaleDateString()}`) },
          'User Email': { rich_text: richText(email) },
          Date: { date: { start: date } },
          Mood: { number: mood },
          Sleep: { number: sleep || null },
          Energy: { number: energy || null },
          Stress: { number: stress || null },
          Symptoms: { rich_text: richText(Array.isArray(symptoms) ? symptoms.join(', ') : symptoms ?? '') },
          Triggers: { rich_text: richText(Array.isArray(triggers) ? triggers.join(', ') : triggers ?? '') },
          Note: { rich_text: richText(note ?? '') },
        },
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return json({ error: err }, res.status)
    }
    return json({ ok: true })
  }

  // Sync an MRS score
  if (request.method === 'POST' && action === 'mrs') {
    const { email, date, totalScore, severity, hotFlashes, heartDiscomfort, sleepProblems, jointPain, depressiveMood, irritability, anxiety, exhaustion, sexualProblems, bladderProblems, vaginalDryness } = await request.json()

    const res = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: notionHeaders(NOTION_TOKEN),
      body: JSON.stringify({
        parent: { database_id: MRS_DB },
        properties: {
          Entry: { title: richText(`${email} — MRS ${totalScore}/44`) },
          'User Email': { rich_text: richText(email) },
          Date: { date: { start: date } },
          'Total Score': { number: totalScore },
          Severity: { rich_text: richText(severity) },
          'Hot Flashes': { number: hotFlashes },
          'Heart Discomfort': { number: heartDiscomfort },
          'Sleep Problems': { number: sleepProblems },
          'Joint Pain': { number: jointPain },
          'Depressive Mood': { number: depressiveMood },
          Irritability: { number: irritability },
          Anxiety: { number: anxiety },
          Exhaustion: { number: exhaustion },
          'Sexual Problems': { number: sexualProblems },
          'Bladder Problems': { number: bladderProblems },
          'Vaginal Dryness': { number: vaginalDryness },
        },
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return json({ error: err }, res.status)
    }
    return json({ ok: true })
  }

  // Sync a treatment
  if (request.method === 'POST' && action === 'treatment') {
    const { email, date, name, category, status, note } = await request.json()

    const categoryMap: Record<string, string> = { hrt: 'HRT', supplement: 'Supplement', lifestyle: 'Lifestyle', medication: 'Medication' }
    const statusMap: Record<string, string> = { started: 'Started', stopped: 'Stopped', adjusted: 'Adjusted', paused: 'Paused' }

    const res = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: notionHeaders(NOTION_TOKEN),
      body: JSON.stringify({
        parent: { database_id: TREATMENTS_DB },
        properties: {
          Entry: { title: richText(`${email} — ${name}`) },
          'User Email': { rich_text: richText(email) },
          Date: { date: { start: date } },
          Category: { select: { name: categoryMap[category] ?? category } },
          Status: { select: { name: statusMap[status] ?? status } },
          Note: { rich_text: richText(note ?? '') },
        },
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return json({ error: err }, res.status)
    }
    return json({ ok: true })
  }

  // Sync onboarding profile — find the waitlist entry by email and update it
  if (request.method === 'POST' && action === 'onboarding') {
    const { email, firstName, journeyStage, ageRange, symptoms, hrtStatus, exerciseFrequency, smokingStatus, alcoholFrequency, caffeineIntake, primaryGoal, medicalFollowUp } = await request.json()

    const WAITLIST_DB = process.env.NOTION_DATABASE_ID
    if (!WAITLIST_DB) return json({ error: 'Waitlist DB not configured' }, 500)

    // Find the user's page by email
    const searchRes = await fetch(`https://api.notion.com/v1/databases/${WAITLIST_DB}/query`, {
      method: 'POST',
      headers: notionHeaders(NOTION_TOKEN),
      body: JSON.stringify({
        filter: { property: 'Email', title: { equals: email } },
        page_size: 1,
      }),
    })
    const searchData = await searchRes.json() as { results: Array<{ id: string }> }
    const pageId = searchData.results?.[0]?.id

    if (!pageId) {
      // No existing entry — create a new page in the waitlist
      await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: notionHeaders(NOTION_TOKEN),
        body: JSON.stringify({
          parent: { database_id: WAITLIST_DB },
          properties: {
            Email: { title: richText(email) },
            'First Name': { rich_text: richText(firstName ?? '') },
            Age: { number: ageRange ? parseInt(ageRange) || null : null },
          },
        }),
      })
    }

    // Also save full profile to a dedicated App Profiles database
    const PROFILES_DB = process.env.APP_PROFILES_DB
    if (PROFILES_DB) {
      await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: notionHeaders(NOTION_TOKEN),
        body: JSON.stringify({
          parent: { database_id: PROFILES_DB },
          properties: {
            Entry: { title: richText(`${firstName ?? email}`) },
            'User Email': { rich_text: richText(email) },
            'First Name': { rich_text: richText(firstName ?? '') },
            'Journey Stage': { rich_text: richText(journeyStage ?? '') },
            'Age Range': { rich_text: richText(ageRange ?? '') },
            Symptoms: { rich_text: richText(Array.isArray(symptoms) ? symptoms.join(', ') : '') },
            'HRT Status': { rich_text: richText(hrtStatus ?? '') },
            Exercise: { rich_text: richText(exerciseFrequency ?? '') },
            Smoking: { rich_text: richText(smokingStatus ?? '') },
            Alcohol: { rich_text: richText(alcoholFrequency ?? '') },
            Caffeine: { rich_text: richText(caffeineIntake ?? '') },
            'Primary Goal': { rich_text: richText(primaryGoal ?? '') },
            'Medical Follow-Up': { rich_text: richText(medicalFollowUp ?? '') },
          },
        }),
      }).catch(() => {})
    }

    return json({ ok: true })
  }

  return new Response('Method not allowed', { status: 405, headers: corsHeaders() })
}
