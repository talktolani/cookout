import { SALES } from '@/content/sales'

const UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']

// TicketMelon link with attribution. The visitor's own UTM tags win (paid ads,
// Instagram bio link). With none, we tag it as the website and name the button
// they pressed, so TicketMelon's order export shows which CTA sold the ticket.
export function checkoutHref(track: string): string {
  const u = new URL(SALES.checkoutUrl)
  if (typeof window === 'undefined') return u.toString()
  const q = new URLSearchParams(window.location.search)
  let carried = false
  for (const k of UTM) {
    const v = q.get(k)
    if (v) { u.searchParams.set(k, v.slice(0, 120)); carried = true }
  }
  if (!carried) {
    u.searchParams.set('utm_source', 'website')
    u.searchParams.set('utm_medium', 'tickets_page')
    u.searchParams.set('utm_content', track)
  }
  return u.toString()
}

export const BUY_EVENT = 'cookout:buy'
export const LEAD_KEY = 'cookout_ticket_lead'

// Opens the opt-in pop-up (components/BuyModal.tsx listens for this).
export function openBuy(track: string) {
  window.dispatchEvent(new CustomEvent(BUY_EVENT, { detail: { track } }))
}
