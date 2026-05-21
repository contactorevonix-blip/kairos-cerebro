import { NextResponse } from 'next/server'
import { randomBytes }  from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join }         from 'node:path'

const DATA_DIR  = join(process.cwd(), '..', '..', '.kairos-data')
const KEYS_FILE = join(DATA_DIR, 'api-keys.json')

interface KeyRecord {
  id:         string
  key:        string
  created_at: string
  last_used:  string | null
  calls:      number
}

function readKeys(): KeyRecord[] {
  try {
    return JSON.parse(readFileSync(KEYS_FILE, 'utf8'))
  } catch {
    return []
  }
}

function saveKeys(keys: KeyRecord[]) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
  writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2), 'utf8')
}

function maskKey(key: string): string {
  // Mostrar primeiros 10 e últimos 4 chars: kc_live_xxxx...yyyy
  if (key.length < 20) return key
  return key.slice(0, 14) + '...' + key.slice(-4)
}

// GET — lista keys (masked)
export async function GET() {
  const keys = readKeys()
  return NextResponse.json({
    keys: keys.map(k => ({
      id:         k.id,
      key_masked: maskKey(k.key),
      created_at: k.created_at,
      last_used:  k.last_used,
      calls:      k.calls,
    })),
  })
}

// POST — gera nova key
export async function POST() {
  const keys   = readKeys()
  const raw    = randomBytes(24).toString('hex') // 48 hex chars
  const newKey: KeyRecord = {
    id:         randomBytes(8).toString('hex'),
    key:        `kc_live_${raw}`,
    created_at: new Date().toISOString(),
    last_used:  null,
    calls:      0,
  }

  keys.push(newKey)
  saveKeys(keys)

  // Retornar a key completa APENAS neste response (não volta a ser exibida)
  return NextResponse.json({ key: newKey.key, id: newKey.id }, { status: 201 })
}

// DELETE — revogar key por id
export async function DELETE(req: Request) {
  const { id } = await req.json().catch(() => ({})) as { id?: string }
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const keys    = readKeys()
  const updated = keys.filter(k => k.id !== id)
  saveKeys(updated)

  return NextResponse.json({ revoked: true, id })
}
