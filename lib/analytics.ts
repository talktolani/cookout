/**
 * Client tracker. Written to the payload contract the AIOS agent gave us,
 * not copied from lani-site's 700 line version. No session recording, no
 * rage click detection, no scroll depth machinery we do not use.
 */

const SITE_KEY = process.env.NEXT_PUBLIC_SITE_KEY ?? 'cookout'
const ENDPOINT = '/c'
const CHARSET = /[^A-Za-z0-9._-]/g
const MAX_BATCH = 200

type Ev = { k: string; p?: string; [key: string]: unknown }

let queue: Ev[] = []
let timer: ReturnType<typeof setTimeout> | null = null
let started = false

function id(len = 20) {
  const a = new Uint8Array(len)
  crypto.getRandomValues(a)
  return Array.from(a, (b) => (b % 36).toString(36)).join('').replace(CHARSET, '')
}

function stored(key: string, store: Storage, len?: number) {
  try {
    const existing = store.getItem(key)
    if (existing) return existing
    const fresh = id(len)
    store.setItem(key, fresh)
    return fresh
  } catch {
    return id(len)
  }
}

function utm() {
  const p = new URLSearchParams(location.search)
  const out: Record<string, string> = {}
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
    const v = p.get(k)
    if (v) out[k] = v.slice(0, 120)
  }
  return out
}

function flush() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  if (!queue.length) return

  const ev = queue.slice(0, MAX_BATCH)
  queue = queue.slice(MAX_BATCH)
  // Anything over the batch cap goes out on the next tick rather than being
  // silently dropped.
  if (queue.length && !timer) timer = setTimeout(flush, 300)

  const payload = {
    site: SITE_KEY, // required. sites_collect refuses a batch without it.
    v: stored('ck_v', localStorage),
    s: stored('ck_s', sessionStorage),
    ref: document.referrer || undefined,
    utm: utm(),
    vw: window.innerWidth,
    vh: window.innerHeight,
    lang: navigator.language,
    // One line, and the single most effective bot signal there is.
    // A headless browser that admits it gets filed as a scanner whatever
    // user agent it claims.
    ...(navigator.webdriver ? { wd: 1 } : {}),
    ev,
  }

  const body = JSON.stringify(payload)
  if (body.length > 64_000) return // body cap is 64KB

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }))
    } else {
      fetch(ENDPOINT, { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'application/json' } })
    }
  } catch {
    /* analytics never breaks the page */
  }
}

/**
 * Event kinds are a closed set: pv, pl, click, rage_click, scroll, form_start,
 * form_submit, cta, copy, error. Anything else is dropped by the collector.
 * Element identity nests under `el`, everything else under `meta`. A key at the
 * top level is ignored, so a click would store with every element column null.
 */
export function track(
  k: string,
  el?: Record<string, unknown>,
  meta?: Record<string, unknown>
) {
  const e: Ev = { k, p: location.pathname }
  if (el) e.el = el
  if (meta) e.meta = meta
  queue.push(e)
  if (!timer) timer = setTimeout(flush, 1200)
}

let maxScroll = 0
let pageStart = 0
let left = false

/**
 * pl is the only event carrying dur, eng, sc and ph, so it is the only source
 * of time on page, engaged time and scroll depth. Without it those tiles stay
 * blank forever.
 */
function pageLeave() {
  if (left) return
  left = true
  const dur = Math.round((Date.now() - pageStart) / 1000)
  queue.push({ k: 'pl', p: location.pathname, dur, eng: dur, sc: maxScroll, ph: pageHeight() })
  flush()
}

// Full scrollable height of the page in pixels (ph). The collector uses it to
// turn scroll depth into a real position, so it must be a number.
function pageHeight(): number {
  const d = document.documentElement
  return Math.round(Math.max(d?.scrollHeight ?? 0, document.body?.scrollHeight ?? 0))
}

export function startTracking() {
  if (started || typeof window === 'undefined') return
  started = true

  pageStart = Date.now()
  // pv carries the title (without it the Pages tab shows bare paths with no
  // names) and ph, the page HEIGHT in pixels. ph used to be document.title,
  // which the collector could not read as a number, so every batch was
  // rejected from 2026-09-24 to 2026-09-25.
  queue.push({ k: 'pv', p: location.pathname, title: document.title, ph: pageHeight() })
  if (!timer) timer = setTimeout(flush, 1200)

  document.addEventListener(
    'click',
    (e) => {
      const t = e.target as HTMLElement | null
      const el = t?.closest('[data-track]') as HTMLElement | null
      if (!el) return
      track('click', {
        tag: el.tagName.toLowerCase(),
        id: el.getAttribute('data-track') ?? undefined,
        sel: el.id || undefined,
        text: (el.textContent ?? '').trim().slice(0, 80),
        href: el.getAttribute('href') ?? undefined,
        role: el.getAttribute('role') ?? undefined,
      })
    },
    { capture: true }
  )

  window.addEventListener(
    'scroll',
    () => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      if (h > 0) maxScroll = Math.max(maxScroll, Math.round((window.scrollY / h) * 100))
    },
    { passive: true }
  )

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') pageLeave()
  })
  window.addEventListener('pagehide', pageLeave)
}
