import { notFound, redirect } from 'next/navigation'
import { after } from 'next/server'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getSession, getMembership } from '@/lib/workspace'
import { Sidebar } from '@/components/Sidebar'
import { TopBar } from '@/components/TopBar'
import { archiveMessage } from '../actions'

function getInitials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function confidenceBadge(confidence: string | null) {
  if (confidence === 'high') return { label: 'High confidence', bg: '#f0fdf4', color: '#16a34a' }
  if (confidence === 'medium') return { label: 'Medium confidence', bg: '#fffbeb', color: '#d97706' }
  return { label: 'Low confidence', bg: '#fef2f2', color: '#dc2626' }
}

export const revalidate = 10

export default async function MessageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, session, membership] = await Promise.all([
    params,
    getSession(),
    getMembership(),
  ])

  if (!membership) notFound()

  const message = await prisma.receivedMessage.findFirst({
    where: { id, mailDomain: { workspaceId: membership.workspaceId } },
    include: { otpExtraction: true, mailDomain: true },
  })

  if (!message) notFound()

  // Mark as read in background — call prisma directly since auth() is unavailable in after()
  if (!message.isRead) {
    after(() =>
      prisma.receivedMessage
        .update({ where: { id: message.id }, data: { isRead: true } })
        .catch(() => {})
    )
  }

  const userName = session?.user?.name ?? session?.user?.email ?? 'User'
  const otp = message.otpExtraction
  const badge = otp?.confidence ? confidenceBadge(otp.confidence) : null

  return (
    <>
      <Sidebar activePage="inbox" userName={userName} userEmail={session?.user?.email ?? ''} />
      <main className="flex-1 flex flex-col overflow-hidden" style={{ background: '#fdf8f5' }}>
        <TopBar breadcrumb={['Inbox', message.subject]} userName={userName} />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-8 py-10">
            {/* Back */}
            <Link
              href="/app/inbox"
              className="inline-flex items-center gap-2 text-[13px] font-medium mb-8 transition-colors hover:opacity-70"
              style={{ color: '#695950', fontFamily: 'var(--font-manrope)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back to inbox
            </Link>

            {/* OTP highlight */}
            {otp?.otpCode && (
              <div
                className="mb-8 px-6 py-5 rounded-2xl flex items-center justify-between gap-4"
                style={{ background: '#FFF0E8', border: '0.5px solid rgba(232,98,58,0.2)' }}
              >
                <div>
                  <p
                    className="text-[11px] font-mono uppercase tracking-widest mb-1"
                    style={{ color: '#D09A80' }}
                  >
                    OTP Code
                  </p>
                  <p
                    className="text-4xl font-bold tracking-[0.2em]"
                    style={{ fontFamily: 'var(--font-mono)', color: '#E8623A' }}
                  >
                    {otp.otpCode}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {badge && (
                    <span
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: badge.bg, color: badge.color }}
                    >
                      {badge.label}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Header */}
            <div className="mb-8">
              <h1
                className="text-2xl font-bold mb-5 tracking-tight"
                style={{ fontFamily: 'var(--font-manrope)', color: '#1C1410', letterSpacing: '-0.02em' }}
              >
                {message.subject}
              </h1>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                    style={{ background: '#1C1410' }}
                  >
                    {getInitials(message.fromName ?? message.fromEmail)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold" style={{ color: '#1C1410' }}>
                      {message.fromName ?? message.fromEmail}
                    </span>
                    <span className="text-[12px]" style={{ color: '#695950' }}>
                      {message.fromEmail}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className="text-[11px] px-2 py-1 rounded"
                    style={{ fontFamily: 'var(--font-mono)', color: '#695950', background: '#f7f3f0' }}
                  >
                    {new Date(message.receivedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    {' · '}
                    {new Date(message.receivedAt).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </p>
                  <p className="text-[11px] mt-1" style={{ color: '#8c716a', fontFamily: 'var(--font-mono)' }}>
                    to {message.toEmail}
                  </p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="mb-8" style={{ borderTop: '0.5px solid rgba(238,184,152,0.25)' }} />

            {/* Body — plain text preferred, sandboxed iframe for HTML-only emails */}
            {message.bodyText ? (
              <div
                className="text-[14px] leading-[1.7] whitespace-pre-line"
                style={{ color: '#1C1410', fontFamily: 'var(--font-body)' }}
              >
                {message.bodyText}
              </div>
            ) : message.bodyHtml ? (
              <iframe
                srcDoc={message.bodyHtml}
                sandbox=""
                title="Email content"
                className="w-full border-0 min-h-[400px]"
                style={{ background: '#fff', borderRadius: '8px' }}
              />
            ) : (
              <div
                className="text-[14px] leading-[1.7]"
                style={{ color: '#695950', fontFamily: 'var(--font-body)' }}
              >
                (No content)
              </div>
            )}

            {/* Actions */}
            <div className="mt-12 pt-8 flex gap-3" style={{ borderTop: '0.5px solid rgba(238,184,152,0.2)' }}>
              <form action={archiveMessage.bind(null, message.id)}>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium transition-colors hover:bg-[#f0ebe8]"
                  style={{ color: '#695950', background: '#f7f3f0', border: '0.5px solid rgba(238,184,152,0.3)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="21 8 21 21 3 21 3 8" />
                    <rect x="1" y="3" width="22" height="5" />
                    <line x1="10" y1="12" x2="14" y2="12" />
                  </svg>
                  Archive
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
