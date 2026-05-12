'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Logo } from './Logo'
import { WolfMascot } from './WolfMascot'

interface SidebarProps {
  userName: string
  userEmail: string
  isAdmin?: boolean
}

interface NavItemProps {
  cjk: string
  label: string
  href: string
  active: boolean
  badge?: string
  onClick?: () => void
}

function NavItem({ cjk, label, href, active, badge, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '11px 14px',
        borderRadius: 10,
        background: active ? 'var(--rice)' : 'transparent',
        boxShadow: active ? '0 4px 14px -10px rgba(0,0,0,0.3)' : 'none',
        color: active ? 'var(--cinnabar-3)' : 'var(--ink-2)',
        fontWeight: active ? 600 : 500,
        fontSize: 14,
        textAlign: 'left',
        transition: 'all 0.3s var(--ease)',
        position: 'relative',
        textDecoration: 'none',
      }}
    >
      <span
        className="cjk"
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: active ? 'var(--cinnabar)' : 'var(--ink-4)',
        }}
      >
        {cjk}
      </span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge && (
        <span
          className="mono"
          style={{
            fontSize: 10,
            fontWeight: 600,
            background: 'var(--cinnabar)',
            color: 'var(--rice)',
            padding: '2px 8px',
            borderRadius: 999,
          }}
        >
          {badge}
        </span>
      )}
      {active && (
        <span
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 3,
            height: '50%',
            background: 'var(--cinnabar)',
            borderRadius: 999,
          }}
        />
      )}
    </Link>
  )
}

export function Sidebar({ userName, userEmail, isAdmin }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const activePage = pathname.startsWith('/app/admin/users')
    ? 'users'
    : pathname.startsWith('/app/domains')
      ? 'domains'
      : 'inbox'

  useEffect(() => {
    const handler = () => setIsOpen((o) => !o)
    document.addEventListener('toggleSidebar', handler)
    return () => document.removeEventListener('toggleSidebar', handler)
  }, [])

  const initials = userName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const close = () => setIsOpen(false)

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={close}
        />
      )}

      <aside
        className={[
          'flex flex-col flex-shrink-0 z-50',
          'fixed inset-y-0 left-0 transition-transform duration-300',
          'lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        style={{
          width: 240,
          background: 'linear-gradient(180deg, var(--cinnabar-soft) 0%, var(--paper) 50%)',
          borderRight: '1px solid var(--line)',
          padding: '24px 18px',
          paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
          height: '100%',
        }}
      >
        {/* Mobile close */}
        <button
          className="absolute top-3 right-3 lg:hidden p-2 rounded-lg"
          onClick={close}
          style={{ color: 'var(--ink-3)' }}
          aria-label="Close menu"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
        </button>

        {/* Brand */}
        <Link href="/app/inbox" onClick={close} style={{ alignSelf: 'flex-start', textDecoration: 'none' }}>
          <Logo size={22} />
        </Link>
        <div
          className="mono"
          style={{
            fontSize: 10,
            color: 'var(--ink-3)',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            marginLeft: 32,
            marginBottom: 28,
            marginTop: 4,
          }}
        >
          OTP curator · 收
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <NavItem cjk="收" label="Inbox" href="/app/inbox" active={activePage === 'inbox'} onClick={close} />
          <NavItem cjk="门" label="Domains" href="/app/domains" active={activePage === 'domains'} onClick={close} />
          {isAdmin && (
            <NavItem
              cjk="徒"
              label="Disciples"
              href="/app/admin/users"
              active={activePage === 'users'}
              onClick={close}
            />
          )}
        </nav>

        {/* Mini wolf widget */}
        <div
          style={{
            marginTop: 24,
            padding: 12,
            background: 'rgba(250,244,228,0.5)',
            borderRadius: 14,
            textAlign: 'center',
            border: '1px dashed var(--line-2)',
          }}
        >
          <WolfMascot size={100} />
          <div
            className="mono"
            style={{
              fontSize: 10,
              color: 'var(--ink-3)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginTop: 4,
            }}
          >
            Lang · on duty
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* New domain CTA */}
        <Link
          href="/app/domains"
          onClick={close}
          style={{
            background: 'var(--cinnabar)',
            color: 'var(--rice)',
            padding: 12,
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 500,
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            textDecoration: 'none',
            transition: 'background 0.3s var(--ease)',
          }}
        >
          + New domain
        </Link>

        {/* User chip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 8px',
            borderRadius: 10,
            background: 'rgba(250,244,228,0.5)',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              background: 'var(--cinnabar)',
              color: 'var(--rice)',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 600,
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            {initials || 'U'}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{userName}</div>
            <div
              className="mono"
              style={{
                fontSize: 10,
                color: 'var(--ink-3)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {userEmail || (isAdmin ? 'sifu · admin' : 'disciple')}
            </div>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/auth/signin' })}
          style={{
            marginTop: 8,
            padding: '10px 8px',
            fontSize: 12,
            color: 'var(--ink-3)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            borderRadius: 10,
            transition: 'background 0.3s',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
          Sign out
        </button>
      </aside>
    </>
  )
}
