# The Cookout site: notes for whoever picks this up next

## REMOVE BEFORE FULL FUNNEL LAUNCH

**The bare domain redirects to /preregister.** See `next.config.mjs`.

While only the squeeze page is ready, `thecookoutevent.com` and
`www.thecookoutevent.com` send `/` to `/preregister` with a 307. The full
funnel at `/` still has bracketed placeholders on it: the venue address, all 3
table packages, costume and tournament prize values, the family-friendly cut
off, and the wet weather answer.

**When the full funnel is ready, delete the `redirects()` block in
`next.config.mjs`.** If you skip this, the homepage is unreachable on the live
domain and it will look like the site is broken.

The redirect is deliberately `permanent: false`, so a 307. Do not change it to
`permanent: true`. A 308 gets cached hard by browsers and would keep
redirecting people long after the rule is deleted, with nothing we can do from
our side to clear it.

## The capture endpoint

`NEXT_PUBLIC_CAPTURE_ENDPOINT` points at the AIOS `site-form-capture` edge
function. Contract, as given by the AIOS agent on 17 September 2026:

- **Anonymous POST, no Authorization header.** Verified working from both the
  apex and www.
- **Origin must be `thecookoutevent.com` or `www.thecookoutevent.com`.** An
  unregistered Origin is a 403. This is a typo catcher, not a security
  boundary, so do not lean on it.
- **The client is chosen by the form row, never by the request body.** An
  unknown form key is a 404 rather than a fallback to somebody else's client.
- **Live form keys:** `preregister`, `ticket-order`, `guest-list`,
  `tournament-entry`, `costume-contest`, `table-booking`. The costume one is
  now unused: the contest was cut on 17 September.
- **Field names are stored as given.** Send whatever the form collects.
- **Honeypots: `_hp`, `website_url`, `fax`.** Fill one and the response is
  still 200 and nothing is written. We use `_hp`, positioned off screen rather
  than `display:none`, because some bots skip hidden inputs but fill anything
  the DOM still lays out.
- **No IP is taken, and nothing is emailed or texted on submit.** The write is
  the write. Any confirmation message to the guest has to come from HighLevel.

## Things that break silently if changed

- **`NEXT_PUBLIC_SITE_KEY` must stay `cookout`.** The AIOS collector refuses a
  batch without it and no longer falls back to `talktolani`. A missing key
  means the traffic is thrown away.
- **`app/c/route.ts` runs on Node, not Edge.** The Edge runtime will not
  reliably let a fetch set the `User-Agent` header, and forwarding the real one
  is the entire reason that route exists. Do not add `export const runtime`.
- **Geo headers are forwarded verbatim.** Vercel percent encodes the city and
  the collector decodes it. Decoding in the route either double decodes, or
  puts raw UTF-8 into an outbound header for a non-ASCII city, which makes
  `fetch` throw. The catch swallows it and the whole batch vanishes.
- **Tracker event kinds are a closed set:** `pv`, `pl`, `click`, `rage_click`,
  `scroll`, `form_start`, `form_submit`, `cta`, `copy`, `error`. Anything else
  is dropped without an error. Element identity nests under `el`, everything
  else under `meta`. A key at the top level is ignored.
- **Do not add `export const formatDetection`** to `app/layout.tsx` as a
  standalone export. It belongs inside the `metadata` object. Next rejects the
  standalone form and the build fails on it. This has already happened once.
- **A stacked CSS fallback like `min-height:100vh; min-height:100svh` in one
  rule** gets deduped by naive inliners and can lose both declarations. Use a
  separate `@supports` block instead. This has already happened once.

## How this codebase is edited

- **All copy lives in `content/event.ts`.** Nothing is hardcoded in a component.
  Anything in `[SQUARE BRACKETS]` is a known gap, not a guess, and renders in
  orange so it cannot ship unnoticed. Search for `[` to find them all.
- **Media is a manifest, not a code change.** `MEDIA` at the top of
  `content/event.ts` maps slot codes to URLs. Paste a URL and the placeholder
  becomes a playing video or image.
- `public/media/hero.jpg`, `hero-portrait.jpg` and `og.jpg` live in the repo
  but are not in the Vercel deployments, because binary files cannot travel in
  the deploy payload. Push them from the repo, then set
  `V1: { src: '/media/hero.jpg', srcMobile: '/media/hero-portrait.jpg' }`.

## Deliberately not built

- **Payment.** Card fields belong to the provider. The hosted step slots in at
  the marked comment in `components/TicketCheckout.tsx`.
- **SMS.** A Malaysian long code cannot originate automated traffic. WhatsApp
  runs in HighLevel; AIOS holds the record.
- **Session recording.** Off for this site in `site_tracking_config`. Leave it
  off until there is a privacy page.

## Verifying builds in the Claude sandbox (added 25 Sep 2026)
The sandbox can't reach fonts.googleapis.com, so `next build` fails on `next/font` (Montserrat) even when the code is fine. That is an environment failure, not a code failure. Verify like this instead:
1. `npx tsc --noEmit` (must exit 0)
2. Mock the font request and build:
   `NEXT_FONT_GOOGLE_MOCKED_RESPONSES=/tmp/fontmock.js npx next build`
   where /tmp/fontmock.js exports `{ "<the exact css2 URL next/font requests>": "<any @font-face css>" }`.
   "Compiled successfully" plus the route table = the code builds. Vercel fetches the real font at deploy time.

## Deploying when the build includes large media (added 25 Sep 2026)
The Vercel MCP tools take file contents inline, which is fine for code but not for multi-MB binaries (the hero loops are ~2MB each), and the sandbox network can't reach Vercel directly. When public/media changes, deploy from Donny's laptop with the Vercel CLI (`npx vercel link` once, then `npx vercel --prod`) from the unzipped tree. Code-only changes can still go through the MCP tools.

## Hero video (added 25 Sep 2026)
MEDIA.V1 plays public/media/hero-mobile.mp4 on screens up to 700px and hero-desktop.mp4 above that; Media.tsx picks one after mount so each device downloads only its own file, with the matching poster still underneath. Both are generated interim footage. Replace with real Bunker shoot footage using the same file names, kept under ~2MB each (H.264, no audio track, faststart).
