'use client';

const GREEN = '#00d97e';

const ACTIVE_NODES = [
  { cx: 190, cy: 120, delay: 0 },
  { cx: 300, cy: 170, delay: 0.6 },
  { cx: 130, cy: 230, delay: 1.2 },
  { cx: 260, cy: 280, delay: 0.3 },
  { cx: 320, cy: 240, delay: 0.9 },
  { cx: 100, cy: 170, delay: 1.5 },
];

export default function HeroGlobe() {
  return (
    <div style={{ position: 'relative', width: '100%', height: 420, overflow: 'hidden' }}>
      <style>{`
        @keyframes ring1 { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes ring2 { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        @keyframes ring3 { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes npulse { 0%,100% { r: 4; opacity: 0.9; } 50% { r: 8; opacity: 0.3; } }
        @keyframes fadeUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
        .hg-wrap { animation: fadeUp 1s ease forwards; }
        .hg-ring1 { transform-origin: 190px 190px; transform-box: fill-box; animation: ring1 18s linear infinite; }
        .hg-ring2 { transform-origin: 190px 190px; transform-box: fill-box; animation: ring2 24s linear infinite; }
        .hg-ring3 { transform-origin: 190px 190px; transform-box: fill-box; animation: ring3 32s linear infinite; }
        .hg-node { animation: npulse 2.5s ease-in-out infinite; }
      `}</style>

      {/* Ambient glow behind globe */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 340, height: 340,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, rgba(0,217,126,0.22) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <svg
        className="hg-wrap"
        viewBox="0 0 380 380"
        width="100%"
        height="100%"
        style={{ display: 'block', overflow: 'visible' }}
      >
        {/* Main sphere outline */}
        <circle cx="190" cy="190" r="168" fill="none" stroke={GREEN} strokeWidth="0.8" strokeOpacity="0.18" />
        <circle cx="190" cy="190" r="120" fill="none" stroke={GREEN} strokeWidth="0.5" strokeOpacity="0.08" />

        {/* Ring 1 — equatorial, fast */}
        <g className="hg-ring1">
          <ellipse cx="190" cy="190" rx="168" ry="50" fill="none" stroke={GREEN} strokeWidth="1.2" strokeOpacity="0.5" />
          {[0,60,120,180,240,300].map((deg, i) => {
            const r = (deg * Math.PI) / 180;
            return <circle key={i} cx={190 + 168 * Math.cos(r)} cy={190 + 50 * Math.sin(r)} r="3.5" fill={GREEN} fillOpacity="0.85" />;
          })}
        </g>

        {/* Ring 2 — tilted, reverse */}
        <g className="hg-ring2">
          <ellipse cx="190" cy="190" rx="155" ry="60" fill="none" stroke={GREEN} strokeWidth="1" strokeOpacity="0.38" />
          {[0,72,144,216,288].map((deg, i) => {
            const r = (deg * Math.PI) / 180;
            return <circle key={i} cx={190 + 155 * Math.cos(r)} cy={190 + 60 * Math.sin(r)} r="3" fill={GREEN} fillOpacity="0.7" />;
          })}
        </g>

        {/* Ring 3 — polar */}
        <g className="hg-ring3">
          <ellipse cx="190" cy="190" rx="55" ry="168" fill="none" stroke={GREEN} strokeWidth="0.8" strokeOpacity="0.28" />
          {[0,90,180,270].map((deg, i) => {
            const r = (deg * Math.PI) / 180;
            return <circle key={i} cx={190 + 55 * Math.cos(r)} cy={190 + 168 * Math.sin(r)} r="2.5" fill={GREEN} fillOpacity="0.55" />;
          })}
        </g>

        {/* Active pulsing nodes */}
        {ACTIVE_NODES.map((n, i) => (
          <g key={i}>
            <circle className="hg-node" cx={n.cx} cy={n.cy} r="4" fill={GREEN} fillOpacity="0.95"
              style={{ animationDelay: `${n.delay}s`, transformOrigin: `${n.cx}px ${n.cy}px`, transformBox: 'fill-box' }} />
            <circle cx={n.cx} cy={n.cy} r="12" fill="none" stroke={GREEN} strokeWidth="1" strokeOpacity="0.25"
              className="hg-node"
              style={{ animationDelay: `${n.delay + 0.1}s`, transformOrigin: `${n.cx}px ${n.cy}px`, transformBox: 'fill-box' }} />
          </g>
        ))}

        {/* Connection lines */}
        <line x1="190" y1="120" x2="300" y2="170" stroke={GREEN} strokeWidth="0.7" strokeOpacity="0.2" />
        <line x1="300" y1="170" x2="260" y2="280" stroke={GREEN} strokeWidth="0.7" strokeOpacity="0.2" />
        <line x1="130" y1="230" x2="260" y2="280" stroke={GREEN} strokeWidth="0.7" strokeOpacity="0.2" />
        <line x1="190" y1="120" x2="100" y2="170" stroke={GREEN} strokeWidth="0.7" strokeOpacity="0.15" />
        <line x1="100" y1="170" x2="130" y2="230" stroke={GREEN} strokeWidth="0.7" strokeOpacity="0.15" />
      </svg>
    </div>
  );
}
