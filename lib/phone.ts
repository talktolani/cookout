import { COUNTRIES, BY_ISO, type Country } from './countries'

export type PhoneValue = {
  /** E.164, e.g. +60123456789. Empty until something is typed. */
  e164: string
  /** ISO 3166 alpha-2 of the chosen flag, e.g. MY. */
  country: string
  /** National digits are within the country's valid lengths. */
  valid: boolean
}

/** Digits of what was typed, with the trunk prefix (the leading 0 in 012...) removed. */
export function nationalDigits(raw: string, c: Country): string {
  let d = raw.replace(/\D/g, '')
  // Strip the trunk prefix only when what is left is still a whole number.
  // Stops us eating a real leading digit on a short or partly typed number.
  if (c.trunk && d.startsWith(c.trunk) && d.length - c.trunk.length >= c.min) {
    d = d.slice(c.trunk.length)
  }
  return d
}

export function toValue(raw: string, c: Country): PhoneValue {
  const d = nationalDigits(raw, c)
  return {
    e164: d ? `+${c.dial}${d}` : '',
    country: c.iso,
    valid: d.length >= c.min && d.length <= c.max,
  }
}

/**
 * Someone typed or autofilled a full international number (+44 7700 900123).
 * Work out which country it belongs to so the flag can follow. Longest dial
 * code wins. Where several countries share a code (every +1 country, +44 for
 * the UK and Jersey), keep the one already chosen if it matches, otherwise take
 * the main one.
 */
export function matchInternational(raw: string, current: Country): { country: Country; rest: string } | null {
  const t = raw.trim()
  if (!t.startsWith('+') && !t.startsWith('00')) return null
  const d = t.replace(/\D/g, '').replace(/^00/, '')
  for (let len = 4; len >= 1; len--) {
    const code = d.slice(0, len)
    const hits = COUNTRIES.filter((c) => c.dial === code)
    if (!hits.length) continue
    const country =
      hits.find((c) => c.iso === current.iso) ?? hits.find((c) => c.main) ?? hits[0]
    return { country, rest: d.slice(len) }
  }
  return null
}

export function countryOr(iso: string | null | undefined, fallback: string): Country {
  return (iso && BY_ISO[iso.toUpperCase()]) || BY_ISO[fallback]
}
