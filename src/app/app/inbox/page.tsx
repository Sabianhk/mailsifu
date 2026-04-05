import { after } from 'next/server'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { TopBar } from '@/components/TopBar'
import { getSession, getMembership } from '@/lib/workspace'
import { InboxView } from './InboxView'

const getCachedFilterOptions = unstable_cache(
  async (workspaceId: string) => {
    const workspaceFilter = { mailDomain: { workspaceId } }
    const [domainRows, aliasRows] = await Promise.all([
      prisma.receivedMessage.findMany({
        where: { isArchived: false, ...workspaceFilter },
        select: { mailDomain: { select: { domain: true } } },
        distinct: ['mailDomainId'],
      }),
      prisma.receivedMessage.findMany({
        where: { isArchived: false, ...workspaceFilter },
        select: { toEmail: true, mailAlias: { select: { label: true } } },
        distinct: ['toEmail'],
      }),
    ])
    return {
      domains: domainRows.map((r) => r.mailDomain.domain),
      aliases: aliasRows.map((r) => ({ address: r.toEmail, label: r.mailAlias?.label ?? null })),
    }
  },
  ['inbox-filter-options'],
  { revalidate: 30, tags: ['inbox-filters'] }
)

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; domain?: string; alias?: string }>
}) {
  const [session, membership, params] = await Promise.all([
    getSession(),
    getMembership(),
    searchParams,
  ])

  const { id: selectedId, domain: filterDomain, alias: filterAlias } = params

  const workspaceFilter = membership
    ? { mailDomain: { workspaceId: membership.workspaceId } }
    : { id: 'none' as const }

  // Run message query and cached filter options in parallel
  const [messages, filterOptions] = await Promise.all([
    prisma.receivedMessage.findMany({
      where: {
        isArchived: false,
        ...workspaceFilter,
        ...(filterDomain ? { mailDomain: { ...workspaceFilter.mailDomain, domain: filterDomain } } : {}),
        ...(filterAlias ? { toEmail: filterAlias } : {}),
      },
      orderBy: { receivedAt: 'desc' },
      take: 50,
      select: {
        id: true,
        fromName: true,
        fromEmail: true,
        toEmail: true,
        subject: true,
        bodyText: true,
        bodyHtml: true,
        receivedAt: true,
        isRead: true,
        isArchived: true,
        otpExtraction: { select: { otpCode: true } },
        mailDomain: { select: { domain: true } },
        mailAlias: { select: { label: true } },
      },
    }),
    membership
      ? getCachedFilterOptions(membership.workspaceId)
      : { domains: [] as string[], aliases: [] as { address: string; label: string | null }[] },
  ])

  const { domains: domainOptions, aliases: aliasOptions } = filterOptions

  const activeMessage = (selectedId ? messages.find((m) => m.id === selectedId) : null) ?? messages[0] ?? null

  if (activeMessage && !activeMessage.isRead) {
    // Mark as read in background — call prisma directly since auth() is unavailable in after()
    after(() =>
      prisma.receivedMessage
        .update({ where: { id: activeMessage.id }, data: { isRead: true } })
        .catch(() => {})
    )
  }

  const isAdmin = membership?.role === 'owner'
  const userName = session?.user?.name ?? session?.user?.email ?? 'User'

  const serialize = (m: typeof messages[number]) => ({
    id: m.id,
    fromName: m.fromName,
    fromEmail: m.fromEmail,
    toEmail: m.toEmail,
    subject: m.subject,
    bodyText: m.bodyText,
    bodyHtml: m.bodyHtml,
    receivedAt: m.receivedAt.toISOString(),
    isRead: m.isRead,
    isArchived: m.isArchived,
    otpExtraction: m.otpExtraction ? { otpCode: m.otpExtraction.otpCode } : null,
    domain: m.mailDomain.domain,
    aliasLabel: m.mailAlias?.label ?? null,
  })

  const serializedMessages = messages.map(serialize)
  const serializedActive = activeMessage ? serialize(activeMessage) : null

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-surface">
      <TopBar
        breadcrumb={['Inbox']}
        showSearch={false}
        userName={userName}
      />
      <InboxView
        messages={serializedMessages}
        activeMessage={serializedActive}
        hasExplicitSelection={!!selectedId}
        domains={domainOptions}
        aliases={aliasOptions}
        activeDomain={filterDomain ?? null}
        activeAlias={filterAlias ?? null}
      />
    </main>
  )
}
