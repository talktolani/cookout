/**
 * Ticket ladder. The urgency mechanic is a real, chosen deadline, not a
 * quantity cap: nothing here limits how many tickets can be sold, only how
 * long the RM 65 price lasts. That matters because the goal is maximum
 * tickets and maximum heads through the door, and a hard cap works against
 * that by definition. A cap was tried earlier and dropped for exactly this
 * reason: it was never a real inventory limit, so it was not honest, and it
 * would have turned away buyers on purpose.
 *
 * The contract splits door revenue 70/30 (Cookout/venue), so a door ticket
 * has to clear roughly 1.43x the Early Bird price to be worth the same as a
 * pre-sale ticket. Against RM 65 that floor is about RM 93. RM 100 for the
 * door, floated by the venue partner, clears it. GA has no floor of its own,
 * only needs to sit between the two. Donny confirmed RM 85 General Admission
 * and RM 100 at the door on 25 Sep.
 */
export const TICKETS = {
  earlyBird: {
    name: 'Early Bird',
    price: 'RM 65',
    closes: '2 October',
    // Used by the live countdown. Real deadline, not a rolling timer.
    // The date itself is a proposal (see the block comment above) until
    // Donny confirms it. If it changes, update this and the copy below.
    closesISO: '2026-10-02T23:59:59+08:00',
    note: 'Runs through 2 October. The price rises after that, whether it has sold out or not.',
  },
  ga: {
    name: 'General Admission',
    price: 'RM 85',
    note: 'From 3 October, online, until the night before.',
  },
  door: { name: 'At The Door', price: 'RM 100', note: 'On the night, at the venue.' },
} as const

export const MEDIA: Record<string, { src?: string; srcMobile?: string; poster?: string; posterMobile?: string }> = {
  V1: {
    src: 'https://d2ol7oe51mr4n9.cloudfront.net/user_3BCuYCQwnreJpxyBr1ZoHKJc0Ay/d61bd346-ba99-499a-8366-4d05127001e5.mp4',
    srcMobile: 'https://d2ol7oe51mr4n9.cloudfront.net/user_3BCuYCQwnreJpxyBr1ZoHKJc0Ay/f052c702-bfee-41db-b487-d6727efa133f.mp4',
    poster: 'https://d2ol7oe51mr4n9.cloudfront.net/user_3BCuYCQwnreJpxyBr1ZoHKJc0Ay/23eade15-9f21-4aca-9a55-d184c704fbd4.png',
    posterMobile: 'https://d2ol7oe51mr4n9.cloudfront.net/user_3BCuYCQwnreJpxyBr1ZoHKJc0Ay/120898dc-154a-41df-ab62-167facf9dd68.png',
  },
  V2: { src: '' },
  V3: { src: '' },
  V4: { src: '' },
  V5: { src: '' },
  V6: { src: '' },
  V7: { src: '' },
  P1: { src: '' },
  S1: { src: '' }, S2: { src: '' }, S3: { src: '' },
  S4: { src: '' }, S5: { src: '' }, S6: { src: '' },
  V8: { src: '', poster: '' },
  P2: { src: '' },
  P3: { src: '' },
  P4: { src: '' },
  G1: { src: '' },
  V9: { src: '' },
  V10: { src: '' },
}

export const EVENT = {
  name: 'The Cookout',
  date: 'Saturday 10 October',
  dateISO: '2026-10-10',
  doors: '4PM',
  close: 'midnight',
  timeRange: '4PM until midnight',
  dateShort: 'Saturday, Oct 10',
  timeShort: '4PM - 12AM',
  venue: 'Bunker 1965',
  city: 'Kuala Lumpur',
  address: '[ADDRESS]',
  doorPrice: 'RM 100',
  calendar: {
    start: '20261010T160000',
    end: '20261011T000000',
  },
} as const

export const HERO = {
  eyebrow: 'KUALA LUMPUR',
  headline: 'Barbecue, games, pickleball, and a sound system.',
  facts: `${EVENT.date} · ${EVENT.timeRange} · ${EVENT.venue}, ${EVENT.city}`,
  support: `Early Bird is ${TICKETS.earlyBird.price} through ${TICKETS.earlyBird.closes}. ${TICKETS.ga.price} after that, and your first drink is on us.`,
  primaryCta: 'Get Your Ticket',
  secondaryCta: 'Free Guest List',
}

export const THREE = {
  heading: 'A barbecue, a games day, and a party. Back to back.',
  lead:
    'The Cookout runs for 8 hours straight. Come early for the food, stay for the tournament, and stay for the music after dark.',
  items: [
    {
      slot: 'V2',
      title: 'The Food',
      body: "Smoked and grilled all afternoon. Get there early. It's always best straight off the grill.",
      brief: 'Tight on the grill. Smoke, tongs turning meat, a tray coming off. Golden hour. Daylight.',
      spec: '4:5 · 8-12s loop',
    },
    {
      slot: 'V3',
      title: 'The Games',
      body: 'Pickle, padel and pool tournaments. Spades, dominoes and UNO tables. Cornhole, giant Jenga, tug of war and ping pong.',
      brief: 'A padel rally that ends in a point. A domino slammed down. A cornhole bag dropping in. Late afternoon light.',
      spec: '4:5 · 8-12s loop',
    },
    {
      slot: 'V4',
      title: 'The Music',
      body: '90s R&B while the food is on, then it climbs. R&B, hip hop, Afrobeats, Amapiano, baile funk and Jersey club, all evening.',
      brief: 'DJ hands on the mixer, cut to the crowd. Wide enough to show the room and the people in one frame. After dark.',
      spec: '4:5 · 8-12s loop',
    },
  ],
}

export const VENUE_SECTION = {
  heading: `Inside ${EVENT.venue}`,
  body: 'A working industrial space, taken over for one night. 8 hours, one room, everything under the same roof.',
  slot: 'V5',
  spec: '16:9 · 30-45s',
  brief:
    'A walk through the venue while it is empty. The turn off the main road, the gate, the parking, then the space. Proves an unknown building is real and findable.',
}

export const TOURNAMENT = {
  heading: "Play, don't just watch.",
  body:
    "The pickle, padel and pool tournaments run in pairs. Bring someone, or tell us you need a partner and we'll match you on the day. Entry is free and the bracket closes 5 days before the event.",
  cta: 'Register Your Team',
}

export const INCLUDED = {
  heading: 'What your ticket gets you',
  items: [
    'Every tier gets the same night. The only difference is what you paid.',
    `Entry from ${EVENT.doors} until ${EVENT.close}`,
    'Your first drink, on us',
    'Every game and every table, free to play',
    'Tournament entry, free, registered in advance',
    'Food and drinks from the vendors, priced on the day',
  ],
}

export const GETTING_THERE = {
  heading: 'Getting there',
  body: `${EVENT.venue}, ${EVENT.address}. Parking is free and there's plenty of it. The week of the event we'll send you a map, the gate to use, and a drop off pin for Grab.`,
  slot: 'V7',
  spec: '9:16 · 15-20s · captions',
  brief: 'Off the main road, through the gate, park, walk in. Filmed from a car. Doubles as a final week Reel.',
}

export const CAROUSEL = {
  heading: 'The night, in short',
  body: 'New clips land every week of the campaign.',
  items: [
    { slot: 'S1', label: 'Creator video', ig: true },
    { slot: 'S2', label: 'Menu reveal still', ig: false },
    { slot: 'S3', label: 'Bracket draw clip', ig: true },
    { slot: 'S4', label: 'DJ announce still', ig: false },
    { slot: 'S5', label: 'Vendor spotlight', ig: true },
    { slot: 'S6', label: 'Vendor or menu still', ig: false },
  ],
}

export const TARGETS = {
  attendees: 400,
  assumedShowRate: 0.4,
  fromTables: 80,
  fromTournament: 32,
  freeRegistrations: 720,
  costPerRegistrationTarget: 'RM 6 to 10',
  costPerRegistrationCeiling: 'RM 14',
} as const

export const REGISTER = {
  heading: 'Not ready to buy yet?',
  body:
    `Get on the free guest list instead. It takes about 20 seconds, gets you the address and the set times, and keeps you out of the general queue. You'll pay ${EVENT.doorPrice} at the door on the night.`,
  cta: 'Get On The Guest List',
  micro: `Free to join. ${EVENT.doorPrice} at the door. Buying ahead is ${TICKETS.earlyBird.price} while Early Bird lasts.`,
  whatsappOptIn:
    'Yes, The Cookout can message me on WhatsApp about this event: the address, where to park, set times, and my tournament bracket.',
  marketingOptIn: 'And tell me about future editions too.',
}

export const FAQ = [
  {
    q: 'How much is a ticket?',
    a: `Early Bird is ${TICKETS.earlyBird.price} through ${TICKETS.earlyBird.closes}. After that it is ${TICKETS.ga.price}, and ${EVENT.doorPrice} at the door if there is still room.`,
  },
  {
    q: 'Can I just turn up and pay at the door?',
    a: `Yes, ${EVENT.doorPrice} cash or card, as long as we have not sold out. Buying ahead is cheaper and guaranteed.`,
  },
  {
    q: 'What is the free guest list then?',
    a: `It is for anyone who wants the address, the set times and a faster door, but is not ready to buy yet. You still pay ${EVENT.doorPrice} on the night.`,
  },
  {
    q: 'What time should I get there?',
    a: `Doors open at ${EVENT.doors}. The food is at its best early and the tournament brackets run through the afternoon.`,
  },
  {
    q: 'Can I come on my own?',
    a: "Yes. Plenty of people will. If you want to play in the tournament, tick the box that says you need a partner and we'll match you.",
  },
  {
    q: 'What should I wear?',
    a: 'Summer casual. Sneakers, tees, shorts, bucket hats. Wear shoes you can move in if you are playing.',
  },
  { q: 'Is there parking?', a: 'Yes, free and on site.' },
  { q: 'Is it family friendly?', a: '[NEEDS ANSWER: all night, or a cut off time?]' },
  { q: 'What happens if it rains?', a: '[NEEDS ANSWER: is the space covered?]' },
]

export const TABLES = {
  hero: {
    heading: 'Tables and VIP',
    support: 'Reserved seating, fast track entry, and drinks waiting when you get there.',
    slot: 'V8',
    spec: '16:9 · 10-15s loop',
    brief: 'A set table: bottles, ice, glasses, seats reserved, room going on behind. Staged before doors.',
  },
  lead:
    'Everything else at The Cookout is first come, first served. A table is the one thing you can lock in ahead of the night.',
  tiers: [
    {
      slot: 'P2',
      name: '[PACKAGE 1: NAME IT FOR THE POSITION]',
      price: 'RM [___]',
      seats: '[__]',
      body: '[One or two lines describing where this table physically sits in the room and who it suits.]',
      includes: [
        '[Entry for everyone on the table, no queue and nothing to pay at the door: NEEDS DONNY. At the door price this is real revenue, not just a copy line.]',
        'Reserved for the full 8 hours',
        'Fast track entry',
        '[DRINKS INCLUSION]',
      ],
      brief: 'Photograph the empty table, wide, no crowd. You are selling the seat, not the party.',
      align: 'left' as const,
      accent: 'green' as const,
    },
    {
      slot: 'P3',
      name: '[PACKAGE 2: NAME IT FOR THE POSITION]',
      price: 'RM [___]',
      seats: '[__]',
      body: '[One or two lines describing where this table physically sits in the room and who it suits.]',
      includes: [
        '[Entry for everyone on the table, no queue and nothing to pay at the door: NEEDS DONNY. At the door price this is real revenue, not just a copy line.]',
        'Reserved for the full 8 hours',
        'Fast track entry',
        '[DRINKS INCLUSION]',
        '[ACTIVITY PERK, E.G. GUARANTEED TOURNAMENT SLOTS]',
      ],
      brief: 'The tier you want chosen. Best light, best angle.',
      align: 'right' as const,
      accent: 'ember' as const,
    },
    {
      slot: 'P4',
      name: '[PACKAGE 3: NAME IT FOR THE POSITION]',
      price: 'RM [___]',
      seats: '[__]',
      body: '[One or two lines describing where this table physically sits in the room and who it suits.]',
      includes: [
        '[Entry for everyone on the table, no queue and nothing to pay at the door: NEEDS DONNY. At the door price this is real revenue, not just a copy line.]',
        'Best position in the room, all night',
        'Fast track entry',
        '[BOTTLE INCLUSION]',
      ],
      brief: 'The anchor. Its job is to make the middle tier look sensible.',
      align: 'left' as const,
      accent: 'green' as const,
    },
  ],
  map: {
    heading: "Where you'll be sitting",
    slot: 'G1',
    spec: 'Graphic, not a photo',
    brief: 'Numbered positions on a simple plan, colour coded by tier.',
    points: [
      "Your table is held for the full night. We don't release it if you're running late.",
      'Everyone on your booking is on the door list by name.',
      'Tables are limited and they go first. Once they\u2019re gone, they\u2019re gone.',
      'Questions? Message us on WhatsApp at [NUMBER].',
    ],
  },
  form: {
    heading: 'Book your table',
    cta: 'Pay And Book',
    micro: 'All fees included. No cover charge for anyone on your table.',
  },
}

export const THANKS = {
  guest: {
    big: "You're on the list.",
    sub: `${EVENT.date} at ${EVENT.venue}. Doors at ${EVENT.doors}.`,
    body:
      "We'll message you the address, the gate to use, and where to park. The week of the event you'll get the set times and the run of day.",
    reminder: `You're on the list, not ticketed. Entry is ${EVENT.doorPrice} at the door, cash or card, and your first drink's included. Early Bird at ${TICKETS.earlyBird.price} is still cheaper if you'd rather lock it in.`,
  },
  ticket: {
    big: "You're in.",
    sub: `${EVENT.date} at ${EVENT.venue}. Doors at ${EVENT.doors}.`,
    body:
      "Your ticket's on its way to your WhatsApp. We'll send the address, the gate to use and where to park, and you'll get the set times the week of the event.",
    reminder: "Nothing to pay on the night beyond food and drinks. Your first drink's included.",
  },
  table: {
    big: "Your table's booked.",
    sub: `${EVENT.date} at ${EVENT.venue}. Doors at ${EVENT.doors}.`,
    body:
      "Everyone on your booking is on the door list, so head straight to the fast track entrance. We'll message you the address, the gate, and where to park, and you'll get the set times the week of the event.",
    reminder: 'Nothing to pay on the night. Your table is held for the full 8 hours.',
  },
  video: {
    slot: 'V9',
    spec: '9:16 · 15-20s',
    brief:
      'Shaggz, phone camera, 15 seconds. Thanks for registering, here is what to expect, bring someone. Reuse as the first WhatsApp message.',
  },
  share: {
    heading: 'Bring someone',
    body: 'The tournament runs in pairs and the food is better in company. Send this to the group chat.',
    cta: 'Send This To Your Group',
    slot: 'V10',
    spec: '9:16 · 6-10s',
    brief: 'Date, venue and "free to register" burned in, sized for a WhatsApp group.',
  },
}
