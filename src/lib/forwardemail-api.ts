/**
 * Forward Email API client — domain & alias management.
 * Docs: https://forwardemail.net/en/email-api
 * Auth: Basic (API key as username, empty password)
 */

const BASE = 'https://api.forwardemail.net'

export type FEDomain = {
  id: string
  domain: string
  plan: string
  is_global: boolean
  has_adult_content: boolean
  created_at: string
  updated_at: string
  verification_record?: string
  has_mx_record?: boolean
  has_txt_record?: boolean
  has_dkim_record?: boolean
  has_return_path_record?: boolean
  has_dmarc_record?: boolean
  has_spf_record?: boolean
  smtp_dns_records?: {
    dkim?: { name: string; value: string }
    return_path?: { name: string; value: string }
    dmarc?: { name: string; value: string }
  }
}

export type FEDnsRecord = {
  type: string // 'MX', 'TXT', 'CNAME'
  name: string
  value: string
  priority?: number
}

export type FEVerifyResult = {
  type: string // 'MX', 'TXT', 'CNAME'
  record: FEDnsRecord
  success: boolean
  message?: string
}

export type FEAlias = {
  id: string
  name: string
  recipients: string[]
  is_enabled: boolean
  has_imap: boolean
  labels: string[]
}

function headers() {
  const key = process.env.FORWARD_EMAIL_API_KEY
  if (!key) throw new Error('FORWARD_EMAIL_API_KEY is not set')
  // Basic auth: API key as username, empty password
  return {
    Authorization: `Basic ${Buffer.from(key + ':').toString('base64')}`,
    'Content-Type': 'application/json',
  }
}

/**
 * Create a new domain on Forward Email.
 */
export async function createDomain(domain: string): Promise<FEDomain> {
  const res = await fetch(`${BASE}/v1/domains`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ domain, has_adult_content: false }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`FE createDomain failed (${res.status}): ${body}`)
  }
  return res.json()
}

/**
 * Get domain details by ID or domain name.
 */
export async function getDomain(domainIdOrName: string): Promise<FEDomain> {
  const res = await fetch(`${BASE}/v1/domains/${encodeURIComponent(domainIdOrName)}`, {
    headers: headers(),
    cache: 'no-store',
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`FE getDomain failed (${res.status}): ${body}`)
  }
  return res.json()
}

/**
 * Verify DNS records for a domain.
 * Returns array of verification results per record type.
 */
export async function verifyDomainRecords(domainId: string): Promise<FEVerifyResult[]> {
  const res = await fetch(`${BASE}/v1/domains/${encodeURIComponent(domainId)}/verify-records`, {
    headers: headers(),
    cache: 'no-store',
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`FE verifyDomainRecords failed (${res.status}): ${body}`)
  }
  const text = await res.text()
  // API returns plain text on success, JSON array on detailed results
  try {
    const parsed = JSON.parse(text)
    if (Array.isArray(parsed)) return parsed
  } catch {
    // Plain text response means all records verified
  }
  // Return all-verified result when API sends plain text confirmation
  return [
    { type: 'MX', record: { type: 'MX', name: '@', value: 'mx1.forwardemail.net', priority: 0 }, success: true },
    { type: 'MX', record: { type: 'MX', name: '@', value: 'mx2.forwardemail.net', priority: 0 }, success: true },
    { type: 'TXT', record: { type: 'TXT', name: '@', value: '' }, success: true },
    { type: 'TXT', record: { type: 'TXT', name: '_dmarc', value: '' }, success: true },
    { type: 'TXT', record: { type: 'TXT', name: '', value: '' }, success: true },
  ]
}

/**
 * Create an alias for a domain.
 * @param domainId - Forward Email domain ID
 * @param name - Alias name (e.g. "catch-all" or specific address like "otp")
 * @param recipients - Array of recipient URLs/emails (webhook URL or email addresses)
 */
export async function createAlias(
  domainId: string,
  name: string,
  recipients: string[]
): Promise<FEAlias> {
  const res = await fetch(`${BASE}/v1/domains/${encodeURIComponent(domainId)}/aliases`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ name, recipients, is_enabled: true }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`FE createAlias failed (${res.status}): ${body}`)
  }
  return res.json()
}

/**
 * List aliases for a domain.
 */
export async function listAliases(domainId: string): Promise<FEAlias[]> {
  const res = await fetch(`${BASE}/v1/domains/${encodeURIComponent(domainId)}/aliases`, {
    headers: headers(),
    cache: 'no-store',
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`FE listAliases failed (${res.status}): ${body}`)
  }
  return res.json()
}

/**
 * Delete an alias from a domain.
 */
export async function deleteAlias(
  domainId: string,
  aliasId: string
): Promise<void> {
  const res = await fetch(`${BASE}/v1/domains/${encodeURIComponent(domainId)}/aliases/${encodeURIComponent(aliasId)}`, {
    method: 'DELETE',
    headers: headers(),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`FE deleteAlias failed (${res.status}): ${body}`)
  }
}
