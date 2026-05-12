'use client'

import { useEffect, useRef, useState } from 'react'

type RevealVariant = 'rise' | 'mist' | 'brush' | 'unfurl' | 'stamp'

interface SectionRevealProps {
  children: React.ReactNode
  variant?: RevealVariant
  delay?: number
  threshold?: number
  rootMargin?: string
  once?: boolean
  as?: keyof React.JSX.IntrinsicElements
  className?: string
  style?: React.CSSProperties
  /** Any data-* attributes are forwarded to the rendered element */
  [dataAttr: `data-${string}`]: string | undefined
}

export function SectionReveal({
  children,
  variant = 'rise',
  delay = 0,
  threshold = 0.18,
  rootMargin = '0px 0px -10% 0px',
  once = true,
  as = 'div',
  className,
  style,
  ...rest
}: SectionRevealProps) {
  const ref = useRef<HTMLElement>(null)
  const [state, setState] = useState<'out' | 'in'>('out')

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Respect reduced motion
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setState('in')
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setState('in')
            if (once) io.disconnect()
          } else if (entry.boundingClientRect.bottom < 0) {
            // Element was scrolled past above viewport without being seen.
            // (Happens on page refresh mid-scroll, anchor jumps, or fast flicks.)
            setState('in')
            if (once) io.disconnect()
          } else if (!once) {
            setState('out')
          }
        }
      },
      { threshold, rootMargin },
    )

    io.observe(el)

    // Fallback: also catch elements scrolled past via instant scrollTo
    // (which can skip IntersectionObserver boundary crossings entirely)
    const onScroll = () => {
      const rect = el.getBoundingClientRect()
      if (rect.bottom < 0) {
        setState('in')
        if (once) {
          window.removeEventListener('scroll', onScroll)
          io.disconnect()
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [threshold, rootMargin, once])

  const Tag = as as 'div'
  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement>}
      data-reveal={variant}
      data-state={state}
      className={className}
      style={{
        ...style,
        transitionDelay: delay ? `${delay}s` : undefined,
      }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
