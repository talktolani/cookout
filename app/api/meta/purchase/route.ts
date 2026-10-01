// TicketMelon purchases -> Meta Purchase events (Conversions API).
//
// Tickets are sold on TicketMelon, so the pixel never sees a purchase. When a
// paid order is recorded in AIOS (cookout_mark_buyers with order_no and total),
// a database trigger POSTs { token } here. This route claims the event from
// AIOS with that one-time token, sends it to every dataset in lib/metaCapi.ts,
// and reports the outcome back. The buyer's details arrive already hashed;
// nothing readable passes through here.
//
// Runs on Node like app/api/meta: do not add `export const runtime`.
//
// action_source: Meta requires a user agent for website events. Buyers who
// signed up on our site first carry their browser context (user agent, _fbp,
// _fbc, hashed visitor id) from that sign-up, so their purchase goes in as a
// website event and ties to their ad click. Buyers who went straight to
// TicketMelon have no browser context and go in as system_generated, matched
// on hashed email and phone only.

import { SALES } from '@/content/sales'
import { TARGETS, sendEvent } from '@/lib/metaCapi'

// Public by design: the AIOS project URL and its publishable key. The two
// functions it may call (cookout_purchase_claim / _report) need the row's
// random one-time token, and a reported purchase never comes back.
const AIOS = 'https://imovvalxcypylkbtrbeb.supabase.co/rest/v1/rpc'
const AIOS_KEY = 'sb_publishable_EtM-dCd2lzI0aSc_Gd5g5g_C7DwlW57'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const USER_KEYS = ['em', 'ph', 'fn', 'ln', 'country', 'external_id', 'client_user_agent', 'fbp', 'fbc']

async function rpc(fn: string, body: Record<string, unknown>): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(`${AIOS}/${fn}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: AIOS_KEY },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      console.error('purchase rpc', fn, res.status, (await res.text()).slice(0, 300))
      return null
    }
    return (await res.json()) as Record<string, unknown>
  } catch (e) {
    console.error('purchase rpc failed', fn, String(e).slice(0, 200))
    return null
  }
}

export async function POST(req: Request) {
  let token = ''
  try {
    token = String(((await req.json()) as Record<string, unknown>).token ?? '')
  } catch {
    return new Response(null, { status: 400 })
  }
  if (!UUID.test(token)) return new Response(null, { status: 400 })
  // No dataset has a token: leave the purchase unclaimed for a later retry.
  if (!TARGETS.length) return Response.json({ ok: false, reason: 'no_datasets' }, { status: 503 })

  const claim = await rpc('cookout_purchase_claim', { p_token: token })
  if (!claim) return Response.json({ ok: false, reason: 'claim_failed' }, { status: 502 })
  if (claim.ok !== true) return Response.json({ ok: false, reason: claim.reason ?? 'not_claimable' }, { status: 409 })

  const src = (claim.user_data ?? {}) as Record<string, unknown>
  const ud: Record<string, unknown> = {}
  for (const k of USER_KEYS) if (src[k] !== undefined && src[k] !== null) ud[k] = src[k]
  const website = typeof ud.client_user_agent === 'string' && ud.client_user_agent.length > 0

  const event: Record<string, unknown> = {
    event_name: 'Purchase',
    event_time: Number(claim.event_time),
    event_id: String(claim.event_id),
    action_source: website ? 'website' : 'system_generated',
    user_data: ud,
    custom_data: {
      currency: String(claim.currency ?? 'MYR'),
      value: Number(claim.value),
      num_items: Number(claim.num_items ?? 1),
      order_id: String(claim.order_id),
      content_name: 'The Cookout',
    },
  }
  if (website) event.event_source_url = SALES.checkoutUrl

  const results = await sendEvent(event)
  const okCount = results.filter((r) => r.ok).length
  await rpc('cookout_purchase_report', {
    p_token: token,
    p_result: { ok_count: okCount, action_source: event.action_source, results },
  })
  console.log('purchase sent', claim.order_id, event.action_source, `${okCount}/${results.length}`)
  return Response.json({ ok: okCount > 0, sent: okCount, of: results.length })
}
