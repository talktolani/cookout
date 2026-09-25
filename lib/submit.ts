import { track } from './analytics'

const ENDPOINT = process.env.NEXT_PUBLIC_CAPTURE_ENDPOINT ?? ''

export type FormKey =
  | 'guest-list'
  | 'preregister'
  | 'ticket-order'
  | 'tournament-entry'
  | 'table-booking'

export type SubmitResult =
  | { status: 'ok' }
  | { status: 'not_connected' }
  | { status: 'error'; message: string }

function utm() {
  if (typeof window === 'undefined') return {}
  const p = new URLSearchParams(location.search)
  const out: Record<string, string> = {}
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
    const v = p.get(k)
    if (v) out[k] = v.slice(0, 120)
  }
  const code = p.get('code') || p.get('ref')
  if (code) out.partner_code = code.slice(0, 60)
  return out
}

/**
 * One endpoint for every form: AIOS site-form-capture.
 *
 * The client is chosen by the crm_forms row, never by this body. An unknown
 * form key is a 404. Origin must be thecookoutevent.com or www.
 *
 * `_hp` travels inside `fields` as a honeypot. Anything in it means a bot and
 * the endpoint answers 200 while writing nothing.
 *
 * WHAT THIS DOES NOT DO: there is no HighLevel push. The endpoint writes one
 * row to crm_form_submissions and stops. An earlier version of this comment
 * said the contact was pushed to HighLevel in the same request. That was true
 * of the planned endpoint and is not true of the one that shipped.
 *
 * The consequence is operational rather than technical: every WhatsApp opt-in
 * collected here lands in a table and reaches no broadcast list. Someone has
 * to move them, or the push has to be built.
 *
 * whatsapp_optin and marketing_optin still travel as their own booleans beside
 * fields rather than inside it, because consent should be a column and not a
 * form answer. The endpoint folds unowned top-level keys into fields, so they
 * are recorded either way.
 */
export async function submitForm(
  form: FormKey,
  fields: Record<string, unknown>,
  whatsappOptIn: boolean,
  marketingOptIn: boolean
): Promise<SubmitResult> {
  track('form_submit', undefined, { form })

  if (!ENDPOINT) return { status: 'not_connected' }

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        form,
        page: typeof window !== 'undefined' ? location.pathname : '',
        fields,
        whatsapp_optin: whatsappOptIn,
        marketing_optin: marketingOptIn,
        utm: utm(),
      }),
    })

    // The endpoint follows lp-lead's posture: a refusal returns 200 { ok: true }
    // and stores nothing, so a bot learns nothing from the response and a human
    // is not staring at an error on a form they already filled in.
    if (!res.ok) return { status: 'error', message: 'Something went wrong. Try again in a moment.' }
    return { status: 'ok' }
  } catch {
    return { status: 'error', message: 'Something went wrong. Try again in a moment.' }
  }
}
