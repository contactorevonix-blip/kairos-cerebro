import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'node:fs'
import { join }         from 'node:path'

const CHECKS_FILE = join(
  process.cwd(), '..', '..', '.kairos-data', 'check-engine-checks.jsonl'
)

export async function GET(req: Request) {
  const url   = new URL(req.url)
  const limit = Math.min(Number(url.searchParams.get('limit') || '50'), 200)

  if (!existsSync(CHECKS_FILE)) {
    return NextResponse.json({ checks: [], total: 0 })
  }

  try {
    const lines  = readFileSync(CHECKS_FILE, 'utf8').trim().split('\n').filter(Boolean)
    const checks = lines
      .slice(-limit)
      .reverse()
      .map(l => {
        try { return JSON.parse(l) } catch { return null }
      })
      .filter((c): c is NonNullable<typeof c> => c !== null && c.type !== 'feedback')
      .map(c => ({
        check_id:   c.check_id,
        score:      c.score,
        band:       c.band,
        decision:   c.decision,
        active_flags: c.active_flags?.slice(0, 3),
        ts:         c.ts,
        execution_time_ms: c.execution_time_ms,
      }))

    return NextResponse.json({ checks, total: lines.length })
  } catch {
    return NextResponse.json({ checks: [], total: 0, error: 'read_error' })
  }
}
