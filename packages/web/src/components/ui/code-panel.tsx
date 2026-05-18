"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { CODE_EXAMPLES } from "@/lib/code-snippets";

type Language = "bash" | "node" | "python" | "php";

interface CodePanelProps {
  language?: Language;
  code?: string;
  className?: string;
  showTabs?: boolean;
}

export function CodePanel({
  language = "bash",
  code,
  className,
  showTabs = true,
}: CodePanelProps) {
  const [active, setActive]   = useState<Language>(language);
  const [copied, setCopied]   = useState(false);

  const displayCode = code ?? CODE_EXAMPLES[active];

  const copy = async () => {
    await navigator.clipboard.writeText(displayCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden bg-black border border-[#262A2D]",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#262A2D]">
        {/* Traffic lights */}
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#3b4345]" />
          <span className="w-3 h-3 rounded-full bg-[#3b4345]" />
          <span className="w-3 h-3 rounded-full bg-[#3b4345]" />
        </div>

        {/* Language tabs */}
        {showTabs && !code && (
          <div className="flex gap-1">
            {(["bash", "node", "python", "php"] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => setActive(l)}
                className={cn(
                  "px-2.5 py-1 text-[11px] rounded-md transition-colors font-mono",
                  active === l
                    ? "bg-white/10 text-white"
                    : "text-gray-500 hover:text-gray-300",
                )}
              >
                {l}
              </button>
            ))}
          </div>
        )}
        {(code || !showTabs) && (
          <span className="text-[11px] font-mono text-gray-500">{active}</span>
        )}

        {/* Copy */}
        <button
          onClick={copy}
          aria-label="Copy code"
          className="text-gray-500 hover:text-white transition-colors"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
        </button>
      </div>

      {/* Code */}
      <pre className="p-5 overflow-x-auto text-[rgb(235,236,237)] font-mono text-sm leading-relaxed">
        <code>{displayCode}</code>
      </pre>
    </div>
  );
}
