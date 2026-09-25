'use client'
import { useEffect } from 'react'

/**
 * Keeps the squeeze page fitted to the space the keyboard leaves behind.
 *
 * The problem: the page is one viewport tall with its content vertically
 * centred. When the keyboard opens, iOS shrinks the *visual* viewport but
 * leaves the *layout* viewport at full height, then scrolls the focused input
 * toward the middle of what is left. The result is the page shoved upward with
 * a dead band of background below it.
 *
 * `interactive-widget=resizes-content` in the viewport meta fixes this on
 * Chrome, but Safari does not honour it, and Safari is most of this traffic.
 *
 * So we measure instead. visualViewport.height is the only number that knows
 * the keyboard exists. We publish it as --vvh and mark the html element while
 * the keyboard is up, which lets the CSS shrink the container to the visible
 * area. With nothing taller than the viewport there is nothing to scroll, so
 * the browser has no reason to push the page anywhere.
 */
export default function ViewportFit() {
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    const root = document.documentElement

    const apply = () => {
      root.style.setProperty('--vvh', `${vv.height}px`)
      // A keyboard typically eats 25% or more of the screen. Anything smaller
      // is an address bar collapsing, which we deliberately ignore.
      const keyboardUp = vv.height < window.innerHeight * 0.75
      root.classList.toggle('kb-open', keyboardUp)
    }

    apply()
    vv.addEventListener('resize', apply)
    vv.addEventListener('scroll', apply)
    return () => {
      vv.removeEventListener('resize', apply)
      vv.removeEventListener('scroll', apply)
      root.classList.remove('kb-open')
      root.style.removeProperty('--vvh')
    }
  }, [])

  return null
}
