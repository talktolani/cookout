# One fix applied to this tree — 14 September 2026, AIOS agent

## The tree did not build as delivered

`npm run build` failed:

    app/layout.tsx
    Type error: Layout "app/layout.tsx" does not match the required types
    of a Next.js Layout.
      "formatDetection" is not a valid Layout export field.

`app/layout.tsx` had a standalone `export const formatDetection = {...}`
below the `viewport` export. The App Router does not accept `formatDetection`
as its own export — it is only valid *inside* the `metadata` object, where it
was already correctly set on line 16.

So it was a duplicate, in an illegal position, and it broke the build.

## What changed

The standalone export is removed. The one inside `metadata` stays, so the
iOS Safari address auto-linking suppression still works exactly as intended.
Nothing else in the file changed. No behaviour changed.

## Verified after the fix

    ✓ Compiled successfully
    ✓ Generating static pages (6/6)

    Route (app)                     Size      First Load JS
    ┌ ○ /                           1.75 kB   102 kB
    ├ ○ /_not-found                 873 B     88.2 kB
    ├ ƒ /c                          0 B       0 B
    ├ ○ /tables                     1.42 kB   102 kB
    └ ƒ /thanks                     2.46 kB   98.5 kB

6 routes, and `/c` is dynamic, which is correct for the collector on the Node
runtime.

## Everything else was left alone

All 13 changes listed in section 7 of the handover were verified present
before touching anything: Bunker 1965, the MEDIA manifest, `100svh` via
`@supports`, the scroll cue, the retuned scrim, the hero/portrait crops,
`og.jpg`, Next 14.2.35, and the Node runtime with the real `User-Agent`
header and verbatim geo headers in `app/c/route.ts`.

Every item in section 4 ("things that will break silently") was checked and
is untouched.

## Still not deployed

Creating the Vercel project was refused:

    403 forbidden — "You don't have permission to create a project."

Same outcome the Cookout agent reported, different message. The connector
token can read and deploy but cannot create projects on that team. Somebody
with owner rights has to create the empty project first, or the site needs a
Vercel account of its own.

`.env.production` in this tree carries the four preview values from section 3.

---

# Second fix — vercel.json, 14 September 2026

The `cookout-site` Vercel project was created with **Framework Preset = null**
(it was linked to an empty repo, so detection had nothing to look at and the
"Other" setting stuck).

With no framework set, Vercel does not run `next build`. It runs a static
build and then fails looking for an output directory:

    STATIC_BUILD_NO_OUT_DIR
    No Output Directory named "public" found after the Build completed.

This affects **any** deploy into that project, including a git push, because
it is a stored project setting rather than a property of the code.

`vercel.json` now pins it:

    { "framework": "nextjs" }

That fixes it in version control, so it cannot drift back. Setting the
Framework Preset to "Next.js" in Project Settings → Build & Deployment does
the same thing through the UI; either is enough, both is fine.
