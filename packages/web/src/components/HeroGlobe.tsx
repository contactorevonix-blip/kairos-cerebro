'use client';

import { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

const MARKERS: { location: [number, number]; size: number }[] = [
  { location: [38.7169,  -9.1395],  size: 0.06 },
  { location: [51.5074,  -0.1278],  size: 0.06 },
  { location: [40.7128, -74.0060],  size: 0.07 },
  { location: [-23.5505, -46.6333], size: 0.07 },
  { location: [35.6762,  139.6503], size: 0.06 },
  { location: [25.2048,   55.2708], size: 0.05 },
  { location: [1.3521,   103.8198], size: 0.05 },
  { location: [-33.8688, 151.2093], size: 0.05 },
  { location: [43.6532,  -79.3832], size: 0.06 },
  { location: [52.5200,   13.4050], size: 0.05 },
  { location: [6.5244,    3.3792],  size: 0.05 },
  { location: [19.0760,   72.8777], size: 0.06 },
];

export default function HeroGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let phi = 0;
    let rafId: number;

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: 600,
      height: 600,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.05, 0.05, 0.05],
      markerColor: [0, 0.85, 0.49],
      glowColor: [0, 0.85, 0.49],
      markers: MARKERS,
    });

    function animate() {
      phi += 0.003;
      globe.update({ phi });
      rafId = requestAnimationFrame(animate);
    }
    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      globe.destroy();
    };
  }, []);

  return (
    <div style={{ width: 500, height: 500, position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </div>
  );
}
