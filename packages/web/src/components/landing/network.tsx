'use client';

import { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  status: 'safe' | 'block' | 'neutral';
  pulse: number;
  pulseSpeed: number;
}

const COLORS = {
  safe: 'rgba(0,220,130,',
  block: 'rgba(239,68,68,',
  neutral: 'rgba(146,129,247,',
};

export default function FraudNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let nodes: Node[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      init();
    };

    const init = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const count = Math.floor((w * h) / 9000);
      nodes = Array.from({ length: count }, () => {
        const roll = Math.random();
        const status: Node['status'] =
          roll < 0.15 ? 'block' : roll < 0.35 ? 'safe' : 'neutral';
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          r: status === 'neutral' ? 2 : 3.5,
          status,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.02 + Math.random() * 0.02,
        };
      });
    };

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const maxDist = 120;

      // Move nodes
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += n.pulseSpeed;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }

      // Draw edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.25;
            const color =
              a.status === 'block' || b.status === 'block'
                ? `rgba(239,68,68,${alpha})`
                : a.status === 'safe' || b.status === 'safe'
                ? `rgba(0,220,130,${alpha})`
                : `rgba(146,129,247,${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const n of nodes) {
        const base = COLORS[n.status];
        const glow = n.status !== 'neutral';

        if (glow) {
          const pulseFactor = 0.7 + 0.3 * Math.sin(n.pulse);
          const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 6 * pulseFactor);
          grad.addColorStop(0, `${base}0.3)`);
          grad.addColorStop(1, `${base}0)`);
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r * 6 * pulseFactor, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `${base}0.9)`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
}
