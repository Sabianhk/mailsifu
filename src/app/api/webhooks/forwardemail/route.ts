import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyWebhookSignature, ForwardEmailInboundPayload } from '@/lib/forwardemail-webhook'
import { processForwardEmailInbound } from '@/lib/inbound'

const MAX_PAYLOAD_BYTES = 1024 * 1024 // 1MB

export async function POST(req: NextRequest) {
  const contentLength = req.headers.get('content-length')
  if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_BYTES) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
  }

  const rawBody = await req.text()
  if (rawBody.length > MAX_PAYLOAD_BYTES) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
  }

  // Verify signature only when secret is configured AND the request carries one.
  // Forward Email does not sign inbound-email webhooks, so we accept unsigned POSTs.
  const secret = process.env.FORWARD_EMAIL_WEBHOOK_SECRET?.trim()
  if (secret) {
    const signature = req.headers.get('x-webhook-signature')
    if (signature) {
      const valid = verifyWebhookSignature(rawBody, req.headers, secret)
      if (!valid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }
  }

  let parsed: ForwardEmailInboundPayload
  try {
    parsed = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Log the raw event for debugging (helps see exact payload format)
  const log = await prisma.webhookEventLog.create({
    data: {
      source: 'forwardemail',
      eventType: 'inbound.email',
      payload: rawBody,
    },
  })

  // Process the inbound email
  const result = await processForwardEmailInbound(parsed, log.id)

  if (result.error) {
    console.error('ForwardEmail webhook processing error:', result.error)
  }

  // Always 200 — prevents retries on transient errors
  return NextResponse.json({ received: true })
}
