'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { verifyDomain } from './actions'

export function VerifyButton({ mailDomainId }: { mailDomainId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  function handleCheck() {
    setError(null)
    setMessage(null)
    startTransition(async () => {
      const result = await verifyDomain(mailDomainId)
      if (result.error) {
        setError(result.error)
      } else if (result.status === 'verified') {
        setMessage('Domain verified! Refreshing…')
        router.refresh()
      } else {
        setMessage('DNS records not yet detected. Check that the records above are set correctly and try again in a few minutes.')
      }
    })
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleCheck}
        disabled={isPending}
        className="premium-gradient text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 soft-elevation active:scale-95 transition-all disabled:opacity-60"
        style={{ fontFamily: 'var(--font-manrope)', fontSize: '0.9375rem' }}
      >
        <span>{isPending ? 'Checking…' : 'Check Verification'}</span>
        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>refresh</span>
      </button>
      {error && (
        <p className="text-xs px-1" style={{ fontFamily: 'var(--font-manrope)', color: '#ba1a1a' }}>{error}</p>
      )}
      {message && !error && (
        <p className="text-xs px-1 leading-relaxed" style={{ fontFamily: 'var(--font-manrope)', color: '#5f5e58', maxWidth: '18rem' }}>{message}</p>
      )}
    </div>
  )
}
