import { NextResponse } from 'next/server'

/**
 * Legacy Resend inbound webhook — replaced by Forward Email.
 * Returns 410 Gone so Resend stops retrying if any webhooks are still configured.
 */
export async function POST() {
  return NextResponse.json(
    { error: 'This endpoint has been deprecated. Inbound email is now handled via Forward Email.' },
    { status: 410 }
  )
}
