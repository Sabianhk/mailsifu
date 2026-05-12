'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition, useCallback } from 'react'
import { archiveMessage } from './actions'
import { SearchableSelect } from '@/components/SearchableSelect'
import { WolfMascot } from '@/components/WolfMascot'

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

export function InboxView({
  messages,
  activeMessage: initialActiveMessage,
  hasExplicitSelection,
  domains,
  aliases,
  activeDomain,
  activeAlias,
}: InboxViewProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [copiedOtp, setCopiedOtp] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(initialActiveMessage?.id ?? null)
  const [hasUserSelected, setHasUserSelected] = useState(hasExplicitSelection)

  const activeMessage = (selectedId ? messages.find((m) => m.id === selectedId) : null) ?? messages[0] ?? null
  const showDetailOnMobile = hasUserSelected && activeMessage !== null

  const handleSelectMessage = useCallback((msgId: string) => {
    setSelectedId(msgId)
    setHasUserSelected(true)
    window.history.replaceState(null, '', `/app/inbox?id=${msgId}`)
  }, [])

  function handleCopyOtp(code: string) {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(code)
        .then(() => {
          setCopiedOtp(true)
          setTimeout(() => setCopiedOtp(false), 2000)
        })
        .catch(() => {})
    } else {
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
    <div className="r-inbox flex-1 flex overflow-hidden">
      {/* Message list */}
      <section
        className={[
          'r-inbox-list overflow-hidden flex-shrink-0 flex-col',
          'w-full md:w-[380px]',
          showDetailOnMobile ? 'hidden md:flex' : 'flex',
        ].join(' ')}
        style={{
          background: 'var(--paper)',
          borderRight: '1px solid var(--line)',
        }}
      >
        {/* Header + search */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <span className="serif" style={{ fontSize: 24, fontWeight: 500, color: 'var(--ink)' }}>
              Inbox{' '}
              <span className="cjk" style={{ color: 'var(--cinnabar)', fontSize: 20 }}>
                · 收
              </span>
            </span>
            <span
              className="mono"
              style={{
                fontSize: 10,
                color: 'var(--ink-3)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                letterSpacing: '0.1em',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: 'var(--cinnabar)',
                  animation: 'pulseDot 2s infinite',
                }}
              />
              live
            </span>
          </div>

          <div style={{ position: 'relative' }}>
            <span
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 13,
                color: 'var(--ink-4)',
                pointerEvents: 'none',
              }}
            >
              ⌕
            </span>
            <input
              placeholder="Search messages, codes, senders…"
              disabled
              style={{
                width: '100%',
                padding: '11px 14px 11px 38px',
                borderRadius: 10,
                background: 'var(--rice)',
                border: '1px solid var(--line)',
                fontSize: 13,
                outline: 'none',
                color: 'var(--ink-3)',
                opacity: 0.7,
                cursor: 'not-allowed',
                fontFamily: 'var(--font-sans)',
              }}
            />
          </div>

          {/* Filters */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 12,
              fontSize: 12,
            }}
          >
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
              options={aliases.map((a) => ({
                value: a.address,
                label: a.label ?? a.address.split('@')[0],
              }))}
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
        </div>

        {/* Message rows */}
        <div
          className={`flex-1 overflow-y-auto transition-opacity duration-150 ${isPending ? 'opacity-60' : ''}`}
          style={{ padding: '12px 12px 60px' }}
        >
          {messages.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>
              <div
                className="cjk"
                style={{ fontSize: 36, color: 'var(--ink-5)', marginBottom: 10, opacity: 0.5 }}
              >
                空
              </div>
              <p className="mono" style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                No messages yet
              </p>
              <p style={{ fontSize: 12, color: 'var(--ink-4)' }}>
                Codes from your domains will appear here.
              </p>
            </div>
          )}

          {messages.map((msg, i) => {
            const isActive = msg.id === activeMessage?.id
            const code = msg.otpExtraction?.otpCode
            return (
              <button
                type="button"
                key={msg.id}
                onClick={() => handleSelectMessage(msg.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '14px 16px',
                  borderRadius: 12,
                  marginBottom: 6,
                  background: isActive ? 'var(--rice)' : 'transparent',
                  border: isActive ? '1px solid var(--line-2)' : '1px solid transparent',
                  boxShadow: isActive ? '0 12px 30px -20px rgba(0,0,0,0.2)' : 'none',
                  transition: 'all 0.4s var(--ease)',
                  animation: `rowIn 0.5s var(--ease) ${i * 0.03}s both`,
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
              >
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 3,
                      height: '60%',
                      background: 'var(--cinnabar)',
                      borderRadius: 999,
                    }}
                  />
                )}

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 6,
                  }}
                >
                  <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                    {msg.fromName ?? msg.fromEmail}
                  </span>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>
                    {formatTime(msg.receivedAt)}
                  </span>
                </div>

                <div
                  style={{
                    fontWeight: msg.isRead ? 500 : 600,
                    fontSize: 14,
                    marginBottom: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: 'var(--ink)',
                  }}
                >
                  {!msg.isRead && (
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 999,
                        background: 'var(--cinnabar)',
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <span
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {msg.subject}
                  </span>
                </div>

                <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 8 }}>
                  →{' '}
                  <span className="mono" style={{ color: 'var(--ink-3)' }}>
                    {msg.toEmail}
                  </span>
                </div>

                {code && (
                  <div
                    className="mono"
                    style={{
                      display: 'inline-flex',
                      background: isActive
                        ? 'var(--cinnabar-soft)'
                        : 'rgba(235, 185, 174, 0.4)',
                      color: 'var(--cinnabar-3)',
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                    }}
                  >
                    OTP · {code}
                  </div>
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
            'r-inbox-detail flex-1 overflow-hidden flex-col',
            showDetailOnMobile ? 'flex' : 'hidden md:flex',
          ].join(' ')}
          style={{
            background: 'var(--paper)',
            position: 'relative',
          }}
        >
          {/* Detail toolbar */}
          <div
            className="h-14 flex items-center justify-between px-4 md:px-8 flex-shrink-0"
            style={{ borderBottom: '1px solid var(--line)' }}
          >
            <div className="flex items-center gap-1">
              <Link
                href="/app/inbox"
                className="md:hidden flex items-center gap-1 px-2 py-2 rounded-lg min-h-[44px] min-w-[44px] justify-center"
                style={{ color: 'var(--ink-3)' }}
                aria-label="Back to inbox"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
              </Link>

              <button
                type="button"
                onClick={handleArchive}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  borderRadius: 10,
                  fontSize: 13,
                  color: 'var(--ink-3)',
                  transition: 'all 0.3s',
                  minHeight: 44,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>archive</span>
                Archive
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 32px 80px' }}>
              {/* Big OTP card */}
              {activeMessage.otpExtraction?.otpCode && (
                <div
                  onClick={() => handleCopyOtp(activeMessage.otpExtraction!.otpCode!)}
                  className="r-otp-card"
                  style={{
                    background:
                      'linear-gradient(135deg, var(--cinnabar-soft) 0%, #F5D4C5 100%)',
                    borderRadius: 16,
                    padding: '28px 32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'transform 0.4s var(--ease), box-shadow 0.4s',
                    boxShadow: '0 12px 30px -20px rgba(200,57,43,0.2)',
                    animation: copiedOtp ? 'copyBurst 0.5s var(--ease-s)' : 'none',
                    position: 'relative',
                    overflow: 'hidden',
                    gap: 16,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 30px 60px -30px rgba(200,57,43,0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = ''
                    e.currentTarget.style.boxShadow = '0 12px 30px -20px rgba(200,57,43,0.2)'
                  }}
                >
                  <span
                    className="cjk"
                    style={{
                      position: 'absolute',
                      right: -20,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: 200,
                      fontWeight: 900,
                      color: 'var(--cinnabar)',
                      opacity: 0.08,
                      lineHeight: 1,
                      pointerEvents: 'none',
                    }}
                  >
                    码
                  </span>
                  <div style={{ position: 'relative', minWidth: 0 }}>
                    <div
                      className="mono"
                      style={{
                        fontSize: 11,
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        color: 'var(--cinnabar-3)',
                        opacity: 0.85,
                      }}
                    >
                      OTP code · 一次性
                    </div>
                    <div
                      className="serif r-otp-num"
                      style={{
                        fontSize: 'clamp(36px, 6vw, 60px)',
                        fontWeight: 600,
                        letterSpacing: '0.12em',
                        color: 'var(--ink)',
                        marginTop: 6,
                        fontVariantNumeric: 'tabular-nums',
                        wordBreak: 'break-all',
                      }}
                    >
                      {activeMessage.otpExtraction.otpCode.split('').join(' ')}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCopyOtp(activeMessage.otpExtraction!.otpCode!)
                    }}
                    aria-label="Copy OTP code"
                    style={{
                      background: copiedOtp ? 'var(--jade)' : 'var(--cinnabar-3)',
                      color: 'var(--rice)',
                      padding: '12px 20px',
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 500,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'background 0.4s',
                      position: 'relative',
                      zIndex: 1,
                      flexShrink: 0,
                      minHeight: 44,
                    }}
                  >
                    {copiedOtp ? '✓ Copied' : '⧉ Copy'}
                  </button>
                </div>
              )}

              <h1
                className="serif"
                style={{
                  fontSize: 'clamp(24px, 4vw, 36px)',
                  fontWeight: 500,
                  margin: '36px 0 18px',
                  letterSpacing: '-0.01em',
                  color: 'var(--ink)',
                }}
              >
                {activeMessage.subject}
              </h1>

              <div
                className="r-msg-meta"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  marginBottom: 28,
                  paddingBottom: 24,
                  borderBottom: '1px solid var(--line)',
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: 'var(--ink)',
                    color: 'var(--rice)',
                    display: 'grid',
                    placeItems: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    fontSize: 14,
                    flexShrink: 0,
                  }}
                >
                  {(activeMessage.fromName ?? activeMessage.fromEmail).slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--ink)' }}>
                    {activeMessage.fromName ?? activeMessage.fromEmail}
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                    {activeMessage.fromEmail}
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                    To: {activeMessage.toEmail}
                  </div>
                </div>
                <div
                  className="mono"
                  style={{
                    fontSize: 11,
                    color: 'var(--ink-3)',
                    background: 'var(--rice)',
                    padding: '6px 10px',
                    borderRadius: 6,
                  }}
                >
                  {new Date(activeMessage.receivedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}{' '}
                  ·{' '}
                  {new Date(activeMessage.receivedAt).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </div>
              </div>

              {/* Body */}
              <div
                className="r-msg-body"
                style={{
                  background: 'var(--rice)',
                  borderRadius: 16,
                  padding: 32,
                  border: '1px solid var(--line)',
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: 'var(--ink-2)',
                }}
              >
                {activeMessage.bodyText?.trim() ? (
                  <div style={{ whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
                    {activeMessage.bodyText}
                  </div>
                ) : activeMessage.bodyHtml ? (
                  <div
                    className="email-html-body w-full overflow-auto"
                    dangerouslySetInnerHTML={{ __html: activeMessage.bodyHtml }}
                  />
                ) : (
                  <div style={{ color: 'var(--ink-4)' }}>(No content)</div>
                )}
              </div>
            </div>
          </div>

          {/* Corner wolf */}
          <div
            className="r-corner-wolf hidden md:block"
            style={{
              position: 'fixed',
              bottom: 16,
              right: 24,
              zIndex: 30,
              pointerEvents: 'none',
            }}
          >
            <WolfMascot size={120} />
          </div>
        </section>
      ) : (
        <section
          className="r-inbox-detail flex-1 hidden md:flex md:flex-col items-center justify-center"
          style={{ background: 'var(--paper)' }}
        >
          <div style={{ textAlign: 'center' }}>
            <div className="cjk" style={{ fontSize: 80, color: 'var(--ink-5)', opacity: 0.4, marginBottom: 12 }}>
              静
            </div>
            <p
              className="mono"
              style={{
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--ink-3)',
                marginBottom: 6,
              }}
            >
              The dojo is quiet
            </p>
            <p style={{ fontSize: 13, color: 'var(--ink-4)' }}>
              Select a message — or wait for a new one to arrive.
            </p>
          </div>
        </section>
      )}
    </div>
  )
}
