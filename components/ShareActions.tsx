'use client'
import { useState } from 'react'
import { THANKS_PAGE } from '@/content/thanks'

export default function ShareActions() {
  const s = THANKS_PAGE.share
  const [copied, setCopied] = useState(false)
  const wa = `https://wa.me/?text=${encodeURIComponent(`${s.message} ${s.link}`)}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(s.link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className="ty-actions">
      <a className="btn ty-pill" href={wa} target="_blank" rel="noopener noreferrer" data-track="thanks-share-whatsapp">
        {s.whatsapp}
      </a>
      <button type="button" className="btn ty-pill ghost" onClick={copy} data-track="thanks-copy-link">
        {copied ? s.copied : s.copy}
      </button>
    </div>
  )
}
