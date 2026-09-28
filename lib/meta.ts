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

export const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '1092247383161339'

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
    if (!PIXEL_ID || typeof window === 'undefined') return
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
    window.fbq('init', PIXEL_ID, ext ? { external_id: ext } : {})
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
  if (typeof window === 'undefined' || !PIXEL_ID) return
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
