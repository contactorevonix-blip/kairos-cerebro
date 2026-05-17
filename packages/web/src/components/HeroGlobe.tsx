'use client';

export default function HeroGlobe() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: 460 }}>
      <style>{`
        @keyframes spin-cw  { from { transform: rotateX(75deg) rotateZ(0deg);   } to { transform: rotateX(75deg) rotateZ(360deg);   } }
        @keyframes spin-ccw { from { transform: rotateX(75deg) rotateZ(0deg);   } to { transform: rotateX(75deg) rotateZ(-360deg);  } }
        @keyframes spin-pol { from { transform: rotateY(80deg) rotateZ(0deg);   } to { transform: rotateY(80deg) rotateZ(360deg);   } }
        @keyframes spin-di  { from { transform: rotateX(45deg) rotateY(20deg) rotateZ(0deg); } to { transform: rotateX(45deg) rotateY(20deg) rotateZ(360deg); } }
        @keyframes dot-pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.2; transform:scale(2.5); } }
        @keyframes globe-in  { from { opacity:0; transform:scale(0.85); } to { opacity:1; transform:scale(1); } }
        .hg-scene { animation: globe-in 1.2s cubic-bezier(0.16,1,0.3,1) forwards; }
        .hg-r1 { animation: spin-cw  18s linear infinite; }
        .hg-r2 { animation: spin-ccw 24s linear infinite; }
        .hg-r3 { animation: spin-pol 28s linear infinite; }
        .hg-r4 { animation: spin-di  20s linear infinite; }
      `}</style>

      {/* Scene wrapper */}
      <div className="hg-scene" style={{
        position: 'relative',
        width: 360,
        height: 360,
        perspective: 900,
        perspectiveOrigin: '50% 50%',
      }}>

        {/* Ambient glow */}
        <div style={{
          position: 'absolute', inset: '-20px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(0,217,126,0.28) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        {/* Outer sphere ring (static) */}
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%',
          border: '1px solid rgba(0,217,126,0.2)',
        }} />

        {/* Ring 1 — equatorial */}
        <div className="hg-r1" style={{
          position: 'absolute', inset: 8,
          borderRadius: '50%',
          border: '1.5px solid rgba(0,217,126,0.75)',
          transformStyle: 'preserve-3d',
        }} />

        {/* Ring 2 — tilted CCW */}
        <div className="hg-r2" style={{
          position: 'absolute', inset: 22,
          borderRadius: '50%',
          border: '1.5px solid rgba(0,217,126,0.6)',
          transformStyle: 'preserve-3d',
        }} />

        {/* Ring 3 — polar */}
        <div className="hg-r3" style={{
          position: 'absolute', inset: 40,
          borderRadius: '50%',
          border: '1px solid rgba(0,217,126,0.45)',
          transformStyle: 'preserve-3d',
        }} />

        {/* Ring 4 — diagonal */}
        <div className="hg-r4" style={{
          position: 'absolute', inset: 60,
          borderRadius: '50%',
          border: '1px solid rgba(0,217,126,0.35)',
          transformStyle: 'preserve-3d',
        }} />

        {/* Pulsing nodes */}
        {[
          { top: '12%',  left: '50%',  d: 0 },
          { top: '28%',  left: '88%',  d: 0.5 },
          { top: '65%',  left: '82%',  d: 1.0 },
          { top: '78%',  left: '45%',  d: 0.3 },
          { top: '60%',  left: '10%',  d: 0.8 },
          { top: '25%',  left: '14%',  d: 1.3 },
          { top: '45%',  left: '95%',  d: 0.6 },
          { top: '42%',  left: '5%',   d: 1.6 },
        ].map((n, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: n.top, left: n.left,
            transform: 'translate(-50%, -50%)',
          }}>
            <div style={{
              width: 8, height: 8,
              borderRadius: '50%',
              background: '#00d97e',
              boxShadow: '0 0 8px rgba(0,217,126,0.8)',
              animation: `dot-pulse 2.5s ease-in-out ${n.d}s infinite`,
            }} />
          </div>
        ))}

        {/* Connection lines (SVG, no transforms) */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <line x1="50%" y1="12%" x2="88%" y2="28%" stroke="#00d97e" strokeWidth="0.8" strokeOpacity="0.3" />
          <line x1="88%" y1="28%" x2="82%" y2="65%" stroke="#00d97e" strokeWidth="0.8" strokeOpacity="0.3" />
          <line x1="82%" y1="65%" x2="45%" y2="78%" stroke="#00d97e" strokeWidth="0.8" strokeOpacity="0.3" />
          <line x1="45%" y1="78%" x2="10%" y2="60%" stroke="#00d97e" strokeWidth="0.8" strokeOpacity="0.3" />
          <line x1="10%" y1="60%" x2="14%" y2="25%" stroke="#00d97e" strokeWidth="0.8" strokeOpacity="0.3" />
          <line x1="14%" y1="25%" x2="50%" y2="12%" stroke="#00d97e" strokeWidth="0.8" strokeOpacity="0.3" />
        </svg>
      </div>
    </div>
  );
}
