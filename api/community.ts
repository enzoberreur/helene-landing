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
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
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

function getText(prop: { rich_text?: Array<{ plain_text: string }>; title?: Array<{ plain_text: string }> }): string {
  return prop?.rich_text?.[0]?.plain_text ?? prop?.title?.[0]?.plain_text ?? ''
}

function getNumber(prop: { number?: number | null }): number {
  return prop?.number ?? 0
}

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() })
  }

  const NOTION_TOKEN = process.env.NOTION_TOKEN
  const POSTS_DB = process.env.COMMUNITY_POSTS_DB ?? 'f50162e75a244e3381aad4059f19d061'
  const COMMENTS_DB = process.env.COMMUNITY_COMMENTS_DB ?? 'd55cb22f242548e4878ca98229de3237'

  if (!NOTION_TOKEN) {
    return json({ error: 'Notion not configured' }, 500)
  }

  const url = new URL(request.url)
  const action = url.searchParams.get('action')

  // GET — fetch all posts + comments
  if (request.method === 'GET' && action === 'list') {
    // Fetch posts
    const postsRes = await fetch(`https://api.notion.com/v1/databases/${POSTS_DB}/query`, {
      method: 'POST',
      headers: notionHeaders(NOTION_TOKEN),
      body: JSON.stringify({ sorts: [{ timestamp: 'created_time', direction: 'descending' }], page_size: 100 }),
    })
    const postsData = await postsRes.json() as { results: Array<{ id: string; properties: Record<string, unknown>; created_time: string }> }

    if (!postsRes.ok) {
      const err = await postsRes.text()
      return json({ error: `Posts DB error: ${err}` }, postsRes.status)
    }

    // Fetch comments
    const commentsRes = await fetch(`https://api.notion.com/v1/databases/${COMMENTS_DB}/query`, {
      method: 'POST',
      headers: notionHeaders(NOTION_TOKEN),
      body: JSON.stringify({ sorts: [{ timestamp: 'created_time', direction: 'ascending' }], page_size: 100 }),
    })
    const commentsData = commentsRes.ok
      ? await commentsRes.json() as { results: Array<{ id: string; properties: Record<string, unknown>; created_time: string }> }
      : { results: [] }

    // Map comments by post ID
    const commentsByPost: Record<string, Array<{ id: string; pseudonym: string; avatarSeed: number; body: string; timestamp: string; parentCommentId: string }>> = {}
    for (const c of commentsData.results) {
      const p = c.properties as Record<string, { rich_text?: Array<{ plain_text: string }>; title?: Array<{ plain_text: string }>; number?: number | null }>
      const postId = getText(p['Post ID'])
      if (!postId) continue
      if (!commentsByPost[postId]) commentsByPost[postId] = []
      commentsByPost[postId].push({
        id: c.id,
        pseudonym: getText(p['Pseudonym']),
        avatarSeed: getNumber(p['Avatar Seed']),
        body: getText(p['Body']),
        timestamp: c.created_time,
        parentCommentId: getText(p['Parent Comment ID']),
      })
    }

    // Build posts
    const posts = postsData.results.map(r => {
      const p = r.properties as Record<string, { rich_text?: Array<{ plain_text: string }>; title?: Array<{ plain_text: string }>; number?: number | null }>
      const postComments = commentsByPost[r.id] ?? []

      // Build nested comments (1-level replies)
      const topLevel = postComments.filter(c => !c.parentCommentId)
      const replies = postComments.filter(c => c.parentCommentId)
      const nested = topLevel.map(c => ({
        ...c,
        replies: replies.filter(r => r.parentCommentId === c.id),
      }))

      // Parse poll
      const pollQuestion = getText(p['Poll Question'])
      const pollOptionsRaw = getText(p['Poll Options'])
      const pollVotesRaw = getText(p['Poll Votes'])
      let poll = null
      if (pollQuestion && pollOptionsRaw) {
        const options = pollOptionsRaw.split('|').map((text, i) => {
          const votes = pollVotesRaw ? (pollVotesRaw.split('|').map(Number)[i] ?? 0) : 0
          return { id: `opt-${i}`, text: text.trim(), votes }
        })
        poll = { question: pollQuestion, options }
      }

      return {
        id: r.id,
        title: getText(p['Title']),
        body: getText(p['Body']),
        pseudonym: getText(p['Pseudonym']),
        avatarSeed: getNumber(p['Avatar Seed']),
        tags: getText(p['Tags']).split(',').map(t => t.trim()).filter(Boolean),
        upvotes: getNumber(p['Upvotes']),
        timestamp: r.created_time,
        comments: nested,
        poll,
      }
    })

    return json({ posts })
  }

  // POST — create a post
  if (request.method === 'POST' && action === 'post') {
    const { title, body, pseudonym, avatarSeed, tags, pollQuestion, pollOptions } = await request.json()

    const properties: Record<string, unknown> = {
      Title: { title: richText(title) },
      Body: { rich_text: richText(body) },
      Pseudonym: { rich_text: richText(pseudonym) },
      'Avatar Seed': { number: avatarSeed ?? 0 },
      Tags: { rich_text: richText(Array.isArray(tags) ? tags.join(',') : '') },
      Upvotes: { number: 0 },
    }

    if (pollQuestion && pollOptions?.length) {
      properties['Poll Question'] = { rich_text: richText(pollQuestion) }
      properties['Poll Options'] = { rich_text: richText(pollOptions.join('|')) }
      properties['Poll Votes'] = { rich_text: richText(pollOptions.map(() => '0').join('|')) }
    }

    const res = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: notionHeaders(NOTION_TOKEN),
      body: JSON.stringify({ parent: { database_id: POSTS_DB }, properties }),
    })

    const data = await res.json() as { id?: string; message?: string }
    if (!res.ok) return json({ error: data.message ?? 'Notion error' }, res.status)
    return json({ id: data.id })
  }

  // POST — create a comment
  if (request.method === 'POST' && action === 'comment') {
    const { postId, body, pseudonym, avatarSeed, parentCommentId } = await request.json()

    const res = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: notionHeaders(NOTION_TOKEN),
      body: JSON.stringify({
        parent: { database_id: COMMENTS_DB },
        properties: {
          Comment: { title: richText(body.slice(0, 50)) },
          'Post ID': { rich_text: richText(postId) },
          Body: { rich_text: richText(body) },
          Pseudonym: { rich_text: richText(pseudonym) },
          'Avatar Seed': { number: avatarSeed ?? 0 },
          'Parent Comment ID': { rich_text: richText(parentCommentId ?? '') },
        },
      }),
    })

    const data = await res.json() as { id?: string; message?: string }
    if (!res.ok) return json({ error: data.message ?? 'Notion error' }, res.status)
    return json({ id: data.id })
  }

  // PATCH — upvote a post (increment/decrement)
  if (request.method === 'PATCH' && action === 'upvote') {
    const { postId, delta } = await request.json()

    // Get current upvotes
    const getRes = await fetch(`https://api.notion.com/v1/pages/${postId}`, {
      headers: notionHeaders(NOTION_TOKEN),
    })
    const page = await getRes.json() as { properties: Record<string, { number?: number | null }> }
    const current = page.properties?.Upvotes?.number ?? 0

    await fetch(`https://api.notion.com/v1/pages/${postId}`, {
      method: 'PATCH',
      headers: notionHeaders(NOTION_TOKEN),
      body: JSON.stringify({
        properties: { Upvotes: { number: Math.max(0, current + (delta ?? 1)) } },
      }),
    })

    return json({ ok: true, upvotes: Math.max(0, current + (delta ?? 1)) })
  }

  // PATCH — edit a post
  if (request.method === 'PATCH' && action === 'edit') {
    const { postId, title, body, tags } = await request.json()
    await fetch(`https://api.notion.com/v1/pages/${postId}`, {
      method: 'PATCH',
      headers: notionHeaders(NOTION_TOKEN),
      body: JSON.stringify({
        properties: {
          Title: { title: richText(title) },
          Body: { rich_text: richText(body) },
          Tags: { rich_text: richText(Array.isArray(tags) ? tags.join(',') : '') },
        },
      }),
    })
    return json({ ok: true })
  }

  // PATCH — archive (delete) a post
  if (request.method === 'PATCH' && action === 'delete') {
    const { postId } = await request.json()
    await fetch(`https://api.notion.com/v1/pages/${postId}`, {
      method: 'PATCH',
      headers: notionHeaders(NOTION_TOKEN),
      body: JSON.stringify({ archived: true }),
    })
    return json({ ok: true })
  }

  return new Response('Method not allowed', { status: 405, headers: corsHeaders() })
}
