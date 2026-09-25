import type { Metadata, Viewport } from 'next'
import { Montserrat } from 'next/font/google'
import Link from 'next/link'
import Analytics from '@/components/Analytics'
import { EVENT } from '@/content/event'
import './globals.css'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-montserrat',
})

export const metadata: Metadata = {
  formatDetection: { telephone: false, address: false, date: false },
  title: 'The Cookout — Barbecue, Games, And A Sound System',
  description: `${EVENT.date}, ${EVENT.timeRange}, at ${EVENT.venue} in ${EVENT.city}. Registration is free. Entry is ${EVENT.doorPrice} at the door and your first drink is on us.`,
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'https://example.invalid'),
  openGraph: {
    title: 'The Cookout',
    description: `${EVENT.date}, ${EVENT.timeRange}, ${EVENT.venue}. Barbecue, games and a sound system.`,
    type: 'website',
    // 4:5 key visual, the same shape as the flyer and the same shape TAO uses.
    images: [{ url: '/og.jpg', width: 1080, height: 1350 }],
  },
}

export const viewport: Viewport = { themeColor: '#0D1226' }

// iOS Safari auto-links anything it reads as an address, phone number or date,
// which underlines the venue line in the hero. That is turned off by
// formatDetection inside the metadata object above, which is the only place
// the App Router accepts it. A standalone `export const formatDetection` used
// to sit here as well: Next rejects it outright ("not a valid Layout export
// field") and the build failed on it, so the duplicate is gone and the
// working one stays.

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body>
        <Analytics />
        {children}
        <footer>
          <div className="wrap footrow">
            <span>{EVENT.name} · {EVENT.venue}, {EVENT.city} · {EVENT.date}</span>
            <span className="footlinks">
              <Link href="/">Guest List</Link>
              <Link href="/tables">Tables</Link>
            </span>
          </div>
        </footer>
      </body>
    </html>
  )
}
