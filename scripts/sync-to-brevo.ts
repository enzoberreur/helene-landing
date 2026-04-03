/**
 * One-time script: sync existing Notion waitlist contacts to Brevo.
 *
 * Usage:
 *   npx tsx scripts/sync-to-brevo.ts
 *
 * Required env vars (reads from .env):
 *   NOTION_TOKEN, NOTION_DATABASE_ID, BREVO_API_KEY, BREVO_LIST_ID
 */

import 'dotenv/config'

const NOTION_TOKEN = process.env.NOTION_TOKEN!
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID!
const BREVO_API_KEY = process.env.BREVO_API_KEY!
const BREVO_LIST_ID = Number(process.env.BREVO_LIST_ID ?? '2')

interface NotionPage {
  id: string
  properties: {
    Email: { title: Array<{ plain_text: string }> }
    'First Name'?: { rich_text: Array<{ plain_text: string }> }
  }
}

interface NotionQueryResponse {
  results: NotionPage[]
  has_more: boolean
  next_cursor: string | null
}

async function fetchAllNotionContacts(): Promise<Array<{ email: string; firstName: string; pageId: string }>> {
  const contacts: Array<{ email: string; firstName: string; pageId: string }> = []
  let cursor: string | undefined = undefined
  let page = 1

  while (true) {
    console.log(`  Fetching Notion page ${page}...`)

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

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Notion API error: ${res.status} — ${err}`)
    }

    const data = (await res.json()) as NotionQueryResponse

    for (const row of data.results) {
      const email = row.properties.Email?.title?.[0]?.plain_text?.trim()
      if (!email) continue

      const firstName = row.properties['First Name']?.rich_text?.[0]?.plain_text?.trim() ?? ''
      contacts.push({ email, firstName, pageId: row.id })
    }

    if (!data.has_more) break
    cursor = data.next_cursor ?? undefined
    page++
  }

  return contacts
}

async function pushToBrevo(contacts: Array<{ email: string; firstName: string; pageId: string }>) {
  let success = 0
  let failed = 0

  for (const contact of contacts) {
    try {
      const res = await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: contact.email,
          attributes: {
            FIRSTNAME: contact.firstName,
            NOTION_PAGE_ID: contact.pageId,
            LOCALE: 'fr', // existing contacts are mostly French
          },
          listIds: [BREVO_LIST_ID],
          updateEnabled: true,
        }),
      })

      if (res.ok || res.status === 204) {
        success++
        console.log(`  + ${contact.email}`)
      } else {
        const err = await res.text()
        // "duplicate_parameter" means already exists — that's fine
        if (err.includes('duplicate_parameter')) {
          success++
          console.log(`  ~ ${contact.email} (already in Brevo, updated)`)
        } else {
          failed++
          console.log(`  x ${contact.email} — ${err}`)
        }
      }
    } catch (e) {
      failed++
      console.log(`  x ${contact.email} — ${e}`)
    }
  }

  return { success, failed }
}

async function main() {
  // Validate env
  if (!NOTION_TOKEN || !BREVO_API_KEY) {
    console.error('Missing NOTION_TOKEN or BREVO_API_KEY in .env')
    process.exit(1)
  }

  console.log('\n1. Fetching contacts from Notion...')
  const contacts = await fetchAllNotionContacts()
  console.log(`   Found ${contacts.length} contacts\n`)

  if (contacts.length === 0) {
    console.log('Nothing to sync.')
    return
  }

  console.log('2. Pushing to Brevo...')
  const { success, failed } = await pushToBrevo(contacts)

  console.log(`\nDone! ${success} synced, ${failed} failed.`)
}

main().catch((e) => {
  console.error('Fatal error:', e)
  process.exit(1)
})
