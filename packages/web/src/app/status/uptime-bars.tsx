'use client';

type DayState = 'operational' | 'degraded' | 'incident';

function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function getState(serviceIndex: number, dayIndex: number): DayState {
  const r = seededRand(serviceIndex * 1000 + dayIndex);
  if (dayIndex === 89) return 'operational';
  if (serviceIndex === 0 && dayIndex === 42) return 'degraded';
  if (serviceIndex === 1 && dayIndex === 67) return 'degraded';
  if (serviceIndex === 5 && dayIndex === 23) return 'incident';
  if (serviceIndex === 5 && dayIndex === 24) return 'degraded';
  if (r < 0.005) return 'incident';
  if (r < 0.025) return 'degraded';
  return 'operational';
}

const STATE_COLORS: Record<DayState, { base: string; hover: string }> = {
  operational: { base: '#1a4d2e', hover: '#00DC82' },
  degraded:    { base: '#4d3a00', hover: '#FFB800' },
  incident:    { base: '#4d0f0f', hover: '#FF4444' },
};

const STATE_LABELS: Record<DayState, string> = {
  operational: 'Operational',
  degraded:    'Degraded performance',
  incident:    'Incident',
};

export default function UptimeBars({ serviceIndex }: { serviceIndex: number }) {
  const days = Array.from({ length: 90 }, (_, i) => getState(serviceIndex, i));

  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
      {days.map((state, i) => {
        const isToday = i === 89;
        const colors = STATE_COLORS[state];
        return (
          <div
            key={i}
            title={`Day ${i + 1}: ${STATE_LABELS[state]}`}
            style={{
              width: 6,
              height: 24,
              borderRadius: 2,
              background: isToday ? '#00DC82' : colors.base,
              cursor: 'default',
              transition: 'background 150ms',
              flexShrink: 0,
            }}
            onMouseEnter={e => { if (!isToday) e.currentTarget.style.background = colors.hover; }}
            onMouseLeave={e => { if (!isToday) e.currentTarget.style.background = colors.base; }}
          />
        );
      })}
    </div>
  );
}
