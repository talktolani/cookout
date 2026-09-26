'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { COUNTRIES, PINNED, DEFAULT_COUNTRY, type Country } from '@/lib/countries'
import { toValue, matchInternational, countryOr, type PhoneValue } from '@/lib/phone'

/**
 * Phone number with a country flag picker.
 *
 * The flag starts on the visitor's country (Vercel's IP country, via /geo),
 * falls back to Malaysia, and never moves once the person has picked a flag or
 * started typing. Typing or autofilling a full +number moves the flag to match.
 *
 * Posts 2 hidden fields with the form: `name` as E.164 (+60123456789) and
 * `name_country` as the ISO code (MY), so the capture row says which country
 * the opt-in came from without anyone parsing the number.
 */
export default function PhoneField({
  id,
  name,
  required,
  placeholder,
  onChange,
}: {
  id: string
  name: string
  required?: boolean
  /** Shown instead of the national example when the field has no visible label. */
  placeholder?: string
  onChange?: (v: PhoneValue) => void
}) {
  const [country, setCountry] = useState<Country>(() => countryOr(DEFAULT_COUNTRY, DEFAULT_COUNTRY))
  const [raw, setRaw] = useState('')
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const touched = useRef(false)
  const wrap = useRef<HTMLDivElement>(null)
  const btn = useRef<HTMLButtonElement>(null)
  const search = useRef<HTMLInputElement>(null)
  const list = useRef<HTMLUListElement>(null)

  const value = toValue(raw, country)

  useEffect(() => { onChange?.(value) }, [value.e164, value.country, value.valid]) // eslint-disable-line react-hooks/exhaustive-deps

  // Default the flag to where the visitor is. Ignored if they already chose.
  useEffect(() => {
    let dead = false
    fetch('/geo', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { country?: string | null } | null) => {
        if (dead || touched.current || !j?.country) return
        setCountry(countryOr(j.country, DEFAULT_COUNTRY))
      })
      .catch(() => {})
    return () => { dead = true }
  }, [])

  const items = useMemo(() => {
    const s = q.trim().toLowerCase().replace(/^\+/, '')
    if (!s) {
      const pinned = PINNED.map((iso) => COUNTRIES.find((c) => c.iso === iso)!).filter(Boolean)
      return { pinned, rest: COUNTRIES.filter((c) => !PINNED.includes(c.iso)) }
    }
    const digits = /^\d+$/.test(s)
    const hit = COUNTRIES.filter((c) =>
      digits ? c.dial.startsWith(s) : c.name.toLowerCase().includes(s) || c.iso.toLowerCase() === s
    )
    // Names that start with the search come first: "in" finds India before Argentina.
    hit.sort((a, b) => Number(!a.name.toLowerCase().startsWith(s)) - Number(!b.name.toLowerCase().startsWith(s)))
    return { pinned: [] as Country[], rest: hit }
  }, [q])
  const flat = useMemo(() => [...items.pinned, ...items.rest], [items])

  // Close on a click anywhere else.
  useEffect(() => {
    if (!open) return
    const off = (e: PointerEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('pointerdown', off)
    return () => document.removeEventListener('pointerdown', off)
  }, [open])

  useEffect(() => {
    if (!open) return
    setQ('')
    setActive(Math.max(0, flat.findIndex((c) => c.iso === country.iso)))
    requestAnimationFrame(() => search.current?.focus({ preventScroll: true }))
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (open) setActive(0) }, [q]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  function pick(c: Country) {
    touched.current = true
    setCountry(c)
    setOpen(false)
    requestAnimationFrame(() => document.getElementById(id)?.focus())
  }

  function onType(v: string) {
    touched.current = true
    const m = matchInternational(v, country)
    if (m) { setCountry(m.country); setRaw(m.rest); return }
    setRaw(v)
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, flat.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); if (flat[active]) pick(flat[active]) }
    else if (e.key === 'Escape') { e.preventDefault(); setOpen(false); btn.current?.focus() }
    else if (e.key === 'Tab') setOpen(false)
  }

  const row = (c: Country, i: number) => (
    <li
      key={c.iso}
      data-i={i}
      role="option"
      aria-selected={c.iso === country.iso}
      className={`phone-opt${i === active ? ' on' : ''}`}
      onPointerMove={() => setActive(i)}
      onClick={() => pick(c)}
    >
      <img src={`/flags/${c.iso.toLowerCase()}.png`} width={24} height={18} alt="" loading="lazy" />
      <span className="phone-name">{c.name}</span>
      <span className="phone-dial">+{c.dial}</span>
    </li>
  )

  return (
    <div className="phone" ref={wrap}>
      <div className="phone-row">
        <button
          ref={btn}
          type="button"
          className="phone-cc"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`Country code: ${country.name} +${country.dial}. Change country`}
          onClick={() => setOpen((o) => !o)}
          data-track="phone-country"
        >
          <img src={`/flags/${country.iso.toLowerCase()}.png`} width={24} height={18} alt="" />
          <span>+{country.dial}</span>
          <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
        </button>
        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder={placeholder ?? (country.iso === 'MY' ? '12 345 6789' : 'Phone number')}
          value={raw}
          onChange={(e) => onType(e.target.value)}
          required={required}
          aria-describedby={`${id}_cc`}
        />
        <span id={`${id}_cc`} hidden>{`${country.name}, +${country.dial}`}</span>
      </div>

      <input type="hidden" name={name} value={value.e164} />
      <input type="hidden" name={`${name}_country`} value={country.iso} />

      {open && (
        <div className="phone-pop">
          <input
            ref={search}
            className="phone-search"
            type="text"
            enterKeyHint="search"
            placeholder="Search country or code"
            aria-label="Search country or code"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKey}
            autoComplete="off"
          />
          <ul ref={list} role="listbox" aria-label="Country">
            {items.pinned.map((c, i) => row(c, i))}
            {items.pinned.length > 0 && <li className="phone-sep" role="presentation" />}
            {items.rest.map((c, i) => row(c, i + items.pinned.length))}
            {flat.length === 0 && <li className="phone-none">No match</li>}
          </ul>
        </div>
      )}
    </div>
  )
}
