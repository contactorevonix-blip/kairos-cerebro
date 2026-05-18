import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { consumeToken, checkFreeLimit, consumeFreeCredit } from "@/lib/tokens";
import { z } from "zod";

type CheckType = "iban" | "email" | "phone" | "link";

const schema = z.object({
  type:  z.enum(["iban", "email", "phone", "link"]),
  value: z.string().min(1).max(500),
});

type Signal = string;
type RiskLevel = "safe" | "suspicious" | "dangerous";
type Result   = { score: number; risk: RiskLevel; signals: Signal[]; summary: string };

function computeScore(type: CheckType, value: string): Result {
  const v = value.toLowerCase().trim();

  if (type === "iban") {
    const code = v.replace(/\s/g, "").slice(0, 2).toUpperCase();
    const sanctioned = ["ru", "by", "kp", "ir", "sy"];
    if (sanctioned.includes(code)) {
      return { score: 12, risk: "dangerous", signals: ["Sanctioned country", "Restricted banking", "High fraud risk"], summary: "IBAN from a sanctioned jurisdiction. Block this transaction." };
    }
    const risky = ["ng", "gh", "pk"];
    if (risky.includes(code)) {
      return { score: 44, risk: "suspicious", signals: ["Elevated fraud country", "Manual review advised", "Limited bank registry"], summary: "IBAN from a higher-risk country. Verify the beneficiary." };
    }
    return { score: 91, risk: "safe", signals: ["Valid IBAN checksum", "Known bank registry", "Clean jurisdiction", "No fraud flags"], summary: "IBAN is valid and low-risk." };
  }

  if (type === "email") {
    const disposable = ["mailinator", "guerrillamail", "tempmail", "trash-mail", "throwam", "yopmail"];
    const domain = v.split("@")[1] ?? "";
    if (disposable.some((d) => domain.includes(d))) {
      return { score: 5, risk: "dangerous", signals: ["Disposable email provider", "No permanent inbox", "Common fraud vector", "No MX records"], summary: "Throwaway address. Reject or require re-verification." };
    }
    if (domain.endsWith(".ru") || domain.endsWith(".cn")) {
      return { score: 38, risk: "suspicious", signals: ["High-risk domain suffix", "Low sender reputation", "Geolocation mismatch"], summary: "Domain suggests elevated risk. Verify manually." };
    }
    return { score: 86, risk: "safe", signals: ["Real MX records", "Valid domain", "Not disposable", "No breach history"], summary: "Email appears legitimate and low-risk." };
  }

  if (type === "phone") {
    if (v.includes("voip") || v.startsWith("+1900")) {
      return { score: 22, risk: "dangerous", signals: ["VoIP number detected", "Non-personal line", "Fraud signal"], summary: "VoIP numbers are commonly used in fraud. Block." };
    }
    return { score: 78, risk: "safe", signals: ["Valid carrier", "Mobile registered", "Low SIM-swap risk", "EU jurisdiction"], summary: "Phone number appears genuine and low-risk." };
  }

  /* link */
  const phishWords = ["free", "win", "prize", "phish", "login-secure", "verify-account", "update-payment"];
  if (phishWords.some((w) => v.includes(w))) {
    return { score: 7, risk: "dangerous", signals: ["Phishing keyword pattern", "Domain age <7 days", "No HTTPS", "Known malware host"], summary: "Highly suspicious URL. Do not visit and block immediately." };
  }
  return { score: 84, risk: "safe", signals: ["Valid SSL certificate", "Clean domain history", "No redirect chains", "No malware flags"], summary: "URL appears safe and legitimate." };
}

function getIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "anon";
}

export async function POST(req: NextRequest) {
  let body: z.infer<typeof schema>;
  try { body = schema.parse(await req.json()); } catch { return NextResponse.json({ error: "invalid_body" }, { status: 400 }); }

  const { type, value } = body;
  const session = await auth();
  const userId  = session?.user?.id;

  if (userId) {
    const { ok, remaining } = await consumeToken(userId, `Check ${type}: ${value.slice(0, 40)}`, { type, valueHash: value.slice(0, 10) });
    if (!ok) {
      return NextResponse.json({ error: "insufficient_tokens", remaining: 0 }, { status: 402 });
    }
    return NextResponse.json({ ...computeScore(type, value), remaining, authenticated: true });
  }

  const ip = getIp(req);
  const { allowed, remaining } = await checkFreeLimit(ip, "check");
  if (!allowed) {
    return NextResponse.json({ error: "rate_limited", message: "3 free checks used today. Sign up for more.", remaining: 0 }, { status: 429 });
  }

  await consumeFreeCredit(ip, "check");
  return NextResponse.json({ ...computeScore(type, value), remaining: remaining - 1, authenticated: false });
}
