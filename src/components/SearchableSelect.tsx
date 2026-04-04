'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface Option {
  value: string
  label: string
}

interface SearchableSelectProps {
  options: Option[]
  selectedValue: string | null
  placeholder: string
  onChange: (value: string | null) => void
}

export function SearchableSelect({ options, selectedValue, placeholder, onChange }: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedLabel = options.find((o) => o.value === selectedValue)?.label ?? null

  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setOpen(false)
      setQuery('')
    }
  }, [])

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      // Focus search input when opened
      setTimeout(() => inputRef.current?.focus(), 0)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, handleClickOutside])

  function handleSelect(value: string | null) {
    onChange(value)
    setOpen(false)
    setQuery('')
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium cursor-pointer focus:outline-none"
        style={{
          background: '#f0edea',
          color: selectedValue ? '#1c1c1a' : '#5f5e58',
          fontFamily: 'var(--font-manrope)',
        }}
      >
        <span className="truncate max-w-[120px]">{selectedLabel ?? placeholder}</span>
        {selectedValue ? (
          <span
            role="button"
            className="material-symbols-outlined flex-shrink-0 hover:opacity-70"
            style={{ fontSize: '14px', color: '#5f5e58' }}
            onClick={(e) => {
              e.stopPropagation()
              handleSelect(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation()
                handleSelect(null)
              }
            }}
            tabIndex={0}
            aria-label={`Clear ${placeholder} filter`}
          >
            close
          </span>
        ) : (
          <span
            className="material-symbols-outlined flex-shrink-0"
            style={{ fontSize: '14px', color: '#5f5e58' }}
          >
            expand_more
          </span>
        )}
      </button>

      {/* Dropdown popup */}
      {open && (
        <div
          className="absolute left-0 top-full mt-1 z-50 w-56 rounded-lg overflow-hidden"
          style={{
            background: '#ffffff',
            border: '0.5px solid rgba(222,192,183,0.3)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          }}
        >
          {/* Search input */}
          <div className="p-2" style={{ borderBottom: '0.5px solid rgba(222,192,183,0.2)' }}>
            <div className="relative">
              <span
                className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ fontSize: '14px', color: '#8b726a' }}
              >
                search
              </span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full py-2 pl-8 pr-3 rounded-md text-xs focus:outline-none"
                style={{
                  background: '#f0edea',
                  color: '#1c1c1a',
                  fontFamily: 'var(--font-manrope)',
                  border: 'none',
                }}
                placeholder="Search…"
              />
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-48 overflow-y-auto p-1">
            {/* "All" option */}
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className="w-full text-left px-3 py-2 rounded-md text-xs transition-colors hover:bg-[#f6f3f0]"
              style={{
                fontFamily: 'var(--font-manrope)',
                color: selectedValue === null ? '#832800' : '#5f5e58',
                fontWeight: selectedValue === null ? 600 : 400,
              }}
            >
              {placeholder}
            </button>
            {filtered.map((opt) => (
              <button
                type="button"
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className="w-full text-left px-3 py-2 rounded-md text-xs transition-colors hover:bg-[#f6f3f0]"
                style={{
                  fontFamily: 'var(--font-manrope)',
                  color: selectedValue === opt.value ? '#832800' : '#1c1c1a',
                  fontWeight: selectedValue === opt.value ? 600 : 400,
                }}
              >
                {opt.label}
              </button>
            ))}
            {filtered.length === 0 && (
              <p
                className="px-3 py-2 text-xs"
                style={{ color: '#8b726a', fontFamily: 'var(--font-manrope)' }}
              >
                No results
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
