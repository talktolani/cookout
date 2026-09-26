import { EVENT, TICKETS } from '@/content/event'

// Copy for the paid-ads sales page at /tickets. Built on the funnel template's
// order (Brunson/Hormozi): offer hero, 3 pillars, how the day runs, tournament,
// value stack, tickets with a real deadline, FAQ, final call.
// Nothing unconfirmed ships here: no street address, no cornhole or giant
// Jenga, no table packages. Add them when they're confirmed. Prices come from
// TICKETS in content/event.ts (GA RM 85, door RM 100, confirmed 25 Sep).

const IMG = 'https://d2ol7oe51mr4n9.cloudfront.net/user_3BCuYCQwnreJpxyBr1ZoHKJc0Ay/'
// Non-breaking space so "RM 65" never splits across two lines.
const nb = (p: string) => p.replace(' ', '\u00a0')
const PRICE = nb(TICKETS.earlyBird.price)

export const SALES = {
  // Every Buy Tickets button opens the opt-in pop-up (saved to the ticket-order
  // form in AIOS), then sends people here to pay. UTM tags ride along.
  checkoutUrl: 'https://www.ticketmelon.com/thecookoutevent/halloween',

  // Live 25 Sep. Shown in the footer and used in the Event markup.
  social: { instagram: '@thecookout.kl', instagramUrl: 'https://www.instagram.com/thecookout.kl/' },

  popup: {
    step: 'Step 1 of 2',
    heading: `Lock In Early Bird: ${PRICE}`,
    sub: `Your first drink's on us. Early Bird ends ${TICKETS.earlyBird.closes}.`,
    consent: 'Yes, The Cookout can message me via email & WhatsApp about my ticket and the event.',
    submit: 'Continue To Payment',
    busy: 'One moment',
    micro: 'Next: pay securely on TicketMelon.',
  },

  hero: {
    headline: 'Barbecue, games, pickleball, and a sound system',
    offer: `Early Bird is ${PRICE} and your first drink's on us. The price goes up after ${TICKETS.earlyBird.closes}.`,
    cta: 'Buy Tickets',
  },

  // What The Cookout is and why it's different: headline left, copy right
  // (Comic-Con's intro format). Sits at the top of the pillars section so the
  // hero's sunset fade runs straight into it.
  intro: {
    eyebrow: 'The Cookout',
    heading: 'The ultimate day party for food, games and good music',
    body: `The Cookout is a barbecue, a games day and a party in one, for 8 hours at ${EVENT.venue} in ${EVENT.city}. Eat straight off the grill, play pickleball, padel and pool tournaments in pairs, pull up a seat for spades and dominoes, then stay when DJ Shaggz turns the sound system up after dark. Everything you'd want from a perfect Saturday, in one place, with your people.`,
  },

  pillars: {
    heading: 'Play first. Party after.',
    lead: "8 hours, 1 venue. Come for the food, stay for the tournament, and don't leave before the sound system takes over.",
    cta: 'Buy Tickets',
    sub: `8 hours of food, games and music for ${PRICE}.`,
    items: [
      {
        title: 'The Food',
        body: "Bunker's kitchen is on the grill all afternoon: Firepit, Crispy Shack and Hot Dawgs. It's best straight off the grill, so get there early.",
        img: `${IMG}7c1f28e1-525d-41f0-89d9-68efc7e8b251.jpg`,
        video: `${IMG}a5fba6c3-9fa6-42c1-ad8d-32db7e2ad91b.mp4`,
        alt: 'Skewers on a charcoal grill',
      },
      {
        title: 'The Games',
        body: "Pickleball, padel and pool tournaments in pairs. Spades, dominoes, UNO, Jenga and ping pong tables. Every game's free to play.",
        img: `${IMG}9c94fd7e-c698-4bb0-93ea-98c3c37367a3.jpg`,
        video: `${IMG}70afc062-6588-46dd-88f5-b92eadc4992c.mp4`,
        alt: 'Friends laughing mid-rally on a pickleball court',
      },
      {
        title: 'The Music',
        body: "DJ Shaggz on a proper sound system. R&B and hip hop while the food's on, then Afrobeats, Amapiano, baile funk and Jersey club after dark.",
        img: `${IMG}2746d573-791b-4616-b632-e3ebba374774.jpg`,
        video: `${IMG}09959071-a3e6-4472-b1d1-9b25d90e5013.mp4`,
        alt: 'Hands on a DJ mixer under warm lights',
      },
    ],
  },

  run: {
    heading: 'How the day runs',
    steps: [
      { time: EVENT.doors, title: 'Doors Open', body: "The grill fires up, the courts open and your first drink's on us." },
      { time: 'Afternoon', title: 'Games And Brackets', body: 'Tournament rounds run while the tables fill up with spades, dominoes and UNO.' },
      { time: 'After Dark', title: 'Sound System On', body: 'DJ Shaggz takes it through to midnight.' },
    ],
  },

  tournament: {
    heading: "Play, don't just watch",
    body: "The pickleball, padel and pool tournaments run in pairs. No rankings, no pressure, every level welcome. Bring a partner or we'll match you on the day. Entry's free with your ticket, and the bracket closes 5 days before the event.",
    img: `${IMG}0325e73d-e0b9-48e7-905c-16a8aa445782.jpg`,
    video: `${IMG}6f0877a1-e15a-4f43-be01-80bcdfb75773.mp4`,
    alt: 'A doubles pickleball rally on the court at Bunker',
    cta: 'Register Your Team',
    form: {
      sports: ['Pickleball', 'Padel', 'Pool'],
      consent: 'Yes, The Cookout can message me on WhatsApp about the tournament: my pair, the bracket and the start times.',
      submit: 'Register My Team',
      done: "We'll WhatsApp you to confirm your pair and the bracket. Your spot's locked in once you've got a ticket.",
    },
  },

  stack: {
    heading: `What ${PRICE} gets you`,
    items: [
      `Entry from ${EVENT.doors} until ${EVENT.close}`,
      'Your first drink, on us',
      'Every game and every table, free to play',
      'Free tournament entry, in pairs',
      'DJ Shaggz and the sound system, all night',
    ],
    note: "Food and drinks are from Bunker's kitchen and bar, priced on the night.",
    cta: 'Buy Tickets',
    sub: `All of it on 1 ticket. Early Bird ends ${TICKETS.earlyBird.closes}.`,
    img: `${IMG}14b4f93d-a8f1-473b-b41c-d53eb0912253.jpg`,
    video: `${IMG}85f991e9-d9cf-4813-8266-88e493ca6bf2.mp4`,
    alt: 'A cocktail with lime and mint on the bar',
  },

  tickets: {
    heading: 'Tickets',
    lead: 'Same night on every ticket. The only difference is when you buy.',
    tiers: [
      { name: 'Early Bird', price: PRICE, note: `Through ${TICKETS.earlyBird.closes}`, feature: true },
      { name: 'General Admission', price: nb(TICKETS.ga.price), note: 'From 3 October', feature: false },
      { name: 'At The Door', price: nb(TICKETS.door.price), note: "If there's room on the night", feature: false },
    ],
    cta: 'Buy Tickets',
    micro: 'First drink included on every ticket.',
  },

  faq: [
    { q: 'How much is a ticket?', a: `Early Bird is ${PRICE} through ${TICKETS.earlyBird.closes}. General Admission is ${nb(TICKETS.ga.price)} from 3 October, and it's ${nb(TICKETS.door.price)} at the door.` },
    { q: 'Do I have to be good at pickleball?', a: "No. The tournament's casual, in pairs, and every level's welcome. Plenty of people will be playing for the first time." },
    { q: 'Can I come on my own?', a: "Yes. Plenty of people will. If you want to play, tell us you need a partner and we'll match you on the day." },
    { q: 'What time should I get there?', a: `Doors open at ${EVENT.doors}. The food's at its best early and the brackets run through the afternoon.` },
    { q: 'What should I wear?', a: 'Summer casual. Sneakers, tees, shorts, bucket hats. Wear shoes you can move in if you are playing.' },
    { q: 'Is food included?', a: "Your first drink is. Food's from Bunker's kitchen, priced on the night." },
    { q: 'Where exactly is it?', a: `${EVENT.venue} in ${EVENT.city}. We'll send the address, the gate to use and where to park on WhatsApp.` },
  ],

  final: {
    heading: 'See you on the court',
    cta: 'Buy Tickets',
    // Footer loop (25 Sep): friends arm in arm, cheering as the crowd jumps.
    // Generated interim footage; swap for real footage from the night.
    img: `${IMG}8ee2cd0a-61f0-4c9e-9d3d-0819e23791fb.jpg`,
    video: `${IMG}46625678-7dc3-4d9b-b64f-5ac6299a02f2.mp4`,
    sub: `Doors open at ${EVENT.doors}. We'll see you at ${EVENT.venue}.`,
  },
}
