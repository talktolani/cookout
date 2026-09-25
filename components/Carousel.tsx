'use client'
import { useRef } from 'react'
import Media from './Media'
import { CAROUSEL } from '@/content/event'

export default function Carousel() {
  const track = useRef<HTMLDivElement>(null)
  const nudge = (d: number) => track.current?.scrollBy({ left: d * 300, behavior: 'smooth' })

  return (
    <section className="band" style={{ overflow: 'hidden' }}>
      <div className="wrap">
        <div className="car-head">
          <div>
            <h2 style={{ marginBottom: 8 }}>{CAROUSEL.heading}</h2>
            <p style={{ marginBottom: 0 }}>{CAROUSEL.body}</p>
          </div>
          <div className="car-ctrl">
            <button onClick={() => nudge(-1)} aria-label="Previous clips" data-track="carousel-prev">&#8249;</button>
            <button onClick={() => nudge(1)} aria-label="Next clips" data-track="carousel-next">&#8250;</button>
          </div>
        </div>
        <div className="car-track" ref={track}>
          {CAROUSEL.items.map((i) => (
            <div className="car-item" key={i.slot}>
              <Media slot={i.slot} brief={i.label} ig={i.ig} ratio="4/5" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
