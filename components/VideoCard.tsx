'use client'
import { useEffect, useRef, useState } from 'react'

// A card image that becomes a silent loop. The photo is always underneath and
// stays visible until the video is actually playing (iOS Low Power Mode and
// data savers refuse autoplay, see CLAUDE.md). The video only loads once the
// card is near the screen, and only plays while it's visible.
export default function VideoCard({ img, video, alt }: { img: string; video: string; alt: string }) {
  const box = useRef<HTMLDivElement>(null)
  const vid = useRef<HTMLVideoElement>(null)
  const [src, setSrc] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const el = box.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setSrc((s) => s ?? video)
        vid.current?.play().catch(() => {})
      } else {
        vid.current?.pause()
      }
    }, { rootMargin: '200px 0px', threshold: 0.2 })
    io.observe(el)
    return () => io.disconnect()
  }, [video])

  useEffect(() => { if (src) vid.current?.play().catch(() => {}) }, [src])

  return (
    <div className="sl-media" ref={box}>
      <img src={img} alt={alt} width={640} height={800} loading="lazy" />
      {src && (
        <video
          ref={vid}
          src={src}
          muted
          loop
          playsInline
          preload="none"
          disablePictureInPicture
          aria-hidden="true"
          onPlaying={() => setPlaying(true)}
          className={`sl-video${playing ? ' is-playing' : ''}`}
        />
      )}
    </div>
  )
}
