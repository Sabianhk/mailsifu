interface LogoProps {
  size?: number
  dark?: boolean
  withWordmark?: boolean
}

export function Logo({ size = 28, dark = false, withWordmark = true }: LogoProps) {
  const color = dark ? '#FAF4E4' : '#1A1410'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <span style={{ position: 'relative', width: size, height: size, display: 'inline-block' }}>
        <svg viewBox="0 0 40 40" width={size} height={size}>
          <rect x="3" y="3" width="34" height="34" rx="5" fill="#C8392B" />
          <rect x="3" y="3" width="34" height="34" rx="5" fill="none" stroke="#8A1F17" strokeWidth="1.2" />
          <text
            x="20"
            y="27"
            textAnchor="middle"
            fontFamily="var(--font-cjk)"
            fontWeight="900"
            fontSize="22"
            fill="#FAF4E4"
          >
            信
          </text>
        </svg>
      </span>
      {withWordmark && (
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
            fontStyle: 'italic',
            fontSize: size * 0.78,
            letterSpacing: '-0.02em',
            color,
          }}
        >
          MailSifu
        </span>
      )}
    </span>
  )
}
