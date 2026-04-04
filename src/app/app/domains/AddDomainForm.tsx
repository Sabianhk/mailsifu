'use client'

import { useActionState } from 'react'
import { addDomain } from './actions'

const initial = { error: undefined as string | undefined }

export function AddDomainForm() {
  const [state, formAction, pending] = useActionState(addDomain, initial)

  return (
    <form action={formAction} className="flex flex-col gap-2 mt-1">
      <input
        name="domain"
        type="text"
        required
        autoComplete="off"
        placeholder="mail.example.com"
        className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
        style={{
          background: '#f0edea',
          border: 'none',
          color: '#1c1c1a',
          fontFamily: 'var(--font-manrope)',
        }}
      />
      {state?.error && (
        <p className="text-[11px]" style={{ fontFamily: 'var(--font-manrope)', color: '#ba1a1a' }}>{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full py-2.5 rounded-lg text-sm font-semibold premium-gradient text-white transition-opacity disabled:opacity-50"
        style={{ fontFamily: 'var(--font-manrope)' }}
      >
        {pending ? 'Adding…' : 'Add Domain'}
      </button>
    </form>
  )
}
