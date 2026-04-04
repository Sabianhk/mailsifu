'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import {
  getDomain as feGetDomain,
  verifyDomainRecords as feVerifyDomainRecords,
  createDomain as feCreateDomain,
  createAlias as feCreateAlias,
  deleteAlias as feDeleteAlias,
  listAliases as feListAliases,
  type FEDomain,
  type FEDnsRecord,
} from '@/lib/forwardemail-api'

const _baseUrl = (process.env.AUTH_URL ?? 'https://staging.mailsifu.com').replace(/\/$/, '')
const WEBHOOK_URL = `${_baseUrl}/api/webhooks/forwardemail`

export type DnsRecordWithStatus = FEDnsRecord & { verified: boolean }

async function assertOwnership(mailDomainId: string) {
  const session = await auth()
  if (!session?.user?.id) return null

  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id },
    select: { workspaceId: true },
  })
  if (!membership) return null

  const domain = await prisma.mailDomain.findFirst({
    where: { id: mailDomainId, workspaceId: membership.workspaceId },
  })
  return domain
}

/**
 * Build the full list of required DNS records for a domain,
 * including the verification TXT record from Forward Email.
 */
function buildRequiredRecords(feDomain?: FEDomain | null): DnsRecordWithStatus[] {
  const records: DnsRecordWithStatus[] = [
    { type: 'MX', name: '@', value: 'mx1.forwardemail.net', priority: 10, verified: false },
    { type: 'MX', name: '@', value: 'mx2.forwardemail.net', priority: 10, verified: false },
  ]

  if (feDomain?.verification_record) {
    records.push({
      type: 'TXT',
      name: '@',
      value: `forward-email-site-verification=${feDomain.verification_record}`,
      verified: false,
    })
  }

  return records
}

export async function getDomainStatus(
  mailDomainId: string
): Promise<{ error?: string; status?: string; records?: DnsRecordWithStatus[] }> {
  const domain = await assertOwnership(mailDomainId)
  if (!domain) return { error: 'Not found' }

  // Note: resendDomainId is a legacy column name — it stores the Forward Email domain ID.
  if (!domain.resendDomainId) {
    // Domain not yet registered with FE — show required DNS records (no verification record yet)
    return { status: 'pending', records: buildRequiredRecords() }
  }

  try {
    // Fetch domain details (for verification_record + has_* flags) and trigger verify in parallel
    const [feDomain] = await Promise.all([
      feGetDomain(domain.resendDomainId).catch(() => null),
      feVerifyDomainRecords(domain.resendDomainId).catch(() => null),
    ])

    const records = buildRequiredRecords(feDomain)

    // Update verified status from FE domain flags
    if (feDomain) {
      for (const rec of records) {
        if (rec.type === 'MX') {
          rec.verified = feDomain.has_mx_record === true
        } else if (rec.value.startsWith('forward-email-site-verification=')) {
          rec.verified = feDomain.has_txt_record === true
        }
      }
    }

    const allVerified = records.every((r) => r.verified)
    const mapped = allVerified ? 'verified' : 'pending'

    if (mapped !== domain.status) {
      await prisma.mailDomain.update({
        where: { id: mailDomainId },
        data: {
          status: mapped,
          verifiedAt: mapped === 'verified' ? new Date() : null,
        },
      })
      revalidatePath(`/app/domains/${mailDomainId}`)
      revalidatePath('/app/domains')
    }

    return { status: mapped, records }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to fetch domain status' }
  }
}

export async function verifyDomain(
  mailDomainId: string
): Promise<{ error?: string; status?: string; records?: FEDnsRecord[] }> {
  const domain = await assertOwnership(mailDomainId)
  if (!domain) return { error: 'Not found' }

  // If no Forward Email domain yet, register it now
  if (!domain.resendDomainId) {
    try {
      let feDomain
      try {
        feDomain = await feCreateDomain(domain.domain)
      } catch (createErr) {
        // Domain may already exist on Forward Email — try to retrieve it by name
        try {
          feDomain = await feGetDomain(domain.domain)
        } catch {
          throw createErr
        }
      }
      await prisma.mailDomain.update({
        where: { id: mailDomainId },
        // resendDomainId: legacy column name — stores Forward Email domain ID
        data: { resendDomainId: feDomain.id },
      })
      // Create catch-all alias (ignore error if it already exists)
      try {
        await feCreateAlias(feDomain.id, '*', [WEBHOOK_URL])
      } catch {
        // Alias may already exist; not fatal
      }
      revalidatePath(`/app/domains/${mailDomainId}`)
      return getDomainStatus(mailDomainId)
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to register domain with Forward Email' }
    }
  }

  // Verify records
  return getDomainStatus(mailDomainId)
}

export async function listAliases(
  mailDomainId: string
): Promise<{ error?: string; aliases?: { id: string; address: string; label: string | null; createdAt: Date }[] }> {
  const domain = await assertOwnership(mailDomainId)
  if (!domain) return { error: 'Not found' }

  const aliases = await prisma.mailAlias.findMany({
    where: { mailDomainId },
    orderBy: { createdAt: 'asc' },
    select: { id: true, address: true, label: true, createdAt: true },
  })
  return { aliases }
}

export async function createAlias(
  mailDomainId: string,
  name: string,
  label?: string
): Promise<{ error?: string; success?: boolean }> {
  const domain = await assertOwnership(mailDomainId)
  if (!domain) return { error: 'Not found' }

  if (!name.trim()) return { error: 'Alias name is required' }
  if (!/^[a-zA-Z0-9._-]+$/.test(name.trim())) {
    return { error: 'Alias can only contain letters, numbers, dots, hyphens, and underscores' }
  }

  const address = `${name.trim().toLowerCase()}@${domain.domain}`

  // Check if alias already exists in DB
  const existing = await prisma.mailAlias.findUnique({ where: { address } })
  if (existing) return { error: 'This alias already exists' }

  // Create on Forward Email if domain is registered
  if (domain.resendDomainId) {
    try {
      await feCreateAlias(domain.resendDomainId, name.trim().toLowerCase(), [WEBHOOK_URL])
    } catch (err) {
      // Alias may already exist on FE side — not fatal
      const msg = err instanceof Error ? err.message : ''
      if (!msg.includes('already exists') && !msg.includes('11000')) {
        return { error: err instanceof Error ? err.message : 'Failed to create alias on mail provider' }
      }
    }
  }

  await prisma.mailAlias.create({
    data: {
      mailDomainId,
      address,
      label: label?.trim() || null,
    },
  })

  revalidatePath(`/app/domains/${mailDomainId}`)
  return { success: true }
}

export async function deleteAlias(
  mailDomainId: string,
  aliasId: string
): Promise<{ error?: string; success?: boolean }> {
  const domain = await assertOwnership(mailDomainId)
  if (!domain) return { error: 'Not found' }

  const alias = await prisma.mailAlias.findFirst({
    where: { id: aliasId, mailDomainId },
  })
  if (!alias) return { error: 'Alias not found' }

  // Delete from Forward Email if domain is registered
  // We need to find the FE alias ID — use listAliases from FE API
  if (domain.resendDomainId) {
    try {
      const feAliases = await feListAliases(domain.resendDomainId)
      const localPart = alias.address.split('@')[0]
      const feAlias = feAliases.find((a) => a.name === localPart)
      if (feAlias) {
        await feDeleteAlias(domain.resendDomainId, feAlias.id)
      }
    } catch {
      // Not fatal — still delete from DB
    }
  }

  await prisma.mailAlias.delete({ where: { id: aliasId } })
  revalidatePath(`/app/domains/${mailDomainId}`)
  return { success: true }
}
