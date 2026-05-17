'use client';

import { useEffect, useRef } from 'react';

const GREEN = '#00d97e';

/* Nodes distributed around each ring */
const RINGS = [
  { rx: 180, ry: 50, tilt: 0,   speed: 18, nodes: 6 },
  { rx: 160, ry: 55, tilt: 50,  speed: 24, nodes: 5 },
  { rx: 140, ry: 48, tilt: -40, speed: 20, nodes: 5 },
  { rx: 100, ry: 35, tilt: 75,  speed: 30, nodes: 4 },
];

const ACTIVE_NODES = [
  { cx: 200, cy: 160, delay: 0 },
  { cx: 320, cy: 200, delay: 0.6 },
  { cx: 160, cy: 280, delay: 1.2 },
  { cx: 280, cy: 310, delay: 0.3 },
  { cx: 350, cy: 150, delay: 0.9 },
  { cx: 120, cy: 200, delay: 1.5 },
];

export default function HeroGlobe() {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 480,
        height: 480,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <style>{`
        @keyframes globe-spin-1 { from { transform: rotateX(70deg) rotateZ(0deg); } to { transform: rotateX(70deg) rotateZ(360deg); } }
        @keyframes globe-spin-2 { from { transform: rotateX(70deg) rotateZ(50deg) rotateY(0deg); } to { transform: rotateX(70deg) rotateZ(50deg) rotateY(360deg); } }
        @keyframes globe-spin-3 { from { transform: rotateX(30deg) rotateZ(-40deg) rotateY(0deg); } to { transform: rotateX(30deg) rotateZ(-40deg) rotateY(360deg); } }
        @keyframes globe-spin-4 { from { transform: rotateX(10deg) rotateZ(75deg) rotateY(0deg); } to { transform: rotateX(10deg) rotateZ(75deg) rotateY(360deg); } }
        @keyframes node-pulse { 0%,100% { transform: scale(1); opacity: 0.9; } 50% { transform: scale(2.2); opacity: 0.4; } }
        @keyframes globe-fade-in { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
        .hero-globe-root { animation: globe-fade-in 1.2s ease forwards; }
        .ring-1 { animation: globe-spin-1 18s linear infinite; }
        .ring-2 { animation: globe-spin-2 24s linear infinite; }
        .ring-3 { animation: globe-spin-3 20s linear infinite reverse; }
        .ring-4 { animation: globe-spin-4 30s linear infinite; }
        .active-node { animation: node-pulse 2.5s ease-in-out infinite; }
      `}</style>

      {/* Outer ambient glow */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, rgba(0,217,126,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div
        className="hero-globe-root"
        style={{
          position: 'relative',
          width: 380,
          height: 380,
          perspective: 800,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Central sphere glow */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 120, height: 120,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(0,217,126,0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Outer wireframe circle */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}
          viewBox="0 0 380 380"
        >
          {/* Main sphere outline */}
          <circle cx="190" cy="190" r="170" fill="none" stroke={GREEN} strokeWidth="0.5" strokeOpacity="0.2" />
          <circle cx="190" cy="190" r="130" fill="none" stroke={GREEN} strokeWidth="0.4" strokeOpacity="0.1" />

          {/* Ring 1 — equatorial */}
          <g className="ring-1" style={{ transformOrigin: '190px 190px', transformBox: 'fill-box' }}>
            <ellipse cx="190" cy="190" rx="170" ry="48" fill="none" stroke={GREEN} strokeWidth="1" strokeOpacity="0.45" />
            {[0,60,120,180,240,300].map((deg, i) => {
              const rad = (deg * Math.PI) / 180;
              const x = 190 + 170 * Math.cos(rad);
              const y = 190 + 48 * Math.sin(rad);
              return <circle key={i} cx={x} cy={y} r="3" fill={GREEN} fillOpacity="0.8" />;
            })}
          </g>

          {/* Ring 2 — tilted */}
          <g className="ring-2" style={{ transformOrigin: '190px 190px', transformBox: 'fill-box' }}>
            <ellipse cx="190" cy="190" rx="155" ry="52" fill="none" stroke={GREEN} strokeWidth="1" strokeOpacity="0.35" />
            {[0,72,144,216,288].map((deg, i) => {
              const rad = (deg * Math.PI) / 180;
              const x = 190 + 155 * Math.cos(rad);
              const y = 190 + 52 * Math.sin(rad);
              return <circle key={i} cx={x} cy={y} r="2.5" fill={GREEN} fillOpacity="0.7" />;
            })}
          </g>

          {/* Ring 3 — opposite tilt */}
          <g className="ring-3" style={{ transformOrigin: '190px 190px', transformBox: 'fill-box' }}>
            <ellipse cx="190" cy="190" rx="140" ry="44" fill="none" stroke={GREEN} strokeWidth="0.8" strokeOpacity="0.3" />
            {[0,72,144,216,288].map((deg, i) => {
              const rad = (deg * Math.PI) / 180;
              const x = 190 + 140 * Math.cos(rad);
              const y = 190 + 44 * Math.sin(rad);
              return <circle key={i} cx={x} cy={y} r="2" fill={GREEN} fillOpacity="0.6" />;
            })}
          </g>

          {/* Ring 4 — polar */}
          <g className="ring-4" style={{ transformOrigin: '190px 190px', transformBox: 'fill-box' }}>
            <ellipse cx="190" cy="190" rx="90" ry="170" fill="none" stroke={GREEN} strokeWidth="0.7" strokeOpacity="0.25" />
            {[0,90,180,270].map((deg, i) => {
              const rad = (deg * Math.PI) / 180;
              const x = 190 + 90 * Math.cos(rad);
              const y = 190 + 170 * Math.sin(rad);
              return <circle key={i} cx={x} cy={y} r="2" fill={GREEN} fillOpacity="0.5" />;
            })}
          </g>

          {/* Active pulsing nodes */}
          {ACTIVE_NODES.map((n, i) => (
            <g key={i}>
              <circle
                cx={n.cx} cy={n.cy} r="4"
                fill={GREEN}
                fillOpacity="0.9"
                className="active-node"
                style={{ animationDelay: `${n.delay}s`, transformOrigin: `${n.cx}px ${n.cy}px`, transformBox: 'fill-box' }}
              />
              <circle cx={n.cx} cy={n.cy} r="10" fill="none" stroke={GREEN} strokeWidth="1" strokeOpacity="0.3"
                className="active-node"
                style={{ animationDelay: `${n.delay}s`, transformOrigin: `${n.cx}px ${n.cy}px`, transformBox: 'fill-box' }}
              />
            </g>
          ))}

          {/* Connection lines between active nodes */}
          {ACTIVE_NODES.slice(0, 4).map((a, i) =>
            ACTIVE_NODES.slice(i + 1, i + 3).map((b, j) => (
              <line
                key={`${i}-${j}`}
                x1={a.cx} y1={a.cy} x2={b.cx} y2={b.cy}
                stroke={GREEN} strokeWidth="0.6" strokeOpacity="0.2"
              />
            ))
          )}
        </svg>
      </div>
    </div>
  );
}
