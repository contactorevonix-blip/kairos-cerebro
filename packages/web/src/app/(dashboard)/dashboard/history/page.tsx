import { History } from 'lucide-react'

interface CheckRecord {
  check_id:   string
  score:      number
  band:       string
  decision:   string
  active_flags: string[]
  ts:         number
  execution_time_ms: number
}

const BAND_COLOR: Record<string, string> = {
  safe:     'var(--kc-success)',
  low:      'var(--kc-success)',
  medium:   'var(--kc-warning)',
  high:     'var(--kc-danger)',
  critical: 'var(--kc-danger)',
}

const DECISION_BG: Record<string, string> = {
  accept:  'oklch(72.3% 0.219 149.579 / 12%)',
  review:  'oklch(76.9% 0.188 70.08 / 12%)',
  decline: 'oklch(63.7% 0.237 25.331 / 12%)',
}

async function fetchHistory(): Promise<{ checks: CheckRecord[]; total: number }> {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const res  = await fetch(`${base}/api/checks?limit=50`, { cache: 'no-store' })
    if (!res.ok) throw new Error()
    return res.json()
  } catch {
    return { checks: [], total: 0 }
  }
}

function ScorePill({ score, band }: { score: number; band: string }) {
  return (
    <span style={{
      fontFamily: 'monospace', fontSize: '13px', fontWeight: 600,
      color: BAND_COLOR[band] || 'var(--kc-text-primary)',
    }}>
      {score}
    </span>
  )
}

function DecisionBadge({ decision }: { decision: string }) {
  return (
    <span style={{
      background:   DECISION_BG[decision] || 'transparent',
      color:        decision === 'accept' ? 'var(--kc-success)' : decision === 'decline' ? 'var(--kc-danger)' : 'var(--kc-warning)',
      padding:      '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 500,
    }}>
      {decision}
    </span>
  )
}

export default async function HistoryPage() {
  const { checks, total } = await fetchHistory()

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '24px' }}>
        <h1 style={{ color: 'var(--kc-text-primary)', fontSize: '22px', fontWeight: 700 }}>Histórico</h1>
        {total > 0 && (
          <span style={{ color: 'var(--kc-text-muted)', fontSize: '13px' }}>{total.toLocaleString()} checks total</span>
        )}
      </div>

      <div style={{ background: 'var(--kc-bg-surface)', border: '1px solid var(--kc-border-subtle)', borderRadius: '12px', overflow: 'hidden' }}>
        {checks.length === 0 ? (
          <div style={{ padding: '64px', textAlign: 'center' }}>
            <History size={36} style={{ color: 'var(--kc-text-muted)', margin: '0 auto 12px', display: 'block' }} />
            <p style={{ color: 'var(--kc-text-muted)', fontSize: '14px' }}>Nenhum check ainda.</p>
            <p style={{ color: 'var(--kc-text-disabled)', fontSize: '13px', marginTop: '4px' }}>
              Os checks aparecem aqui em tempo real.
            </p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--kc-border-subtle)' }}>
                {['Check ID', 'Score', 'Decisão', 'Flags', 'Latência', 'Quando'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left',
                    color: 'var(--kc-text-muted)', fontSize: '12px',
                    fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {checks.map((c, i) => (
                <tr key={c.check_id} style={{
                  borderBottom: i < checks.length - 1 ? '1px solid var(--kc-border-subtle)' : 'none',
                }}>
                  <td style={{ padding: '12px 16px' }}>
                    <code style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--kc-text-muted)' }}>
                      {c.check_id?.slice(-12)}
                    </code>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <ScorePill score={c.score} band={c.band} />
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <DecisionBadge decision={c.decision} />
                  </td>
                  <td style={{ padding: '12px 16px', maxWidth: '220px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {(c.active_flags || []).map(flag => (
                        <span key={flag} style={{
                          background: 'var(--kc-bg-elevated)',
                          color: 'var(--kc-text-secondary)',
                          padding: '1px 6px', borderRadius: '4px', fontSize: '11px',
                          fontFamily: 'monospace',
                        }}>
                          {flag.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--kc-text-muted)', fontSize: '12px', fontFamily: 'monospace' }}>
                    {c.execution_time_ms}ms
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--kc-text-muted)', fontSize: '12px' }}>
                    {new Date(c.ts).toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
