'use client'
import { useEffect, useState } from 'react'
import CtaLink from '@/components/CtaLink'
import { TICKETS } from '@/content/event'

// Phone-only bar that appears once the hero has scrolled away, so the buy
// button is always one tap from wherever someone is reading.
export default function StickyCta() {
  const [heroOut, setHeroOut] = useState(false)
  // Hidden while the tournament section is on screen, so it never covers the
  // Register Your Team form's button or its messages.
  const [teamIn, setTeamIn] = useState(false)
  useEffect(() => {
    const hero = document.querySelector('.sl-hero')
    const team = document.querySelector('#team')
    const ios: IntersectionObserver[] = []
    if (hero) {
      const io = new IntersectionObserver(([e]) => setHeroOut(!e.isIntersecting), { threshold: 0 })
      io.observe(hero); ios.push(io)
    }
    if (team) {
      const io = new IntersectionObserver(([e]) => setTeamIn(e.isIntersecting), { threshold: 0 })
      io.observe(team); ios.push(io)
    }
    return () => ios.forEach((io) => io.disconnect())
  }, [])
  const show = heroOut && !teamIn
  return (
    <div className={`sl-sticky${show ? ' on' : ''}`} aria-hidden={!show}>
      <div className="sl-sticky-price"><strong>{TICKETS.earlyBird.price}</strong> Early Bird</div>
      <CtaLink track="sticky-cta" size="sm">Buy Tickets</CtaLink>
    </div>
  )
}
