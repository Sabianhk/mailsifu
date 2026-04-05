import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { prisma } = await import('@/lib/prisma')
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({
      ok: true,
      dbUrlPrefix: process.env.DATABASE_URL?.substring(0, 60) + '...',
    })
  } catch (err) {
    return NextResponse.json({
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      dbUrlPrefix: process.env.DATABASE_URL?.substring(0, 60) + '...',
    }, { status: 500 })
  }
}
