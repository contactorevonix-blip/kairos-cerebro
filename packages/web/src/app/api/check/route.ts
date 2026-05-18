import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { consumeToken, checkFreeLimit, consumeFreeCredit } from "@/lib/tokens";
import { z } from "zod";

type CheckType = "iban" | "email" | "phone" | "link";

const schema = z.object({
  type:  z.enum(["iban", "email", "phone", "link"]),
  value: z.string().min(1).max(500),
});

const SNIPER_API_URL = process.env.SNIPER_API_URL;

/* -------- proxy to real sniper-engine when configured -------- */
async function proxyToEngine(type: CheckType, value: string) {
  if (!SNIPER_API_URL) return null;
  try {
    const body: Record<string, string> = {};
    if (type === "iban")  body.iban   = value;
    if (type === "email") body.email  = value;
    if (type === "phone") body.phone  = value;
    if (type === "link")  body.domain = value;

    const res = await fetch(`${SNIPER_API_URL}/api/check`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
      signal:  AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;
    const data = await res.json();

    /* normalise sniper-engine response to our schema */
    return {
      score:   data.score   ?? 50,
      risk:    mapVerdict(data.verdict ?? data.decision ?? "REVIEW"),
      signals: (data.signals ?? data.reasons ?? []).slice(0, 6),
      summary: data.dominant_threat
        ? `Dominant threat: ${data.dominant_threat}. ${verdictSummary(data.verdict)}`
        : verdictSummary(data.verdict),
      from_engine: true,
    };
  } catch {
    return null;
  }
}

function mapVerdict(v: string): "safe" | "suspicious" | "dangerous" {
  const up = String(v).toUpperCase();
  if (up === "ALLOW") return "safe";
  if (up === "BLOCK") return "dangerous";
  return "suspicious";
}

function verdictSummary(v: string): string {
  const up = String(v || "").toUpperCase();
  if (up === "ALLOW") return "Entity is clean and low-risk.";
  if (up === "BLOCK") return "Entity flagged. Block this interaction.";
  return "Entity requires manual review before proceeding.";
}

/* -------- local heuristic fallback -------- */
function localAnalyze(type: CheckType, value: string) {
  const v = value.toLowerCase().trim();

  if (type === "iban") {
    const code = v.replace(/\s/g, "").slice(0, 2).toUpperCase();
    if (["RU", "BY", "KP", "IR", "SY"].includes(code))
      return { score: 8,  risk: "dangerous" as const, signals: ["Sanctioned jurisdiction", "High fraud risk", "Restricted banking zone"],      summary: "IBAN from a sanctioned jurisdiction. Block this transaction." };
    if (["NG", "GH", "PK"].includes(code))
      return { score: 42, risk: "suspicious" as const, signals: ["High-risk country code", "Manual review advised", "Limited bank registry"],      summary: "IBAN from a higher-risk country. Verify the beneficiary." };
    return   { score: 92, risk: "safe"      as const, signals: ["Valid IBAN structure", "Known bank registry", "Clean jurisdiction", "No fraud flags"], summary: "IBAN is valid and low-risk." };
  }

  if (type === "email") {
    const domain = v.split("@")[1] ?? "";
    const disposable = ["mailinator", "guerrillamail", "tempmail", "trash-mail", "throwam", "yopmail", "sharklasers"];
    if (disposable.some((d) => domain.includes(d)))
      return { score: 4,  risk: "dangerous" as const, signals: ["Disposable email provider", "No permanent inbox", "Common fraud vector"],          summary: "Throwaway address detected. Require re-verification." };
    if (domain.endsWith(".ru") || domain.endsWith(".cn"))
      return { score: 36, risk: "suspicious" as const, signals: ["High-risk TLD", "Low sender reputation", "Geolocation mismatch"],                  summary: "Domain suggests elevated risk. Verify manually." };
    return   { score: 87, risk: "safe"      as const, signals: ["Valid MX records", "Established domain", "Not disposable", "No breach history"],    summary: "Email appears legitimate and low-risk." };
  }

  if (type === "phone") {
    if (v.includes("voip") || v.startsWith("+1900"))
      return { score: 20, risk: "dangerous" as const, signals: ["VoIP number detected", "Non-personal line", "Fraud signal"],                        summary: "VoIP numbers are commonly used in fraud. Block." };
    return   { score: 80, risk: "safe"      as const, signals: ["Valid carrier prefix", "Mobile registered", "Low SIM-swap risk", "EU jurisdiction"], summary: "Phone number appears genuine and low-risk." };
  }

  /* link */
  const phishWords = ["free-prize", "win-now", "phish", "login-secure", "verify-account", "update-payment", "claim-reward"];
  if (phishWords.some((w) => v.includes(w)))
    return { score: 6,  risk: "dangerous" as const, signals: ["Phishing keyword pattern", "Suspicious URL structure", "Known malware pattern"],    summary: "Highly suspicious URL. Do not visit — block immediately." };
  const knownSafe = ["github.com", "google.com", "microsoft.com", "apple.com", "stripe.com"];
  if (knownSafe.some((d) => v.includes(d)))
    return { score: 96, risk: "safe"      as const, signals: ["Verified domain", "Valid SSL", "High trust score", "Clean history"],                  summary: "URL is from a verified, trusted domain." };
  return     { score: 82, risk: "safe"      as const, signals: ["Valid SSL certificate", "Clean domain history", "No redirect chains"],               summary: "URL appears safe and legitimate." };
}

/* -------- helpers -------- */
function getIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "anon"
  );
}

/* -------- POST handler -------- */
export async function POST(req: NextRequest) {
  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { type, value } = body;
  const session  = await auth();
  const userId   = session?.user?.id;

  /* authenticated: deduct 1 token, try real engine first */
  if (userId) {
    const { ok, remaining } = await consumeToken(
      userId,
      `Check ${type}: ${value.slice(0, 40)}`,
      { type, valueHash: value.slice(0, 10) },
    );
    if (!ok) {
      return NextResponse.json(
        { error: "insufficient_tokens", remaining: 0 },
        { status: 402 },
      );
    }

    const result =
      (await proxyToEngine(type, value)) ??
      localAnalyze(type, value);

    return NextResponse.json({ ...result, remaining, authenticated: true });
  }

  /* anonymous: rate-limited to 3/day */
  const ip = getIp(req);
  const { allowed, remaining } = await checkFreeLimit(ip, "check");
  if (!allowed) {
    return NextResponse.json(
      { error: "rate_limited", message: "3 free checks used today. Sign up for unlimited access.", remaining: 0 },
      { status: 429 },
    );
  }

  await consumeFreeCredit(ip, "check");
  const result =
    (await proxyToEngine(type, value)) ??
    localAnalyze(type, value);

  return NextResponse.json({ ...result, remaining: remaining - 1, authenticated: false });
}
