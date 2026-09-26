'use client'
import { useEffect, useRef, useState } from 'react'

// Liquid-metal button, adapted from a 21st.dev component (25 Sep).
// A live chrome ring (Paper shaders, WebGL) around a lime pill. Differences
// from the snippet, all on purpose:
// - plain CSS classes (in app/tickets/sales.css), no Tailwind, no lucide
// - sized by its label, not a fixed 142x46 box
// - renders a real <a> for links so buttons stay crawlable and middle-clickable
// - the snippet targeted an older @paper-design/shaders; 0.0.81 is pinned and
//   every uniform is passed explicitly (unset colours rendered the metal black)
// - static CSS chrome ring shows until WebGL starts, and stays if it can't
// - shader stops for prefers-reduced-motion; the library already pauses it off screen
type Props = {
  children: React.ReactNode
  href?: string
  onClick?: (e: React.MouseEvent<HTMLElement>) => void
  type?: 'button' | 'submit'
  disabled?: boolean
  track?: string
  size?: 'md' | 'sm'
}

export default function LiquidMetalButton({ children, href, onClick, type = 'button', disabled, track, size = 'md' }: Props) {
  const ring = useRef<HTMLSpanElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mount = useRef<any>(null)
  const still = useRef(false)
  const [gl, setGl] = useState(false)
  const [pressed, setPressed] = useState(false)
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([])
  const rid = useRef(0)

  useEffect(() => {
    let cancelled = false
    still.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    import('@paper-design/shaders')
      .then(async (S) => {
        const blank = new Image()
        blank.src = S.emptyPixel
        await blank.decode().catch(() => {})
        if (cancelled || !ring.current) return
        try {
          mount.current = new S.ShaderMount(
            ring.current,
            S.liquidMetalFragmentShader,
            {
              u_colorBack: [0, 0, 0, 0],
              u_colorTint: [1, 1, 1, 1],
              u_image: blank,
              u_isImage: false,
              u_repetition: 4,
              u_softness: 0.5,
              u_shiftRed: 0.3,
              u_shiftBlue: 0.3,
              u_distortion: 0,
              u_contour: 0,
              u_angle: 45,
              u_shape: S.LiquidMetalShapes.none,
              u_fit: S.ShaderFitOptions.cover,
              u_scale: 1,
              u_rotation: 0,
              u_originX: 0.5,
              u_originY: 0.5,
              u_offsetX: 0,
              u_offsetY: 0,
              u_worldWidth: 0,
              u_worldHeight: 0,
            },
            undefined,
            still.current ? 0 : 0.6,
          )
          setGl(true)
        } catch {
          // No WebGL: the static chrome ring stays.
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
      mount.current?.dispose?.()
      mount.current = null
    }
  }, [])

  const speed = (s: number) => { if (!still.current) mount.current?.setSpeed?.(s) }

  function down(e: React.PointerEvent<HTMLElement>) {
    setPressed(true)
    speed(2.4)
    const r = e.currentTarget.getBoundingClientRect()
    const id = rid.current++
    setRipples((p) => [...p, { x: e.clientX - r.left, y: e.clientY - r.top, id }])
    setTimeout(() => setRipples((p) => p.filter((x) => x.id !== id)), 600)
  }
  const up = () => { setPressed(false); speed(1) }
  const leave = () => { setPressed(false); speed(0.6) }

  const cls = `lm-btn lm-${size}${gl ? ' lm-gl' : ''}${pressed ? ' is-pressed' : ''}`
  const inner = (
    <>
      <span className="lm-ring" ref={ring} aria-hidden="true" />
      <span className="lm-fill" aria-hidden="true" />
      <span className="lm-label">{children}</span>
      {ripples.map((r) => <span key={r.id} className="lm-ripple" style={{ left: r.x, top: r.y }} aria-hidden="true" />)}
    </>
  )
  const handlers = { onPointerDown: down, onPointerUp: up, onPointerLeave: leave, onPointerEnter: () => speed(1) }

  if (href) return <a className={cls} href={href} data-track={track} onClick={onClick} {...handlers}>{inner}</a>
  return <button className={cls} type={type} disabled={disabled} data-track={track} onClick={onClick} {...handlers}>{inner}</button>
}
