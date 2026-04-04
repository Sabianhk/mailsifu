import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/Sidebar'
import { TopBar } from '@/components/TopBar'
import { getSession, getMembership } from '@/lib/workspace'
import { AddDomainForm } from './AddDomainForm'

function formatVerified(date: Date | null) {
  if (!date) return null
  const diff = Date.now() - new Date(date).getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 24) return `Verified ${hours}h ago`
  return `Verified ${Math.floor(hours / 24)}d ago`
}

function getStatusConfig(status: string) {
  if (status === 'verified') return { label: 'Verified', bg: '#f4dfcb', color: '#524536', dot: '#832800' }
  if (status === 'pending') return { label: 'Pending DNS', bg: '#e5e2da', color: '#5f5e58', dot: '#8b726a' }
  return { label: 'Error', bg: '#ffdad6', color: '#ba1a1a', dot: '#ba1a1a' }
}

export const revalidate = 30

export default async function DomainsPage() {
  const [session, membership] = await Promise.all([getSession(), getMembership()])

  const userName = session?.user?.name ?? session?.user?.email ?? 'User'

  const isAdmin = membership?.role === 'owner'

  const domains = membership
    ? await prisma.mailDomain.findMany({
        where: { workspaceId: membership.workspaceId },
        orderBy: { createdAt: 'asc' },
        include: { _count: { select: { aliases: true, messages: true } } },
      })
    : []

  return (
    <>
      <Sidebar activePage="domains" userName={userName} userEmail={session?.user?.email ?? ''} isAdmin={isAdmin} />
      <main className="flex-1 flex flex-col overflow-hidden" style={{ background: '#fcf9f6' }}>
        <TopBar breadcrumb={['Workspace', 'Domains']} showSearch searchPlaceholder="Search domains…" userName={userName} />

        <section className="flex-1 overflow-y-auto px-4 md:px-10 py-6 md:py-12">
          <div className="max-w-6xl mx-auto">
            {/* Editorial header */}
            <div className="mb-12">
              <h1
                className="text-2xl md:text-4xl"
                style={{
                  fontFamily: 'var(--font-newsreader)',
                  color: '#1c1c1a',
                  fontWeight: 600,
                  lineHeight: 1.1,
                  marginBottom: '0.75rem',
                }}
              >
                Receiving Domains
              </h1>
              <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '0.9375rem', color: '#5f5e58', maxWidth: '28rem' }}>
                Domains configured for OTP email ingestion via Forward Email.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {domains.map((domain: typeof domains[number]) => {
                const badge = getStatusConfig(domain.status)
                const verifiedText = formatVerified(domain.verifiedAt)
                return (
                  <Link
                    key={domain.id}
                    href={`/app/domains/${domain.id}`}
                    className="group relative rounded-xl p-4 md:p-6 flex flex-col gap-4 transition-all duration-300 soft-elevation md:hover:translate-y-[-2px] overflow-hidden"
                    style={{ background: '#ffffff', textDecoration: 'none' }}
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 transition-transform duration-300 group-hover:scale-110" style={{ background: 'rgba(131,40,0,0.04)' }} />
                    <div className="relative">
                      <h3
                        className="font-bold text-base md:text-lg mb-1 truncate"
                        style={{ fontFamily: 'var(--font-manrope)', color: '#1c1c1a' }}
                      >
                        {domain.domain}
                      </h3>
                      <span
                        className="text-[11px] uppercase tracking-wider"
                        style={{ fontFamily: 'var(--font-manrope)', color: '#8b726a' }}
                      >
                        {domain._count.aliases} {domain._count.aliases === 1 ? 'alias' : 'aliases'} · {domain._count.messages} messages
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-4" style={{ borderTop: '1px solid rgba(222,192,183,0.2)' }}>
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs md:text-sm font-semibold"
                        style={{ background: badge.bg, color: badge.color }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: badge.dot }} />
                        {badge.label}
                      </span>
                      {verifiedText && (
                        <span
                          className="text-[11px] italic"
                          style={{ fontFamily: 'var(--font-newsreader)', color: '#8b726a' }}
                        >
                          {verifiedText}
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })}

              {/* Add domain card */}
              <div
                className="rounded-xl p-4 md:p-6 flex flex-col gap-4"
                style={{ border: '2px dashed rgba(139,114,106,0.25)', background: 'transparent' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: '#ffffff', boxShadow: '0 2px 12px rgba(28,28,26,0.06)' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#832800' }}>add_circle</span>
                  </div>
                  <div>
                    <span
                      className="block font-bold"
                      style={{ fontFamily: 'var(--font-manrope)', color: '#1c1c1a' }}
                    >
                      Add Domain
                    </span>
                    <span
                      className="text-xs italic"
                      style={{ fontFamily: 'var(--font-newsreader)', color: '#5f5e58' }}
                    >
                      Configure a receiving domain
                    </span>
                  </div>
                </div>
                <AddDomainForm />
              </div>
            </div>

            {/* Stats */}
            <div className="mt-16 pt-8 flex flex-wrap gap-6 md:gap-12" style={{ borderTop: '1px solid rgba(222,192,183,0.2)' }}>
              {[
                { label: 'Total Domains', value: domains.length.toString().padStart(2, '0') },
                { label: 'Verified', value: domains.filter((d: typeof domains[number]) => d.status === 'verified').length.toString().padStart(2, '0') },
              ].map((stat) => (
                <div key={stat.label} className="space-y-1">
                  <span
                    className="uppercase tracking-widest"
                    style={{ fontFamily: 'var(--font-manrope)', fontSize: '0.625rem', color: '#8b726a' }}
                  >
                    {stat.label}
                  </span>
                  <p
                    className="text-xl font-bold"
                    style={{ fontFamily: 'var(--font-newsreader)', color: '#1c1c1a' }}
                  >
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
