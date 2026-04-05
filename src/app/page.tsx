'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

/* ─── OTP digit that "materializes" with a slot-machine reveal ─── */
function OTPDigit({ digit, delay, index }: { digit: string; delay: number; index: number }) {
  const [revealed, setRevealed] = useState(false)
  const [scramble, setScramble] = useState('0')

  useEffect(() => {
    const scrambleChars = '0123456789'
    let frame = 0
    const totalFrames = 12
    const startTime = delay * 1000

    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        frame++
        if (frame >= totalFrames) {
          clearInterval(interval)
          setScramble(digit)
          setRevealed(true)
        } else {
          setScramble(scrambleChars[Math.floor(Math.random() * scrambleChars.length)])
        }
      }, 50)
    }, startTime)

    return () => clearTimeout(timeout)
  }, [digit, delay])

  return (
    <motion.span
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{
        opacity: revealed ? 1 : 0.4,
        y: 0,
        scale: 1,
      }}
      transition={{
        delay: delay,
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative inline-block"
      style={{
        fontFamily: 'var(--font-manrope)',
        fontWeight: 800,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {/* Per-digit glow */}
      {revealed && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0.4] }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute inset-0 pointer-events-none"
          style={{
            textShadow: '0 0 40px rgba(232, 98, 58, 0.6), 0 0 80px rgba(232, 98, 58, 0.3), 0 0 120px rgba(232, 98, 58, 0.15)',
            color: 'transparent',
          }}
          aria-hidden="true"
        >
          {digit}
        </motion.span>
      )}
      <span className="relative z-10">{scramble}</span>
    </motion.span>
  )
}

/* ─── The massive OTP code centerpiece ─── */
function HeroOTPCode() {
  const digits = ['4', '8', '2', ' ', '9', '0', '1']

  return (
    <div className="relative">
      {/* Deep ambient glow behind the entire code */}
      <div
        className="absolute inset-0 -inset-x-20 -inset-y-12 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(232, 98, 58, 0.15), rgba(238, 184, 152, 0.06) 50%, transparent 80%)',
          filter: 'blur(40px)',
          animation: 'code-breathe 4s ease-in-out infinite',
        }}
      />

      {/* The code itself */}
      <div
        className="relative text-6xl sm:text-8xl md:text-[10rem] lg:text-[12rem] tracking-[0.15em] sm:tracking-[0.2em]"
        style={{ color: '#1C1410' }}
      >
        {digits.map((d, i) =>
          d === ' ' ? (
            <span key={i} className="inline-block w-4 sm:w-8 md:w-14" />
          ) : (
            <OTPDigit key={i} digit={d} delay={0.8 + i * 0.12} index={i} />
          )
        )}
      </div>

      {/* Underline signal — a warm glowing bar beneath the code */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="mt-3 sm:mt-4 h-[2px] sm:h-[3px] origin-left"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(232, 98, 58, 0.5) 20%, rgba(232, 98, 58, 0.8) 50%, rgba(232, 98, 58, 0.5) 80%, transparent 100%)',
          boxShadow: '0 0 20px rgba(232, 98, 58, 0.3), 0 0 40px rgba(232, 98, 58, 0.15)',
        }}
      />
    </div>
  )
}

/* ─── Converging signal ribbon — a floating source label that slides toward center ─── */
function SignalRibbon({
  label,
  subject,
  fromSide,
  delay,
  yOffset,
}: {
  label: string
  subject: string
  fromSide: 'left' | 'right'
  delay: number
  yOffset: string
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: fromSide === 'left' ? -120 : 120,
      }}
      animate={{
        opacity: [0, 0.7, 0.5],
        x: fromSide === 'left' ? -20 : 20,
      }}
      transition={{
        delay,
        duration: 1.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`absolute ${fromSide === 'left' ? 'left-0 sm:-left-8' : 'right-0 sm:-right-8'} hidden md:flex items-center gap-3`}
      style={{
        top: yOffset,
      }}
    >
      {fromSide === 'right' && (
        <div
          className="w-16 h-px"
          style={{
            background: `linear-gradient(${fromSide === 'right' ? '270deg' : '90deg'}, rgba(232, 98, 58, 0.3), transparent)`,
          }}
        />
      )}
      <div
        className="px-4 py-2 rounded-xl flex items-center gap-2.5"
        style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 4px 24px rgba(28, 20, 16, 0.04), 0 1px 2px rgba(28, 20, 16, 0.03)',
        }}
      >
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{
            background: '#E8623A',
            boxShadow: '0 0 8px rgba(232, 98, 58, 0.4)',
            animation: 'dot-pulse 2.5s ease-in-out infinite',
          }}
        />
        <div>
          <div
            className="text-[11px] font-semibold"
            style={{ color: '#1C1410', fontFamily: 'var(--font-manrope)' }}
          >
            {label}
          </div>
          <div
            className="text-[10px]"
            style={{ color: '#B89A88', fontFamily: 'var(--font-manrope)' }}
          >
            {subject}
          </div>
        </div>
      </div>
      {fromSide === 'left' && (
        <div
          className="w-16 h-px"
          style={{
            background: `linear-gradient(90deg, rgba(232, 98, 58, 0.3), transparent)`,
          }}
        />
      )}
    </motion.div>
  )
}

/* ─── Ambient particles that drift upward like warm signals ─── */
function AmbientParticles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${8 + Math.random() * 84}%`,
    delay: Math.random() * 5,
    duration: 4 + Math.random() * 6,
    size: 1.5 + Math.random() * 2.5,
    opacity: 0.15 + Math.random() * 0.25,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            bottom: '-5%',
            width: p.size,
            height: p.size,
            background: `rgba(232, 98, 58, ${p.opacity})`,
            boxShadow: `0 0 ${p.size * 3}px rgba(232, 98, 58, ${p.opacity * 0.5})`,
            animation: `particle-rise ${p.duration}s ${p.delay}s ease-out infinite`,
          }}
        />
      ))}
    </div>
  )
}

/* ─── Horizontal signal lines converging to center ─── */
function ConvergingLines() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Left converging lines */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`left-${i}`}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 0.15 + i * 0.05, scaleX: 1 }}
          transition={{ delay: 2.2 + i * 0.15, duration: 1, ease: 'easeOut' }}
          className="absolute h-px origin-right"
          style={{
            right: '52%',
            top: `${42 + i * 8}%`,
            width: `${20 + i * 5}%`,
            background: `linear-gradient(90deg, transparent, rgba(232, 98, 58, ${0.2 + i * 0.05}))`,
          }}
        />
      ))}
      {/* Right converging lines */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`right-${i}`}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 0.15 + i * 0.05, scaleX: 1 }}
          transition={{ delay: 2.3 + i * 0.15, duration: 1, ease: 'easeOut' }}
          className="absolute h-px origin-left"
          style={{
            left: '52%',
            top: `${42 + i * 8}%`,
            width: `${20 + i * 5}%`,
            background: `linear-gradient(270deg, transparent, rgba(232, 98, 58, ${0.2 + i * 0.05}))`,
          }}
        />
      ))}
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fdf8f5', color: '#1C1410' }}>
      {/* Keyframe animations */}
      <style>{`
        @keyframes code-breathe {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.03); }
        }
        @keyframes dot-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes particle-rise {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.3; }
          100% { transform: translateY(-100vh) scale(0.3); opacity: 0; }
        }
        @keyframes shimmer-sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes grain-shift {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-1%, -1%); }
          20% { transform: translate(1%, 0%); }
          30% { transform: translate(0%, 1%); }
          40% { transform: translate(-1%, 0%); }
          50% { transform: translate(1%, -1%); }
          60% { transform: translate(0%, 1%); }
          70% { transform: translate(-1%, -1%); }
          80% { transform: translate(1%, 0%); }
          90% { transform: translate(0%, -1%); }
        }
      `}</style>

      {/* Nav */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-5 max-w-5xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
            style={{ background: 'linear-gradient(145deg, #E8623A, #c94b25)' }}
          >
            M
          </div>
          <span
            className="text-base font-semibold tracking-tight"
            style={{ fontFamily: 'var(--font-manrope)', color: '#1C1410' }}
          >
            MailSifu
          </span>
        </div>
        <Link
          href="/auth/signin"
          className="text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          style={{ color: '#695950' }}
        >
          Sign in
        </Link>
      </nav>

      {/* ════════════════════════════════════════════════════════
          HERO — "The Arrival"
          One oversized OTP code as the dramatic centerpiece.
          Signal ribbons converge. Ambient particles drift.
         ════════════════════════════════════════════════════════ */}
      <section className="relative max-w-6xl mx-auto px-6 pt-12 sm:pt-20 pb-12 sm:pb-16 overflow-hidden">
        {/* Atmospheric background layers */}
        <div className="absolute inset-0 -top-40 -bottom-20 overflow-hidden pointer-events-none" aria-hidden="true">
          {/* Primary warm radiance — large, centered, very soft */}
          <div
            className="absolute w-[800px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: 'radial-gradient(ellipse, rgba(232, 98, 58, 0.08) 0%, rgba(238, 184, 152, 0.04) 40%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />
          {/* Secondary peach bloom — offset right */}
          <div
            className="absolute w-[500px] h-[400px] rounded-full"
            style={{
              top: '10%',
              right: '-5%',
              background: 'radial-gradient(ellipse, rgba(238, 184, 152, 0.06) 0%, transparent 70%)',
              filter: 'blur(50px)',
            }}
          />
          {/* Tertiary amber — offset left low */}
          <div
            className="absolute w-[400px] h-[350px] rounded-full"
            style={{
              bottom: '5%',
              left: '5%',
              background: 'radial-gradient(ellipse, rgba(244, 196, 160, 0.05) 0%, transparent 70%)',
              filter: 'blur(50px)',
            }}
          />
        </div>

        {/* Film grain */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.02]"
          aria-hidden="true"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '128px 128px',
            animation: 'grain-shift 8s steps(10) infinite',
          }}
        />

        {/* Converging signal lines */}
        <ConvergingLines />

        {/* Ambient rising particles */}
        <AmbientParticles />

        {/* ── Top copy — minimal, confident ── */}
        <div className="relative z-10 text-center max-w-2xl mx-auto mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-5"
          >
            <span
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] px-3 py-1.5 rounded-full"
              style={{
                color: '#B87A5E',
                background: 'rgba(255, 240, 232, 0.6)',
                border: '1px solid rgba(232, 98, 58, 0.08)',
                fontFamily: 'var(--font-manrope)',
                fontWeight: 500,
              }}
            >
              <span
                className="w-1 h-1 rounded-full"
                style={{ background: '#E8623A', opacity: 0.6 }}
              />
              Internal workspace
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="text-base sm:text-lg leading-relaxed"
            style={{ color: '#8A7568', fontFamily: 'var(--font-manrope)' }}
          >
            Your verification code just arrived.
          </motion.p>
        </div>

        {/* ══ THE CENTERPIECE — Oversized OTP Code ══ */}
        <div className="relative z-10 flex justify-center items-center min-h-[120px] sm:min-h-[160px] md:min-h-[220px] mb-8 sm:mb-10">
          {/* Signal ribbons from services — flanking the code */}
          <SignalRibbon
            label="auth@stripe.com"
            subject="Verification code"
            fromSide="left"
            delay={2.0}
            yOffset="10%"
          />
          <SignalRibbon
            label="noreply@github.com"
            subject="Confirm identity"
            fromSide="right"
            delay={2.3}
            yOffset="15%"
          />
          <SignalRibbon
            label="verify@slack.com"
            subject="Login code"
            fromSide="left"
            delay={2.6}
            yOffset="75%"
          />

          <HeroOTPCode />
        </div>

        {/* ── Bottom copy + CTA ── */}
        <div className="relative z-10 text-center max-w-lg mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-[1.15] mb-4"
            style={{
              fontFamily: 'var(--font-newsreader)',
              color: '#1C1410',
              letterSpacing: '-0.02em',
            }}
          >
            Codes extracted.
            <br />
            <span style={{ color: '#E8623A' }}>Ready to copy.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.8 }}
            className="text-sm sm:text-base mb-7 leading-relaxed"
            style={{ color: '#8A7568', fontFamily: 'var(--font-manrope)' }}
          >
            A clean inbox that receives OTP emails and surfaces the codes instantly — no digging through spam.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 2.0, ease: 'easeOut' }}
          >
            <Link
              href="/auth/signin"
              className="group relative inline-flex items-center gap-2 text-sm font-semibold px-7 py-3.5 rounded-xl text-white transition-all hover:-translate-y-0.5 overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, #E8623A, #c94b25)',
                boxShadow: '0 4px 24px rgba(232, 98, 58, 0.3), 0 1px 3px rgba(232, 98, 58, 0.1), 0 0 0 1px rgba(232, 98, 58, 0.1)',
                fontFamily: 'var(--font-manrope)',
              }}
            >
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  animation: 'shimmer-sweep 1.5s ease-in-out infinite',
                }}
              />
              <span className="relative z-10 flex items-center gap-2">
                Open workspace
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="transition-transform group-hover:translate-x-0.5"
                >
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Accent divider */}
      <div className="max-w-5xl mx-auto px-8 relative">
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(238, 184, 152, 0.3), transparent)' }} />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-8 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(232, 98, 58, 0.06), transparent 70%)',
            filter: 'blur(8px)',
          }}
        />
      </div>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-8 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8623A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                  <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                </svg>
              ),
              title: 'OTP Inbox',
              desc: 'All inbound OTP emails in one view. Codes are extracted and surfaced front and centre.',
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8623A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              ),
              title: 'Domain Management',
              desc: 'Add receiving domains and aliases. DNS instructions included for easy setup.',
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8623A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              ),
              title: 'Team Access',
              desc: 'Invite team members to your workspace. Controlled internal access, no complexity.',
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="p-7 rounded-2xl transition-all group"
              style={{
                background: 'rgba(255, 255, 255, 0.55)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0 2px 20px rgba(28, 20, 16, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
              }}
            >
              <div
                className="mb-4 p-2 rounded-lg inline-flex"
                style={{ background: 'rgba(255, 240, 232, 0.6)' }}
              >
                {f.icon}
              </div>
              <h3
                className="text-base font-semibold mb-1.5"
                style={{ fontFamily: 'var(--font-manrope)', color: '#1C1410' }}
              >
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#8A7568' }}>
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-8 py-10" style={{ borderTop: '1px solid rgba(238, 184, 152, 0.15)' }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded flex items-center justify-center text-white text-[9px] font-bold"
              style={{ background: 'linear-gradient(145deg, #E8623A, #c94b25)' }}
            >
              M
            </div>
            <span
              className="font-semibold text-sm"
              style={{ fontFamily: 'var(--font-manrope)', color: '#1C1410' }}
            >
              MailSifu
            </span>
          </div>
          <p className="text-xs" style={{ color: '#C4A694', fontFamily: 'var(--font-manrope)' }}>
            Internal OTP inbox workspace
          </p>
        </div>
      </footer>
    </div>
  )
}
