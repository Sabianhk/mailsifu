/**
 * Dev-only endpoint to seed demo inbound emails for local testing.
 * GET /api/dev/seed-inbox
 *
 * Requires NODE_ENV !== 'production'.
 * Creates a verified demo domain + sample OTP emails through the real inbound pipeline.
 */
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { processInboundEmail } from '@/lib/inbound'
import { ResendInboundPayload } from '@/lib/resend-webhook'

const DEMO_DOMAIN = 'inbound.mailsifu.com'

const SAMPLE_EMAILS: ResendInboundPayload[] = [
  {
    type: 'inbound.email',
    data: {
      from: 'GitHub <noreply@github.com>',
      to: [`alerts@${DEMO_DOMAIN}`],
      subject: 'Your GitHub authentication code: 847291',
      text: 'Your GitHub authentication code is 847291.\n\nThis code expires in 15 minutes. If you did not request this, you can ignore this email.',
    },
  },
  {
    type: 'inbound.email',
    data: {
      from: 'Stripe <no-reply@stripe.com>',
      to: [`billing@${DEMO_DOMAIN}`],
      subject: 'Stripe verification code',
      text: 'To verify your Stripe account, enter this one-time code: 5523\n\nValid for 10 minutes. Do not share this code.',
    },
  },
  {
    type: 'inbound.email',
    data: {
      from: 'accounts@google.com',
      to: [`alerts@${DEMO_DOMAIN}`],
      subject: 'Google sign-in attempt',
      text: 'Your Google verification code is 193847. Do not share this code with anyone.\n\nThis code will expire in 10 minutes.',
    },
  },
  {
    type: 'inbound.email',
    data: {
      from: 'Notion <no-reply@makenotion.com>',
      to: [`work@${DEMO_DOMAIN}`],
      subject: 'Your Notion login code',
      text: 'Your login code for Notion is:\n\n928374\n\nThis code expires in 5 minutes.',
    },
  },
]

export async function GET(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 })
  }

  // Require DEV_ACCESS_TOKEN even in staging to prevent accidental exposure
  const expectedToken = process.env.DEV_ACCESS_TOKEN
  if (expectedToken) {
    const url = new URL(request.url)
    const token = url.searchParams.get('token')
    if (token !== expectedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  // Ensure demo domain exists
  let workspace = await prisma.workspace.findFirst()
  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: { name: 'MailSifu', slug: 'mailsifu' },
    })
  }

  await prisma.mailDomain.upsert({
    where: { domain: DEMO_DOMAIN },
    update: {},
    create: {
      workspaceId: workspace.id,
      domain: DEMO_DOMAIN,
      status: 'verified',
      verifiedAt: new Date(),
    },
  })

  // Process each sample through the real inbound pipeline
  const results: { subject: string; messageId: string | null; error: string | null }[] = []
  for (const sample of SAMPLE_EMAILS) {
    const log = await prisma.webhookEventLog.create({
      data: {
        source: 'resend',
        eventType: sample.type,
        payload: JSON.stringify(sample),
      },
    })
    const result = await processInboundEmail(sample, log.id)
    results.push({
      subject: sample.data.subject,
      messageId: result.messageId,
      error: result.error,
    })
  }

  const succeeded = results.filter((r) => r.messageId).length
  return NextResponse.json({
    seeded: true,
    domain: DEMO_DOMAIN,
    messages: results.length,
    succeeded,
    results,
  })
}
