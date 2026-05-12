'use client'

import { useEffect, useState } from 'react'

const STOPS = [
  { at: 0.0, cjk: '信', label: 'start' },
  { at: 0.15, cjk: '道', label: 'way' },
  { at: 0.35, cjk: '收', label: 'inbox' },
  { at: 0.55, cjk: '快', label: 'speed' },
  { at: 0.75, cjk: '静', label: 'still' },
  { at: 0.92, cjk: '师', label: 'sifu' },
]

export function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const doc = document.documentElement
        const max = doc.scrollHeight - window.innerHeight
        const p = max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0
        setProgress(p)
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  if (!mounted) return null

  const stop = STOPS.slice().reverse().find((s) => progress >= s.at) ?? STOPS[0]
  const pct = Math.round(progress * 100)

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        right: 22,
        bottom: 22,
        zIndex: 80,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 12px 8px 8px',
        borderRadius: 999,
        background: 'rgba(250,244,228,0.78)',
        border: '1px solid var(--line-2)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: '0 14px 30px -20px rgba(0,0,0,0.3)',
        pointerEvents: 'none',
        transition: 'opacity 0.3s var(--ease)',
        opacity: progress > 0.02 && progress < 0.99 ? 1 : 0,
      }}
    >
      {/* circular progress dial */}
      <svg width="28" height="28" viewBox="0 0 28 28" style={{ flexShrink: 0 }}>
        <circle cx="14" cy="14" r="11" fill="none" stroke="var(--line-2)" strokeWidth="2" />
        <circle
          cx="14"
          cy="14"
          r="11"
          fill="none"
          stroke="var(--cinnabar)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 11}`}
          strokeDashoffset={`${2 * Math.PI * 11 * (1 - progress)}`}
          transform="rotate(-90 14 14)"
          style={{ transition: 'stroke-dashoffset 0.25s var(--ease)' }}
        />
        <text
          x="14"
          y="18"
          textAnchor="middle"
          fontFamily="var(--font-cjk)"
          fontWeight="700"
          fontSize="13"
          fill="var(--cinnabar-3)"
        >
          {stop.cjk}
        </text>
      </svg>
      <span
        className="mono"
        style={{
          fontSize: 10,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--ink-3)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {String(pct).padStart(2, '0')}%
      </span>
    </div>
  )
}
