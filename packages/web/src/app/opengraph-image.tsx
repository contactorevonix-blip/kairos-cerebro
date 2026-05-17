import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#000',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Grid lines */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        {/* Radial glow */}
        <div style={{
          position: 'absolute',
          top: -80,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 900,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(0,220,130,0.15) 0%, transparent 70%)',
        }} />

        {/* Logo icon */}
        <div style={{
          width: 96, height: 96,
          borderRadius: 22,
          background: '#00DC82',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 40,
          position: 'relative',
          boxShadow: '0 0 80px rgba(0,220,130,0.4)',
        }}>
          <span style={{ color: '#000', fontSize: 56, fontWeight: 900, lineHeight: '1' }}>K</span>
        </div>

        {/* Heading */}
        <div style={{
          fontSize: 72,
          fontWeight: 800,
          color: '#fff',
          letterSpacing: '-3px',
          lineHeight: '1',
          marginBottom: 20,
        }}>
          Kairos Check
        </div>

        {/* Subtitle */}
        <div style={{
          fontSize: 28,
          color: '#555',
          letterSpacing: '-0.5px',
        }}>
          Fraud Detection API for indie devs
        </div>

        {/* Badge */}
        <div style={{
          marginTop: 44,
          background: 'rgba(0,220,130,0.08)',
          border: '1px solid rgba(0,220,130,0.2)',
          borderRadius: 9999,
          padding: '10px 28px',
          fontSize: 18,
          color: '#00DC82',
          fontWeight: 600,
          letterSpacing: '-0.3px',
        }}>
          Stop fraud before it ships.
        </div>
      </div>
    ),
    { ...size },
  );
}
