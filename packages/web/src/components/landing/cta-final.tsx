'use client';

import Link from 'next/link';

export default function CtaFinal() {
  return (
    <section style={{ position: 'relative', overflow: 'hidden', background: '#000', paddingTop: 'clamp(80px,10vw,140px)', paddingBottom: 0 }}>

      {/* Subtle top glow */}
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 600, height: 200, pointerEvents: 'none', background: 'radial-gradient(ellipse at 50% 0%, rgba(0,220,130,0.06), transparent 70%)' }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', paddingBottom: 72 }}>
        <h2 style={{
          fontFamily: 'var(--font-serif), Georgia, serif',
          fontSize: 'clamp(48px,6vw,80px)',
          fontWeight: 400,
          color: '#f5f5f5',
          lineHeight: 1.15,
          letterSpacing: '-0.02em',
          margin: '0 auto',
          maxWidth: 800,
        }}>
          Fraud stops here.<br />
          Ship with confidence.
        </h2>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 44, alignItems: 'center' }}>
          <Link href="/signup">
            <button className="inline-flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-full px-7 py-3 text-[15px] font-medium hover:bg-[#222] hover:border-[#333] transition-all duration-200 group" style={{ fontFamily: 'var(--font-geist-sans)' }}>
              Get started
              <span className="text-[#00DC82] group-hover:translate-x-0.5 transition-transform duration-200">›</span>
            </button>
          </Link>
          <Link href="mailto:hello@kairoscheck.net">
            <button className="inline-flex items-center gap-1 text-[#00DC82] text-[15px] hover:text-[#00e88a] transition-colors duration-200 group" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-geist-sans)' }}>
              Contact us
              <span className="group-hover:translate-x-0.5 transition-transform duration-200">›</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Giant watermark text */}
      <div style={{
        position: 'absolute', bottom: -40, left: '50%', transform: 'translateX(-50%)',
        whiteSpace: 'nowrap',
        fontFamily: 'var(--font-serif), Georgia, serif',
        fontSize: 'clamp(180px,25vw,380px)',
        fontWeight: 400,
        color: '#111',
        letterSpacing: '-0.04em',
        lineHeight: 1,
        pointerEvents: 'none', userSelect: 'none', zIndex: 1,
      }}>
        Kairos
      </div>

      {/* Bottom separator */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(to right, transparent, #1f1f1f 30%, #1f1f1f 70%, transparent)' }} />
    </section>
  );
}
