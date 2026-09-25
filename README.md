# The Cookout — site

3 pages: landing (`/`), tables and VIP (`/tables`), thank you (`/thanks`).
Next.js 14 App Router, TypeScript, no CSS framework.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Builds clean. Verified with `next build`.

---

## Where the copy lives

**`content/event.ts`.** Every fact and every line of copy is in that one file.
Change the site by editing it. Do not edit copy inside components.

Anything wrapped in `[SQUARE BRACKETS]` is a confirmed gap, not a guess. It
renders in orange on the page so it cannot ship unnoticed. Search the file for
`[` to find them all.

## Where the media goes

`components/Media.tsx` handles every slot. With no `src` it renders a labelled
placeholder carrying the shot brief. Pass a `src` and it renders the real muted
looping video or image instead:

```tsx
<Media slot="V1" src="/media/hero.mp4" poster="/media/hero.jpg" fill />
```

Swapping a placeholder for a finished asset is a one line change. Drop files in
`public/media/`.

14 slots. 5 are must-have before launch: V1 hero loop, V5 venue walkthrough,
P2 to P4 empty table positions, G1 floor plan, V9 the thank you video.

---

## AIOS integration

### Tracker

`app/c/route.ts` is the first party proxy. It exists because the Supabase
gateway rewrites `X-Forwarded-For` to its own peer address before the function
runs, so the visitor's real IP travels in a custom header. Without it every
visitor hashes to the same IP and geography is blank.

Adapted from `lani-site/app/c/route.ts`. The 3 changes are marked
`COOKOUT CHANGE n of 3` in the file:

1. Config fetch sends `&site=cookout`. lani-site sends `cfg=1` with no site and
   gets talktolani's config back.
2. Catch-block fallback returns `cookout`, not `talktolani`.
3. Exclusion cookie is `cookout_no_track`. `lani_no_track` is scoped to
   `.talktolani.com` and can never reach this domain.

Header names stay `X-Lani-*` because `site-collect` is shared infrastructure and
that is what it reads. They carry no Lani AI data, only the header contract.

`lib/analytics.ts` is written to the payload contract rather than copied from
lani-site's 700 lines. It sends `site: 'cookout'` on every batch, and `wd: 1`
when `navigator.webdriver` is true.

**Not implemented on purpose:** session recording. `site_tracking_config` has it
off for this site. Leave it off until there is a privacy page.

### Forms

All 4 forms post to one endpoint, `NEXT_PUBLIC_CAPTURE_ENDPOINT`, built by the
AIOS agent. See `lib/submit.ts`. Payload:

```json
{
  "form": "guest-list",
  "page": "/",
  "fields": { "first_name": "...", "whatsapp": "...", "...": "..." },
  "whatsapp_optin": true,
  "marketing_optin": false,
  "utm": { "utm_source": "...", "partner_code": "..." }
}
```

`whatsapp_optin` travels as its own boolean rather than buried in `fields`,
because the HighLevel push has to carry it and it cannot be retrofitted.

With the endpoint unset, forms show a "not connected" state instead of failing
silently. That is the correct state during copy review.

### crm_forms rows needed

Send these to the AIOS agent. `client_id` is
`88eb0ec1-ab2f-464d-88be-1db916cb5a6b`.

| key | name | page_path | source_value | tags |
|---|---|---|---|---|
| `guest-list` | Guest List Registration | `/` | `guest_list` | `cookout`, `guest-list`, `edition-001` |
| `tournament-entry` | Tournament Entry | `/` | `tournament` | `cookout`, `tournament`, `edition-001` |
| `costume-contest` | Costume Contest Entry | `/` | `costume` | `cookout`, `costume`, `edition-001` |
| `table-booking` | Table And VIP Booking | `/tables` | `table_booking` | `cookout`, `table`, `edition-001` |

Tags are what a CRM workflow enrols on, so they are set up to let one workflow
target the whole edition and another target only table buyers.

`source` is `funnel_lead` for all 4.

### Rate limiting

The capture endpoint needs per-IP rate limiting and an attempts log from the
first commit, following `lp_lead_gate`'s shape. **Do not copy its destination
rule**: it only permits callable North American numbers and would refuse every
Malaysian `+60` number. This event has no outbound calling, so no destination
rule is needed at all.

---

## Deployment

Its own GitHub repo and its own Vercel project. Not a folder inside
`lani-site`, and not in `aios-dashboard`, whose CI deploys edge functions on
push.

Deploy to a `vercel.app` URL for copy review. No domain needed for that.

**Do not point the tracker at a live domain** until the domain, this `/c` route,
and the `site_sites.base_url` update all land together. Half of that shipped
alone gives a traffic history you cannot trust.

Once the domain is real, tell the AIOS agent so `site_sites.base_url`, `name`
and `repo` get updated in the same pass, and set `NEXT_PUBLIC_BASE_URL` here.

---

## Deliberately not built

- **Payment.** Stripe Connect is not started on this client. Card fields belong
  to the payment provider, never to us. The provider's hosted step slots in
  above the submit button in `components/TableForm.tsx`.
- **SMS.** A Malaysian long code cannot originate automated traffic. WhatsApp
  runs in HighLevel; AIOS holds the record.
- **An email sequence.** Postmark is on a 100 per month plan.

## Still needed from Donny

1. Full address for Bunker 1883
2. Table package names, prices, seat counts and inclusions
3. Whether a table includes door entry for everyone on it
4. Costume contest prize values
5. Family friendly cut off time, and the wet weather answer
6. WhatsApp support number
7. Booking terms and refund position
8. The `og.jpg` key visual at 1080x1350
