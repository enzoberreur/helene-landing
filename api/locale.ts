export const config = { runtime: 'edge' }

export default function handler(request: Request) {
  const country = request.headers.get('x-vercel-ip-country') ?? ''
  const locale = country === 'FR' ? 'fr' : 'en'

  return new Response(JSON.stringify({ locale, country }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
