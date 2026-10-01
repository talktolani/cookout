/**
 * Meta pixel + Conversions API, sent as pairs.
 *
 * Every event goes out twice with the same event_id: once from the browser
 * (fbq) and once from our own server (/api/meta -> Graph API). Meta keeps
 * one of each pair, so an ad blocker or iOS dropping the browser copy no
 * longer loses the conversion. Do not change one side's event_id without the
 * other: a mismatch counts every conversion twice.
 *
 * Contact details go to /api/meta raw over HTTPS and are hashed there, never
 * in the browser, never stored.
 */

import { PIXEL_IDS } from './metaIds'

export { PIXEL_ID, PARTNER_PIXEL_ID } from './metaIds'

export type MetaEventName = 'PageView' | 'ViewContent' | 'Lead' | 'InitiateCheckout'

export type MetaUser = {
  email?: string
  phone?: string // E.164, e.g. +60123456789
  first_name?: string
  last_name?: string
  country?: string // ISO 3166 alpha-2, e.g. MY
}

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void
  queue?: unknown[]
  push?: unknown
  loaded?: boolean
  version?: string
}

declare global {
  interface Window { fbq?: Fbq; _fbq?: Fbq }
}

let externalId: Promise<string> | null = null

// The tracker's visitor id (lib/analytics.ts, key ck_v), hashed. Sent as
// external_id on both sides so every event from one browser ties together.
function visitorHash(): Promise<string> {
  if (externalId) return externalId
  externalId = (async () => {
    try {
      let v = localStorage.getItem('ck_v')
      if (!v) {
        v = crypto.randomUUID().replace(/-/g, '')
        localStorage.setItem('ck_v', v)
      }
      const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(v))
      return Array.from(new Uint8Array(d), (b) => b.toString(16).padStart(2, '0')).join('')
    } catch {
      return ''
    }
  })()
  return externalId
}

let booted: Promise<void> | null = null

// Meta's standard loader, written out so fbq exists before the first event
// fires (no race with a next/script tag).
function boot(): Promise<void> {
  if (booted) return booted
  booted = (async () => {
    if (!PIXEL_IDS.length || typeof window === 'undefined') return
    if (!window.fbq) {
      const n = function (...args: unknown[]) {
        if (n.callMethod) n.callMethod(...args)
        else n.queue!.push(args)
      } as Fbq
      n.push = n
      n.loaded = true
      n.version = '2.0'
      n.queue = []
      window.fbq = n
      if (!window._fbq) window._fbq = n
      const s = document.createElement('script')
      s.async = true
      s.src = 'https://connect.facebook.net/en_US/fbevents.js'
      document.head.appendChild(s)
    }
    const ext = await visitorHash()
    // One init per dataset. After this every fbq('track') goes to all of them
    // with the same eventID, so each dataset dedupes against its server copy.
    for (const id of PIXEL_IDS) window.fbq('init', id, ext ? { external_id: ext } : {})
  })()
  return booted
}

function eventId() {
  try {
    return crypto.randomUUID()
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`
  }
}

export async function metaEvent(
  name: MetaEventName,
  custom: Record<string, unknown> = {},
  user: MetaUser = {}
) {
  if (typeof window === 'undefined' || !PIXEL_IDS.length) return
  if (navigator.webdriver) return // headless bots and our own screenshot runs
  await boot()
  const id = eventId()
  const ext = await visitorHash()

  try {
    window.fbq?.('track', name, custom, { eventID: id })
  } catch {}

  const body = JSON.stringify({
    event_name: name,
    event_id: id,
    url: location.href,
    custom,
    user,
    external_id: ext,
  })
  try {
    // keepalive lets it finish when the page is navigating away (the buy
    // pop-up sends people to TicketMelon straight after InitiateCheckout).
    fetch('/api/meta', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {})
  } catch {}
}

function readCookie(name: string): string {
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`))
  return m ? decodeURIComponent(m[1]) : ''
}

// Saved with every form (lib/submit.ts) so a ticket bought later on
// TicketMelon can be reported to Meta as this browser's Purchase
// (app/api/meta/purchase): the user agent Meta requires for a website event,
// Meta's own _fbp/_fbc cookies (the ad click), and the hashed visitor id the
// pixel already uses as external_id. Flat string keys: the capture endpoint
// stores every field as a string.
export async function metaContext(): Promise<Record<string, string>> {
  if (typeof window === 'undefined') return {}
  try {
    let fbc = readCookie('_fbc')
    if (!fbc) {
      const clid = new URLSearchParams(location.search).get('fbclid')
      if (clid) fbc = `fb.1.${Date.now()}.${clid}`
    }
    const out: Record<string, string> = { _ua: navigator.userAgent.slice(0, 500) }
    const fbp = readCookie('_fbp')
    if (fbp) out._fbp = fbp
    if (fbc) out._fbc = fbc.slice(0, 500)
    const ext = await visitorHash()
    if (ext) out._ext = ext
    return out
  } catch {
    return {}
  }
}

export function userFromFields(fields: Record<string, unknown>): MetaUser {
  const s = (k: string) => (typeof fields[k] === 'string' ? (fields[k] as string).trim() : '')
  return {
    email: s('email') || undefined,
    phone: s('whatsapp') || undefined,
    first_name: s('first_name') || undefined,
    last_name: s('last_name') || undefined,
    country: s('whatsapp_country') || undefined,
  }
}
