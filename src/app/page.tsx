'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Logo } from '@/components/Logo'
import { Seal } from '@/components/Seal'
import { WolfMascot } from '@/components/WolfMascot'
import { Lantern } from '@/components/Lantern'
import { SectionReveal } from '@/components/SectionReveal'
import { ScrollProgress } from '@/components/ScrollProgress'

const CODES = ['482901', 'H7W822', '739105', '215884', '604277']
const PROVIDERS = [
  'Apple', 'Stripe', 'GitHub', 'Linear', 'Notion',
  'Vercel', 'Figma', 'Cloudflare', 'Anthropic', 'OpenAI',
  'Slack', 'Discord', 'Shopify', 'Cursor', 'Supabase',
]

function useMouse() {
  const [m, setM] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const f = (e: MouseEvent) => setM({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', f)
    return () => window.removeEventListener('mousemove', f)
  }, [])
  return m
}

function TopNav() {
  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '18px 36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backdropFilter: 'blur(10px)',
        background:
          'linear-gradient(to bottom, rgba(242,233,212,0.85), rgba(242,233,212,0.4) 70%, transparent)',
      }}
    >
      <Logo size={26} />
      <nav style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
        <Link
          href="/auth/signin"
          className="btn btn-cinnabar"
          style={{ padding: '12px 22px', fontSize: 13 }}
        >
          <span>Enter dojo</span>
          <span>→</span>
        </Link>
      </nav>
    </header>
  )
}

function Hero() {
  const [idx, setIdx] = useState(0)
  const m = useMouse()

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % CODES.length), 4200)
    return () => clearInterval(t)
  }, [])

  const code = CODES[idx]
  const px = typeof window !== 'undefined' ? (m.x / window.innerWidth - 0.5) * 16 : 0
  const py = typeof window !== 'undefined' ? (m.y / window.innerHeight - 0.5) * 16 : 0

  return (
    <section
      className="r-hero"
      style={{
        minHeight: '100vh',
        position: 'relative',
        paddingTop: 110,
        paddingBottom: 60,
        display: 'grid',
        gridTemplateColumns: '1.05fr 1fr',
        gap: 40,
        paddingLeft: 60,
        paddingRight: 60,
        overflow: 'hidden',
      }}
    >
      <svg
        viewBox="0 0 1400 900"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
        aria-hidden
      >
        <g
          style={{
            transform: `translate(${px * 0.4}px, ${py * 0.4}px)`,
            transition: 'transform 0.6s var(--ease)',
          }}
        >
          <path
            d="M0 540 Q140 440 260 480 Q400 360 540 460 Q700 360 860 470 Q1020 380 1180 450 Q1320 360 1400 440 L1400 900 L0 900 Z"
            fill="#D3C3A2"
            opacity="0.55"
          />
          <path
            d="M0 620 Q160 540 320 580 Q480 480 640 580 Q800 500 960 590 Q1120 510 1280 580 Q1360 540 1400 580 L1400 900 L0 900 Z"
            fill="#B5A180"
            opacity="0.55"
          />
          <path
            d="M0 720 Q200 660 380 700 Q560 640 740 720 Q920 660 1100 720 Q1280 670 1400 700 L1400 900 L0 900 Z"
            fill="#917A5A"
            opacity="0.45"
          />
          <circle cx="1100" cy="200" r="80" fill="#C8392B" opacity="0.85" />
          <circle cx="1100" cy="200" r="120" fill="#C8392B" opacity="0.15" />
        </g>
      </svg>

      {['信', '码', '师', '安', '快', '心'].map((c, i) => (
        <span
          key={c}
          className="cjk hidden md:inline"
          style={{
            position: 'absolute',
            left: `${5 + (i * 17) % 90}%`,
            top: `${15 + (i * 23) % 70}%`,
            fontWeight: 900,
            fontSize: 110 + (i % 3) * 30,
            color: 'var(--ink)',
            opacity: 0.03,
            pointerEvents: 'none',
            zIndex: 1,
            animation: `drift ${8 + i * 1.4}s var(--ease-q) ${i * 0.6}s infinite alternate`,
          }}
        >
          {c}
        </span>
      ))}

      {/* LEFT — copy */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 26 }}>
          <Seal char="码" size={36} rotate={-4} />
          <span
            className="mono"
            style={{
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--ink-3)',
            }}
          >
            mǎ · the way of the code
          </span>
        </div>

        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontWeight: 400,
            fontSize: 'clamp(56px, 7.4vw, 124px)',
            lineHeight: 0.95,
            letterSpacing: '-0.035em',
            color: 'var(--ink)',
          }}
        >
          Codes,
          <br />
          <span className="serif-it" style={{ color: 'var(--cinnabar)' }}>
            mastered
          </span>
          <span style={{ color: 'var(--cinnabar)' }}>.</span>
        </h1>

        <svg viewBox="0 0 600 80" width="100%" style={{ maxWidth: 480, height: 60, marginTop: 8 }} aria-hidden>
          <path
            d="M10 50 Q140 16 300 36 Q440 50 580 28"
            fill="none"
            stroke="#1A1410"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="1200"
            style={{ animation: 'inkBrush 2.2s var(--ease-q) 0.7s both', opacity: 0.85 }}
          />
          <path
            d="M30 64 Q200 40 400 56 Q500 60 560 52"
            fill="none"
            stroke="#C8392B"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="1200"
            style={{ animation: 'inkBrush 2.6s var(--ease-q) 1.4s both', opacity: 0.8 }}
          />
        </svg>

        <p style={{ marginTop: 28, maxWidth: 480, fontSize: 17, lineHeight: 1.6, color: 'var(--ink-2)' }}>
          MailSifu is the quiet master at the gate of your inbox — sifting one-time
          codes from every verification email the moment they arrive. Your loyal{' '}
          <strong style={{ color: 'var(--cinnabar)', fontWeight: 600 }}>mini-wolf</strong>{' '}
          fetches them, paws them onto your desk, and wags before you can blink.
        </p>

        <div style={{ marginTop: 36, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href="/auth/signin" className="btn btn-cinnabar">
            <span className="cjk" style={{ fontWeight: 700, marginRight: 4 }}>入</span>
            <span>Enter the dojo</span>
            <span>→</span>
          </Link>
        </div>

        <div
          className="r-stats"
          style={{
            marginTop: 56,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, auto)',
            gap: 36,
            alignItems: 'end',
          }}
        >
          {[
            { k: 'Avg fetch', v: '180', unit: 'ms', cjk: '快' },
            { k: 'Providers', v: '230', unit: '+', cjk: '门' },
            { k: 'Aliases', v: '12.4', unit: 'K', cjk: '号' },
          ].map((s) => (
            <div key={s.k} style={{ position: 'relative' }}>
              <span
                className="cjk"
                style={{
                  position: 'absolute',
                  top: -28,
                  left: -8,
                  fontWeight: 900,
                  fontSize: 64,
                  color: 'var(--cinnabar)',
                  opacity: 0.1,
                  lineHeight: 1,
                  pointerEvents: 'none',
                }}
              >
                {s.cjk}
              </span>
              <div
                className="serif r-stat-num"
                style={{ fontSize: 44, fontWeight: 500, lineHeight: 1, color: 'var(--ink)' }}
              >
                {s.v}
                <span style={{ fontSize: 22, color: 'var(--ink-3)' }}>{s.unit}</span>
              </div>
              <div
                className="mono"
                style={{
                  fontSize: 10,
                  letterSpacing: '0.12em',
                  color: 'var(--ink-3)',
                  textTransform: 'uppercase',
                  marginTop: 4,
                }}
              >
                {s.k}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — wolf scene */}
      <div
        className="r-hero-right"
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 580,
        }}
      >
        <div style={{ position: 'absolute', top: 0, right: 30 }}>
          <Lantern code={code} size={120} />
        </div>

        <div style={{ position: 'absolute', top: 36, left: 10, animation: 'seal 1s var(--ease-s) 0.4s both' }}>
          <Seal char="师" size={84} rotate={-12} />
        </div>

        <div
          style={{
            position: 'relative',
            width: 'min(380px, 80vw)',
            animation: 'bob 4s var(--ease-q) infinite',
            transform: 'rotate(-3deg)',
          }}
        >
          <div
            style={{
              height: 14,
              background: 'linear-gradient(to bottom, #8B6724, #5A4218)',
              borderRadius: 7,
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
              margin: '0 -14px',
            }}
          />
          <div
            style={{
              background: 'linear-gradient(135deg, var(--rice) 0%, #F3E9CE 100%)',
              border: '1px solid var(--ink-4)',
              padding: '40px 28px 56px',
              position: 'relative',
              boxShadow:
                '0 30px 80px -30px rgba(0,0,0,0.35), inset 0 0 60px rgba(180,140,80,0.15)',
            }}
          >
            <div style={{ position: 'absolute', inset: 8, border: '1px solid var(--cinnabar)', opacity: 0.4, pointerEvents: 'none' }} />
            <div
              className="mono"
              style={{
                fontSize: 10,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--cinnabar-3)',
                textAlign: 'center',
                marginBottom: 14,
              }}
            >
              ━━━ OTP · 一次性密码 ━━━
            </div>
            <div
              className="serif"
              style={{
                fontSize: 'clamp(40px, 8vw, 64px)',
                fontWeight: 500,
                letterSpacing: '0.08em',
                color: 'var(--ink)',
                textAlign: 'center',
                fontVariantNumeric: 'tabular-nums',
                lineHeight: 1,
                margin: '4px 0 18px',
              }}
            >
              {code.split('').map((c, i) => (
                <span
                  key={`${code}-${i}`}
                  style={{
                    display: 'inline-block',
                    animation: `flapDigit 0.9s var(--ease-q) ${i * 0.07}s`,
                  }}
                >
                  {c}
                </span>
              ))}
            </div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textAlign: 'center' }}>
              valid · 10 min · do not share
            </div>
            <div style={{ position: 'absolute', bottom: -10, right: -10, animation: 'seal 0.8s var(--ease-s) 1s both' }}>
              <Seal char="验" size={52} rotate={12} />
            </div>
          </div>
          <div
            style={{
              height: 14,
              background: 'linear-gradient(to bottom, #8B6724, #5A4218)',
              borderRadius: 7,
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
              margin: '0 -14px',
            }}
          />
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 16,
            right: 30,
            animation: 'bob 4.4s var(--ease-q) infinite',
            zIndex: 3,
          }}
        >
          <WolfMascot size={200} />
        </div>
      </div>
    </section>
  )
}

function PathSection() {
  const items = [
    { n: '一', t: 'The watch',   d: 'Sifu sits silent. Your domains, aliases, and providers stream through.', cjk: '守', en: 'guard' },
    { n: '二', t: 'The strike',  d: 'A code arrives. In a single breath — under 200ms — it is plucked from the message.', cjk: '取', en: 'pluck' },
    { n: '三', t: 'The deliver', d: 'Wolf cub trots over with the code on a scroll. You copy. The kettle whistles.', cjk: '送', en: 'deliver' },
  ]
  return (
    <section className="r-section" style={{ padding: '160px 60px', position: 'relative' }}>
      <SectionReveal variant="stamp">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, marginBottom: 60 }}>
          <Seal char="道" size={48} rotate={-6} />
          <span className="eyebrow">The Way · 道</span>
        </div>
      </SectionReveal>
      <SectionReveal variant="brush" delay={0.15}>
        <h2
          className="serif"
          style={{
            margin: 0,
            fontSize: 'clamp(40px, 5vw, 80px)',
            fontWeight: 400,
            lineHeight: 1.0,
            letterSpacing: '-0.025em',
            maxWidth: 1000,
          }}
        >
          Three motions.
          <br />
          <span className="serif-it" style={{ color: 'var(--cinnabar)' }}>
            Then the code is yours.
          </span>
        </h2>
      </SectionReveal>

      <div
        className="r-3col"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 80 }}
      >
        {items.map((it, i) => (
          <SectionReveal
            key={it.n}
            variant="unfurl"
            delay={0.1 + i * 0.18}
            as="div"
            className="r-card"
            style={{
              background: 'var(--rice)',
              border: '1px solid var(--line)',
              borderRadius: 18,
              padding: '36px 28px 44px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <span
              className="cjk"
              style={{
                position: 'absolute',
                top: -20,
                right: -20,
                fontWeight: 900,
                fontSize: 220,
                color: 'var(--cinnabar)',
                opacity: 0.06,
                lineHeight: 1,
                pointerEvents: 'none',
              }}
            >
              {it.cjk}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="cjk" style={{ fontSize: 28, fontWeight: 700, color: 'var(--cinnabar)' }}>
                {it.n}
              </span>
              <span className="mono" style={{ fontSize: 11, letterSpacing: '0.16em', color: 'var(--ink-4)' }}>
                {`0${i + 1} / 03`}
              </span>
            </div>
            <h3 className="serif" style={{ fontSize: 32, fontWeight: 500, margin: '24px 0 12px', letterSpacing: '-0.01em' }}>
              {it.t}
            </h3>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink-3)', margin: 0, maxWidth: 280 }}>
              {it.d}
            </p>
            <div style={{ position: 'absolute', bottom: 18, right: 22, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="cjk" style={{ fontSize: 18, color: 'var(--cinnabar)', fontWeight: 700 }}>
                {it.cjk}
              </span>
              <span className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.08em' }}>
                {it.en}
              </span>
            </div>
          </SectionReveal>
        ))}
      </div>
    </section>
  )
}

function ProvidersMarquee() {
  const row = [...PROVIDERS, ...PROVIDERS, ...PROVIDERS]
  return (
    <SectionReveal
      variant="mist"
      as="section"
      style={{
        padding: '60px 0',
        borderTop: '1px solid var(--line)',
        borderBottom: '1px solid var(--line)',
        background: 'var(--paper-2)',
      }}
    >
      <div className="eyebrow" style={{ textAlign: 'center', marginBottom: 24 }}>
        230 + sender styles · 信使 parsed automatically
      </div>
      <div
        style={{
          overflow: 'hidden',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 56,
            animation: 'marquee 38s linear infinite',
            width: 'max-content',
            alignItems: 'center',
          }}
        >
          {row.map((name, i) => (
            <div
              key={i}
              className="r-marquee-item serif"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontSize: 26,
                color: 'var(--ink-2)',
                whiteSpace: 'nowrap',
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: 'var(--cinnabar)',
                  color: 'var(--rice)',
                  display: 'grid',
                  placeItems: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  fontSize: 13,
                  flexShrink: 0,
                }}
              >
                {name[0]}
              </span>
              {name}
            </div>
          ))}
        </div>
      </div>
    </SectionReveal>
  )
}

function ScrollsTimeline() {
  const phases = [
    { t: '0 ms', d: 'Code lands in your alias inbox. Sifu opens one eye.' },
    { t: '40 ms', d: 'Headers, body, attachments — all sieved through the OTP parser.' },
    { t: '120 ms', d: 'Code identified, normalized, fingerprinted against known sender templates.' },
    { t: '180 ms', d: 'Mini-wolf trots to your screen, scroll in mouth. Your move.' },
  ]
  return (
    <section className="r-section" style={{ padding: '160px 60px', background: 'var(--paper-2)' }}>
      <SectionReveal variant="brush">
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div className="eyebrow">Sub-200ms · 一瞬</div>
          <h2
            className="serif"
            style={{
              margin: '14px 0 0',
              fontSize: 'clamp(40px, 5vw, 70px)',
              fontWeight: 400,
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}
          >
            From <span className="serif-it" style={{ color: 'var(--cinnabar)' }}>arrival</span>{' '}
            to your clipboard,
            <br />
            in a single breath.
          </h2>
        </div>
      </SectionReveal>
      <div style={{ position: 'relative', maxWidth: 1100, margin: '0 auto' }}>
        <svg viewBox="0 0 1100 120" width="100%" style={{ height: 120 }} aria-hidden>
          <path
            d="M40 70 Q280 30 540 70 Q800 110 1060 50"
            fill="none"
            stroke="#1A1410"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="1200"
            style={{ animation: 'inkBrush 2.4s var(--ease-q) both' }}
          />
          {phases.map((_, i) => (
            <circle
              key={i}
              cx={40 + i * (1020 / 3)}
              cy={i % 2 ? 80 : 60}
              r="9"
              fill="#C8392B"
              style={{ animation: `seal 0.6s var(--ease-s) ${i * 0.2 + 0.6}s both` }}
            />
          ))}
        </svg>
        <div
          className="r-4col"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
            marginTop: 30,
          }}
        >
          {phases.map((p, i) => (
            <SectionReveal
              key={i}
              variant="rise"
              delay={0.15 + i * 0.12}
              style={{ textAlign: 'center', padding: '0 8px' }}
            >
              <div
                className="mono"
                style={{
                  fontSize: 12,
                  color: 'var(--cinnabar)',
                  letterSpacing: '0.1em',
                  fontWeight: 600,
                }}
              >
                {p.t}
              </div>
              <p style={{ marginTop: 8, fontSize: 13, lineHeight: 1.55, color: 'var(--ink-3)' }}>
                {p.d}
              </p>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Manifesto() {
  return (
    <section className="r-section" style={{ padding: '180px 60px', position: 'relative' }}>
      <SectionReveal variant="mist" style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <span
          className="cjk"
          style={{
            display: 'block',
            fontSize: 200,
            fontWeight: 900,
            color: 'var(--cinnabar)',
            opacity: 0.08,
            lineHeight: 1,
            marginBottom: -100,
            pointerEvents: 'none',
          }}
        >
          静
        </span>
        <p
          className="serif"
          style={{
            fontSize: 'clamp(28px, 3.4vw, 48px)',
            lineHeight: 1.25,
            fontWeight: 400,
            fontStyle: 'italic',
            margin: 0,
            color: 'var(--ink)',
            position: 'relative',
          }}
        >
          &ldquo;Codes do not move faster than the master who waits for them.
          <br />
          They land where they belong — quietly, exactly,
          <br />
          and never twice.&rdquo;
        </p>
        <div
          className="mono"
          style={{
            marginTop: 24,
            fontSize: 11,
            letterSpacing: '0.2em',
            color: 'var(--ink-3)',
            textTransform: 'uppercase',
          }}
        >
          ━━━━ Sifu, on the inbox · 信师语录 ━━━━
        </div>
      </SectionReveal>
    </section>
  )
}

function FinalCta() {
  return (
    <section
      className="r-section"
      style={{
        padding: '180px 60px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <span
        className="cjk"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -55%)',
          fontWeight: 900,
          fontSize: 'clamp(280px, 32vw, 520px)',
          lineHeight: 1,
          color: 'var(--cinnabar)',
          opacity: 0.07,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        师
      </span>

      <div style={{ position: 'relative', zIndex: 2 }}>
        <SectionReveal variant="brush">
          <h2
            className="serif"
            style={{
              margin: 0,
              fontSize: 'clamp(48px, 7vw, 110px)',
              fontWeight: 400,
              lineHeight: 0.96,
              letterSpacing: '-0.03em',
            }}
          >
            When your code arrives,
            <br />
            <span className="serif-it" style={{ color: 'var(--cinnabar)' }}>
              so will the wolf.
            </span>
          </h2>
        </SectionReveal>
        <SectionReveal variant="stamp" delay={0.3}>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 48, marginBottom: -10 }}>
            <WolfMascot size={170} />
          </div>
        </SectionReveal>
        <SectionReveal variant="rise" delay={0.5}>
          <div style={{ marginTop: 28, display: 'inline-flex', gap: 14 }}>
            <Link
              href="/auth/signin"
              className="btn btn-cinnabar"
              style={{ padding: '18px 32px', fontSize: 16 }}
            >
              <span className="cjk" style={{ fontWeight: 700, marginRight: 4 }}>
                入
              </span>
              <span>Enter the dojo</span>
              <span>→</span>
            </Link>
          </div>
        </SectionReveal>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--line)',
        padding: '36px 60px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 14,
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Logo size={22} />
      <div
        className="mono"
        style={{
          fontSize: 11,
          color: 'var(--ink-3)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        © 2026 MailSifu · 师父 · Internal access
      </div>
    </footer>
  )
}

function SectionDivider({ char = '·' }: { char?: string }) {
  return (
    <SectionReveal as="div" variant="brush" className="r-section-divider" threshold={0.4}>
      <svg viewBox="0 0 600 28" preserveAspectRatio="none" aria-hidden>
        <path d="M10 14 Q150 4 300 14 Q450 24 590 12" />
      </svg>
      <span className="r-section-divider-seal" aria-hidden>{char}</span>
    </SectionReveal>
  )
}

export default function LandingPage() {
  return (
    <div className="page">
      <TopNav />
      <Hero />
      <SectionDivider char="道" />
      <PathSection />
      <SectionDivider char="使" />
      <ProvidersMarquee />
      <SectionDivider char="瞬" />
      <ScrollsTimeline />
      <SectionDivider char="静" />
      <Manifesto />
      <SectionDivider char="师" />
      <FinalCta />
      <Footer />
      <ScrollProgress />
    </div>
  )
}
