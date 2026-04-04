'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { createDomain as feCreateDomain, createAlias as feCreateAlias } from '@/lib/forwardemail-api'

const _baseUrl = (process.env.AUTH_URL ?? 'https://staging.mailsifu.com').replace(/\/$/, '')
const WEBHOOK_URL = `${_baseUrl}/api/webhooks/forwardemail`

export async function addDomain(
  _prev: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Unauthenticated' }

  const domain = (formData.get('domain') as string | null)?.trim().toLowerCase()
  if (!domain || !/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(domain)) {
    return { error: 'Enter a valid domain name (e.g. mail.example.com)' }
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id },
    select: { workspaceId: true },
  })
  if (!membership) return { error: 'No workspace found' }

  const existing = await prisma.mailDomain.findUnique({ where: { domain } })
  if (existing) return { error: 'This domain is already registered' }

  // Register with Forward Email first to get the domain ID and create catch-all alias
  let feDomainId: string | undefined
  try {
    const feDomain = await feCreateDomain(domain)
    feDomainId = feDomain.id

    // Create catch-all alias with webhook URL as recipient
    // This ensures all incoming email to any address on this domain hits our webhook
    await feCreateAlias(feDomain.id, '*', [WEBHOOK_URL])
  } catch (err) {
    // Don't block DB creation if FE fails — user can retry from the detail page
    console.error('[addDomain] ForwardEmail createDomain error:', err instanceof Error ? err.message : err)
  }

  await prisma.mailDomain.create({
    data: {
      workspaceId: membership.workspaceId,
      domain,
      status: 'pending',
      // resendDomainId: legacy column name — actually stores Forward Email domain ID.
      // Kept as-is to avoid a DB migration; see MailDomain model in schema.prisma.
      resendDomainId: feDomainId ?? null,
    },
  })

  revalidatePath('/app/domains')
  return {}
}
