'use client'
import { CSSProperties, useEffect, useState } from 'react'
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

/**
 * One component for every media slot.
 *
 * Resolution order:
 *   1. an explicit src prop, if a page passes one
 *   2. MEDIA[slot] in content/event.ts
 *   3. a labelled placeholder carrying the shot brief
 *
 * So adding media is pasting a URL into the manifest. Nothing else changes.
 *
 * srcMobile is art direction, not responsive sizing. A 16:9 frame centre
 * cropped to 9:16 loses whatever the shot was actually about, so the portrait
 * version is a separate crop rather than the same file squeezed.
 */
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

  // Video art direction. Phones and desktops get separate cuts, and each
  // device downloads only its own file. The choice needs matchMedia, so it
  // happens after mount; until then the matching poster still is shown, which
  // is also what a slow connection or a reduced-motion setting keeps seeing.
  const stillMobile = m?.posterMobile
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const isVideoSlot = /\.(mp4|webm|mov|m3u8)(\?|$)/i.test(url)
  useEffect(() => {
    if (!isVideoSlot) return
    const small = window.matchMedia('(max-width: 700px)').matches
    setVideoSrc(small && mobile ? mobile : url)
  }, [isVideoSlot, mobile, url])

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
              key={videoSrc}
              src={videoSrc}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden="true"
              className="media-video-layer"
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
