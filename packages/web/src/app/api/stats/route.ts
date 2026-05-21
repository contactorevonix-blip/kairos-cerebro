import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'node:fs'
import { join }         from 'node:path'

const CHECKS_FILE = join(
  process.cwd(), '..', '..', '.kairos-data', 'check-engine-checks.jsonl'
)

export async function GET() {
  if (!existsSync(CHECKS_FILE)) {
    return NextResponse.json({ total: 0, avg_score: 0, accept_rate: 0, by_band: {} })
  }

  try {
    const lines  = readFileSync(CHECKS_FILE, 'utf8').trim().split('\n').filter(Boolean)
    const checks = lines
      .map(l => { try { return JSON.parse(l) } catch { return null } })
      .filter((c): c is NonNullable<typeof c> => c !== null && c.type !== 'feedback' && typeof c.score === 'number')

    const total      = checks.length
    const avgScore   = total ? Math.round(checks.reduce((s, c) => s + c.score, 0) / total) : 0
    const accepts    = checks.filter(c => c.decision === 'accept').length
    const acceptRate = total ? Math.round((accepts / total) * 100) : 0

    const byBand: Record<string, number> = {}
    for (const c of checks) {
      byBand[c.band] = (byBand[c.band] || 0) + 1
    }

    const today = new Date().toDateString()
    const todayCalls = checks.filter(c => new Date(c.ts).toDateString() === today).length

    return NextResponse.json({
      total,
      avg_score:   avgScore,
      accept_rate: acceptRate,
      today_calls: todayCalls,
      by_band:     byBand,
    })
  } catch {
    return NextResponse.json({ total: 0, avg_score: 0, accept_rate: 0, by_band: {} })
  }
}
