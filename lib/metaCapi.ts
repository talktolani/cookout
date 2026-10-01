import { createHash } from 'node:crypto'

import { PIXEL_ID, PARTNER_PIXEL_ID, PIXEL_IDS } from '@/lib/metaIds'

// Server-only half of the Meta Conversions API, shared by app/api/meta
// (browser-paired events) and app/api/meta/purchase (TicketMelon purchases).
//
// Sends to every dataset in lib/metaIds.ts that has a token:
//   ours     META_CAPI_TOKEN          (+ META_TEST_EVENT_CODE)
//   partner  META_PARTNER_CAPI_TOKEN  (+ META_PARTNER_TEST_EVENT_CODE)
// Tokens come from Events Manager > dataset > Settings > Conversions API >
// Generate access token, created by an admin of the business that owns the
// dataset. A dataset without a token still gets the browser pixel. A test
// event code routes that dataset's events to its Test events tab: remove it
// once verified or real events never count there.

export const TARGETS = [
  { id: PIXEL_ID, token: process.env.META_CAPI_TOKEN, test: process.env.META_TEST_EVENT_CODE },
  { id: PARTNER_PIXEL_ID, token: process.env.META_PARTNER_CAPI_TOKEN, test: process.env.META_PARTNER_TEST_EVENT_CODE },
].filter((t) => PIXEL_IDS.includes(t.id) && t.token) as { id: string; token: string; test?: string }[]

const GRAPH = process.env.META_GRAPH_URL ?? 'https://graph.facebook.com/v23.0' // override only for local tests

export const sha = (v: string) => createHash('sha256').update(v).digest('hex')

export function norm(kind: 'em' | 'ph' | 'name' | 'country', v: unknown): string | null {
  if (typeof v !== 'string') return null
  let s = v.trim().toLowerCase()
  if (!s) return null
  if (kind === 'ph') s = s.replace(/\D/g, '') // E.164 without the +
  if (kind === 'name') s = s.normalize('NFKD').replace(/[^\p{L}]/gu, '')
  if (kind === 'country') s = s.slice(0, 2)
  if (kind === 'em' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return null
  return s || null
}

export type SendResult = { dataset: string; ok: boolean; status: number; body: string }

// One event to every dataset. Logs both outcomes: Vercel's runtime logs are
// the only place to prove a dataset's token works, and a quiet log proves
// nothing. Never throws.
export async function sendEvent(event: Record<string, unknown>): Promise<SendResult[]> {
  const name = String(event.event_name ?? '')
  return Promise.all(TARGETS.map(async (t): Promise<SendResult> => {
    const payload: Record<string, unknown> = { data: [event] }
    if (t.test) payload.test_event_code = t.test
    try {
      const res = await fetch(`${GRAPH}/${t.id}/events?access_token=${encodeURIComponent(t.token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const body = (await res.text()).slice(0, 500)
      if (!res.ok) console.error('meta capi', t.id, name, res.status, body)
      else console.log('meta capi ok', t.id, name, body.slice(0, 80))
      return { dataset: t.id, ok: res.ok, status: res.status, body: body.slice(0, 200) }
    } catch (e) {
      console.error('meta capi fetch failed', t.id, String(e).slice(0, 200))
      return { dataset: t.id, ok: false, status: 0, body: String(e).slice(0, 200) }
    }
  }))
}
