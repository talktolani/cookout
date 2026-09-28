import type { Metadata, Viewport } from 'next'
import { Montserrat } from 'next/font/google'
import Link from 'next/link'
import Analytics from '@/components/Analytics'
import MetaPixel from '@/components/MetaPixel'
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
  title: 'The Cookout: Barbecue, Games, 90s R&B, Afrobeats And Amapiano',
  description: `${EVENT.dateShort}, ${EVENT.timeShort} at ${EVENT.venue}, ${EVENT.city}. Barbecue, games, pickleball, 90s R&B, Afrobeats and Amapiano. Pre-register free for the cheapest tickets.`,
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'https://example.invalid'),
  openGraph: {
    title: 'The Cookout',
    description: `${EVENT.dateShort} | ${EVENT.timeShort} at ${EVENT.venue}, ${EVENT.city}. Barbecue, games, pickleball, 90s R&B, Afrobeats and Amapiano.`,
    type: 'website',
    // The share image is drawn by app/opengraph-image.tsx at build time.
  },
  twitter: { card: 'summary_large_image' },
  // Meta domain verification (Business settings > Brand safety > Domains).
  ...(process.env.NEXT_PUBLIC_FB_DOMAIN_VERIFICATION
    ? { other: { 'facebook-domain-verification': process.env.NEXT_PUBLIC_FB_DOMAIN_VERIFICATION } }
    : {}),
}

export const viewport: Viewport = { themeColor: '#000000', viewportFit: 'cover' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body>
        <Analytics />
        <MetaPixel />
        {children}
        <footer>
          <div className="wrap footrow">
            <span>{EVENT.name} · {EVENT.venue}, {EVENT.city} · {EVENT.date}</span>
            <span className="footlinks">
              <Link href="/">Guest List</Link>
              <Link href="/tables">Tables</Link>
              <Link href="/privacy">Privacy</Link>
            </span>
          </div>
        </footer>
      </body>
    </html>
  )
}
