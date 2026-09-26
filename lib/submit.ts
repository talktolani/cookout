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

// One endpoint for every form: AIOS site-form-capture. No HighLevel push:
// the endpoint writes one row to crm_form_submissions and stops.
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

    if (!res.ok) return { status: 'error', message: 'Something went wrong. Try again in a moment.' }
    return { status: 'ok' }
  } catch {
    return { status: 'error', message: 'Something went wrong. Try again in a moment.' }
  }
}
