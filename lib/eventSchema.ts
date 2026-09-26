import { EVENT, TICKETS } from '@/content/event'
import { SALES } from '@/content/sales'

// schema.org Event markup for Google's event results ("events in KL this
// weekend"). Rendered as JSON-LD on /tickets. Keep it in step with
// content/event.ts: dates and prices here must match what the page says.
// The street address is still unconfirmed, so location has the venue name
// and city only. Add streetAddress once Donny confirms it.
const BASE = 'https://thecookoutevent.com'
const IMG = 'https://d2ol7oe51mr4n9.cloudfront.net/user_3BCuYCQwnreJpxyBr1ZoHKJc0Ay/'
const rm = (p: string) => p.replace(/[^0-9.]/g, '')

export const EVENT_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: 'The Cookout',
  description: `A barbecue, a games day and a party in one at ${EVENT.venue}, ${EVENT.city}. Food off the grill, pickleball, padel and pool tournaments in pairs, spades and dominoes, and DJ Shaggz on the sound system after dark.`,
  startDate: `${EVENT.dateISO}T16:00:00+08:00`,
  endDate: '2026-10-11T00:00:00+08:00',
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  location: {
    '@type': 'Place',
    name: EVENT.venue,
    address: { '@type': 'PostalAddress', addressLocality: EVENT.city, addressCountry: 'MY' },
  },
  image: [`${IMG}23eade15-9f21-4aca-9a55-d184c704fbd4.png`, `${IMG}8ee2cd0a-61f0-4c9e-9d3d-0819e23791fb.jpg`],
  performer: { '@type': 'Person', name: 'DJ Shaggz' },
  organizer: { '@type': 'Organization', name: 'The Cookout', url: BASE, sameAs: [SALES.social.instagramUrl] },
  offers: [
    {
      '@type': 'Offer', name: TICKETS.earlyBird.name, price: rm(TICKETS.earlyBird.price), priceCurrency: 'MYR',
      availability: 'https://schema.org/InStock', url: `${BASE}/tickets`,
      validFrom: '2026-09-20T00:00:00+08:00', validThrough: TICKETS.earlyBird.closesISO,
    },
    {
      '@type': 'Offer', name: TICKETS.ga.name, price: rm(TICKETS.ga.price), priceCurrency: 'MYR',
      availability: 'https://schema.org/InStock', url: `${BASE}/tickets`,
      validFrom: '2026-10-03T00:00:00+08:00', validThrough: `${EVENT.dateISO}T16:00:00+08:00`,
    },
  ],
}
