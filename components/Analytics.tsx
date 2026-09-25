'use client'
import { useEffect } from 'react'
import { startTracking } from '@/lib/analytics'

export default function Analytics() {
  useEffect(() => { startTracking() }, [])
  return null
}
