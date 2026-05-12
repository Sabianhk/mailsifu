import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { token, platform } = await req.json()
  if (!token || typeof token !== 'string') {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  await prisma.pushDeviceToken.upsert({
    where: { token },
    update: { userId: session.user.id, platform: platform ?? 'android', updatedAt: new Date() },
    create: { userId: session.user.id, token, platform: platform ?? 'android' },
  })

  return NextResponse.json({ ok: true })
}
