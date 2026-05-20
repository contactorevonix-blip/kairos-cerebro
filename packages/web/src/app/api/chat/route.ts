import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.KAIROS_API_URL ?? 'https://kairoscheck.net'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, history } = body

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Mensagem vazia' }, { status: 400 })
    }

    // Proxy para o backend Railway — toda a lógica está lá
    // (token gate, rate limit, Claude Haiku, system prompt)
    const apiKey = req.headers.get('x-api-key') // API key do utilizador logado (opcional)

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`
    }

    // Passar o IP real para rate limiting no backend
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '0.0.0.0'
    headers['X-Forwarded-For'] = clientIp

    const res = await fetch(`${BACKEND}/api/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message, history: history ?? [] }),
      signal: AbortSignal.timeout(20_000), // 20s timeout
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    if (msg.includes('timeout') || msg.includes('abort')) {
      return NextResponse.json({ error: 'Timeout — tenta novamente' }, { status: 504 })
    }
    return NextResponse.json({ error: 'Erro ao conectar ao chat' }, { status: 502 })
  }
}
