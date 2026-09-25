'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { submitForm } from '@/lib/submit'
import { TICKETS, REGISTER } from '@/content/event'

/**
 * Paid ticket purchase. Checkout is in-house, so this collects the order and
 * the consents, then hands off to the payment provider.
 *
 * The payment step is deliberately not built here: card fields belong to the
 * provider, never to us. When the provider is chosen, the hosted step slots in
 * where marked below and this form posts the order first so the WhatsApp
 * opt-in is captured even if payment is abandoned.
 */
export default function TicketCheckout() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [wa, setWa] = useState(false)
  const [mk, setMk] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!wa) { setMsg('Tick the WhatsApp box so we can send you your ticket and the address.'); return }
    setBusy(true); setMsg(null)

    const fd = new FormData(e.currentTarget)
    const res = await submitForm('ticket-order', {
      tier: fd.get('tier'),
      quantity: fd.get('quantity'),
      first_name: fd.get('first_name'),
      last_name: fd.get('last_name'),
      whatsapp: fd.get('whatsapp'),
      email: fd.get('email'),
      wants_tournament: fd.get('wants_tournament') === 'on',
    }, wa, mk)

    setBusy(false)
    if (res.status === 'ok') router.push('/thanks?ticket=1')
    else if (res.status === 'not_connected') setMsg('Checkout is not connected yet. Nothing was charged.')
    else setMsg(res.message)
  }

  return (
    <form className="formcard" onSubmit={onSubmit} noValidate>
      <div className="row2">
        <div className="field">
          <label htmlFor="tier">Ticket <span className="req">*</span></label>
          <select id="tier" name="tier" required defaultValue={TICKETS.earlyBird.name}>
            <option>{`${TICKETS.earlyBird.name} — ${TICKETS.earlyBird.price}`}</option>
            <option>{`${TICKETS.ga.name} — ${TICKETS.ga.price}`}</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="quantity">How Many? <span className="req">*</span></label>
          <select id="quantity" name="quantity" required defaultValue="1">
            {['1', '2', '3', '4', '5', '6'].map((n) => <option key={n}>{n}</option>)}
          </select>
        </div>
      </div>

      <div className="row2">
        <div className="field">
          <label htmlFor="t_first">First Name <span className="req">*</span></label>
          <input id="t_first" name="first_name" type="text" autoComplete="given-name" required />
        </div>
        <div className="field">
          <label htmlFor="t_last">Last Name</label>
          <input id="t_last" name="last_name" type="text" autoComplete="family-name" />
        </div>
      </div>

      <div className="field">
        <label htmlFor="t_wa">WhatsApp Number <span className="req">*</span></label>
        <p className="help">This is how we send your ticket, the address and the set times.</p>
        <input id="t_wa" name="whatsapp" type="tel" placeholder="+60" autoComplete="tel" required />
      </div>

      <div className="field">
        <label htmlFor="t_email">Email <span className="req">*</span></label>
        <p className="help">For your receipt.</p>
        <input id="t_email" name="email" type="email" autoComplete="email" required />
      </div>

      <div className="check">
        <input id="t_tour" name="wants_tournament" type="checkbox" />
        <label htmlFor="t_tour">Put me in the tournament bracket</label>
      </div>

      <div className="optin">
        <div className="check">
          <input id="t_optin" type="checkbox" checked={wa} onChange={(e) => setWa(e.target.checked)} />
          <label htmlFor="t_optin">{REGISTER.whatsappOptIn} <span className="req">*</span></label>
        </div>
        <div className="check">
          <input id="t_mk" type="checkbox" checked={mk} onChange={(e) => setMk(e.target.checked)} />
          <label htmlFor="t_mk">{REGISTER.marketingOptIn}</label>
        </div>
      </div>

      {/* PAYMENT PROVIDER HOSTED STEP SLOTS IN HERE. Do not build card fields. */}

      <button className="btn wide" type="submit" disabled={busy} data-track="ticket-submit">
        {busy ? 'One moment' : 'Get Your Ticket'}
      </button>
      <p className="micro">First drink included. Same night on every tier.</p>
      {msg && <p className="formmsg" role="status">{msg}</p>}
    </form>
  )
}
