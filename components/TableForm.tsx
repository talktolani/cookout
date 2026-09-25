'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { submitForm } from '@/lib/submit'
import { TABLES, REGISTER } from '@/content/event'

export default function TableForm() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [wa, setWa] = useState(false)
  const [mk, setMk] = useState(false)
  const [terms, setTerms] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!wa) { setMsg('Tick the WhatsApp box so we can send you the address and set times.'); return }
    if (!terms) { setMsg('Please agree to the booking terms.'); return }
    setBusy(true); setMsg(null)

    const fd = new FormData(e.currentTarget)
    const res = await submitForm('table-booking', {
      package: fd.get('package'),
      name: fd.get('name'),
      whatsapp: fd.get('whatsapp'),
      email: fd.get('email'),
      party_size: fd.get('party_size'),
      door_list: fd.get('door_list'),
      notes: fd.get('notes'),
    }, wa, mk)

    setBusy(false)
    if (res.status === 'ok') router.push('/thanks?booked=1')
    else if (res.status === 'not_connected') setMsg('Checkout is not connected yet. Nothing was charged or saved.')
    else setMsg(res.message)
  }

  return (
    <form className="formcard" onSubmit={onSubmit} noValidate>
      <div className="field">
        <label htmlFor="package">Package <span className="req">*</span></label>
        <select id="package" name="package" required>
          {TABLES.tiers.map((t) => (
            <option key={t.slot}>{`${t.name} — ${t.price}, seats ${t.seats}`}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="name">Your Name <span className="req">*</span></label>
        <p className="help">This is the name we put on the door list.</p>
        <input id="name" name="name" type="text" required />
      </div>

      <div className="row2">
        <div className="field">
          <label htmlFor="whatsapp">WhatsApp Number <span className="req">*</span></label>
          <input id="whatsapp" name="whatsapp" type="tel" placeholder="+60" required />
        </div>
        <div className="field">
          <label htmlFor="email">Email <span className="req">*</span></label>
          <input id="email" name="email" type="email" required />
        </div>
      </div>

      <div className="field">
        <label htmlFor="party_size">How Many In Your Party? <span className="req">*</span></label>
        <input id="party_size" name="party_size" type="number" min={1} required />
      </div>

      <div className="field">
        <label htmlFor="door_list">Names For The Door List</label>
        <p className="help">Optional, and it speeds up entry on the night.</p>
        <textarea id="door_list" name="door_list" />
      </div>

      <div className="field">
        <label htmlFor="notes">Anything We Should Know?</label>
        <textarea id="notes" name="notes" />
      </div>

      <div className="optin">
        <div className="check">
          <input id="twa" type="checkbox" checked={wa} onChange={(e) => setWa(e.target.checked)} />
          <label htmlFor="twa">Yes, The Cookout can message me on WhatsApp about this booking: the address, where to park, and set times. <span className="req">*</span></label>
        </div>
        <div className="check">
          <input id="tmk" type="checkbox" checked={mk} onChange={(e) => setMk(e.target.checked)} />
          <label htmlFor="tmk">{REGISTER.marketingOptIn}</label>
        </div>
      </div>

      <div className="check">
        <input id="terms" type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
        <label htmlFor="terms">I agree to the booking terms. <span className="req">*</span></label>
      </div>

      {/*
        Payment is deliberately not built here. Stripe Connect is not started
        on this client and card fields belong to the payment provider, never
        to us. The provider's hosted step slots in above this button.
      */}
      <button className="btn wide" type="submit" disabled={busy} data-track="table-submit">
        {busy ? 'One moment' : TABLES.form.cta}
      </button>
      <p className="micro">{TABLES.form.micro}</p>
      {msg && <p className="formmsg" role="status">{msg}</p>}
    </form>
  )
}
