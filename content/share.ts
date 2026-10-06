import { EVENT } from '@/content/event'

// Copy for /share, the page the table cards link to. Guests send photos and
// videos here; they land in a private bucket and nobody else can see them.
// No em dashes, numerals for numbers, Title Case on buttons (see CLAUDE.md).

export const SHARE = {
  eyebrow: `${EVENT.venue.toUpperCase()} · ${EVENT.city.toUpperCase()}`,
  big: 'Share Your Cookout',
  sub: 'Got photos or videos from the night? Send them here. They go straight to the team, and nobody else can see them.',
  name: 'Your Name (Optional)',
  handle: 'Instagram Handle (Optional)',
  pick: 'Choose Photos And Videos',
  pickMore: 'Add More',
  hint: 'Photos and videos, up to 500 MB each',
  send: 'Send To The Cookout',
  sending: 'Sending...',
  retry: 'Try Again',
  doneBig: 'Thank You',
  doneSub: (n: number) => (n === 1 ? 'We got your file.' : `We got all ${n} files.`),
  more: 'Send More',
  note: "By sending files you're happy for us to use them to promote The Cookout.",
  errors: {
    type: 'Photos and videos only.',
    size: 'That file is over 500 MB.',
    many: 'Max 40 files at a time.',
    failed: "That one didn't go through.",
    generic: 'Something went wrong. Check your signal and try again.',
  },
}

export const SHARE_LIMITS = {
  maxFiles: 40,
  maxBytes: 500 * 1024 * 1024,
  perCall: 10,
  concurrency: 2,
}
