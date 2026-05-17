'use client';

import { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

const MARKERS: { location: [number, number]; size: number }[] = [
  { location: [38.7, -9.1],   size: 0.08 },
  { location: [51.5, -0.1],   size: 0.07 },
  { location: [40.7, -74.0],  size: 0.09 },
  { location: [-23.5, -46.6], size: 0.08 },
  { location: [35.6, 139.6],  size: 0.07 },
  { location: [1.3, 103.8],   size: 0.06 },
  { location: [25.2, 55.2],   size: 0.06 },
  { location: [52.5, 13.4],   size: 0.06 },
  { location: [19.0, 72.8],   size: 0.07 },
  { location: [43.6, -79.3],  size: 0.06 },
];

export default function HeroGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phiRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: 600,
      height: 600,
      phi: 0,
      theta: 0.25,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.05, 0.05, 0.05],
      markerColor: [0, 0.85, 0.49],
      glowColor: [0, 0.85, 0.49],
      markers: MARKERS,
      onRender: (state) => {
        state.phi = phiRef.current;
        phiRef.current += 0.003;
      },
    });
    return () => globe.destroy();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={600}
      style={{ width: '100%', height: 'auto', display: 'block', maxWidth: 440 }}
    />
  );
}
