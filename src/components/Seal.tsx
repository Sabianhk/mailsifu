interface SealProps {
  char?: string
  size?: number
  rotate?: number
}

export function Seal({ char = '信', size = 56, rotate = -8 }: SealProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: 'var(--cinnabar)',
        color: 'var(--rice)',
        display: 'grid',
        placeItems: 'center',
        borderRadius: 6,
        border: '2px solid var(--cinnabar-3)',
        fontFamily: 'var(--font-cjk)',
        fontWeight: 900,
        fontSize: size * 0.55,
        transform: `rotate(${rotate}deg)`,
        boxShadow:
          '0 6px 14px -8px rgba(138,31,23,0.6), inset 0 0 0 1px rgba(250,244,228,0.2)',
        position: 'relative',
      }}
    >
      {char}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.18,
          mixBlendMode: 'multiply',
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><filter id='n'><feTurbulence baseFrequency='1.8' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
      />
    </div>
  )
}
