/**
 * Core inbound email processing.
 * Maps inbound email payloads → ReceivedMessage + OtpExtraction in the DB.
 * Supports both Resend and Forward Email webhook formats.
 * Called by both the webhook endpoint and the dev seed route.
 */
import { prisma } from './prisma'
import { extractOtp } from './otp'
import { parseFromAddress as parseResendFrom, ResendInboundPayload } from './resend-webhook'
import {
  parseFromAddress as parseFEFrom,
  ForwardEmailInboundPayload,
  normalizePayload,
} from './forwardemail-webhook'

export interface InboundResult {
  messageId: string | null
  error: string | null
}

export async function processInboundEmail(
  payload: ResendInboundPayload,
  webhookLogId?: string
): Promise<InboundResult> {
  try {
    const { data } = payload

    // Normalise to[] → single address
    const toAddress = (Array.isArray(data.to) ? data.to[0] : data.to)?.trim().toLowerCase()
    if (!toAddress) return fail(webhookLogId, 'Missing to address')

    const { name: fromName, email: fromEmail } = parseResendFrom(data.from)

    return storeInboundMessage({
      toAddress,
      fromName,
      fromEmail,
      subject: data.subject?.trim() || '(no subject)',
      bodyText: data.text ?? null,
      bodyHtml: data.html ?? null,
      webhookLogId,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return fail(webhookLogId, msg)
  }
}

/**
 * Process a Forward Email inbound webhook payload.
 */
export async function processForwardEmailInbound(
  payload: ForwardEmailInboundPayload,
  webhookLogId?: string
): Promise<InboundResult> {
  try {
    const normalized = normalizePayload(payload)

    const toAddress = normalized.to?.trim().toLowerCase()
    if (!toAddress) return fail(webhookLogId, 'Missing to address')

    const { name: fromName, email: fromEmail } = parseFEFrom(normalized.from)

    return storeInboundMessage({
      toAddress,
      fromName,
      fromEmail,
      subject: normalized.subject?.trim() || '(no subject)',
      bodyText: normalized.text,
      bodyHtml: normalized.html,
      webhookLogId,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return fail(webhookLogId, msg)
  }
}

/**
 * Shared storage logic — works for both Resend and Forward Email payloads.
 */
async function storeInboundMessage({
  toAddress,
  fromName,
  fromEmail,
  subject,
  bodyText,
  bodyHtml,
  webhookLogId,
}: {
  toAddress: string
  fromName: string | null
  fromEmail: string
  subject: string
  bodyText: string | null
  bodyHtml: string | null
  webhookLogId?: string
}): Promise<InboundResult> {
  const domain = toAddress.split('@')[1]
  if (!domain) return fail(webhookLogId, `Cannot parse domain from: ${toAddress}`)

  // Require a known MailDomain — unknown domains are logged but not stored
  const mailDomain = await prisma.mailDomain.findUnique({ where: { domain } })
  if (!mailDomain) return fail(webhookLogId, `No MailDomain configured for: ${domain}`)

  // Find or auto-create the alias row for this specific address
  let mailAlias = await prisma.mailAlias.findUnique({ where: { address: toAddress } })
  if (!mailAlias) {
    mailAlias = await prisma.mailAlias.create({
      data: { mailDomainId: mailDomain.id, address: toAddress },
    })
  }

  const message = await prisma.receivedMessage.create({
    data: {
      mailDomainId: mailDomain.id,
      mailAliasId: mailAlias.id,
      fromName,
      fromEmail,
      toEmail: toAddress,
      subject,
      bodyText,
      bodyHtml,
    },
  })

  // Extract OTP and store result
  const { otpCode, confidence } = extractOtp(message.subject, message.bodyText)
  if (otpCode) {
    await prisma.otpExtraction.create({
      data: { receivedMessageId: message.id, otpCode, confidence },
    })
  }

  if (webhookLogId) {
    await prisma.webhookEventLog.update({
      where: { id: webhookLogId },
      data: { processedAt: new Date() },
    })
  }

  return { messageId: message.id, error: null }
}

async function fail(webhookLogId: string | undefined, error: string): Promise<InboundResult> {
  if (webhookLogId) {
    await prisma.webhookEventLog
      .update({ where: { id: webhookLogId }, data: { error } })
      .catch(() => {})
  }
  return { messageId: null, error }
}
