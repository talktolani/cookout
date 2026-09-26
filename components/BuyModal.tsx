'use client'
import { useEffect, useRef, useState } from 'react'
import { submitForm } from '@/lib/submit'
import { SALES } from '@/content/sales'
import { BUY_EVENT, LEAD_KEY, checkoutHref } from '@/lib/checkout'
import LiquidMetalButton from '@/components/LiquidMetalButton'
import PhoneField from '@/components/PhoneField'
import { BY_ISO } from '@/lib/countries'
import type { PhoneValue } from '@/lib/phone'

// Step 1 of 2 before TicketMelon: capture the lead, then send them to pay.
// Rules, on purpose:
// - Saves to the ticket-order form in AIOS; the crm_form_submissions trigger
//   turns it into a Cookout contact tagged ticket-order.
// - The sale beats the lead: if saving fails or takes over 4s, they still go
//   to checkout. Nobody gets stuck on our side of the payment.
// - Once someone has opted in this visit, Buy Tickets skips the pop-up.
// - WhatsApp consent is optional, never pre-ticked.
// - The number carries a country flag (PhoneField): it defaults to the
//   visitor's country and posts whatsapp as E.164 plus whatsapp_country (ISO).
export default function BuyModal() {
  const c = SALES.popup
  const [track, setTrack] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [wa, setWa] = useState(false)
  const [phone, setPhone] = useState<PhoneValue>({ e164: '', country: 'MY', valid: false })
  const first = useRef<HTMLInputElement>(null)
  const opener = useRef<Element | null>(null)

  useEffect(() => {
    const onBuy = (e: Event) => {
      const t = (e as CustomEvent<{ track: string }>).detail?.track ?? 'cta'
      let done = false
      try { done = sessionStorage.getItem(LEAD_KEY) === '1' } catch {}
      if (done) { window.location.href = checkoutHref(t); return }
      opener.current = document.activeElement
      setMsg(null); setBusy(false); setTrack(t)
    }
    window.addEventListener(BUY_EVENT, onBuy)
    return () => window.removeEventListener(BUY_EVENT, onBuy)
  }, [])

  // No scroll lock (25 Sep): the page behind stays scrollable with a trackpad
  // or mouse wheel while the pop-up is open.
  useEffect(() => {
    if (!track) return
    const t = setTimeout(() => first.current?.focus(), 60)
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => { clearTimeout(t); window.removeEventListener('keydown', onKey) }
  }, [track])

  function close() {
    setTrack(null)
    ;(opener.current as HTMLElement | null)?.focus?.()
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!track || busy) return
    const fd = new FormData(e.currentTarget)
    const name = String(fd.get('name') ?? '').trim().replace(/\s+/g, ' ')
    const email = String(fd.get('email') ?? '').trim()
    if (!name) { setMsg('Enter your name.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { setMsg('That email doesn\'t look right.'); return }
    if (!phone.e164) { setMsg('Add your WhatsApp number.'); return }
    if (!phone.valid) { setMsg(`That doesn't look like a full ${BY_ISO[phone.country]?.name ?? ''} number. Check the flag and the digits.`); return }
    setMsg(null); setBusy(true)
    // One Name field: first word is the first name, the rest the last name.
    const [firstName, ...rest] = name.split(' ')
    // One consent box covers email and WhatsApp: whatsapp_optin and
    // email_optin both follow it (the CRM tags whatsapp-optin / email-optin).
    const save = submitForm('ticket-order', {
      first_name: firstName, last_name: rest.join(' '), email,
      whatsapp: phone.e164, whatsapp_country: phone.country,
      email_optin: wa, cta: track, _hp: fd.get('_hp'),
    }, wa, false)
    const res = await Promise.race([save, new Promise<null>((r) => setTimeout(() => r(null), 4000))])
    if (res && res.status === 'ok') { try { sessionStorage.setItem(LEAD_KEY, '1') } catch {} }
    window.location.href = checkoutHref(track)
  }

  if (!track) return null
  return (
    <div className="bm-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) close() }}>
      <div className="bm-card" role="dialog" aria-modal="true" aria-labelledby="bm-title">
        <button type="button" className="bm-close" onClick={close} aria-label="Close">×</button>
        <p className="bm-step">{c.step}</p>
        <h3 id="bm-title" className="bm-title">{c.heading}</h3>
        <p className="bm-sub">{c.sub}</p>
        <form onSubmit={onSubmit} noValidate>
          <input className="sq-hp" type="text" name="_hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <label className="sr-only" htmlFor="bm_name">Name</label>
          <input ref={first} id="bm_name" name="name" type="text" autoComplete="name" placeholder="Name" />
          <label className="sr-only" htmlFor="bm_email">Email</label>
          <input id="bm_email" name="email" type="email" inputMode="email" autoComplete="email" placeholder="Email" />
          <label className="sr-only" htmlFor="bm_phone">WhatsApp Number</label>
          <PhoneField id="bm_phone" name="whatsapp" placeholder="WhatsApp Number" onChange={setPhone} />
          <div className="check">
            <input id="bm_consent" type="checkbox" checked={wa} onChange={(e) => setWa(e.target.checked)} />
            <label htmlFor="bm_consent">{c.consent}</label>
          </div>
          {msg && <p className="formmsg" role="status">{msg}</p>}
          <div className="bm-submit">
            <LiquidMetalButton type="submit" disabled={busy} track="popup-submit">{busy ? c.busy : c.submit}</LiquidMetalButton>
          </div>
          <p className="bm-micro">{c.micro}</p>
        </form>
      </div>
    </div>
  )
}
