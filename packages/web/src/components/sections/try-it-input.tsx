"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { useDemoVerify } from "@/hooks/use-demo-verify";
import { ScoreMeter }   from "@/components/ui/score-meter";

type VerifyType = "email" | "iban" | "phone" | "link";

const PLACEHOLDERS: Record<VerifyType, string> = {
  email: "user@example.com",
  iban:  "PT50 0002 0123 1234 5678 9015 4",
  phone: "+351 912 345 678",
  link:  "https://suspicious-site.com",
};

export function TryItInput() {
  const [type,  setType]  = useState<VerifyType>("email");
  const [value, setValue] = useState("");
  const { verify, result, loading, remaining } = useDemoVerify();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) verify(type, value.trim());
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md p-5 flex flex-col gap-4">
      {/* Type tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] w-fit">
        {(["email", "iban", "phone", "link"] as VerifyType[]).map((t) => (
          <button
            key={t}
            onClick={() => { setType(t); setValue(""); }}
            className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition-colors ${
              type === t
                ? "bg-white/10 text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Input row */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={PLACEHOLDERS[type]}
          className="flex-1 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors font-mono text-sm"
        />
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="px-4 py-3 rounded-xl bg-white text-black hover:bg-gray-100 disabled:opacity-40 transition-all flex items-center justify-center"
          aria-label="Verify"
        >
          {loading
            ? <Loader2 size={16} className="animate-spin" />
            : <ArrowRight size={16} />}
        </button>
      </form>

      {/* Result */}
      {result && (
        <div className="pt-3 border-t border-white/[0.06] animate-fade-in">
          <ScoreMeter
            score={result.score}
            risk={result.risk}
            signals={result.signals}
            summary={result.summary}
          />
        </div>
      )}

      {/* Footer */}
      <p className="text-[11px] text-gray-600">
        Free public demo
        {remaining !== null && ` · ${remaining} check${remaining !== 1 ? "s" : ""} left today`}
      </p>
    </div>
  );
}
