import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * The visitor's country, for the default flag on the WhatsApp field.
 *
 * Vercel sets x-vercel-ip-country on every request. Pages here are static, so
 * the field asks this route instead of reading a header itself. Nothing is
 * stored or forwarded. null outside Vercel (local dev), and the field falls
 * back to Malaysia.
 */
export function GET(req: NextRequest) {
  const c = (req.headers.get('x-vercel-ip-country') ?? '').toUpperCase()
  return NextResponse.json(
    { country: /^[A-Z]{2}$/.test(c) ? c : null },
    { headers: { 'Cache-Control': 'private, no-store' } }
  )
}
