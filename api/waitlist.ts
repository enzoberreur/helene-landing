export const config = { runtime: 'edge' }

const NOTION_VERSION = '2022-06-28'

// Map translated period options → Notion select keys
const PERIOD_STATUS_MAP: Record<string, string> = {
  // English
  'Pretty regular, same as always': 'Pretty regular',
  'A bit different lately — shorter, longer, or heavier': 'A bit different lately',
  "All over the place — I never know when it's coming": 'All over the place',
  "I've gone months without one": 'Gone months without',
  "They've stopped completely": 'Stopped completely',
  "I'm on hormonal contraception or HRT": 'Hormonal contraception or HRT',
  // French
  'Plutôt régulières, comme d\'habitude': 'Pretty regular',
  'Un peu différentes ces derniers temps : plus courtes, plus longues, plus abondantes': 'A bit different lately',
  'Complètement n\'importe quoi, impossible de savoir quand elles arrivent': 'All over the place',
  'Ça fait des mois que je n\'en ai pas eu': 'Gone months without',
  'Elles se sont arrêtées': 'Stopped completely',
  'Je suis sous contraception hormonale ou THS': 'Hormonal contraception or HRT',
}

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
    'Access-Control-Allow-Methods': 'POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

async function addToBrevo(email: string, firstName: string, pageId: string, locale: string, listId: number): Promise<string | null> {
  const BREVO_API_KEY = process.env.BREVO_API_KEY
  if (!BREVO_API_KEY) return 'BREVO_API_KEY not set'

  const res = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      attributes: { FIRSTNAME: firstName, NOTION_PAGE_ID: pageId, LOCALE: locale },
      listIds: [listId],
      updateEnabled: true,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    return `Brevo ${res.status}: ${err}`
  }
  return null
}

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() })
  }

  const NOTION_TOKEN = process.env.NOTION_TOKEN
  const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID

  if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
    return new Response(JSON.stringify({ error: 'Notion credentials not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    })
  }

  // POST — Step 1 signup: create Notion page + add to Brevo
  if (request.method === 'POST') {
    const { email, firstName, age, periodStatus, timestamp, source } = await request.json()

    const notionPeriodStatus = PERIOD_STATUS_MAP[periodStatus] ?? periodStatus

    const res = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: notionHeaders(NOTION_TOKEN),
      body: JSON.stringify({
        parent: { database_id: NOTION_DATABASE_ID },
        properties: {
          Email: { title: [{ text: { content: email ?? '' } }] },
          'First Name': { rich_text: [{ text: { content: firstName ?? '' } }] },
          Age: { number: age ? Number(age) : null },
          'Period Status': notionPeriodStatus ? { select: { name: notionPeriodStatus } } : undefined,
          Timestamp: { date: { start: timestamp ?? new Date().toISOString() } },
          Source: { url: source || null },
        },
      }),
    })

    const data = await res.json() as { id?: string; message?: string }

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data.message ?? 'Notion error' }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      })
    }

    // Add contact to Brevo — non-blocking, log error in response for debugging
    const BREVO_LIST_ID = Number(process.env.BREVO_LIST_ID ?? '2')
    let brevoError: string | null = null
    try {
      brevoError = await addToBrevo(email, firstName ?? '', data.id!, locale ?? 'fr', BREVO_LIST_ID)
    } catch (e) {
      brevoError = String(e)
    }

    return new Response(JSON.stringify({ pageId: data.id, brevoError }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    })
  }

  // PATCH — Step 2 survey: update existing page with deeper profile
  if (request.method === 'PATCH') {
    const { pageId, contraception, symptoms, doctorVisit, currentTools, goldenQuestion, coDesign, location } = await request.json()

    if (!pageId) {
      return new Response(JSON.stringify({ error: 'pageId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      })
    }

    const richText = (value: string) => [{ text: { content: value ?? '' } }]

    const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      method: 'PATCH',
      headers: notionHeaders(NOTION_TOKEN),
      body: JSON.stringify({
        properties: {
          Contraception: contraception ? { select: { name: contraception } } : undefined,
          Symptoms: { rich_text: richText(symptoms) },
          'Doctor Visit': doctorVisit ? { select: { name: doctorVisit } } : undefined,
          'Current Tools': { rich_text: richText(currentTools) },
          'Golden Question': { rich_text: richText(goldenQuestion) },
          'Co-Design': coDesign ? { select: { name: coDesign } } : undefined,
          Location: { rich_text: richText(location) },
          'Step 2 Completed': { checkbox: true },
        },
      }),
    })

    if (!res.ok) {
      const data = await res.json() as { message?: string }
      return new Response(JSON.stringify({ error: data.message ?? 'Notion error' }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      })
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    })
  }

  return new Response('Method not allowed', { status: 405, headers: corsHeaders() })
}
