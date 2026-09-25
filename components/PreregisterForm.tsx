'use client'
import { useEffect, useRef, useState } from 'react'
import { submitForm } from '@/lib/submit'
import { TICKETS } from '@/content/event'

/**
 * Multi-step squeeze form. One field per step.
 *
 * The point is perceived effort: 3 fields at once reads as work, 1 field reads
 * as nothing. Each answered step is also a small commitment, which makes the
 * next one easier to give.
 *
 * Answers are held in state rather than in the DOM, so going Back and forward
 * never loses what was already typed.
 *
 * The form element wraps every step, so Enter advances the step instead of
 * submitting early. That matters on mobile, where the keyboard's Go key is the
 * natural thing to press.
 */

const STEPS = [
  { key: 'first_name', label: 'First name', type: 'text', autoComplete: 'given-name', placeholder: 'First name' },
  { key: 'email', label: 'Email', type: 'email', autoComplete: 'email', placeholder: 'Email' },
  { key: 'whatsapp', label: 'WhatsApp Number', type: 'tel', autoComplete: 'tel', placeholder: 'WhatsApp Number' },
] as const

type Key = (typeof STEPS)[number]['key']

export default function PreregisterForm() {
  const [step, setStep] = useState(0)
  const [values, setValues] = useState<Record<Key, string>>({ first_name: '', email: '', whatsapp: '' })
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [wa, setWa] = useState(false)
  // Honeypot. A human never sees it, so anything in it means a bot. The
  // endpoint treats _hp as a trap: it answers 200 and writes nothing.
  const [hp, setHp] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const last = step === STEPS.length - 1
  const current = STEPS[step]

  // Focus the field on every step change so nobody has to tap twice.
  useEffect(() => { inputRef.current?.focus() }, [step])

  function validate(): string | null {
    const v = values[current.key].trim()
    if (!v) return `Enter your ${current.label.toLowerCase()}.`
    if (current.key === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'That email does not look right.'
    if (current.key === 'whatsapp' && v.replace(/\D/g, '').length < 8) return 'That number looks too short.'
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
    const res = await submitForm('preregister', { ...values, _hp: hp }, wa, false)
    setBusy(false)

    if (res.status === 'ok') setDone(true)
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

      {/* Visually hidden, not deleted. A placeholder alone is not a label:
          it vanishes the moment someone types, and screen readers treat it
          inconsistently. The progress dots carry the visible step cue. */}
      <label className="sq-label sr-only" htmlFor="sq_field">{current.label}</label>
      <input
        ref={inputRef}
        id="sq_field"
        key={current.key}
        type={current.type}
        inputMode={current.key === 'whatsapp' ? 'tel' : undefined}
        autoComplete={current.autoComplete}
        placeholder={current.placeholder}
        value={values[current.key]}
        onChange={(e) => setValues({ ...values, [current.key]: e.target.value })}
        aria-label={current.label}
      />

      {last && (
        <div className="check sq-check">
          <input id="sq_wa" type="checkbox" checked={wa} onChange={(e) => setWa(e.target.checked)} />
          <label htmlFor="sq_wa">
            Yes, The Cookout can message me on WhatsApp about this event: the Early Bird link,
            the address and the set times.
          </label>
        </div>
      )}

      <button className="btn wide" type="submit" disabled={busy} data-track={last ? 'preregister-submit' : `preregister-next-${step + 1}`}>
        {busy ? 'One moment' : last ? 'Get First Access' : 'Next'}
      </button>

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
