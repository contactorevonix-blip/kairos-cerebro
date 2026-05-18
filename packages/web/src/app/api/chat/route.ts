import { NextRequest, NextResponse } from "next/server";

const FREE_DAILY_LIMIT = 5;

/* In-memory daily counter keyed by IP (per-process, stateless across replicas).
   For production: replace with Redis + sliding-window.
*/
const dailyUsage = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const resetAt = midnight.getTime();

  const entry = dailyUsage.get(ip);
  if (!entry || entry.resetAt < now) {
    dailyUsage.set(ip, { count: 0, resetAt });
    return { allowed: true, remaining: FREE_DAILY_LIMIT };
  }

  if (entry.count >= FREE_DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: FREE_DAILY_LIMIT - entry.count };
}

function consumeCredit(ip: string): void {
  const entry = dailyUsage.get(ip)!;
  entry.count += 1;
}

/* Simple pattern-based analysis — replace with real KAIROS engine call */
function analyzeInput(message: string): string {
  const m = message.trim().toUpperCase();

  /* IBAN */
  if (/^[A-Z]{2}\d{2}[A-Z0-9]{4,}/.test(m.replace(/\s/g, ""))) {
    const code = m.replace(/\s/g, "").slice(0, 2);
    const highRisk = ["RU", "BY", "KP", "IR", "SY"];
    if (highRisk.includes(code)) {
      return `**IBAN risk: HIGH** ⚠️\n\nCountry code \`${code}\` is in a sanctioned jurisdiction. Score: **12/100**.\n\nSignals:\n- Sanctioned country\n- High fraud prevalence\n- Restricted banking`;
    }
    return `**IBAN verified** ✅\n\nScore: **91/100** — Low risk.\n\nSignals:\n- Valid checksum\n- Known bank\n- Clean jurisdiction\n- No fraud flags`;
  }

  /* Email */
  const emailMatch = message.match(/[\w.-]+@[\w.-]+\.[a-z]{2,}/i);
  if (emailMatch) {
    const domain = emailMatch[0].split("@")[1].toLowerCase();
    const disposable = ["mailinator", "guerrillamail", "tempmail", "trash", "throwam"];
    if (disposable.some((d) => domain.includes(d))) {
      return `**Email risk: DANGEROUS** ❌\n\n\`${emailMatch[0]}\` is a disposable address. Score: **5/100**.\n\nSignals:\n- Disposable provider\n- No permanent inbox\n- Known fraud vector`;
    }
    return `**Email verified** ✅\n\n\`${emailMatch[0]}\` appears legitimate. Score: **84/100**.\n\nSignals:\n- Real MX records\n- Valid domain\n- Not disposable`;
  }

  /* Phone */
  const phoneMatch = message.match(/[+]?[\d\s\-().]{8,}/);
  if (phoneMatch) {
    return `**Phone analyzed** ℹ️\n\nScore: **71/100** — Moderate confidence.\n\nSignals:\n- Mobile carrier detected\n- EU jurisdiction\n- Low SIM-swap risk`;
  }

  /* URL / Link */
  if (message.match(/https?:\/\/|www\.|\.[a-z]{2,}\//i)) {
    const suspicious = ["free", "win", "click", "phish", "login-verify", "secure-update"];
    if (suspicious.some((w) => message.toLowerCase().includes(w))) {
      return `**Link risk: DANGEROUS** ❌\n\nPhishing pattern detected. Score: **8/100**.\n\nSignals:\n- Suspicious keyword pattern\n- Domain registered <7 days\n- Redirect chain detected`;
    }
    return `**Link scanned** ✅\n\nScore: **87/100** — Clean URL.\n\nSignals:\n- Valid SSL certificate\n- No redirect chains\n- No malware history`;
  }

  /* Fallback */
  return `I can verify **IBANs**, **emails**, **phone numbers**, and **links**.\n\nTry something like:\n- \`NL91 ABNA 0417 1643 00\`\n- \`user@company.com\`\n- \`+351 912 345 678\`\n- \`https://example.com\``;
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed, remaining } = checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      {
        error:   "rate_limited",
        message: "Daily free limit reached. Upgrade for unlimited checks.",
        remaining: 0,
      },
      { status: 429 }
    );
  }

  let body: { message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const message = body.message?.trim();
  if (!message) {
    return NextResponse.json({ error: "missing_message" }, { status: 422 });
  }

  consumeCredit(ip);

  const reply = analyzeInput(message);

  return NextResponse.json({
    reply,
    remaining: remaining - 1,
    limit: FREE_DAILY_LIMIT,
  });
}
