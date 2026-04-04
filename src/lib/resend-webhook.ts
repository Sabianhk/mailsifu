/**
 * Resend inbound webhook types and signature verification.
 * Resend uses Svix for webhook delivery; signed content = "{svix-id}.{svix-timestamp}.{rawBody}"
 */
import { createHmac, timingSafeEqual } from 'crypto'

export { parseFromAddress } from './email-utils'

export interface ResendInboundPayload {
  type: string
  created_at?: string
  data: {
    from: string
    to: string | string[]
    subject: string
    text?: string
    html?: string
    headers?: Array<{ name: string; value: string }>
    attachments?: unknown[]
  }
}

/**
 * Verify Svix-style HMAC-SHA256 webhook signature.
 * Returns true when signature matches; false on any failure.
 * Pass secret as raw string (not base64).
 */
export function verifyWebhookSignature(
  rawBody: string,
  headers: Headers,
  secret: string
): boolean {
  const msgId = headers.get('svix-id')
  const timestamp = headers.get('svix-timestamp')
  const sigHeader = headers.get('svix-signature')

  if (!msgId || !timestamp || !sigHeader) return false

  // Reject stale webhooks (> 5 minutes)
  const ts = parseInt(timestamp, 10)
  if (Number.isNaN(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return false

  const toSign = `${msgId}.${timestamp}.${rawBody}`
  // Svix secrets arrive as "whsec_<base64>" — decode to raw bytes before HMAC
  const keyBytes = secret.startsWith('whsec_')
    ? Buffer.from(secret.slice('whsec_'.length), 'base64')
    : Buffer.from(secret)
  const hmac = createHmac('sha256', keyBytes).update(toSign).digest('base64')
  const expected = `v1,${hmac}`

  // svix-signature may be space-separated list of "v1,<b64>"
  return sigHeader.split(' ').some((s) => {
    const candidate = s.trim()
    try {
      return timingSafeEqual(Buffer.from(candidate), Buffer.from(expected))
    } catch {
      return false
    }
  })
}
