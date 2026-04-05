'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SignInForm() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  // Restrict to relative paths only — prevents open-redirect via crafted callbackUrl param
  const raw = searchParams.get('callbackUrl') ?? ''
  const callbackUrl = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/app/inbox'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value

    const result = await signIn('credentials', { email, password, redirect: false })

    if (result?.error) {
      setError('Invalid email or password.')
      setLoading(false)
    } else {
      router.push(callbackUrl)
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#fcf9f6' }}>
      {/* Left — Art panel (hidden on mobile) */}
      <div
        className="hidden lg:flex lg:w-1/2 relative items-end p-12"
        style={{
          backgroundImage: 'url(/images/signin-art.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(28,20,16,0.55) 0%, rgba(28,20,16,0.1) 50%, transparent 100%)' }} />
        <div className="relative z-10">
          <span
            style={{
              fontFamily: 'var(--font-newsreader)',
              fontStyle: 'italic',
              fontSize: '2.5rem',
              color: '#ffffff',
              fontWeight: 600,
              lineHeight: 1.15,
              display: 'block',
              marginBottom: '0.75rem',
            }}
          >
            Your codes,<br />ready when you are.
          </span>
          <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)' }}>
            OTP emails extracted and surfaced instantly.
          </p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-10">
            <span
              style={{
                fontFamily: 'var(--font-newsreader)',
                fontStyle: 'italic',
                fontSize: '2rem',
                color: '#832800',
                fontWeight: 600,
              }}
            >
              MailSifu
            </span>
            <p
              style={{
                fontFamily: 'var(--font-manrope)',
                fontSize: '0.75rem',
                color: '#5f5e58',
                letterSpacing: '0.08em',
                marginTop: '0.25rem',
              }}
            >
              Internal workspace access
            </p>
          </div>

          {/* Card */}
          <div
            className="rounded-xl px-8 py-10 soft-elevation"
            style={{ background: '#ffffff' }}
          >
            <h1
              style={{
                fontFamily: 'var(--font-newsreader)',
                fontSize: '1.5rem',
                color: '#1c1c1a',
                fontWeight: 600,
                marginBottom: '2rem',
              }}
            >
              Sign in
            </h1>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  className="block mb-2"
                  style={{
                    fontFamily: 'var(--font-manrope)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#57423b',
                  }}
                >
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none transition-all"
                  style={{
                    background: '#f0edea',
                    border: 'none',
                    color: '#1c1c1a',
                    fontFamily: 'var(--font-manrope)',
                  }}
                />
              </div>

              <div>
                <label
                  className="block mb-2"
                  style={{
                    fontFamily: 'var(--font-manrope)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#57423b',
                  }}
                >
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none transition-all"
                  style={{
                    background: '#f0edea',
                    border: 'none',
                    color: '#1c1c1a',
                    fontFamily: 'var(--font-manrope)',
                  }}
                />
              </div>

              {error && (
                <p
                  className="text-xs px-3 py-2 rounded-lg"
                  style={{ background: '#ffdad6', color: '#ba1a1a' }}
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg text-sm font-semibold text-white premium-gradient transition-all hover:opacity-90 disabled:opacity-60 mt-2 flex items-center justify-center gap-2"
                style={{ fontFamily: 'var(--font-manrope)' }}
              >
                {loading && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {loading ? 'Signing in\u2026' : 'Sign in'}
              </button>
            </form>
          </div>

          <p
            className="text-center text-xs mt-6"
            style={{ fontFamily: 'var(--font-manrope)', color: '#8b726a' }}
          >
            MailSifu \u00b7 Internal access only
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  )
}
