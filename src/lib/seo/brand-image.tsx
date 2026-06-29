/** Shared OG / favicon brand mark for ImageResponse generators. */
export function BrandMark({
  titleSize = 72,
  subtitle,
  subtitleSize = 36,
  compact = false,
}: {
  titleSize?: number;
  subtitle?: string;
  subtitleSize?: number;
  compact?: boolean;
}) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: compact ? 'center' : 'flex-start',
        padding: compact ? 0 : 72,
        background: 'linear-gradient(135deg, #0f172a 0%, #064e3b 55%, #10b981 100%)',
        color: '#ffffff',
        fontFamily: 'sans-serif',
        textAlign: compact ? 'center' : 'left',
      }}
    >
      <div
        style={{
          display: 'flex',
          fontSize: titleSize,
          fontWeight: 800,
          letterSpacing: '-0.04em',
          marginBottom: subtitle ? 16 : 0,
        }}
      >
        <span>Sajilo</span>
        <span style={{ color: '#a7f3d0' }}>Work</span>
      </div>
      {subtitle ? (
        <div
          style={{
            fontSize: subtitleSize,
            fontWeight: 500,
            lineHeight: 1.35,
            maxWidth: 900,
            opacity: 0.95,
          }}
        >
          {subtitle}
        </div>
      ) : null}
    </div>
  );
}
