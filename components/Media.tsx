'use client'
import { CSSProperties, useEffect, useRef, useState } from 'react'
import { MEDIA } from '@/content/event'

type Props = {
  slot: string
  spec?: string
  brief?: string
  src?: string
  poster?: string
  ratio?: string
  ig?: boolean
  className?: string
  style?: CSSProperties
  fill?: boolean
}

export default function Media({
  slot, spec, brief, src, poster, ratio = '16/9', ig, className = '', style, fill,
}: Props) {
  const key = slot.split('\u00b7')[0].trim()
  const m = MEDIA[key]
  const url = src || m?.src || ''
  const mobile = m?.srcMobile
  const still = poster || m?.poster || undefined

  const wrapStyle: CSSProperties = fill
    ? { position: 'absolute', inset: 0, ...style }
    : { aspectRatio: ratio, ...style }

  const stillMobile = m?.posterMobile
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const isVideoSlot = /\.(mp4|webm|mov|m3u8)(\?|$)/i.test(url)
  useEffect(() => {
    if (!isVideoSlot) return
    const small = window.matchMedia('(max-width: 700px)').matches
    setVideoSrc(small && mobile ? mobile : url)
  }, [isVideoSlot, mobile, url])

  // Autoplay can be refused (iOS Low Power Mode). The video stays invisible
  // until it is actually playing, so the poster shows instead; a first tap
  // anywhere retries.
  useEffect(() => {
    const v = videoRef.current
    if (!v || !videoSrc) return
    let retry: (() => void) | null = null
    v.play().catch(() => {
      retry = () => { v.play().catch(() => {}) }
      document.addEventListener('touchstart', retry, { once: true, passive: true })
      document.addEventListener('click', retry, { once: true })
    })
    return () => {
      if (retry) {
        document.removeEventListener('touchstart', retry)
        document.removeEventListener('click', retry)
      }
    }
  }, [videoSrc])

  if (url) {
    const isVideo = isVideoSlot
    if (isVideo) {
      return (
        <div className={`media-real ${className}`} style={wrapStyle}>
          {(still || stillMobile) && (
            <picture>
              {stillMobile && <source media="(max-width: 700px)" srcSet={stillMobile} />}
              <img src={still || stillMobile} alt="" />
            </picture>
          )}
          {videoSrc && (
            <video
              ref={videoRef}
              key={videoSrc}
              src={videoSrc}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              disablePictureInPicture
              controls={false}
              aria-hidden="true"
              onPlaying={() => setPlaying(true)}
              className={`media-video-layer${playing ? ' is-playing' : ''}`}
            />
          )}
        </div>
      )
    }
    return (
      <div className={`media-real ${className}`} style={wrapStyle}>
        {mobile ? (
          <picture>
            <source media="(max-width: 700px)" srcSet={mobile} />
            <img src={url} alt="" loading="lazy" />
          </picture>
        ) : (
          <img src={url} alt="" loading="lazy" />
        )}
      </div>
    )
  }

  return (
    <div className={`media ${className}`} data-slot={slot} data-spec={spec ?? ''} style={wrapStyle}>
      {ig && <span className="igbadge">INSTAGRAM</span>}
      {brief && <div className="brief">{brief}</div>}
    </div>
  )
}
