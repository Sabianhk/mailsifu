interface LanternProps {
  code: string
  size?: number
}

export function Lantern({ code, size = 110 }: LanternProps) {
  return (
    <div
      style={{
        width: size,
        transformOrigin: 'top center',
        animation: 'lanternSway 4.2s var(--ease-q) infinite alternate',
      }}
    >
      <div style={{ width: 1, height: 24, background: 'var(--ink-3)', margin: '0 auto' }} />
      <div
        style={{
          width: size * 0.6,
          height: 8,
          background: 'var(--ink)',
          margin: '0 auto',
          borderRadius: '4px 4px 0 0',
        }}
      />
      <div
        style={{
          width: size,
          height: size * 0.95,
          background:
            'radial-gradient(ellipse at 30% 30%, #E55B47 0%, #C8392B 40%, #8A1F17 100%)',
          borderRadius: '50%',
          position: 'relative',
          boxShadow:
            '0 18px 50px -8px rgba(200,57,43,0.45), inset -10px -16px 30px rgba(0,0,0,0.25), inset 8px 8px 16px rgba(255,180,120,0.3)',
          display: 'grid',
          placeItems: 'center',
          animation: 'glow 3s var(--ease-q) infinite',
        }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: 4,
              bottom: 4,
              left: '50%',
              width: 1,
              background: 'rgba(0,0,0,0.18)',
              transform: `translateX(-50%) rotateY(${i * 36}deg)`,
              borderRadius: 999,
            }}
          />
        ))}
        <div
          className="mono"
          style={{
            position: 'relative',
            background: 'rgba(250,244,228,0.92)',
            padding: '6px 12px',
            borderRadius: 4,
            fontWeight: 700,
            fontSize: size * 0.13,
            color: 'var(--cinnabar-3)',
            letterSpacing: '0.1em',
            boxShadow: '0 0 18px rgba(255,200,150,0.6)',
          }}
        >
          {code}
        </div>
      </div>
      <div style={{ width: 4, height: 8, background: 'var(--gold)', margin: '0 auto' }} />
      <div
        style={{
          width: 8,
          height: 18,
          background: 'linear-gradient(to bottom, var(--gold), #8B6724)',
          margin: '0 auto',
          borderRadius: '0 0 4px 4px',
          clipPath: 'polygon(0 0, 100% 0, 70% 100%, 30% 100%)',
        }}
      />
    </div>
  )
}
