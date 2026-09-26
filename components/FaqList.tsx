'use client'
import { useState } from 'react'

// FAQ with an animated open/close. Uses the grid-rows 0fr -> 1fr technique
// (Chrome 107+, Safari 16+), so it animates to the answer's real height with
// no measuring. Each question opens on its own. Reduced motion: instant.
export default function FaqList({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<Record<number, boolean>>({})
  return (
    <div className="sl-faqs">
      {items.map((f, i) => {
        const o = !!open[i]
        return (
          <div className={`sl-faq${o ? ' open' : ''}`} key={f.q}>
            <h3 className="sl-faq-q">
              <button type="button" id={`faq-q-${i}`} aria-expanded={o} aria-controls={`faq-a-${i}`}
                onClick={() => setOpen((p) => ({ ...p, [i]: !p[i] }))}>
                <span>{f.q}</span>
                <span className="sl-faq-icon" aria-hidden="true" />
              </button>
            </h3>
            <div className="sl-faq-panel" id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} aria-hidden={!o}>
              <div className="sl-faq-inner"><p>{f.a}</p></div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
