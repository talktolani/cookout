'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { submitForm } from '@/lib/submit'
import { TICKETS } from '@/content/event'
import PhoneField from '@/components/PhoneField'
import { BY_ISO } from '@/lib/countries'
import type { PhoneValue } from '@/lib/phone'

const STEPS = [
  { key: 'first_name', label: 'First name', type: 'text', autoComplete: 'given-name', placeholder: 'First name' },
  { key: 'email', label: 'Email', type: 'email', autoComplete: 'email', placeholder: 'Email' },
  { key: 'whatsapp', label: 'WhatsApp Number', type: 'tel', autoComplete: 'tel', placeholder: 'WhatsApp Number' },
] as const

type Key = (typeof STEPS)[number]['key']

export default function PreregisterForm() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [values, setValues] = useState<Record<Key, string>>({ first_name: '', email: '', whatsapp: '' })
  // The WhatsApp step uses the flag picker; null until it has been on screen once.
  const [phone, setPhone] = useState<PhoneValue | null>(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [wa, setWa] = useState(false)
  const [hp, setHp] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const last = step === STEPS.length - 1
  const current = STEPS[step]

  useEffect(() => {
    // The phone step renders PhoneField, whose number box also has id sq_field.
    ;(inputRef.current ?? document.getElementById('sq_field'))?.focus()
  }, [step])

  function validate(): string | null {
    if (current.key === 'whatsapp') {
      if (!phone?.e164) return 'Enter your WhatsApp number.'
      if (!phone.valid) return `That doesn't look like a full ${BY_ISO[phone.country]?.name ?? ''} number. Check the flag and the digits.`
      return null
    }
    const v = values[current.key].trim()
    if (!v) return `Enter your ${current.label.toLowerCase()}.`
    if (current.key === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "That email doesn't look right."
    return null
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const err = validate()
    if (err) { setMsg(err); return }
    setMsg(null)

    if (!last) { setStep(step + 1); return }

    if (!wa) { setMsg('Tick the box so we can send you the Early Bird link.'); return }

    setBusy(true)
    const res = await submitForm(
      'preregister',
      { ...values, whatsapp: phone?.e164 ?? '', whatsapp_country: phone?.country ?? '', _hp: hp },
      wa,
      false
    )
    setBusy(false)

    if (res.status === 'ok') {
      // First name rides to /thanks in sessionStorage, never in the URL.
      try { sessionStorage.setItem('cookout_first_name', values.first_name.trim()) } catch {}
      setDone(true)
      router.push('/thanks')
    }
    else if (res.status === 'not_connected') setMsg('Not connected yet. Nothing was saved.')
    else setMsg(res.message)
  }

  if (done) {
    return (
      <div className="sq-done">
        <h2>You&apos;re on the list.</h2>
        <p>
          We&apos;ll message you on WhatsApp the moment Early Bird opens. {TICKETS.earlyBird.price},
          through {TICKETS.earlyBird.closes}.
        </p>
      </div>
    )
  }

  return (
    <form className="sq-form" onSubmit={onSubmit} noValidate>
      <div className="sq-steps" aria-hidden="true">
        {STEPS.map((s, i) => (
          <span key={s.key} className={`sq-dot ${i <= step ? 'on' : ''}`} />
        ))}
      </div>

      <input
        className="sq-hp"
        type="text"
        name="_hp"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={hp}
        onChange={(e) => setHp(e.target.value)}
      />

      <label className="sq-label sr-only" htmlFor="sq_field">{current.label}</label>

      {last && (
        <div className="check sq-check">
          <input id="sq_wa" type="checkbox" checked={wa} onChange={(e) => setWa(e.target.checked)} />
          <label htmlFor="sq_wa">
            Yes, The Cookout can message me on WhatsApp about this event: the Early Bird link,
            the address and the set times.
          </label>
        </div>
      )}

      <div className={`sq-row${current.key === 'whatsapp' ? ' sq-row-phone' : ''}`}>
        {current.key === 'whatsapp' ? (
          <PhoneField
            id="sq_field"
            name="whatsapp"
            placeholder={current.placeholder}
            initial={phone}
            onChange={setPhone}
          />
        ) : (
          <input
            ref={inputRef}
            id="sq_field"
            key={current.key}
            type={current.type}
            autoComplete={current.autoComplete}
            placeholder={current.placeholder}
            value={values[current.key]}
            onChange={(e) => setValues({ ...values, [current.key]: e.target.value })}
            aria-label={current.label}
          />
        )}
        <button className="btn sq-btn" type="submit" disabled={busy} data-track={last ? 'preregister-submit' : `preregister-next-${step + 1}`}>
          {busy ? 'One moment' : last ? 'Get First Access' : 'Next'}
        </button>
      </div>

      {step > 0 && (
        <button
          type="button"
          className="sq-back"
          onClick={() => { setMsg(null); setStep(step - 1) }}
          data-track="preregister-back"
        >
          Back
        </button>
      )}

      <ul className="sq-benefits">
        <li>Free to join</li>
        <li>Free tournament entry</li>
        <li>First drink included</li>
      </ul>
      {msg && <p className="formmsg" role="status">{msg}</p>}
    </form>
  )
}
