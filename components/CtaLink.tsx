'use client'
import { useEffect, useState } from 'react'
import { SALES } from '@/content/sales'
import { checkoutHref, openBuy } from '@/lib/checkout'
import LiquidMetalButton from '@/components/LiquidMetalButton'

// Every Buy Tickets button on /tickets. A click opens the opt-in pop-up
// (BuyModal), which then sends them to TicketMelon. The href is the real
// TicketMelon link, so it still works without JavaScript or when opened in a
// new tab. Rendered as the liquid-metal button.
export default function CtaLink({ children, track, size }: { children: React.ReactNode; track: string; size?: 'md' | 'sm' }) {
  const [href, setHref] = useState(SALES.checkoutUrl)
  useEffect(() => { setHref(checkoutHref(track)) }, [track])
  return (
    <LiquidMetalButton
      href={href}
      track={track}
      size={size}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return
        e.preventDefault()
        openBuy(track)
      }}
    >
      {children}
    </LiquidMetalButton>
  )
}
