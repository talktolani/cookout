'use client'
import { useEffect, useState } from 'react'

// Adds ", Donny" to the headline. The first name travels from the form in
// sessionStorage, never in the URL, so it can't leak into analytics or logs.
export default function ThanksName({ base }: { base: string }) {
  const [name, setName] = useState('')
  useEffect(() => {
    try {
      const n = sessionStorage.getItem('cookout_first_name')
      if (n) setName(n.trim().split(/\s+/)[0].slice(0, 24))
    } catch {}
  }, [])
  return <>{name ? `${base}, ${name}` : base}</>
}
