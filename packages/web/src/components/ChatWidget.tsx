"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Shield, Lock, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const FREE_DAILY_LIMIT = 5;

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const SYSTEM_SUGGESTIONS = [
  "Check NL91 ABNA 0417164300",
  "Is test@example.com safe?",
  "Scan link suspicious-site.com",
  "Verify +351 912 345 678",
];

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm KAIROS. I can verify IBANs, emails, phone numbers and links in seconds. Try me — you have **5 free checks today**. No signup needed.",
  timestamp: new Date(),
};

export default function ChatWidget() {
  const [open, setOpen]           = useState(false);
  const [messages, setMessages]   = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [usedToday, setUsedToday] = useState(0);
  const [showUpsell, setShowUpsell] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  const remainingFree = FREE_DAILY_LIMIT - usedToday;

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    if (usedToday >= FREE_DAILY_LIMIT) {
      setShowUpsell(true);
      return;
    }

    const userMsg: Message = {
      id:        Date.now().toString(),
      role:      "user",
      content:   text.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setUsedToday((n) => n + 1);

    try {
      const res = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ message: text.trim() }),
      });
      const data = await res.json();
      const reply: Message = {
        id:        (Date.now() + 1).toString(),
        role:      "assistant",
        content:   data.reply ?? "I couldn't process that. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, reply]);
      if (usedToday + 1 >= FREE_DAILY_LIMIT) setShowUpsell(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id:        "err",
          role:      "assistant",
          content:   "Connection error. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading, usedToday]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Floating trigger */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 h-12 pl-4 pr-5 glass rounded-full border border-blue-500/30 text-sm font-medium text-gray-12 shadow-glow-sm hover:shadow-glow-blue transition-kairos"
            aria-label="Open KAIROS chat"
          >
            <Shield className="w-4 h-4 text-blue-400" />
            <span>Ask KAIROS</span>
            {remainingFree > 0 && (
              <Badge variant="accent" className="text-2xs py-0.5">{remainingFree} left</Badge>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-6 z-50 flex flex-col w-[380px] max-h-[600px] glass-strong rounded-3xl border border-white/8 shadow-card overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-gray-2" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-12">KAIROS AI</div>
                  <div className="text-xs text-gray-10">Fraud detection engine</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="accent" className="text-2xs">
                  {remainingFree}/{FREE_DAILY_LIMIT} free
                </Badge>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-10 hover:text-gray-12 hover:bg-white/6 transition-kairos"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin min-h-0">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "flex gap-2",
                    msg.role === "user" && "flex-row-reverse"
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center shrink-0 mt-0.5">
                      <Shield className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-blue-600/90 text-white rounded-tr-sm"
                        : "bg-white/5 text-gray-11 border border-white/8 rounded-tl-sm"
                    )}
                    dangerouslySetInnerHTML={{
                      __html: msg.content
                        .replace(/\*\*(.*?)\*\*/g, "<strong class='text-gray-12'>$1</strong>")
                        .replace(/\n/g, "<br />"),
                    }}
                  />
                </motion.div>
              ))}

              {/* Loading dots */}
              {loading && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center shrink-0">
                    <Shield className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="bg-white/5 border border-white/8 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-gray-9 animate-plop"
                        style={{ animationDelay: `${i * 200}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Upsell card */}
              {showUpsell && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-gradient-to-br from-blue-600/15 to-violet-600/10 border border-blue-500/20 p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-semibold text-gray-12">Daily limit reached</span>
                  </div>
                  <p className="text-xs text-gray-10 mb-3 leading-relaxed">
                    Get unlimited checks with a token pack or subscribe to Pro.
                  </p>
                  <Button size="sm" className="w-full" asChild>
                    <a href="#pricing">
                      Unlock unlimited checks <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </Button>
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Suggestions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-none">
                {SYSTEM_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="shrink-0 text-xs text-gray-10 bg-white/4 hover:bg-white/8 border border-white/8 rounded-full px-3 py-1.5 transition-kairos whitespace-nowrap"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex gap-2 px-4 py-3 border-t border-white/6">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="IBAN, email, phone or link..."
                className="flex-1 min-w-0 bg-white/5 border border-white/8 rounded-2xl px-4 py-2.5 text-sm text-gray-12 placeholder:text-gray-9 focus:outline-none focus:border-blue-500/40 transition-kairos"
                disabled={loading || usedToday >= FREE_DAILY_LIMIT}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading || usedToday >= FREE_DAILY_LIMIT}
                className="w-10 h-10 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 flex items-center justify-center transition-kairos shrink-0"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </form>

            {/* Footer trust */}
            <div className="flex items-center justify-center gap-2 px-4 pb-3 text-2xs text-gray-9">
              <Lock className="w-3 h-3" />
              End-to-end encrypted · GDPR compliant
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
