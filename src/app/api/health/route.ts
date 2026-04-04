import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  let db: 'ok' | 'error' = 'ok'
  try {
    await prisma.$queryRaw`SELECT 1`
  } catch (err) {
    db = 'error'
    console.error('[health] DB check failed:', err instanceof Error ? err.message : err)
  }

  const ok = db === 'ok' && !!process.env.DATABASE_URL && !!process.env.AUTH_SECRET
  return NextResponse.json({ ok, db }, { status: ok ? 200 : 503 })
}
