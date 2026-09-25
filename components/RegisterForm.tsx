'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { submitForm } from '@/lib/submit'
import { REGISTER } from '@/content/event'

export default function RegisterForm() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [wa, setWa] = useState(false)
  const [mk, setMk] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!wa) {
      setMsg('Tick the WhatsApp box so we can send you the address and set times.')
      return
    }
    setBusy(true)
    setMsg(null)

    const fd = new FormData(e.currentTarget)
    const res = await submitForm(
      'guest-list',
      {
        first_name: fd.get('first_name'),
        last_name: fd.get('last_name'),
        whatsapp: fd.get('whatsapp'),
        email: fd.get('email'),
        guests: fd.get('guests'),
        heard_from: fd.get('heard_from'),
        wants_tournament: fd.get('wants_tournament') === 'on',
      },
      wa,
      mk
    )

    setBusy(false)
    if (res.status === 'ok') router.push('/thanks')
    else if (res.status === 'not_connected')
      setMsg('Capture endpoint is not connected yet. Nothing was saved.')
    else setMsg(res.message)
  }

  return (
    <form className="formcard" onSubmit={onSubmit} noValidate>
      <div className="row2">
        <div className="field">
          <label htmlFor="first_name">First Name <span className="req">*</span></label>
          <input id="first_name" name="first_name" type="text" autoComplete="given-name" required />
        </div>
        <div className="field">
          <label htmlFor="last_name">Last Name</label>
          <input id="last_name" name="last_name" type="text" autoComplete="family-name" />
        </div>
      </div>

      <div className="field">
        <label htmlFor="whatsapp">WhatsApp Number <span className="req">*</span></label>
        <p className="help">This is how we send you the address and set times.</p>
        <input id="whatsapp" name="whatsapp" type="tel" placeholder="+60" autoComplete="tel" required />
      </div>

      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" />
      </div>

      <div className="field">
        <label htmlFor="guests">How Many Are You Bringing? <span className="req">*</span></label>
        <select id="guests" name="guests" defaultValue="Just me" required>
          {['Just me', '1', '2', '3', '4', '5 or more'].map((o) => <option key={o}>{o}</option>)}
        </select>
      </div>

      <div className="field">
        <label htmlFor="heard_from">How Did You Hear About This?</label>
        <select id="heard_from" name="heard_from" defaultValue="Instagram">
          {['Instagram', 'TikTok', 'A friend', 'A DJ', 'A vendor', 'Saw a poster', 'Other'].map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>

      <div className="check">
        <input id="wants_tournament" name="wants_tournament" type="checkbox" />
        <label htmlFor="wants_tournament">I want to play in the tournament</label>
      </div>

      {/*
        WhatsApp requires opt-in before a business may message someone.
        A list collected without it cannot be messaged later and there is no
        way to go back and ask. Never pre-tick, never bundle into terms.
        Marketing consent is a separate permission and a separate template
        category, so it gets its own box.
      */}
      <div className="optin">
        <div className="check">
          <input id="wa" type="checkbox" checked={wa} onChange={(e) => setWa(e.target.checked)} />
          <label htmlFor="wa">{REGISTER.whatsappOptIn} <span className="req">*</span></label>
        </div>
        <div className="check">
          <input id="mk" type="checkbox" checked={mk} onChange={(e) => setMk(e.target.checked)} />
          <label htmlFor="mk">{REGISTER.marketingOptIn}</label>
        </div>
      </div>

      <button className="btn wide" type="submit" disabled={busy} data-track="register-submit">
        {busy ? 'One moment' : REGISTER.cta}
      </button>
      <p className="micro">{REGISTER.micro}</p>
      {msg && <p className="formmsg" role="status">{msg}</p>}
    </form>
  )
}
