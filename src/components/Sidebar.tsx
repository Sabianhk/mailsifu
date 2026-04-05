'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'

interface SidebarProps {
  userName: string
  userEmail: string
  isAdmin?: boolean
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

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={[
          'w-64 flex flex-col py-8 px-4 flex-shrink-0 z-50',
          'fixed inset-y-0 left-0 h-full transition-transform duration-300',
          'lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        style={{ background: '#FFF0E8' }}
      >
        {/* Mobile close button */}
        <button
          className="absolute top-4 right-4 lg:hidden p-2 rounded-lg hover:bg-[#fcf9f6]/50 transition-colors"
          onClick={() => setIsOpen(false)}
          aria-label="Close menu"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#5f5e58' }}>close</span>
        </button>

        {/* Brand */}
        <div className="mb-10 px-4">
          <span
            style={{
              fontFamily: 'var(--font-newsreader)',
              fontStyle: 'italic',
              fontSize: '1.5rem',
              color: '#832800',
              fontWeight: 600,
              display: 'block',
            }}
          >
            MailSifu
          </span>
          <p
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '0.7rem',
              color: '#5f5e58',
              letterSpacing: '0.08em',
              marginTop: '0.2rem',
            }}
          >
            OTP Curator
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          <Link
            href="/app/inbox"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 min-h-[44px]"
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '0.875rem',
              fontWeight: activePage === 'inbox' ? 700 : 500,
              color: activePage === 'inbox' ? '#832800' : '#5f5e58',
              background: activePage === 'inbox' ? 'rgba(255,255,255,0.55)' : 'transparent',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>inbox</span>
            <span>Inbox</span>
          </Link>

          <Link
            href="/app/domains"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 min-h-[44px]"
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '0.875rem',
              fontWeight: activePage === 'domains' ? 700 : 500,
              color: activePage === 'domains' ? '#832800' : '#5f5e58',
              background: activePage === 'domains' ? 'rgba(255,255,255,0.55)' : 'transparent',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>language</span>
            <span>Domains</span>
          </Link>

          {isAdmin && (
            <Link
              href="/app/admin/users"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 min-h-[44px]"
              style={{
                fontFamily: 'var(--font-manrope)',
                fontSize: '0.875rem',
                fontWeight: activePage === 'users' ? 700 : 500,
                color: activePage === 'users' ? '#832800' : '#5f5e58',
                background: activePage === 'users' ? 'rgba(255,255,255,0.55)' : 'transparent',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>group</span>
              <span>Users</span>
            </Link>
          )}
        </nav>

        {/* Footer */}
        <div
          className="mt-auto space-y-4 px-2"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          <Link
            href="/app/domains"
            onClick={() => setIsOpen(false)}
            className="w-full premium-gradient text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all active:opacity-80 active:scale-[0.99] min-h-[44px]"
            style={{ fontFamily: 'var(--font-manrope)', fontSize: '0.875rem', textDecoration: 'none' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
            New Domain
          </Link>

          <div
            className="pt-4"
            style={{ borderTop: '0.5px solid rgba(222,192,183,0.2)' }}
          >
            {/* User */}
            <div
              className="flex items-center gap-3 px-4 py-2 rounded-lg mb-1"
              style={{ background: 'rgba(252,249,246,0.4)' }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #832800 0%, #a43e15 100%)' }}
              >
                {initials}
              </div>
              <div className="flex flex-col min-w-0">
                <span
                  className="truncate leading-none mb-0.5"
                  style={{ fontFamily: 'var(--font-manrope)', fontSize: '0.75rem', fontWeight: 600, color: '#1c1c1a' }}
                >
                  {userName}
                </span>
                <span
                  className="truncate"
                  style={{ fontFamily: 'var(--font-manrope)', fontSize: '0.65rem', color: '#57423b' }}
                >
                  {userEmail}
                </span>
              </div>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              className="w-full flex items-center gap-3 px-4 py-3 transition-colors duration-200 rounded-lg hover:bg-[#fcf9f6]/50 min-h-[44px]"
              style={{ fontFamily: 'var(--font-manrope)', fontSize: '0.875rem', color: '#5f5e58' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
