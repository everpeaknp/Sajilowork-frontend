import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Sajilowork — hire skilled taskers and freelancers in Nepal';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '72px',
          background: 'linear-gradient(135deg, #0f172a 0%, #064e3b 55%, #10b981 100%)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 24 }}>
          Sajilo<span style={{ color: '#a7f3d0' }}>Work</span>
        </div>
        <div style={{ fontSize: 36, fontWeight: 500, lineHeight: 1.35, maxWidth: 900, opacity: 0.95 }}>
          Hire skilled taskers, find jobs, and book local services across Nepal.
        </div>
      </div>
    ),
    { ...size },
  );
}
