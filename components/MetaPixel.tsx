'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { metaEvent } from '@/lib/meta'

// PageView on every route, plus ViewContent on the ticket sales page. Each is
// sent from the browser and from /api/meta with one shared event_id.
export default function MetaPixel() {
  const path = usePathname()
  useEffect(() => {
    metaEvent('PageView')
    if (path === '/tickets') metaEvent('ViewContent', { content_name: 'Tickets', content_category: 'Event' })
  }, [path])
  return null
}
