import { createHash } from 'node:crypto'

// Server half of the Meta pixel (lib/meta.ts sends the browser half with the
// same event_id). Runs on Node, like app/c/route.ts: do not add
// `export const runtime`.
//
// Needs META_CAPI_TOKEN (Events Manager > dataset > Settings > Conversions
// API > Generate access token). Without it this answers 204 and sends
// nothing, so the site works before the token exists. META_TEST_EVENT_CODE,
// when set, routes every event to Events Manager's Test events tab: remove it
// once verified or real events never count.

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '1092247383161339'
const GRAPH = process.env.META_GRAPH_URL ?? 'https://graph.facebook.com/v23.0' // override only for local tests
const ALLOWED = new Set(['PageView', 'ViewContent', 'Lead', 'InitiateCheckout'])

const sha = (v: string) => createHash('sha256').update(v).digest('hex')

function norm(kind: 'em' | 'ph' | 'name' | 'country', v: unknown): string | null {
  if (typeof v !== 'string') return null
  let s = v.trim().toLowerCase()
  if (!s) return null
  if (kind === 'ph') s = s.replace(/\D/g, '') // E.164 without the +
  if (kind === 'name') s = s.normalize('NFKD').replace(/[^\p{L}]/gu, '')
  if (kind === 'country') s = s.slice(0, 2)
  if (kind === 'em' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return null
  return s || null
}

function cookie(header: string | null, name: string): string | undefined {
  if (!header) return
  const m = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`))
  return m ? decodeURIComponent(m[1]) : undefined
}

export async function POST(req: Request) {
  const token = process.env.META_CAPI_TOKEN
  if (!token) return new Response(null, { status: 204 })

  let b: Record<string, unknown>
  try {
    b = await req.json()
  } catch {
    return new Response(null, { status: 400 })
  }

  const name = String(b.event_name ?? '')
  const id = String(b.event_id ?? '').slice(0, 100)
  if (!ALLOWED.has(name) || !id) return new Response(null, { status: 400 })

  const url = typeof b.url === 'string' ? b.url.slice(0, 1000) : undefined
  const user = (b.user ?? {}) as Record<string, unknown>
  const cookies = req.headers.get('cookie')

  // _fbc is the pixel's click cookie. On the very first page view it may not
  // be written yet, so fall back to the fbclid in the landing URL.
  let fbc = cookie(cookies, '_fbc')
  if (!fbc && url) {
    try {
      const clid = new URL(url).searchParams.get('fbclid')
      if (clid) fbc = `fb.1.${Date.now()}.${clid}`
    } catch {}
  }

  const ud: Record<string, unknown> = {
    client_ip_address: (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || undefined,
    client_user_agent: req.headers.get('user-agent') ?? undefined,
    fbp: cookie(cookies, '_fbp'),
    fbc,
  }
  const em = norm('em', user.email)
  const ph = norm('ph', user.phone)
  const fn = norm('name', user.first_name)
  const ln = norm('name', user.last_name)
  const country = norm('country', user.country)
  if (em) ud.em = [sha(em)]
  if (ph) ud.ph = [sha(ph)]
  if (fn) ud.fn = [sha(fn)]
  if (ln) ud.ln = [sha(ln)]
  if (country) ud.country = [sha(country)]
  // Already a SHA-256 hex from the browser, identical to the pixel's copy.
  if (typeof b.external_id === 'string' && /^[0-9a-f]{64}$/.test(b.external_id)) ud.external_id = [b.external_id]

  const custom = b.custom && typeof b.custom === 'object' ? (b.custom as Record<string, unknown>) : {}

  const payload: Record<string, unknown> = {
    data: [{
      event_name: name,
      event_time: Math.floor(Date.now() / 1000),
      event_id: id,
      action_source: 'website',
      event_source_url: url,
      user_data: ud,
      custom_data: custom,
    }],
  }
  if (process.env.META_TEST_EVENT_CODE) payload.test_event_code = process.env.META_TEST_EVENT_CODE

  try {
    const res = await fetch(`${GRAPH}/${PIXEL_ID}/events?access_token=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) console.error('meta capi', res.status, (await res.text()).slice(0, 500))
  } catch (e) {
    console.error('meta capi fetch failed', String(e).slice(0, 200))
  }
  return new Response(null, { status: 204 })
}
