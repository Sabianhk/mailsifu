import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Dynamic import to avoid module-level env check
    const { prisma } = await import('@/lib/prisma')

    const msg = await prisma.receivedMessage.findFirst({
      where: { subject: { contains: 'TikTok' } },
      select: {
        id: true,
        subject: true,
        bodyText: true,
        bodyHtml: true,
      },
      orderBy: { receivedAt: 'desc' },
    })

    if (!msg) {
      return NextResponse.json({ error: 'No message found' })
    }

    return NextResponse.json({
      id: msg.id,
      subject: msg.subject,
      bodyTextIsNull: msg.bodyText === null,
      bodyTextLength: msg.bodyText?.length ?? null,
      bodyTextTrimmedLength: msg.bodyText?.trim().length ?? null,
      bodyTextPreview: msg.bodyText?.substring(0, 300) ?? null,
      bodyHtmlIsNull: msg.bodyHtml === null,
      bodyHtmlLength: msg.bodyHtml?.length ?? null,
      bodyHtmlPreview: msg.bodyHtml?.substring(0, 500) ?? null,
      hasDbUrl: !!process.env.DATABASE_URL,
    })
  } catch (err) {
    return NextResponse.json({
      error: String(err),
      hasDbUrl: !!process.env.DATABASE_URL,
    }, { status: 500 })
  }
}
