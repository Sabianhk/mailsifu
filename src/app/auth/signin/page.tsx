'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Logo } from '@/components/Logo'
import { Seal } from '@/components/Seal'
import { WolfMascot } from '@/components/WolfMascot'

function SignInForm() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState<'e' | 'p' | null>(null)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const router = useRouter()
  const searchParams = useSearchParams()
  const raw = searchParams.get('callbackUrl') ?? ''
  const callbackUrl = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/app/inbox'

  useEffect(() => {
    const f = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', f)
    return () => window.removeEventListener('mousemove', f)
  }, [])

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

  const px =
    typeof window !== 'undefined' ? (mouse.x / window.innerWidth - 0.5) * 16 : 0
  const py =
    typeof window !== 'undefined' ? (mouse.y / window.innerHeight - 0.5) * 16 : 0

  return (
    <div
      className="r-signin"
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1.05fr 1fr',
        background: 'var(--paper)',
      }}
    >
      {/* Left — art panel */}
      <div
        className="r-signin-left"
        style={{
          position: 'relative',
          background:
            'linear-gradient(160deg, #2a1810 0%, #4a2418 45%, #8A1F17 85%, #C8392B 100%)',
          overflow: 'hidden',
          color: 'var(--rice)',
          padding: 40,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Giant rotating CJK glyph */}
        <span
          className="cjk"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`,
            fontWeight: 900,
            fontSize: 'clamp(420px, 56vw, 800px)',
            color: '#FAF4E4',
            opacity: 0.06,
            lineHeight: 1,
            pointerEvents: 'none',
            transition: 'transform 0.6s var(--ease)',
          }}
        >
          師
        </span>

        {/* Concentric circles */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          aria-hidden
        >
          {[0, 1, 2].map((i) => (
            <circle
              key={i}
              cx="50%"
              cy="50%"
              r={140 + i * 80}
              fill="none"
              stroke="#FAF4E4"
              strokeWidth="0.6"
              opacity={0.18 - i * 0.04}
              strokeDasharray="4 6"
              style={{
                animation: `${i % 2 ? 'spinR' : 'spin'} ${40 + i * 20}s linear infinite`,
                transformOrigin: 'center',
              }}
            />
          ))}
        </svg>

        {/* Wolf at the gate */}
        <div
          style={{
            position: 'absolute',
            bottom: 36,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <WolfMascot size={240} />
        </div>

        <div style={{ position: 'relative', zIndex: 2 }}>
          <Logo size={24} dark />
        </div>

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 400 }}>
          <div
            className="mono"
            style={{
              fontSize: 11,
              letterSpacing: '0.18em',
              opacity: 0.7,
              textTransform: 'uppercase',
              marginBottom: 18,
            }}
          >
            · 师父 sifu
          </div>
          <div
            className="serif"
            style={{
              fontSize: 'clamp(36px, 4vw, 56px)',
              fontWeight: 400,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
            }}
          >
            The dojo
            <br />
            <span className="serif-it">opens its gate.</span>
          </div>
          <div className="mono" style={{ marginTop: 18, fontSize: 12, opacity: 0.75 }}>
            Step in. The wolf is waiting.
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div
        className="r-signin-right"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
          background: 'var(--paper)',
        }}
      >
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h1
              className="serif-it"
              style={{
                fontSize: 56,
                fontWeight: 400,
                margin: 0,
                letterSpacing: '-0.02em',
                color: 'var(--cinnabar-3)',
              }}
            >
              MailSifu
            </h1>
            <div
              className="mono"
              style={{
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--ink-3)',
                marginTop: 6,
              }}
            >
              Disciple sign-in · 入门
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            style={{
              background: 'var(--rice)',
              borderRadius: 20,
              padding: 32,
              border: '1px solid var(--line)',
              boxShadow: '0 40px 80px -40px rgba(0,0,0,0.2)',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -16,
                right: -16,
                animation: 'seal 1s var(--ease-s) 0.6s both',
              }}
            >
              <Seal char="验" size={60} />
            </div>

            <h2 className="serif" style={{ fontSize: 28, fontWeight: 500, margin: '0 0 24px' }}>
              Sign in
            </h2>

            <label style={{ display: 'block', position: 'relative' }}>
              <div
                className="mono"
                style={{
                  fontSize: 10,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: focused === 'e' ? 'var(--cinnabar)' : 'var(--ink-3)',
                  marginBottom: 8,
                  transition: 'color 0.3s',
                }}
              >
                Email
              </div>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@mailsifu.com"
                onFocus={() => setFocused('e')}
                onBlur={() => setFocused(null)}
                style={{
                  width: '100%',
                  padding: '12px 0',
                  fontSize: 16,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: `1px solid ${focused === 'e' ? 'var(--cinnabar)' : 'var(--line-2)'}`,
                  outline: 'none',
                  color: 'var(--ink)',
                  transition: 'border-color 0.3s var(--ease)',
                }}
              />
            </label>
            <div style={{ height: 18 }} />
            <label style={{ display: 'block', position: 'relative' }}>
              <div
                className="mono"
                style={{
                  fontSize: 10,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: focused === 'p' ? 'var(--cinnabar)' : 'var(--ink-3)',
                  marginBottom: 8,
                  transition: 'color 0.3s',
                }}
              >
                Password
              </div>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••••"
                onFocus={() => setFocused('p')}
                onBlur={() => setFocused(null)}
                style={{
                  width: '100%',
                  padding: '12px 0',
                  fontSize: 16,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: `1px solid ${focused === 'p' ? 'var(--cinnabar)' : 'var(--line-2)'}`,
                  outline: 'none',
                  color: 'var(--ink)',
                  transition: 'border-color 0.3s var(--ease)',
                }}
              />
            </label>

            {error && (
              <p
                className="mono"
                style={{
                  marginTop: 16,
                  padding: '8px 12px',
                  background: 'rgba(200,57,43,0.1)',
                  border: '1px solid rgba(200,57,43,0.25)',
                  color: 'var(--cinnabar-3)',
                  fontSize: 12,
                  borderRadius: 8,
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                marginTop: 28,
                padding: '14px 16px',
                borderRadius: 12,
                background: 'var(--ink)',
                color: 'var(--rice)',
                fontSize: 14,
                fontWeight: 500,
                cursor: loading ? 'wait' : 'pointer',
                transition: 'background 0.4s var(--ease)',
                opacity: loading ? 0.85 : 1,
              }}
            >
              {loading ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 999,
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#FAF4E4',
                      animation: 'spin 0.8s linear infinite',
                      display: 'inline-block',
                    }}
                  />
                  Bowing in…
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span className="cjk" style={{ fontWeight: 700 }}>
                    入
                  </span>{' '}
                  Enter dojo <span>→</span>
                </span>
              )}
            </button>
          </form>

          <div
            className="mono"
            style={{
              marginTop: 24,
              textAlign: 'center',
              fontSize: 11,
              color: 'var(--ink-4)',
              letterSpacing: '0.08em',
            }}
          >
            内部 · MailSifu Internal · 2026
          </div>
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
