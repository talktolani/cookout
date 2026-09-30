// Which Meta datasets (pixels) receive our events. Shared by the browser
// pixel (lib/meta.ts) and the Conversions API route (app/api/meta/route.ts)
// so the two sides can never disagree.
//
// OURS: "The Cookout", owned by the Donny Pkg2 Rep business portfolio.
//
// PARTNER: Bunker 1965's own dataset for the ads they run for us from their
// ad account (30 Sep 2026). Meta blocks a new business portfolio from sharing
// a dataset with a partner business for "several weeks", so Bunker created
// one in their business and we fire every event into both. Every event keeps
// one event_id across the browser and server copies, and Meta dedupes per
// dataset, so neither dataset double counts. Empty string = switched off.

export const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '1092247383161339'

// "The Cookout KL" in Bunker 1965's business, ID sent by Donny 30 Sep.
export const PARTNER_PIXEL_ID = process.env.NEXT_PUBLIC_META_PARTNER_PIXEL_ID || '28544942708504204'

export const PIXEL_IDS = [PIXEL_ID, PARTNER_PIXEL_ID].filter((id) => /^\d{10,20}$/.test(id))
