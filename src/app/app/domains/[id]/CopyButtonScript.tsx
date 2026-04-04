'use client'

import { useEffect } from 'react'

export function CopyButtonScript() {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const btn = (e.target as HTMLElement).closest('.copy-btn') as HTMLElement | null
      if (!btn) return
      const text = btn.getAttribute('data-copy')
      if (!text) return
      navigator.clipboard.writeText(text).then(() => {
        const icon = btn.querySelector('.material-symbols-outlined')
        if (icon) {
          const orig = icon.textContent
          icon.textContent = 'check'
          setTimeout(() => { icon.textContent = orig }, 1500)
        }
      })
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  return null
}
