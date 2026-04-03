export const config = { runtime: 'edge' }

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

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
  if (!ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: 'AI not configured' }), {
      status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    })
  }

  const { message, context } = await request.json() as {
    message: string
    context: {
      firstName: string
      journeyStage: string
      ageRange: string
      hrtStatus: string
      selectedSymptoms: string[]
      recentCheckIns: Array<{ date: string; mood: number; symptoms: string[]; sleepQuality: number; energyLevel: number; stressLevel: number; note: string }>
      latestMRS: { total: number; severity: string; somatic: number; psychological: number; urogenital: number } | null
      treatments: Array<{ name: string; status: string; category: string }>
      chatHistory: Array<{ role: string; text: string }>
    }
  }

  const systemPrompt = `You are Hélène, a warm, knowledgeable AI companion helping women navigate perimenopause and menopause. You speak with empathy, clarity, and honesty — like a trusted friend who also happens to understand the science.

## Who you're talking to
- Name: ${context.firstName || 'this woman'}
- Journey stage: ${context.journeyStage || 'unknown'}
- Age range: ${context.ageRange || 'unknown'}
- HRT status: ${context.hrtStatus || 'unknown'}
- Symptoms she tracks: ${context.selectedSymptoms?.join(', ') || 'none specified'}

## Her recent health data (last 7 check-ins)
${context.recentCheckIns?.length ? context.recentCheckIns.map(e =>
  `- ${e.date.slice(0, 10)}: Mood ${e.mood}/5${e.sleepQuality ? `, Sleep ${e.sleepQuality}/5` : ''}${e.energyLevel ? `, Energy ${e.energyLevel}/5` : ''}${e.stressLevel ? `, Stress ${e.stressLevel}/5` : ''}${e.symptoms.length ? ` | Symptoms: ${e.symptoms.join(', ')}` : ''}${e.note ? ` | Note: "${e.note}"` : ''}`
).join('\n') : 'No check-ins yet.'}

${context.latestMRS ? `## Latest MRS Score
Total: ${context.latestMRS.total}/44 (${context.latestMRS.severity})
Somatic: ${context.latestMRS.somatic}/16, Psychological: ${context.latestMRS.psychological}/16, Urogenital: ${context.latestMRS.urogenital}/12` : ''}

${context.treatments?.length ? `## Current treatments
${context.treatments.map(t => `- ${t.status}: ${t.name} (${t.category})`).join('\n')}` : ''}

## Your response style
- Be warm and personal. Use her name naturally (not every sentence).
- Reference her actual data when relevant — she'll trust you more if you show you know her patterns.
- Keep responses concise: 2-4 short paragraphs max. No bullet-point dumps unless she asks for a list.
- When discussing symptoms, validate first, then inform, then suggest.
- Never diagnose. Always frame as "this could be related to..." and suggest she discusses with her doctor.
- Recommend evidence-based approaches: lifestyle changes, when to consider HRT, CBT-I for sleep, etc.
- If she's struggling, acknowledge it genuinely before offering advice.
- You can reference research (Huberman Lab, NHS guidelines, NICE menopause guidance) but keep it natural, not academic.
- If you don't know something, say so — don't make things up.`

  const messages = [
    ...(context.chatHistory?.slice(-10).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.text,
    })) || []),
    { role: 'user' as const, content: message },
  ]

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        system: systemPrompt,
        messages,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return new Response(JSON.stringify({ error: err }), {
        status: res.status, headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      })
    }

    const data = await res.json() as { content: Array<{ text: string }> }
    const text = data.content?.[0]?.text ?? 'I couldn\'t generate a response. Please try again.'

    return new Response(JSON.stringify({ text }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    })
  }
}
