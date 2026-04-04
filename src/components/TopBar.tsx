'use client'
import { useState } from 'react'

interface TopBarProps {
  breadcrumb: string[]
  showSearch?: boolean
  searchPlaceholder?: string
  userName?: string
}

export function TopBar({ breadcrumb, showSearch, searchPlaceholder, userName }: TopBarProps) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  const initials = userName
    ? userName.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <header
      className="flex justify-between items-center h-16 px-4 md:px-8 w-full z-10 flex-shrink-0 glass-panel"
      style={{ borderBottom: '0.5px solid rgba(222,192,183,0.2)' }}
    >
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-[#f0edea] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          onClick={() => document.dispatchEvent(new CustomEvent('toggleSidebar'))}
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#5f5e58' }}>menu</span>
        </button>

        {/* Breadcrumb — hidden when mobile search is open */}
        {!mobileSearchOpen && (
          <nav
            className="flex items-center gap-2"
            style={{ fontFamily: 'var(--font-manrope)', fontSize: '0.75rem', color: '#5f5e58' }}
          >
            {breadcrumb.map((item, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && (
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#dec0b7' }}>chevron_right</span>
                )}
                <span style={{ color: i === breadcrumb.length - 1 ? '#1c1c1a' : '#5f5e58', fontWeight: i === breadcrumb.length - 1 ? 600 : 400 }}>
                  {item}
                </span>
              </span>
            ))}
          </nav>
        )}

        {/* Mobile search input (expanded) */}
        {mobileSearchOpen && showSearch && (
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1">
              <span
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ fontSize: '16px', color: '#8b726a' }}
              >
                search
              </span>
              <input
                autoFocus
                className="w-full pl-9 pr-4 py-2 rounded-lg text-base focus:outline-none"
                style={{
                  background: '#f0edea',
                  fontFamily: 'var(--font-manrope)',
                  color: '#1c1c1a',
                  border: 'none',
                }}
                placeholder={searchPlaceholder ?? 'Search…'}
              />
            </div>
            <button
              className="p-2 rounded-lg hover:bg-[#f0edea] transition-colors"
              onClick={() => setMobileSearchOpen(false)}
              style={{ color: '#5f5e58' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Desktop search */}
        {showSearch && (
          <div className="relative hidden md:flex items-center">
            <span
              className="material-symbols-outlined absolute left-3 pointer-events-none"
              style={{ fontSize: '16px', color: '#8b726a' }}
            >
              search
            </span>
            <input
              className="pl-9 pr-4 py-2 rounded-lg text-sm w-56 focus:outline-none"
              style={{
                background: '#f0edea',
                fontFamily: 'var(--font-manrope)',
                color: '#1c1c1a',
                border: 'none',
              }}
              placeholder={searchPlaceholder ?? 'Search…'}
            />
          </div>
        )}

        {/* Mobile search icon */}
        {showSearch && !mobileSearchOpen && (
          <button
            className="flex md:hidden p-2 rounded-lg hover:bg-[#f0edea] transition-colors min-h-[44px] min-w-[44px] items-center justify-center"
            onClick={() => setMobileSearchOpen(true)}
            aria-label="Search"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#5f5e58' }}>search</span>
          </button>
        )}

        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold premium-gradient flex-shrink-0"
        >
          {initials}
        </div>
      </div>
    </header>
  )
}
