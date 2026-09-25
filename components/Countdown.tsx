'use client'
import { useEffect, useState } from 'react'

/**
 * Live countdown to the Early Bird close.
 *
 * Urgency only works when it is true. This reads a real deadline rather than
 * a rolling fake timer that resets per visitor, which is the version that
 * destroys trust the moment somebody reloads the page.
 *
 * Renders nothing until mounted, and nothing once the deadline passes, so a
 * finished countdown never sits on the page saying 0.
 */
export default function Countdown({ iso, label }: { iso: string; label: string }) {
  const [left, setLeft] = useState<number | null>(null)

  useEffect(() => {
    const target = new Date(iso).getTime()
    const tick = () => setLeft(target - Date.now())
    tick()
    const t = setInterval(tick, 60_000)
    return () => clearInterval(t)
  }, [iso])

  if (left === null || left <= 0) return null

  const d = Math.floor(left / 86_400_000)
  const h = Math.floor((left % 86_400_000) / 3_600_000)

  return (
    <p className="sq-count">
      <span className="sq-count-num">{d}</span> {d === 1 ? 'day' : 'days'}{' '}
      <span className="sq-count-num">{h}</span> {h === 1 ? 'hour' : 'hours'} {label}
    </p>
  )
}
