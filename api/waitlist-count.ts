export const config = { runtime: 'edge' }

export default async function handler() {
  const NOTION_TOKEN = process.env.NOTION_TOKEN
  const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID

  if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
    return new Response(JSON.stringify({ count: 140 }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }

  let total = 0
  let cursor: string | undefined

  while (true) {
    const body: Record<string, unknown> = { page_size: 100 }
    if (cursor) body.start_cursor = cursor

    const res = await fetch(`https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify(body),
    })

    const data = await res.json() as { results: unknown[]; has_more: boolean; next_cursor: string | null }
    total += data.results.length
    if (!data.has_more) break
    cursor = data.next_cursor ?? undefined
  }

  // Add 100 buffer
  const display = total + 100

  return new Response(JSON.stringify({ count: display }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, s-maxage=3600',
    },
  })
}
