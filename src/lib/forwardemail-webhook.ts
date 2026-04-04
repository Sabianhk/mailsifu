/**
 * Forward Email webhook types and signature verification.
 * Forward Email POSTs JSON to your webhook URL when an email arrives.
 *
 * Webhook docs: https://forwardemail.net/en/faq#do-you-support-webhooks
 * Signature: HMAC-SHA256 using X-Webhook-Signature header
 */

import { createHmac, timingSafeEqual } from 'crypto'

export { parseFromAddress } from './email-utils'

/**
 * Forward Email webhook payload — flexible type to handle variations.
 * The exact fields may vary; we extract what we need.
 */
export interface ForwardEmailInboundPayload {
  // Standard email fields
  from?: string
  to?: string | string[]
  subject?: string
  text?: string
  html?: string
  headers?: Record<string, string | string[]> | Array<{ name: string; value: string }>

  // Envelope fields (some webhook formats include these)
  envelope?: {
    from?: string
    to?: string | string[]
    mailFrom?: string
    rcptTo?: string | string[]
  }

  // Forward Email may include these
  message_id?: string
  date?: string
  raw?: string

  // Allow extra fields
  [key: string]: unknown
}

/**
 * Verify Forward Email webhook signature.
 * Forward Email uses HMAC-SHA256 with the webhook key.
 * Signature is sent in the X-Webhook-Signature header.
 */
export function verifyWebhookSignature(
  rawBody: string,
  headers: Headers,
  secret: string
): boolean {
  const signature = headers.get('x-webhook-signature')
  if (!signature) return false

  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')

  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  } catch {
    return false
  }
}

/**
 * Coerce a mailparser address field to a plain string.
 * Forward Email sends `from`/`to` as either:
 *   - a plain string  "Name <email>"
 *   - a mailparser object  { text: "Name <email>", value: [{ address, name }] }
 *   - an array of the above
 */
function addressToString(field: unknown): string {
  if (!field) return ''
  if (typeof field === 'string') return field
  if (Array.isArray(field)) return addressToString(field[0])
  if (typeof field === 'object' && field !== null) {
    const obj = field as Record<string, unknown>
    // mailparser object: prefer .text, fall back to first .value[].address
    if (typeof obj.text === 'string' && obj.text) return obj.text
    if (Array.isArray(obj.value) && obj.value.length > 0) {
      const first = obj.value[0] as Record<string, unknown>
      const addr = first?.address ?? first?.email ?? ''
      const name = first?.name ?? ''
      if (name && addr) return `${name} <${addr}>`
      return String(addr || '')
    }
  }
  return String(field)
}

/**
 * Extract the useful fields from a Forward Email webhook payload.
 * Normalizes various possible formats to a standard shape.
 */
export function normalizePayload(payload: ForwardEmailInboundPayload): {
  from: string
  to: string
  subject: string
  text: string | null
  html: string | null
} {
  // From: try direct field first, then envelope
  const from = addressToString(payload.from) || addressToString(payload.envelope?.from) || ''

  // To: try direct field, then envelope
  const to = addressToString(payload.to)
    || addressToString(payload.envelope?.rcptTo)
    || addressToString(payload.envelope?.to)
    || ''

  // Subject
  const subject = (typeof payload.subject === 'string' ? payload.subject : '') || ''

  // Body
  const text = (typeof payload.text === 'string' ? payload.text : null)
  const html = (typeof payload.html === 'string' ? payload.html : null)

  return { from, to, subject, text, html }
}
