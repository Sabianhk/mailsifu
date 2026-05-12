'use client'

import { useEffect, useState } from 'react'

interface Chapter {
  /** CSS selector matching a section header element on the page */
  selector: string
  number: string // "I", "II", "III"...
  title: string
  cjk: string
  pinyin: string
}

const CHAPTERS: Chapter[] = [
  { selector: '[data-chapter="hero"]',     number: '序',  title: 'Prologue',   cjk: '信', pinyin: 'xìn' },
  { selector: '[data-chapter="path"]',     number: '一',  title: 'The Way',    cjk: '道', pinyin: 'dào' },
  { selector: '[data-chapter="senders"]',  number: '二',  title: 'Messengers', cjk: '使', pinyin: 'shǐ' },
  { selector: '[data-chapter="timeline"]', number: '三',  title: 'In a breath',cjk: '瞬', pinyin: 'shùn' },
  { selector: '[data-chapter="manifesto"]',number: '四',  title: 'Stillness',  cjk: '静', pinyin: 'jìng' },
  { selector: '[data-chapter="cta"]',      number: '五',  title: 'Enter',      cjk: '师', pinyin: 'shī' },
]

export function ChapterIndicator() {
  const [active, setActive] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const els = CHAPTERS.map((c) => document.querySelector<HTMLElement>(c.selector))
    if (els.every((e) => !e)) return

    const recompute = () => {
      const mid = window.innerHeight * 0.35
      let bestIdx = 0
      let bestTop = -Infinity
      els.forEach((el, i) => {
        if (!el) return
        const top = el.getBoundingClientRect().top
        // pick the section whose top is closest to (and not past) the upper third
        if (top - mid <= 0 && top > bestTop) {
          bestTop = top
          bestIdx = i
        }
      })
      setActive(bestIdx)
      setVisible(window.scrollY > 220 && window.scrollY < document.documentElement.scrollHeight - window.innerHeight - 200)
    }

    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(recompute)
    }
    recompute()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  const c = CHAPTERS[active]

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 90,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px 10px 10px',
        borderRadius: 999,
        background: 'rgba(250,244,228,0.78)',
        border: '1px solid var(--line-2)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: '0 14px 30px -22px rgba(0,0,0,0.3)',
        transition: 'opacity 350ms var(--ease), transform 350ms var(--ease)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-8px)',
        maxWidth: 'calc(100vw - 32px)',
      }}
      className="chapter-indicator"
    >
      {/* CJK seal */}
      <div
        key={c.cjk}
        style={{
          width: 30,
          height: 30,
          borderRadius: 6,
          background: 'var(--cinnabar)',
          color: 'var(--rice)',
          display: 'grid',
          placeItems: 'center',
          fontFamily: 'var(--font-cjk)',
          fontWeight: 900,
          fontSize: 16,
          flexShrink: 0,
          animation: 'sealMorph 0.45s var(--ease-s)',
        }}
      >
        {c.cjk}
      </div>
      {/* roman chapter number + title (hidden on mobile) */}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1, minWidth: 0 }} className="chapter-indicator-text">
        <span
          className="mono"
          style={{
            fontSize: 9,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--ink-4)',
          }}
        >
          {c.number} · {c.pinyin}
        </span>
        <span
          key={c.title}
          className="serif-it"
          style={{
            fontSize: 14,
            color: 'var(--ink)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            animation: 'titleMorph 0.5s var(--ease)',
          }}
        >
          {c.title}
        </span>
      </div>
    </div>
  )
}
