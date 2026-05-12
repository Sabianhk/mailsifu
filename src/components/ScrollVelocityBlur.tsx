'use client'

import { useEffect } from 'react'

/**
 * Subtle film-like motion blur driven by scroll velocity.
 * Sets --scroll-blur on body. CSS classes (`r-velocity-blur`) consume it.
 *
 * Also toggles `has-snap` on <html> after first interaction so the initial
 * jump-to-anchor / load-time scroll-restore behavior isn't disturbed.
 */
export function ScrollVelocityBlur() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const html = document.documentElement
    const body = document.body
    let lastY = window.scrollY
    let lastT = performance.now()
    let raf = 0
    let snapEnabled = false

    const tick = () => {
      const now = performance.now()
      const dy = window.scrollY - lastY
      const dt = Math.max(1, now - lastT)
      const v = Math.abs(dy / dt) // px per ms
      lastY = window.scrollY
      lastT = now

      // Map velocity to blur. Threshold ~1.5px/ms, cap at 2.2px blur.
      const blur = Math.min(2.2, Math.max(0, (v - 1.5) * 1.2))
      body.style.setProperty('--scroll-blur', `${blur.toFixed(2)}px`)

      // Enable snap after first meaningful scroll
      if (!snapEnabled && Math.abs(window.scrollY) > 50) {
        snapEnabled = true
        html.classList.add('has-snap')
      }
    }

    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(tick)
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    // Decay blur back to 0 when scrolling stops
    const decay = setInterval(() => {
      const cur = parseFloat(getComputedStyle(body).getPropertyValue('--scroll-blur')) || 0
      if (cur > 0.05) {
        body.style.setProperty('--scroll-blur', `${(cur * 0.6).toFixed(2)}px`)
      } else if (cur !== 0) {
        body.style.setProperty('--scroll-blur', '0px')
      }
    }, 80)

    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
      clearInterval(decay)
      body.style.removeProperty('--scroll-blur')
      html.classList.remove('has-snap')
    }
  }, [])

  return null
}
