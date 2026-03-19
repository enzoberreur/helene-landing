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
    'Access-Control-Allow-Methods': 'POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
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

  // POST — initial email submission: create a new Notion page
  if (request.method === 'POST') {
    const { email, timestamp, source } = await request.json()

    const res = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: notionHeaders(NOTION_TOKEN),
      body: JSON.stringify({
        parent: { database_id: NOTION_DATABASE_ID },
        properties: {
          Email: { title: [{ text: { content: email ?? '' } }] },
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

    return new Response(JSON.stringify({ pageId: data.id }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    })
  }

  // PATCH — survey completion: update the existing page
  if (request.method === 'PATCH') {
    const { pageId, symptom, impact, need, wtp } = await request.json()

    if (!pageId) {
      return new Response(JSON.stringify({ error: 'pageId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      })
    }

    const richText = (value: string) => [{ text: { content: value ?? '' } }]

    await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      method: 'PATCH',
      headers: notionHeaders(NOTION_TOKEN),
      body: JSON.stringify({
        properties: {
          Symptom: { rich_text: richText(symptom) },
          Impact: { rich_text: richText(impact) },
          Need: { rich_text: richText(need) },
          WTP: { rich_text: richText(wtp) },
        },
      }),
    })

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    })
  }

  return new Response('Method not allowed', { status: 405, headers: corsHeaders() })
}
