'use client'

import { useEffect, useRef, useState } from 'react'

interface WolfMascotProps {
  size?: number
  follow?: boolean
  sleeping?: boolean
  happy?: boolean
  holdCode?: string | null
}

export function WolfMascot({
  size = 200,
  follow = true,
  sleeping = false,
  happy = true,
  holdCode = null,
}: WolfMascotProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [eye, setEye] = useState({ x: 0, y: 0 })
  const [blink, setBlink] = useState(false)
  const [hover, setHover] = useState(false)

  useEffect(() => {
    if (!follow || sleeping) return
    const onMove = (e: MouseEvent) => {
      const r = ref.current?.getBoundingClientRect()
      if (!r) return
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      const dx = (e.clientX - cx) / Math.max(window.innerWidth, 800)
      const dy = (e.clientY - cy) / Math.max(window.innerHeight, 800)
      setEye({
        x: Math.max(-1, Math.min(1, dx * 4)),
        y: Math.max(-1, Math.min(1, dy * 4)),
      })
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [follow, sleeping])

  useEffect(() => {
    if (sleeping) return
    const t = setInterval(() => {
      setBlink(true)
      setTimeout(() => setBlink(false), 140)
    }, 2400 + Math.random() * 1800)
    return () => clearInterval(t)
  }, [sleeping])

  const ex = eye.x * 1.6
  const ey = eye.y * 1.4

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ width: size, height: size, position: 'relative', display: 'inline-block' }}
    >
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        style={{
          overflow: 'visible',
          animation: sleeping
            ? 'breathe 3.4s var(--ease-q) infinite'
            : 'breathe 2.2s var(--ease-q) infinite',
        }}
      >
        <defs>
          <radialGradient id="wolfBody" cx="0.5" cy="0.45">
            <stop offset="0%" stopColor="#F5EBD8" />
            <stop offset="55%" stopColor="#D6C5A5" />
            <stop offset="100%" stopColor="#9E8765" />
          </radialGradient>
          <radialGradient id="wolfBelly" cx="0.5" cy="0.6">
            <stop offset="0%" stopColor="#FBF5E5" />
            <stop offset="100%" stopColor="#E8D9B7" />
          </radialGradient>
          <radialGradient id="wolfCheek" cx="0.5" cy="0.5">
            <stop offset="0%" stopColor="#E89589" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#E89589" stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse cx="100" cy="178" rx="48" ry="6" fill="#1A1410" opacity="0.18" />

        <g
          style={{
            transformOrigin: '155px 130px',
            animation: sleeping ? 'none' : 'wag 1.2s var(--ease-q) infinite',
          }}
        >
          <path
            d="M150 130 Q175 110 178 88 Q180 75 170 72 Q165 78 165 92 Q160 110 148 122 Z"
            fill="url(#wolfBody)"
            stroke="#3E2F1F"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M170 72 Q172 84 165 92" fill="#FBF5E5" />
        </g>

        <ellipse cx="100" cy="135" rx="50" ry="38" fill="url(#wolfBody)" stroke="#3E2F1F" strokeWidth="1.8" />
        <ellipse cx="100" cy="145" rx="32" ry="22" fill="url(#wolfBelly)" />

        <ellipse cx="78" cy="170" rx="12" ry="9" fill="url(#wolfBody)" stroke="#3E2F1F" strokeWidth="1.5" />
        <ellipse cx="122" cy="170" rx="12" ry="9" fill="url(#wolfBody)" stroke="#3E2F1F" strokeWidth="1.5" />
        {[78, 122].map((cx) => (
          <g key={cx}>
            <circle cx={cx - 4} cy={172} r="1.4" fill="#3E2F1F" />
            <circle cx={cx} cy={172} r="1.4" fill="#3E2F1F" />
            <circle cx={cx + 4} cy={172} r="1.4" fill="#3E2F1F" />
          </g>
        ))}

        <g
          style={{
            transformOrigin: '100px 90px',
            transform: `translate(${ex * 0.6}px, ${ey * 0.4}px)`,
            transition: 'transform 0.25s var(--ease)',
          }}
        >
          <g style={{ transformOrigin: '78px 60px', animation: sleeping ? 'none' : 'earTwitch 5s var(--ease-q) infinite' }}>
            <path d="M70 70 L72 38 L92 60 Z" fill="url(#wolfBody)" stroke="#3E2F1F" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M76 60 L78 46 L86 58 Z" fill="#E89589" />
          </g>
          <g style={{ transformOrigin: '122px 60px', animation: sleeping ? 'none' : 'earTwitch 7s var(--ease-q) infinite 2s' }}>
            <path d="M130 70 L128 38 L108 60 Z" fill="url(#wolfBody)" stroke="#3E2F1F" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M124 60 L122 46 L114 58 Z" fill="#E89589" />
          </g>

          <circle cx="100" cy="92" r="38" fill="url(#wolfBody)" stroke="#3E2F1F" strokeWidth="1.8" />
          <ellipse cx="100" cy="106" rx="22" ry="16" fill="#FBF5E5" stroke="#3E2F1F" strokeWidth="1.4" />
          <ellipse cx="78" cy="106" rx="10" ry="7" fill="url(#wolfCheek)" />
          <ellipse cx="122" cy="106" rx="10" ry="7" fill="url(#wolfCheek)" />

          {sleeping ? (
            <>
              <path d="M82 92 q6 4 12 0" stroke="#1A1410" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M106 92 q6 4 12 0" stroke="#1A1410" strokeWidth="2" fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              <ellipse cx="86" cy="92" rx="7" ry={blink ? 0.6 : 7} fill="#FBF5E5" stroke="#1A1410" strokeWidth="1.4" />
              {!blink && (
                <>
                  <circle cx={86 + ex} cy={92 + ey} r="4.5" fill="#1A1410" />
                  <circle cx={86 + ex + 1.2} cy={92 + ey - 1.2} r="1.4" fill="#FBF5E5" />
                </>
              )}
              <ellipse cx="114" cy="92" rx="7" ry={blink ? 0.6 : 7} fill="#FBF5E5" stroke="#1A1410" strokeWidth="1.4" />
              {!blink && (
                <>
                  <circle cx={114 + ex} cy={92 + ey} r="4.5" fill="#1A1410" />
                  <circle cx={114 + ex + 1.2} cy={92 + ey - 1.2} r="1.4" fill="#FBF5E5" />
                </>
              )}
            </>
          )}

          <path d="M94 100 Q100 96 106 100 Q104 106 100 107 Q96 106 94 100 Z" fill="#1A1410" />
          <circle cx="98" cy="100.5" r="1" fill="#FBF5E5" opacity="0.7" />

          {happy ? (
            <path
              d="M100 107 Q92 116 86 112 M100 107 Q108 116 114 112"
              stroke="#1A1410"
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
            />
          ) : (
            <path d="M100 107 Q100 113 100 113" stroke="#1A1410" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          )}
          {hover && !sleeping && <path d="M97 113 q3 3 6 0 q-3 -2 -6 0 Z" fill="#E89589" />}

          <g>
            <rect x="62" y="68" width="76" height="9" rx="1.5" fill="#C8392B" stroke="#8A1F17" strokeWidth="1" />
            <text
              x="100"
              y="75"
              textAnchor="middle"
              fontFamily="var(--font-cjk)"
              fontWeight="900"
              fontSize="7"
              fill="#FAF4E4"
            >
              師
            </text>
            <path d="M62 72 q-10 4 -6 16 q-2 -8 -10 -4" stroke="#C8392B" strokeWidth="2.4" fill="none" strokeLinecap="round" />
            <path d="M138 72 q10 4 6 16 q2 -8 10 -4" stroke="#C8392B" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          </g>
        </g>

        {sleeping && (
          <g style={{ animation: 'bob 2s var(--ease-q) infinite' }}>
            <text x="140" y="60" fontFamily="var(--font-display)" fontStyle="italic" fontSize="14" fill="#5A4A38" opacity="0.6">z</text>
            <text x="150" y="48" fontFamily="var(--font-display)" fontStyle="italic" fontSize="18" fill="#5A4A38" opacity="0.7">Z</text>
          </g>
        )}

        {holdCode && (
          <g style={{ transformOrigin: '100px 160px', animation: 'bob 2.5s var(--ease-q) infinite' }}>
            <rect x="68" y="156" width="64" height="22" rx="3" fill="#FBF5E5" stroke="#8A1F17" strokeWidth="1.2" />
            <rect x="68" y="156" width="64" height="22" rx="3" fill="none" stroke="#C8392B" strokeDasharray="2 2" strokeWidth="0.7" />
            <text x="100" y="171" textAnchor="middle" fontFamily="var(--font-mono)" fontWeight="700" fontSize="11" fill="#8A1F17">
              {holdCode}
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}
