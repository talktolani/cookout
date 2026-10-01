import { EVENT } from '@/content/event'

// Copy for /thanks. Lives here rather than in event.ts so small copy edits
// don't mean resending the whole event file on every deploy (see CLAUDE.md).
// THANKS in event.ts is the old guest-list version and is no longer used.

const SITE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://thecookoutevent.com'

export const THANKS_PAGE = {
  preregister: {
    big: "You're on the list",
    sub: "We'll message you the Early Bird link before it goes public. Keep an eye on your email and WhatsApp",
  },
  ticket: {
    big: "You're in",
    sub: "Your ticket's on its way to your WhatsApp, with the address and where to park.",
  },
  table: {
    big: "Your table's booked",
    sub: "Everyone on your booking is on the door list. We'll WhatsApp you the address and where to park.",
  },
  stepsHeading: 'While you’re here',
  calendar: {
    title: 'Save The Date',
    body: `${EVENT.dateShort} from ${EVENT.doors}. Add it now so it doesn't get buried.`,
    google: 'Google Calendar',
    apple: 'Apple Calendar',
  },
  share: {
    title: 'Bring Your Crew',
    body: "The tournament runs in pairs and the food's better with company. Send this to the group chat.",
    whatsapp: 'Share On WhatsApp',
    copy: 'Copy Link',
    copied: 'Link Copied',
    link: `${SITE}/preregister?utm_source=whatsapp&utm_medium=share`,
    message: `I'm going to The Cookout, ${EVENT.dateShort} at ${EVENT.venue}. Barbecue, games, pickleball, 90s R&B, Afrobeats and Amapiano. Pre-register free for the cheapest tickets:`,
  },
}

export const CALENDAR = {
  google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    'The Cookout'
  )}&dates=${EVENT.calendar.start}/${EVENT.calendar.end}&ctz=Asia/Kuala_Lumpur&location=${encodeURIComponent(
    `${EVENT.venue}, ${EVENT.city}`
  )}&details=${encodeURIComponent('Barbecue, games, pickleball, 90s R&B, Afrobeats and Amapiano. ' + SITE)}`,
  ics: '/the-cookout.ics',
  outlook: `https://outlook.live.com/calendar/0/action/compose?subject=${encodeURIComponent(
    'The Cookout'
  )}&startdt=${encodeURIComponent('2026-10-10T16:00:00+08:00')}&enddt=${encodeURIComponent(
    '2026-10-11T00:00:00+08:00'
  )}&location=${encodeURIComponent(`${EVENT.venue}, ${EVENT.city}`)}&body=${encodeURIComponent(
    'Barbecue, games, pickleball, 90s R&B, Afrobeats and Amapiano. ' + SITE
  )}`,
}

// /calendar: where the emails' Add To Calendar button lands. An email can't
// add an event by itself, so this page offers each calendar app its own way in.
export const CALENDAR_PAGE = {
  big: 'Save The Date',
  sub: `${EVENT.date}, ${EVENT.timeRange} at ${EVENT.venue}. Pick your calendar and tap Save.`,
  google: 'Google Calendar',
  apple: 'Apple Calendar',
  outlook: 'Outlook',
  note: 'Apple Calendar opens the event on iPhone and Mac. On Android, use Google Calendar.',
}
