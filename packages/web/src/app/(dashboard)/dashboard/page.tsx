import { Suspense } from 'react'

interface Stats {
  total:       number
  avg_score:   number
  accept_rate: number
  today_calls: number
  by_band:     Record<string, number>
}

async function fetchStats(): Promise<Stats> {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const res  = await fetch(`${base}/api/stats`, { cache: 'no-store' })
    if (!res.ok) throw new Error()
    return res.json()
  } catch {
    return { total: 0, avg_score: 0, accept_rate: 0, today_calls: 0, by_band: {} }
  }
}

const BAND_COLORS: Record<string, string> = {
  safe:     'var(--kc-success)',
  low:      'var(--kc-success)',
  medium:   'var(--kc-warning)',
  high:     'var(--kc-danger)',
  critical: 'var(--kc-danger)',
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{
      background:   'var(--kc-bg-surface)',
      border:       '1px solid var(--kc-border-subtle)',
      borderRadius: '12px',
      padding:      '20px 24px',
    }}>
      <p style={{ color: 'var(--kc-text-muted)', fontSize: '13px', marginBottom: '8px' }}>{label}</p>
      <p style={{ color: color || 'var(--kc-text-primary)', fontSize: '28px', fontWeight: 700, fontFamily: 'monospace' }}>
        {value}
      </p>
      {sub && <p style={{ color: 'var(--kc-text-muted)', fontSize: '12px', marginTop: '4px' }}>{sub}</p>}
    </div>
  )
}

async function StatsGrid() {
  const s = await fetchStats()
  const scoreColor = s.avg_score < 30 ? 'var(--kc-success)' : s.avg_score < 60 ? 'var(--kc-warning)' : 'var(--kc-danger)'

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <StatCard label="Total Checks"   value={s.total.toLocaleString()} />
        <StatCard label="Score Médio"    value={s.avg_score}    color={scoreColor} sub="0 = seguro · 100 = crítico" />
        <StatCard label="Taxa de Aceite" value={`${s.accept_rate}%`} color="var(--kc-success)" />
        <StatCard label="Hoje"           value={s.today_calls}  sub="chamadas nas últimas 24h" />
      </div>

      {Object.keys(s.by_band).length > 0 && (
        <div style={{ background: 'var(--kc-bg-surface)', border: '1px solid var(--kc-border-subtle)', borderRadius: '12px', padding: '20px 24px' }}>
          <p style={{ color: 'var(--kc-text-secondary)', fontSize: '14px', marginBottom: '16px', fontWeight: 500 }}>Distribuição por banda de risco</p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {Object.entries(s.by_band).map(([band, count]) => (
              <div key={band} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: BAND_COLORS[band] || 'var(--kc-text-muted)', flexShrink: 0 }} />
                <span style={{ color: 'var(--kc-text-secondary)', fontSize: '13px' }}>{band}</span>
                <span style={{ color: 'var(--kc-text-primary)', fontSize: '13px', fontWeight: 600 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {s.total === 0 && (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--kc-text-muted)', fontSize: '15px' }}>
          Nenhum check ainda. Gera uma API key e faz o teu primeiro check.
        </div>
      )}
    </>
  )
}

export default function DashboardPage() {
  return (
    <div>
      <h1 style={{ color: 'var(--kc-text-primary)', fontSize: '22px', fontWeight: 700, marginBottom: '24px' }}>
        Overview
      </h1>
      <Suspense fallback={
        <div style={{ color: 'var(--kc-text-muted)', fontSize: '14px' }}>A carregar...</div>
      }>
        <StatsGrid />
      </Suspense>
    </div>
  )
}
