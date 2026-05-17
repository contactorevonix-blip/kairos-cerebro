import { NextRequest, NextResponse } from 'next/server';

const ipHits = new Map<string, { count: number; resetAt: number }>();
const DEMO_LIMIT = 10;
const WINDOW_MS  = 60 * 60 * 1000;

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = ipHits.get(ip);
  if (!entry || now > entry.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: DEMO_LIMIT - 1 };
  }
  if (entry.count >= DEMO_LIMIT) return { allowed: false, remaining: 0 };
  entry.count++;
  return { allowed: true, remaining: DEMO_LIMIT - entry.count };
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  const { allowed, remaining } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Demo limit reached. Get your free API key to continue.' },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const { query } = body as { query?: string };

  if (!query || typeof query !== 'string' || query.trim().length < 3) {
    return NextResponse.json(
      { error: 'Enter a domain, email, phone or IBAN to check.' },
      { status: 400 },
    );
  }

  const input = query.trim().toLowerCase();

  let payload: Record<string, string> = {};
  if (input.includes('@')) {
    payload = { email: input };
  } else if (/^[+\d][\d\s\-().]{6,}$/.test(input)) {
    payload = { phone: input };
  } else if (/^[a-z]{2}\d{2}[a-z0-9]{4,}$/i.test(input.replace(/\s/g, ''))) {
    payload = { iban: input.replace(/\s/g, '') };
  } else {
    payload = { domain: input.replace(/^https?:\/\//, '').split('/')[0] };
  }

  const apiBase = process.env.KAIROS_API_URL ?? 'https://kairoscheck.net';
  const demoKey = process.env.KAIROS_DEMO_KEY;

  if (!demoKey) {
    return NextResponse.json({ error: 'Demo not configured.' }, { status: 503 });
  }

  const start = Date.now();
  let apiRes: Response;
  try {
    apiRes = await fetch(`${apiBase}/v1/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${demoKey}`,
      },
      body: JSON.stringify({ ...payload, model: 'swift' }),
    });
  } catch {
    return NextResponse.json({ error: 'API unreachable. Try again.' }, { status: 502 });
  }

  const data = await apiRes.json();
  const latencyMs = Date.now() - start;

  return NextResponse.json(
    { ...data, latency_ms: latencyMs, demo_remaining: remaining },
    { status: apiRes.status },
  );
}
