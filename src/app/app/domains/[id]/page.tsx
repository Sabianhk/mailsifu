import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getSession, getMembership } from '@/lib/workspace'
import { Sidebar } from '@/components/Sidebar'
import { TopBar } from '@/components/TopBar'
import { VerifyButton } from './VerifyButton'
import { AliasSection } from './AliasSection'
import { CopyButtonScript } from './CopyButtonScript'
import { getDomainStatus, type DnsRecordWithStatus } from './actions'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string; dot: string }> = {
    verified: { label: 'Verified', bg: '#f4dfcb', color: '#3d2010', dot: '#832800' },
    pending: { label: 'Pending DNS', bg: '#e5e2da', color: '#3d3d38', dot: '#5f5e58' },
    not_started: { label: 'Pending DNS', bg: '#e5e2da', color: '#3d3d38', dot: '#5f5e58' },
    failed: { label: 'Failed', bg: '#ffdad6', color: '#ba1a1a', dot: '#ba1a1a' },
  }
  const badge = map[status] ?? map.failed
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase"
      style={{ background: badge.bg, color: badge.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: badge.dot }} />
      {badge.label}
    </span>
  )
}

function RecordTypeTag({ type }: { type: string }) {
  return (
    <span
      className="inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider"
      style={{ background: '#e5e2da', color: '#5f5e58', fontFamily: 'var(--font-manrope)' }}
    >
      {type}
    </span>
  )
}

function RecordRow({ rec }: { rec: DnsRecordWithStatus }) {
  const isVerified = rec.verified === true
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-4 items-center px-4 py-5 rounded-xl transition-all group gap-2 md:gap-0"
      style={{ background: 'rgba(255,255,255,0.7)', cursor: 'default' }}
    >
      {/* Type */}
      <div className="md:col-span-1 flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest md:hidden" style={{ color: '#8b726a', fontFamily: 'var(--font-manrope)', minWidth: '3rem' }}>Type</span>
        <RecordTypeTag type={rec.type} />
      </div>

      {/* Host */}
      <div className="md:col-span-1 flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest md:hidden" style={{ color: '#8b726a', fontFamily: 'var(--font-manrope)', minWidth: '3rem' }}>Host</span>
        <span
          className="text-sm font-medium"
          style={{ color: '#1c1c1a', fontFamily: 'var(--font-manrope)' }}
        >
          {rec.name}
        </span>
      </div>

      {/* Value */}
      <div className="md:col-span-2 flex items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
          <span className="text-[10px] font-bold uppercase tracking-widest md:hidden flex-shrink-0" style={{ color: '#8b726a', fontFamily: 'var(--font-manrope)', minWidth: '3rem' }}>Value</span>
          <code
            className="text-xs block truncate min-w-0"
            style={{ fontFamily: 'var(--font-manrope)', color: '#5f5e58' }}
            title={rec.value}
          >
            {rec.value}
            {rec.priority !== undefined ? ` (priority ${rec.priority})` : ''}
          </code>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isVerified && (
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '16px', color: '#832800', fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          )}
          <button
            type="button"
            data-copy={rec.value ?? ''}
            className="copy-btn p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            style={{ color: '#8b726a' }}
          >
            <span className="material-symbols-outlined hover:text-[#832800]" style={{ fontSize: '18px' }}>content_copy</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export const revalidate = 30

export default async function DomainDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Parallelize params resolution with auth+membership lookup
  const [{ id }, session, membership] = await Promise.all([params, getSession(), getMembership()])
  if (!membership) redirect('/app/domains')

  const userName = session?.user?.name ?? session?.user?.email ?? 'User'

  const domain = await prisma.mailDomain.findFirst({
    where: { id, workspaceId: membership.workspaceId },
  })
  if (!domain) notFound()

  // Fetch DNS records and per-record verification status from server action
  let records: DnsRecordWithStatus[] = []
  const domainStatus = await getDomainStatus(domain.id)
  if (domainStatus.records) {
    records = domainStatus.records
  }

  const aliases = await prisma.mailAlias.findMany({
    where: { mailDomainId: id },
    orderBy: { createdAt: 'asc' },
    select: { id: true, address: true, label: true, createdAt: true },
  })

  const isVerified = domain.status === 'verified'

  return (
    <>
      <Sidebar activePage="domains" userName={userName} userEmail={session?.user?.email ?? ''} />
      <main className="flex-1 flex flex-col overflow-hidden bg-surface">
        <TopBar
          breadcrumb={['Workspace', 'Domains', domain.domain]}
          showSearch={false}
          userName={userName}
        />

        <section className="flex-1 overflow-y-auto px-4 md:px-12 py-6 md:py-12">
          <div className="max-w-5xl mx-auto">

            {/* Editorial Header */}
            <div className="mb-10 md:mb-16">
              <nav className="flex items-center gap-2 mb-6" style={{ fontFamily: 'var(--font-manrope)', fontSize: '0.75rem', color: '#5f5e58' }}>
                <Link href="/app/domains" className="hover:text-[#832800] transition-colors" style={{ color: '#5f5e58', textDecoration: 'none' }}>
                  Domains
                </Link>
                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#dec0b7' }}>chevron_right</span>
                <span style={{ color: '#1c1c1a' }}>Verification</span>
              </nav>

              <div className="grid grid-cols-1 md:grid-cols-12 items-start gap-4 md:gap-8">
                {/* Heading */}
                <div className="col-span-12 md:col-span-7">
                  <h1
                    className="text-3xl md:text-5xl break-all"
                    style={{
                      fontFamily: 'var(--font-newsreader)',
                      color: '#1c1c1a',
                      fontWeight: 600,
                      lineHeight: 1.1,
                    }}
                  >
                    {domain.domain}
                  </h1>
                </div>

                {/* Description */}
                <div className="col-span-12 md:col-span-5 md:pt-10">
                  <div className="flex items-center gap-3 mb-4">
                    <StatusBadge status={domain.status} />
                    <span
                      className="text-sm italic"
                      style={{ fontFamily: 'var(--font-newsreader)', color: '#5f5e58' }}
                    >
                      {isVerified ? 'Ready to receive mail.' : 'Awaiting DNS verification…'}
                    </span>
                  </div>
                  {!isVerified && (
                    <div className="flex flex-col items-start gap-2">
                      <VerifyButton mailDomainId={domain.id} />
                      <p
                        className="uppercase tracking-tighter opacity-60"
                        style={{ fontFamily: 'var(--font-manrope)', fontSize: '0.625rem', color: '#5f5e58' }}
                      >
                        Added {new Date(domain.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-12 gap-6 md:gap-10">

              {/* Status card */}
              <div className="col-span-12 lg:col-span-5">
                <div
                  className="p-6 md:p-10 rounded-2xl soft-elevation relative overflow-hidden"
                  style={{ background: '#ffffff' }}
                >
                  <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl" style={{ background: 'rgba(131,40,0,0.05)' }} />
                  <div className="relative z-10">
                    {isVerified ? (
                      <>
                        <div
                          className="w-12 h-12 flex items-center justify-center rounded-xl mb-6"
                          style={{ background: '#f4dfcb' }}
                        >
                          <span className="material-symbols-outlined" style={{ color: '#832800', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        </div>
                        <h2
                          className="text-2xl mb-4"
                          style={{ fontFamily: 'var(--font-newsreader)', color: '#1c1c1a', fontWeight: 600 }}
                        >
                          Domain verified
                        </h2>
                        <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '0.9375rem', color: '#5f5e58', lineHeight: 1.7 }}>
                          <strong style={{ color: '#1c1c1a' }}>{domain.domain}</strong> is fully verified and ready to receive inbound emails via Forward Email.
                        </p>
                      </>
                    ) : (
                      <>
                        <div
                          className="w-12 h-12 flex items-center justify-center rounded-xl mb-6"
                          style={{ background: 'rgba(186,26,26,0.08)' }}
                        >
                          <span className="material-symbols-outlined" style={{ color: '#ba1a1a' }}>domain_disabled</span>
                        </div>
                        <h2
                          className="text-2xl mb-4"
                          style={{ fontFamily: 'var(--font-newsreader)', color: '#1c1c1a', fontWeight: 600 }}
                        >
                          {!domain.resendDomainId ? 'Not yet registered' : 'Pending verification'}
                        </h2>
                        <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '0.9375rem', color: '#5f5e58', lineHeight: 1.7, marginBottom: '2rem' }}>
                          {!domain.resendDomainId
                            ? <>The domain <strong style={{ color: '#1c1c1a' }}>{domain.domain}</strong> hasn&rsquo;t been registered with Forward Email yet. Click &ldquo;Check Verification&rdquo; to register and get DNS records.</>
                            : <>Add the DNS records shown to the right in your registrar. Propagation can take up to 72 hours.</>
                          }
                        </p>
                        {domain.resendDomainId && (
                          <div
                            className="flex items-center gap-4 p-4 rounded-lg"
                            style={{ background: '#f4dfcb' }}
                          >
                            <span className="material-symbols-outlined text-sm" style={{ color: '#832800', fontVariationSettings: "'FILL' 1", fontSize: '16px' }}>info</span>
                            <span style={{ fontFamily: 'var(--font-manrope)', fontSize: '0.8125rem', color: '#524536' }}>
                              Copy each record value exactly as shown.
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* DNS Records table */}
              {records.length > 0 && (
                <div className="col-span-12 lg:col-span-7">
                  <div
                    className="glass-panel p-4 md:p-8 rounded-2xl"
                    style={{ outline: '1px solid rgba(222,192,183,0.35)' }}
                  >
                    <div className="flex items-center justify-between mb-6 md:mb-8">
                      <h3
                        className="italic"
                        style={{ fontFamily: 'var(--font-newsreader)', fontSize: '1.25rem', color: '#1c1c1a', fontWeight: 600 }}
                      >
                        Required Records
                      </h3>
                      <span
                        className="uppercase tracking-widest"
                        style={{ fontFamily: 'var(--font-manrope)', fontSize: '0.625rem', fontWeight: 700, color: '#5f5e58' }}
                      >
                        Type: DNS Settings
                      </span>
                    </div>

                    <div className="space-y-2 md:space-y-1">
                      {/* Table header — desktop only */}
                      <div
                        className="hidden md:grid grid-cols-4 px-4 py-3 uppercase tracking-widest"
                        style={{ fontFamily: 'var(--font-manrope)', fontSize: '0.625rem', color: '#5f5e58', fontWeight: 700 }}
                      >
                        <div className="col-span-1">Type</div>
                        <div className="col-span-1">Host</div>
                        <div className="col-span-2">Value</div>
                      </div>

                      {records.map((rec, i) => (
                        <RecordRow key={i} rec={rec} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* If no records yet and not verified */}
              {records.length === 0 && !isVerified && (
                <div className="col-span-12 lg:col-span-7 flex items-center justify-center" style={{ minHeight: '12rem' }}>
                  <div className="text-center">
                    <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#dec0b7', display: 'block', marginBottom: '1rem' }}>dns</span>
                    <p style={{ fontFamily: 'var(--font-newsreader)', fontStyle: 'italic', color: '#8b726a' }}>
                      DNS records will appear here after registration.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Aliases */}
            <div className="grid grid-cols-12 gap-6 md:gap-10 mt-10">
              <AliasSection
                mailDomainId={domain.id}
                domain={domain.domain}
                aliases={aliases.map((a) => ({
                  ...a,
                  createdAt: a.createdAt.toISOString(),
                }))}
              />
            </div>

            {/* Footer */}
            <footer className="mt-20 flex flex-col items-center gap-6 pt-12" style={{ borderTop: '0.5px solid rgba(222,192,183,0.2)' }}>
              <div className="flex gap-4">
                <div className="w-1 h-1 rounded-full" style={{ background: 'rgba(131,40,0,0.2)' }} />
                <div className="w-1 h-1 rounded-full" style={{ background: 'rgba(131,40,0,0.4)' }} />
                <div className="w-1 h-1 rounded-full" style={{ background: 'rgba(131,40,0,0.2)' }} />
              </div>
            </footer>
          </div>
        </section>
      </main>

      <CopyButtonScript />
    </>
  )
}
