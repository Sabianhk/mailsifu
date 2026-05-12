'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

interface MagneticButtonProps {
  href: string
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  /** Pull strength (px the button moves at max). Default 12. */
  strength?: number
  /** Distance in px around the button at which magnetism activates. Default 120. */
  radius?: number
}

/**
 * A CTA that gently magnetises toward the cursor when it's nearby.
 * Falls back to a regular Link with no transform on touch / reduced-motion.
 */
export function MagneticButton({
  href,
  children,
  className,
  style,
  strength = 12,
  radius = 120,
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const touch = window.matchMedia('(hover: none)').matches
    if (reduced || touch) return

    let raf = 0
    let tx = 0
    let ty = 0
    let targetX = 0
    let targetY = 0

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const dist = Math.hypot(dx, dy)
      if (dist > radius) {
        targetX = 0
        targetY = 0
      } else {
        const f = (1 - dist / radius) * strength
        targetX = (dx / Math.max(1, dist)) * f
        targetY = (dy / Math.max(1, dist)) * f
      }
    }

    const onLeave = () => {
      targetX = 0
      targetY = 0
    }

    const animate = () => {
      tx += (targetX - tx) * 0.18
      ty += (targetY - ty) * 0.18
      el.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`
      raf = requestAnimationFrame(animate)
    }
    animate()

    window.addEventListener('mousemove', onMove, { passive: true })
    el.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(raf)
      el.style.transform = ''
    }
  }, [strength, radius])

  return (
    <Link
      ref={ref}
      href={href}
      className={className}
      style={{
        ...style,
        willChange: 'transform',
        transition: 'box-shadow 0.4s var(--ease)',
      }}
    >
      {children}
    </Link>
  )
}
