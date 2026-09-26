'use client'
import { useState } from 'react'
import { submitForm } from '@/lib/submit'
import { SALES } from '@/content/sales'
import LiquidMetalButton from '@/components/LiquidMetalButton'

// Register Your Team: opens a short form under the tournament copy and saves
// to the tournament-entry form in AIOS (crm_forms row checked active 25 Sep).
export default function TeamForm() {
  const t = SALES.tournament
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [wa, setWa] = useState(false)
  const [solo, setSolo] = useState(false)

  if (done) {
    return (
      <div className="sl-team-done" role="status">
        <strong>You&apos;re on the bracket list, {done}.</strong>
        <p>{t.form.done}</p>
      </div>
    )
  }

  if (!open) {
    return (
      <LiquidMetalButton onClick={() => setOpen(true)} track="team-open">
        {t.cta}
      </LiquidMetalButton>
    )
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const name = String(fd.get('first_name') ?? '').trim()
    const phone = String(fd.get('whatsapp') ?? '').trim()
    const partner = String(fd.get('partner_name') ?? '').trim()
    if (!name) { setMsg('Enter your first name.'); return }
    if (phone.replace(/\D/g, '').length < 8) { setMsg('That WhatsApp number looks too short.'); return }
    if (!solo && !partner) { setMsg("Add your partner's name, or tick that you need one."); return }
    if (!wa) { setMsg('Tick the box so we can confirm your pair on WhatsApp.'); return }
    setMsg(null); setBusy(true)
    const res = await submitForm('tournament-entry', {
      first_name: name,
      whatsapp: phone,
      partner_name: solo ? '' : partner,
      needs_partner: solo,
      sport: fd.get('sport'),
      _hp: fd.get('_hp'),
    }, wa, false)
    setBusy(false)
    if (res.status === 'ok') setDone(name.split(/\s+/)[0])
    else if (res.status === 'not_connected') setMsg('Not connected yet. Nothing was saved.')
    else setMsg(res.message)
  }

  return (
    <form className="sl-team" onSubmit={onSubmit} noValidate>
      <input className="sq-hp" type="text" name="_hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <div className="sl-team-row">
        <label className="sr-only" htmlFor="tm_name">Your first name</label>
        <input id="tm_name" name="first_name" type="text" autoComplete="given-name" placeholder="Your first name" />
        <label className="sr-only" htmlFor="tm_wa">WhatsApp number</label>
        <input id="tm_wa" name="whatsapp" type="tel" inputMode="tel" autoComplete="tel" placeholder="WhatsApp number" />
      </div>
      <div className="sl-team-row">
        <label className="sr-only" htmlFor="tm_partner">Partner's first name</label>
        <input id="tm_partner" name="partner_name" type="text" placeholder="Partner's first name" disabled={solo} />
        <label className="sr-only" htmlFor="tm_sport">Game</label>
        <select id="tm_sport" name="sport" defaultValue={t.form.sports[0]}>
          {t.form.sports.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="check">
        <input id="tm_solo" type="checkbox" checked={solo} onChange={(e) => setSolo(e.target.checked)} />
        <label htmlFor="tm_solo">I need a partner, match me on the day</label>
      </div>
      <div className="check">
        <input id="tm_consent" type="checkbox" checked={wa} onChange={(e) => setWa(e.target.checked)} />
        <label htmlFor="tm_consent">{t.form.consent}</label>
      </div>
      <div className="sl-team-submit">
        <LiquidMetalButton type="submit" disabled={busy} track="team-submit">
          {busy ? 'One moment' : t.form.submit}
        </LiquidMetalButton>
      </div>
      {msg && <p className="formmsg" role="status">{msg}</p>}
    </form>
  )
}
