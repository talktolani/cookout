import { ImageResponse } from 'next/og'
import { readFile } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { EVENT, HERO, TICKETS } from '@/content/event'

// The WhatsApp / Instagram share image, drawn from code at build time (25 Sep).
// Replaces a hand-made JPEG that got corrupted twice on its way through the
// deploy tool. Uses the real Montserrat (@fontsource/montserrat) and the real
// hero poster from Higgsfield storage, so it always matches the live hero.
// Next adds the og:image tags for every page automatically.
export const runtime = 'nodejs'
export const alt = 'The Cookout: barbecue, games, pickleball and a sound system'
export const size = { width: 1200, height: 630 }
// JPEG, not PNG: the PNG came out near 700KB and WhatsApp drops preview
// images over roughly 300KB.
export const contentType = 'image/jpeg'

const POSTER = 'https://d2ol7oe51mr4n9.cloudfront.net/user_3BCuYCQwnreJpxyBr1ZoHKJc0Ay/23eade15-9f21-4aca-9a55-d184c704fbd4.png'
const LIME = '#8BE643'
const CREAM = '#F6F0E2'

const font = (w: number) =>
  readFile(path.join(process.cwd(), 'node_modules/@fontsource/montserrat/files', `montserrat-latin-${w}-normal.woff`))

async function poster(): Promise<string | null> {
  try {
    const local = process.env.OG_LOCAL_BG // only for local previews
    const buf = local ? await readFile(local) : Buffer.from(await (await fetch(POSTER)).arrayBuffer())
    const type = local && /\.jpe?g$/i.test(local) ? 'image/jpeg' : 'image/png'
    return `data:${type};base64,${buf.toString('base64')}`
  } catch {
    return null // falls back to the gradient alone rather than failing the build
  }
}

export default async function Image() {
  const [f400, f600, f700, f800, f900, bg] = await Promise.all([font(400), font(600), font(700), font(800), font(900), poster()])
  const full = { position: 'absolute' as const, top: 0, left: 0, width: 1200, height: 630, display: 'flex' }
  const png = await new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: '#000' }}>
        {bg && <img src={bg} width={1200} height={630} style={{ ...full, objectFit: 'cover' }} />}
        <div style={{ ...full, backgroundImage: 'linear-gradient(to top, rgba(224,122,38,.55) 0%, rgba(180,73,26,.42) 14%, rgba(70,20,14,.62) 34%, rgba(0,0,0,.74) 58%, rgba(0,0,0,.9) 100%)' }} />
        <div style={{ ...full, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: CREAM, fontFamily: 'Montserrat' }}>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 5, color: LIME, marginBottom: 20 }}>
            {`${EVENT.venue.toUpperCase()} · ${EVENT.city.toUpperCase()}`}
          </div>
          <div style={{ fontSize: 64, fontWeight: 900, lineHeight: 1, letterSpacing: -1 }}>THE</div>
          <div style={{ fontSize: 176, fontWeight: 900, lineHeight: 1, letterSpacing: -6, color: LIME, marginTop: -4, marginBottom: 26, textShadow: '0 0 24px rgba(139,230,67,.45), 0 0 70px rgba(139,230,67,.3)' }}>
            COOKOUT!
          </div>
          <div style={{ fontSize: 33, fontWeight: 800, marginBottom: 16 }}>{HERO.headline.toUpperCase()}</div>
          <div style={{ fontSize: 21, fontWeight: 600, letterSpacing: 2.5, marginBottom: 18 }}>
            {`${EVENT.dateShort} | ${EVENT.timeShort}`.toUpperCase()}
          </div>
          <div style={{ fontSize: 19, fontWeight: 400, opacity: 0.92 }}>
            {`Pre-register free, get the cheapest tickets first. Early Bird closes ${TICKETS.earlyBird.closes}.`}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Montserrat', data: f400, weight: 400, style: 'normal' },
        { name: 'Montserrat', data: f600, weight: 600, style: 'normal' },
        { name: 'Montserrat', data: f700, weight: 700, style: 'normal' },
        { name: 'Montserrat', data: f800, weight: 800, style: 'normal' },
        { name: 'Montserrat', data: f900, weight: 900, style: 'normal' },
      ],
    },
  ).arrayBuffer()
  const jpg = await sharp(Buffer.from(png)).jpeg({ quality: 80, mozjpeg: true }).toBuffer()
  return new Response(new Uint8Array(jpg), { headers: { 'Content-Type': 'image/jpeg' } })
}
