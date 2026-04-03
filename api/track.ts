export const config = { runtime: 'edge' }

const NOTION_VERSION = '2022-06-28'

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() })
  }

  const NOTION_TOKEN = process.env.NOTION_TOKEN
  const ANALYTICS_DB = process.env.ANALYTICS_DB ?? '45950529036e43bea90c49ef9fb1de29'

  if (!NOTION_TOKEN) {
    return new Response('ok', { headers: corsHeaders() })
  }

  try {
    const { events } = await request.json() as {
      events: Array<{ event: string; category: string; email?: string; page?: string; properties?: Record<string, unknown> }>
    }

    // Batch create — up to 10 events per request
    const batch = (events || []).slice(0, 10)

    await Promise.all(batch.map(ev =>
      fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${NOTION_TOKEN}`,
          'Content-Type': 'application/json',
          'Notion-Version': NOTION_VERSION,
        },
        body: JSON.stringify({
          parent: { database_id: ANALYTICS_DB },
          properties: {
            Event: { title: [{ text: { content: ev.event } }] },
            Category: { select: { name: ev.category } },
            'User Email': { rich_text: [{ text: { content: ev.email ?? 'anonymous' } }] },
            Page: { rich_text: [{ text: { content: ev.page ?? '' } }] },
            Properties: { rich_text: [{ text: { content: ev.properties ? JSON.stringify(ev.properties) : '' } }] },
          },
        }),
      }).catch(() => {})
    ))
  } catch {
    // Never fail — tracking should never break the user experience
  }

  return new Response('ok', { headers: corsHeaders() })
}
