'use client'

import { useActionState } from 'react'
import { createUser } from './actions'

type FormState = { error?: string; success?: string }
const initialState: FormState = {}

const inputStyle = {
  fontFamily: 'var(--font-manrope)',
  fontSize: '0.9375rem',
  color: '#1c1c1a',
  background: '#fdf8f5',
  border: '1px solid rgba(222,192,183,0.5)',
  borderRadius: '0.5rem',
  padding: '0.625rem 0.875rem',
  width: '100%',
  outline: 'none',
}

const labelStyle = {
  fontFamily: 'var(--font-manrope)',
  fontSize: '0.8125rem',
  fontWeight: 600,
  color: '#5f5e58',
  display: 'block',
  marginBottom: '0.375rem',
}

export function CreateUserForm() {
  const [state, action, isPending] = useActionState<FormState, FormData>(createUser, initialState)

  return (
    <form action={action} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="email" style={labelStyle}>Email *</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="user@example.com"
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="name" style={labelStyle}>Name</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Full name (optional)"
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="password" style={labelStyle}>Password *</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="Min. 8 characters"
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="role" style={labelStyle}>Role *</label>
          <select id="role" name="role" style={inputStyle}>
            <option value="member">Member</option>
            <option value="owner">Admin (Owner)</option>
          </select>
        </div>
      </div>

      {state?.error && (
        <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '0.875rem', color: '#ba1a1a' }}>
          {state.error}
        </p>
      )}
      {state?.success && (
        <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '0.875rem', color: '#2e7d32' }}>
          {state.success}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="premium-gradient text-white px-6 py-3 rounded-lg font-medium transition-all active:opacity-80 disabled:opacity-60"
        style={{ fontFamily: 'var(--font-manrope)', fontSize: '0.875rem' }}
      >
        {isPending ? 'Creating…' : 'Create User'}
      </button>
    </form>
  )
}
