'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition, useCallback } from 'react'
import { archiveMessage } from './actions'
import { SearchableSelect } from '@/components/SearchableSelect'

type OtpExtraction = { otpCode: string | null } | null

interface Message {
  id: string
  fromName: string | null
  fromEmail: string
  toEmail: string
  subject: string
  bodyText: string | null
  bodyHtml: string | null
  receivedAt: string
  isRead: boolean
  isArchived: boolean
  otpExtraction: OtpExtraction
  domain: string
  aliasLabel: string | null
}

interface InboxViewProps {
  messages: Message[]
  activeMessage: Message | null
  hasExplicitSelection: boolean
  domains: string[]
  aliases: { address: string; label: string | null }[]
  activeDomain: string | null
  activeAlias: string | null
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  if (diff < 24 * 60 * 60 * 1000)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  if (diff < 48 * 60 * 60 * 1000) return 'Yesterday'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getInitials(name: string) {
  return name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2)
}

export function InboxView({ messages, activeMessage: initialActiveMessage, hasExplicitSelection, domains, aliases, activeDomain, activeAlias }: InboxViewProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [copiedOtp, setCopiedOtp] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(initialActiveMessage?.id ?? null)
  const [hasUserSelected, setHasUserSelected] = useState(hasExplicitSelection)

  // Derive active message from client-side state
  const activeMessage = (selectedId ? messages.find((m) => m.id === selectedId) : null) ?? messages[0] ?? null

  // On mobile: show detail only when user explicitly selected a message
  const showDetailOnMobile = hasUserSelected && activeMessage !== null

  const handleSelectMessage = useCallback((msgId: string) => {
    setSelectedId(msgId)
    setHasUserSelected(true)
    // Update URL for bookmarkability without triggering server navigation
    window.history.replaceState(null, '', `/app/inbox?id=${msgId}`)
  }, [])

  function handleCopyOtp(code: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        setCopiedOtp(true)
        setTimeout(() => setCopiedOtp(false), 2000)
      }).catch(() => {})
    } else {
      // fallback for older browsers
      const el = document.createElement('textarea')
      el.value = code
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopiedOtp(true)
      setTimeout(() => setCopiedOtp(false), 2000)
    }
  }

  function handleArchive() {
    if (!activeMessage) return
    startTransition(async () => {
      await archiveMessage(activeMessage.id)
      setSelectedId(null)
      setHasUserSelected(false)
      router.push('/app/inbox')
      router.refresh()
    })
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Message list */}
      <section
        className={[
          'overflow-hidden flex-shrink-0',
          'w-full md:w-[380px]',
          // On mobile: hide list when showing detail
          showDetailOnMobile ? 'hidden md:flex md:flex-col' : 'flex flex-col',
        ].join(' ')}
        style={{ background: '#f6f3f0' }}
      >
        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <span
              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ fontSize: '16px', color: '#8b726a' }}
            >
              search
            </span>
            <input
              className="w-full py-2.5 pl-9 pr-4 rounded-lg text-base focus:outline-none cursor-not-allowed"
              style={{ background: '#f0edea', color: '#8b726a', fontFamily: 'var(--font-manrope)', border: 'none', opacity: 0.6 }}
              placeholder="Search messages…"
              disabled
            />
          </div>
        </div>

        {/* Filter dropdowns */}
        <div className="flex items-center gap-2 px-5 pb-3" style={{ fontFamily: 'var(--font-manrope)', fontSize: '0.75rem' }}>
          <SearchableSelect
            options={domains.map((d) => ({ value: d, label: d }))}
            selectedValue={activeDomain}
            placeholder="All Domains"
            onChange={(val) => {
              const params = new URLSearchParams()
              if (val) params.set('domain', val)
              if (activeAlias) params.set('alias', activeAlias)
              startTransition(() => {
                router.push(`/app/inbox${params.toString() ? `?${params}` : ''}`)
              })
            }}
          />
          <SearchableSelect
            options={aliases.map((a) => ({ value: a.address, label: a.label ?? a.address.split('@')[0] }))}
            selectedValue={activeAlias}
            placeholder="All Aliases"
            onChange={(val) => {
              const params = new URLSearchParams()
              if (activeDomain) params.set('domain', activeDomain)
              if (val) params.set('alias', val)
              startTransition(() => {
                router.push(`/app/inbox${params.toString() ? `?${params}` : ''}`)
              })
            }}
          />
        </div>

        {/* Messages */}
        <div className={`flex-1 overflow-y-auto px-3 pb-8 space-y-1 transition-opacity duration-150 ${isPending ? 'opacity-60' : ''}`}>
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                style={{ background: '#e5e2da' }}
              >
                <span className="material-symbols-outlined" style={{ color: '#57423b', fontSize: '22px' }}>inbox</span>
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: '#1c1c1a', fontFamily: 'var(--font-manrope)' }}>No messages yet</p>
              <p className="text-xs leading-relaxed" style={{ color: '#5f5e58', fontFamily: 'var(--font-manrope)' }}>
                Messages from your configured domains will appear here once email receiving is set up.
              </p>
            </div>
          )}
          {messages.map((msg) => {
            const isActive = msg.id === activeMessage?.id
            return (
              <button
                type="button"
                key={msg.id}
                onClick={() => handleSelectMessage(msg.id)}
                className="relative px-4 py-4 rounded-lg transition-all block min-h-[44px] w-full text-left cursor-pointer"
                style={{
                  background: isActive ? 'rgba(255,255,255,0.9)' : 'transparent',
                }}
              >
                <div className="flex justify-between items-start mb-1">
                  <span
                    className="text-[13px]"
                    style={{ fontFamily: 'var(--font-manrope)', fontWeight: isActive ? 700 : 500, color: isActive ? '#1c1c1a' : '#5f5e58' }}
                  >
                    {msg.fromName ?? msg.fromEmail}
                  </span>
                  <span className="text-[11px]" style={{ fontFamily: 'var(--font-manrope)', color: '#8b726a' }}>
                    {formatTime(msg.receivedAt)}
                  </span>
                </div>
                <h4
                  className="text-[13px] mb-1 truncate"
                  style={{ fontFamily: 'var(--font-manrope)', fontWeight: 600, color: isActive ? '#1c1c1a' : '#57423b' }}
                >
                  {msg.subject}
                </h4>
                <p
                  className="text-[11px] mb-0.5 truncate"
                  style={{ color: '#8b726a', fontFamily: 'var(--font-manrope)' }}
                >
                  &rarr; {msg.toEmail}
                </p>
                <p
                  className="text-[12px] leading-relaxed line-clamp-2"
                  style={{ color: '#8b726a', fontFamily: 'var(--font-manrope)' }}
                >
                  {msg.bodyText?.slice(0, 120) ?? (msg.bodyHtml ? '(HTML email)' : '')}
                </p>
                {msg.otpExtraction?.otpCode && (
                  <span
                    className="mt-2 inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                    style={{ background: '#f4dfcb', color: '#832800', fontFamily: 'var(--font-manrope)', letterSpacing: '0.05em' }}
                  >
                    OTP: {msg.otpExtraction.otpCode}
                  </span>
                )}
                {!msg.isRead && !isActive && (
                  <div className="absolute right-3 top-4 w-2 h-2 rounded-full" style={{ background: '#832800' }} />
                )}
              </button>
            )
          })}
        </div>
      </section>

      {/* Detail pane */}
      {activeMessage ? (
        <section
          className={[
            'flex-1 overflow-hidden bg-surface-container-lowest',
            // On mobile: show detail only when explicitly selected
            showDetailOnMobile ? 'flex flex-col' : 'hidden md:flex md:flex-col',
          ].join(' ')}
        >
          <div
            className="h-14 flex items-center justify-between px-4 md:px-8 flex-shrink-0"
            style={{ borderBottom: '0.5px solid rgba(222,192,183,0.2)' }}
          >
            <div className="flex items-center gap-1">
              {/* Back button — mobile only */}
              <Link
                href="/app/inbox"
                className="md:hidden flex items-center gap-1 px-2 py-2 rounded-lg transition-colors hover:bg-[#f0edea] min-h-[44px] min-w-[44px] justify-center"
                style={{ color: '#5f5e58' }}
                aria-label="Back to inbox"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
              </Link>

              <button
                type="button"
                onClick={handleArchive}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors hover:bg-[#f0edea] min-h-[44px]"
                style={{ fontFamily: 'var(--font-manrope)', fontSize: '0.8125rem', color: '#5f5e58' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>archive</span>
                Archive
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 md:px-12 py-6 md:py-12">
              {/* OTP highlight */}
              {activeMessage.otpExtraction?.otpCode && (
                <div
                  className="mb-8 px-6 py-5 rounded-xl flex items-center justify-between gap-4"
                  style={{ background: '#f4dfcb', border: '0.5px solid rgba(222,192,183,0.2)' }}
                >
                  <div className="min-w-0">
                    <p
                      className="uppercase tracking-widest mb-2"
                      style={{ fontFamily: 'var(--font-manrope)', fontSize: '0.65rem', color: '#57423b' }}
                    >
                      OTP Code
                    </p>
                    <p
                      className="text-2xl md:text-3xl font-bold tracking-[0.2em] font-mono break-all"
                      style={{ fontFamily: 'var(--font-newsreader)', color: '#832800' }}
                    >
                      {activeMessage.otpExtraction.otpCode}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyOtp(activeMessage.otpExtraction!.otpCode!)}
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all min-h-[44px] min-w-[44px]"
                    style={{
                      background: copiedOtp ? '#832800' : 'rgba(131,40,0,0.12)',
                      color: copiedOtp ? '#ffffff' : '#832800',
                      fontFamily: 'var(--font-manrope)',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                    }}
                    aria-label="Copy OTP code"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      {copiedOtp ? 'check' : 'content_copy'}
                    </span>
                    <span className="hidden sm:inline">{copiedOtp ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              )}

              <div className="mb-10">
                <h1
                  className="text-2xl mb-6"
                  style={{ fontFamily: 'var(--font-newsreader)', color: '#1c1c1a', fontWeight: 600 }}
                >
                  {activeMessage.subject}
                </h1>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                      style={{ background: '#1c1c1a' }}
                    >
                      {getInitials(activeMessage.fromName ?? activeMessage.fromEmail)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold" style={{ color: '#1c1c1a', fontFamily: 'var(--font-manrope)' }}>
                        {activeMessage.fromName ?? activeMessage.fromEmail}
                      </span>
                      <span className="text-[12px]" style={{ color: '#5f5e58', fontFamily: 'var(--font-manrope)' }}>
                        {activeMessage.fromEmail}
                      </span>
                      <span className="text-[11px]" style={{ color: '#8b726a', fontFamily: 'var(--font-manrope)' }}>
                        To: {activeMessage.toEmail}
                      </span>
                    </div>
                  </div>
                  <div
                    className="text-[11px] px-2 py-1 rounded-md"
                    style={{ fontFamily: 'var(--font-manrope)', color: '#5f5e58', background: '#f0edea' }}
                  >
                    {new Date(activeMessage.receivedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {' · '}
                    {new Date(activeMessage.receivedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                  </div>
                </div>
              </div>

              {activeMessage.bodyText?.trim() ? (
                <div
                  className="text-[14px] leading-[1.7] whitespace-pre-line break-words"
                  style={{ color: '#1c1c1a', fontFamily: 'var(--font-manrope)' }}
                >
                  {activeMessage.bodyText}
                </div>
              ) : activeMessage.bodyHtml ? (
                <div
                  className="email-html-body w-full overflow-auto"
                  style={{ background: '#fff', borderRadius: '8px' }}
                  dangerouslySetInnerHTML={{ __html: activeMessage.bodyHtml }}
                />
              ) : (
                <div
                  className="text-[14px] leading-[1.7]"
                  style={{ color: '#8b726a', fontFamily: 'var(--font-manrope)' }}
                >
                  (No content)
                </div>
              )}
            </div>
          </div>
        </section>
      ) : (
        <section className="flex-1 hidden md:flex md:flex-col items-center justify-center bg-surface-container-lowest">
          <div className="text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: '#e5e2da' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#57423b' }}>inbox</span>
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: '#1c1c1a', fontFamily: 'var(--font-manrope)' }}>
              Your inbox is empty
            </p>
            <p className="text-xs" style={{ color: '#5f5e58', fontFamily: 'var(--font-manrope)' }}>
              Messages will appear here once email receiving is set up.
            </p>
          </div>
        </section>
      )}
    </div>
  )
}
