import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ ok: false, error: 'Not available in production' }, { status: 404 })
  }

  let token: string | null = null
  try {
    const body = await req.json()
    token = typeof body?.token === 'string' ? body.token : null
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const expected = process.env.BOOTSTRAP_ADMIN_TOKEN

  if (!expected || !token) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  // Timing-safe comparison to prevent token leakage via timing attacks
  const tokBuf = Buffer.from(token)
  const expBuf = Buffer.from(expected)
  if (tokBuf.length !== expBuf.length || !timingSafeEqual(tokBuf, expBuf)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const email = process.env.BOOTSTRAP_ADMIN_EMAIL ?? 'stanley@mailsifu.com'
    const name = process.env.BOOTSTRAP_ADMIN_NAME ?? 'Stanley'
    const password = process.env.BOOTSTRAP_ADMIN_PASSWORD
    if (!password) {
      return NextResponse.json({ ok: false, error: 'BOOTSTRAP_ADMIN_PASSWORD not set' }, { status: 500 })
    }
    // Cost 10 is sufficient for a one-time admin seed and avoids CPU timeout on slow hosts
    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        passwordHash,
      },
      create: {
        email,
        name,
        passwordHash,
      },
    })

    const workspace = await prisma.workspace.upsert({
      where: { slug: 'mailsifu' },
      update: {},
      create: {
        name: 'MailSifu',
        slug: 'mailsifu',
      },
    })

    await prisma.membership.upsert({
      where: { userId_workspaceId: { userId: user.id, workspaceId: workspace.id } },
      update: { role: 'owner' },
      create: {
        userId: user.id,
        workspaceId: workspace.id,
        role: 'owner',
      },
    })

    return NextResponse.json({
      ok: true,
      email,
      workspace: workspace.slug,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[bootstrap-admin] error:', message)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
