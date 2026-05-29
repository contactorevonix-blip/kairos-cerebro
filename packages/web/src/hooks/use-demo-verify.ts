"use client";

import { useState } from "react";

type Risk = "safe" | "suspicious" | "dangerous";

interface VerifyResult {
  score:    number;
  risk:     Risk;
  signals:  string[];
  summary:  string;
}

export function useDemoVerify() {
  const [result,    setResult]    = useState<VerifyResult | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [error,     setError]     = useState<string | null>(null);

  const verify = async (type: string, value: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/check", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ type, value }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Check failed");
        return;
      }
      setResult({ score: data.score, risk: data.risk, signals: data.signals ?? [], summary: data.summary ?? "" });
      if (typeof data.remaining === "number") setRemaining(data.remaining);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return { verify, result, loading, error, remaining };
}
