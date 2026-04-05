import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    // Allow in production temporarily for debugging
  }

  const subject = req.nextUrl.searchParams.get('subject') || 'TikTok'

  const msg = await prisma.receivedMessage.findFirst({
    where: { subject: { contains: subject } },
    select: {
      id: true,
      subject: true,
      bodyText: true,
      bodyHtml: true,
      fromEmail: true,
      toEmail: true,
      receivedAt: true,
    },
    orderBy: { receivedAt: 'desc' },
  })

  if (!msg) {
    return NextResponse.json({ error: 'No message found' })
  }

  return NextResponse.json({
    id: msg.id,
    subject: msg.subject,
    fromEmail: msg.fromEmail,
    toEmail: msg.toEmail,
    bodyTextIsNull: msg.bodyText === null,
    bodyTextLength: msg.bodyText?.length ?? null,
    bodyTextTrimmedLength: msg.bodyText?.trim().length ?? null,
    bodyTextPreview: msg.bodyText?.substring(0, 300) ?? null,
    bodyHtmlIsNull: msg.bodyHtml === null,
    bodyHtmlLength: msg.bodyHtml?.length ?? null,
    bodyHtmlPreview: msg.bodyHtml?.substring(0, 500) ?? null,
  })
}
