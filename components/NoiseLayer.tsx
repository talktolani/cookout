'use client'
import { useEffect, useRef } from 'react'

// Film-grain / TV-static overlay, adapted from a 21st.dev noisy-gradient
// component. Plain CSS + one canvas, no Tailwind. Cheaper than the original on
// purpose because it sits on a paid-ads page opened on phones:
// - drawn at CSS pixel size, not device pixels (grain doesn't need retina)
// - redraws every `every` frames (3 = about 20fps), not every frame
// - stops completely while the section is off screen
// - one still frame, no animation, for prefers-reduced-motion
export default function NoiseLayer({ alpha = 22, size = 110, every = 3 }: { alpha?: number; size?: number; every?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const tile = document.createElement('canvas')
    tile.width = tile.height = size
    const tctx = tile.getContext('2d')
    if (!tctx) return
    const img = tctx.createImageData(size, size)

    let raf = 0, frame = 0, visible = false
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const resize = () => {
      const r = canvas.parentElement?.getBoundingClientRect()
      canvas.width = Math.max(1, Math.round(r?.width ?? 0))
      canvas.height = Math.max(1, Math.round(r?.height ?? 0))
    }
    const draw = () => {
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v
        img.data[i + 3] = alpha
      }
      tctx.putImageData(img, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const p = ctx.createPattern(tile, 'repeat')
      if (p) { ctx.fillStyle = p; ctx.fillRect(0, 0, canvas.width, canvas.height) }
    }
    const loop = () => {
      if (!visible) { raf = 0; return }
      if (frame++ % every === 0) draw()
      raf = requestAnimationFrame(loop)
    }

    resize(); draw()
    const ro = new ResizeObserver(() => { resize(); draw() })
    if (canvas.parentElement) ro.observe(canvas.parentElement)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting && !still
      if (visible && !raf) raf = requestAnimationFrame(loop)
    })
    io.observe(canvas)
    return () => { io.disconnect(); ro.disconnect(); cancelAnimationFrame(raf) }
  }, [alpha, size, every])

  return <canvas ref={ref} className="sl-noise" aria-hidden="true" />
}
