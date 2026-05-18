"use client";

import { cn } from "@/lib/utils";

interface ScoreMeterProps {
  score: number;
  risk: "safe" | "suspicious" | "dangerous";
  signals?: string[];
  summary?: string;
}

export function ScoreMeter({ score, risk, signals = [], summary }: ScoreMeterProps) {
  const color = risk === "safe"
    ? "#22c55e"
    : risk === "suspicious"
    ? "#f59e0b"
    : "#ef4444";

  const label = risk === "safe" ? "Low risk" : risk === "suspicious" ? "Review" : "High risk";

  return (
    <div className="space-y-3">
      {/* Score bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${score}%`, backgroundColor: color }}
          />
        </div>
        <span className="text-sm font-semibold tabular-nums" style={{ color }}>
          {score}/100
        </span>
        <span
          className={cn(
            "text-xs px-2 py-0.5 rounded-full font-medium",
            risk === "safe"       && "bg-emerald-500/10 text-emerald-400",
            risk === "suspicious" && "bg-amber-500/10   text-amber-400",
            risk === "dangerous"  && "bg-red-500/10     text-red-400",
          )}
        >
          {label}
        </span>
      </div>

      {/* Summary */}
      {summary && <p className="text-xs text-gray-400">{summary}</p>}

      {/* Signals */}
      {signals.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {signals.slice(0, 4).map((s) => (
            <span
              key={s}
              className="px-2 py-0.5 text-[10px] rounded-full bg-white/[0.04] border border-white/[0.08] text-gray-400"
            >
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
