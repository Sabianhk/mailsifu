import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { getDomain, verifyDomainRecords } = await import('@/lib/forwardemail-api')

    // mailsifu.com Forward Email domain ID from DB
    const feId = '69cab1d57a71aae6524f6b26'

    const [domainData, verifyResult] = await Promise.all([
      getDomain(feId).catch((e: Error) => ({ error: e.message })),
      verifyDomainRecords(feId).catch((e: Error) => ({ error: e.message })),
    ])

    return NextResponse.json({
      domain: domainData,
      verify: verifyResult,
    })
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : String(err),
    }, { status: 500 })
  }
}
