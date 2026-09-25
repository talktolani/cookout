import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * First party tracker proxy.
 *
 * The Supabase gateway rewrites X-Forwarded-For to its own peer address before
 * the edge function runs, so the visitor's real IP has to travel in a custom
 * header. Without this route every visitor hashes to the same IP and geography
 * comes back blank.
 *
 * Header names stay X-Lani-* because site-collect is shared infrastructure and
 * that is what it reads. They are not Lani AI data, only the header contract.
 *
 * Runs on Node, not Edge. The Edge runtime will not reliably let a fetch set
 * the User-Agent header, and forwarding the real one is the entire reason this
 * route exists.
 *
 * Adapted from lani-site/app/c/route.ts. The 3 Cookout changes are marked.
 */

const SITE_COLLECT =
  process.env.SITE_COLLECT_URL ??
  'https://imovvalxcypylkbtrbeb.supabase.co/functions/v1/site-collect'

// COOKOUT CHANGE 1 of 3: our site key, never talktolani.
const SITE_KEY = process.env.NEXT_PUBLIC_SITE_KEY ?? 'cookout'

// COOKOUT CHANGE 2 of 3: exclusion cookie scoped to our own domain.
// lani_no_track is scoped to .talktolani.com and can never reach us.
const EXCLUDE_COOKIE = 'cookout_no_track'

function passthroughHeaders(req: NextRequest): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }

  const ip =
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    ''
  if (ip) h['X-Lani-Client-IP'] = ip

  // Real header name. The collector classifies every session from this string,
  // so under any other name it reads Vercel's own fetch agent instead.
  const ua = req.headers.get('user-agent')
  if (ua) h['User-Agent'] = ua

  // Vercel percent encodes these and the collector decodes them. Forward
  // verbatim: decoding here either double decodes, or puts raw UTF-8 into an
  // outbound header for a non-ASCII city, which makes fetch throw. The catch
  // swallows it and the whole batch vanishes.
  const city = req.headers.get('x-vercel-ip-city')
  const region = req.headers.get('x-vercel-ip-country-region')
  const country = req.headers.get('x-vercel-ip-country')
  if (city) h['X-Lani-Geo-City'] = city
  if (region) h['X-Lani-Geo-Region'] = region
  if (country) h['X-Lani-Geo-Country'] = country

  if (req.cookies.get(EXCLUDE_COOKIE) || process.env.NEXT_PUBLIC_NO_TRACK === '1') {
    h['X-Lani-Internal'] = '1'
  }

  return h
}

export async function GET(req: NextRequest) {
  const cfg = req.nextUrl.searchParams.get('cfg')
  if (!cfg) return NextResponse.json({ ok: false }, { status: 400 })

  try {
    // COOKOUT CHANGE 3 of 3: the site parameter is required.
    // lani-site sends cfg=1 with no site and gets talktolani's config back.
    const r = await fetch(`${SITE_COLLECT}?cfg=1&site=${encodeURIComponent(SITE_KEY)}`, {
      headers: passthroughHeaders(req),
      cache: 'no-store',
    })
    const body = await r.json()
    return NextResponse.json(body, { status: r.status })
  } catch {
    // Fallback must name our site, not talktolani.
    return NextResponse.json({
      site: SITE_KEY,
      clicks: true,
      scroll: true,
      forms: true,
      rec: { on: false },
    })
  }
}

export async function POST(req: NextRequest) {
  let payload: Record<string, unknown>
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ ok: false, reason: 'bad_json' }, { status: 400 })
  }

  // Never let a batch through without the site key. A missing key is refused
  // by sites_collect with bad_site rather than silently filed under Lani AI.
  payload.site = SITE_KEY

  try {
    const r = await fetch(SITE_COLLECT, {
      method: 'POST',
      headers: passthroughHeaders(req),
      body: JSON.stringify(payload),
    })
    const body = await r.json().catch(() => ({ ok: r.ok }))
    return NextResponse.json(body, { status: r.status })
  } catch {
    // Analytics must never break the page.
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
