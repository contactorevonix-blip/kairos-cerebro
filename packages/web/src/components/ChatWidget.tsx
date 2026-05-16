'use client';
import { useEffect, useRef, useState, useCallback } from 'react';

const FREE_LIMIT = 5;

interface Message {
  role: 'user' | 'ai';
  text: string;
}

const SUGGESTIONS = [
  { label: 'Score a domain', q: 'How do I score a domain for fraud?' },
  { label: 'Free tier?', q: 'What is the free tier?' },
  { label: 'API example', q: 'Show me a curl example' },
];

function Logo() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border border-accent/30 bg-gradient-to-br from-[#003d1f] to-[#006b38]">
      <svg width="16" height="16" viewBox="0 0 20 22" fill="none" aria-hidden="true">
        <path d="M10 1L1 4.5V10.5C1 15.7 5.2 19.7 10 21C14.8 19.7 19 15.7 19 10.5V4.5Z" fill="#00d97e" />
        <path d="M7 7.5V14.5M7 11H10.5M10.5 11L13 7.5M10.5 11L13 14.5" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [freeUsed, setFreeUsed] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const historyRef = useRef<{ role: string; content: string }[]>([]);

  useEffect(() => {
    const saved = parseInt(localStorage.getItem('kc_chat_free') || '0', 10);
    setFreeUsed(saved);
    // Welcome message
    setMessages([{ role: 'ai', text: 'Hey! What are you building? Tell me about your fraud problem and I\'ll show you exactly how to stop it — with a working code example.' }]);
  }, []);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  const send = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    if (freeUsed >= FREE_LIMIT) return;

    setInput('');
    setShowSuggestions(false);
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);
    historyRef.current.push({ role: 'user', content: msg });

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history: historyRef.current.slice(-4) }),
      });
      const data = await res.json();

      if (res.status === 429 || data.free_remaining === 0) {
        setMessages(prev => [...prev, { role: 'ai', text: '**Free preview complete.** Get your free API key to continue — 50 checks/month included, no card needed. [Get API key →](/pricing)' }]);
        setFreeUsed(FREE_LIMIT);
        localStorage.setItem('kc_chat_free', String(FREE_LIMIT));
      } else {
        const reply = data.reply ?? '';
        setMessages(prev => [...prev, { role: 'ai', text: reply }]);
        historyRef.current.push({ role: 'assistant', content: reply });
        const newUsed = FREE_LIMIT - (data.free_remaining ?? FREE_LIMIT - 1);
        setFreeUsed(newUsed);
        localStorage.setItem('kc_chat_free', String(newUsed));
      }
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Connection error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, freeUsed]);

  const freeLeft = Math.max(0, FREE_LIMIT - freeUsed);

  return (
    <>
      {/* Bubble */}
      <button
        id="kc-bubble"
        onClick={() => setOpen(o => !o)}
        aria-label="Open Kairos AI — free fraud detection assistant"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-black shadow-[0_4px_24px_rgba(0,217,126,0.35),0_1px_0_rgba(255,255,255,0.2)_inset] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,217,126,0.5)] animate-[slide-up_0.45s_cubic-bezier(0.34,1.56,0.64,1)_1.5s_both]"
        style={{ animation: 'kc-slide 0.45s cubic-bezier(0.34,1.56,0.64,1) 1.5s both' }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 1.5C4.41 1.5 1.5 4.08 1.5 7.25c0 1.12.34 2.17.93 3.06L1.5 14.5l4.37-1.38A7.1 7.1 0 008 13c3.59 0 6.5-2.58 6.5-5.75S11.59 1.5 8 1.5z" fill="#000" />
        </svg>
        Ask AI — free
      </button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Kairos AI assistant"
          className="fixed bottom-20 right-6 z-50 flex w-[400px] flex-col overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#111] shadow-[0_32px_80px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.04)] max-sm:bottom-0 max-sm:right-0 max-sm:w-full max-sm:rounded-b-none"
          style={{ maxHeight: '80vh' }}
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-4 py-3.5">
            <div className="flex items-center gap-3">
              <Logo />
              <div>
                <div className="text-sm font-bold tracking-tight text-[#f5f5f5]">Kairos AI</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                  <span className="text-[11px] text-white/35">Online · fraud detection expert</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {freeLeft > 0 && (
                <span className="rounded border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-white/30">
                  {freeLeft} free left
                </span>
              )}
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.05] text-white/35 transition-all hover:bg-white/[0.1] hover:text-white/70"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={messagesRef} className="flex flex-1 flex-col gap-2.5 overflow-y-auto p-4" style={{ maxHeight: '320px', minHeight: '120px' }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                  m.role === 'user'
                    ? 'rounded-br-sm bg-accent font-medium text-black'
                    : 'rounded-bl-sm border border-white/[0.05] bg-[#1c1c1c] text-[#e8e8e8]'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-white/[0.05] bg-[#1c1c1c] px-4 py-3">
                  {[0, 150, 300].map(delay => (
                    <span key={delay} className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/30" style={{ animationDelay: `${delay}ms` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Suggestion chips */}
          {showSuggestions && (
            <div className="shrink-0 flex gap-2 flex-wrap px-4 pb-3">
              {SUGGESTIONS.map(s => (
                <button
                  key={s.label}
                  onClick={() => send(s.q)}
                  className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[11px] text-white/40 transition-all hover:border-accent/40 hover:bg-accent/[0.06] hover:text-accent"
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="shrink-0 flex items-end gap-2 border-t border-white/[0.05] bg-[#111] px-3.5 py-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={freeLeft > 0 ? 'Ask about fraud detection, pricing, the API…' : 'Get a free API key to continue →'}
              disabled={freeLeft === 0}
              rows={1}
              aria-label="Chat message"
              className="flex-1 resize-none rounded-xl border border-white/[0.08] bg-[#1a1a1a] px-3.5 py-2.5 text-[13px] text-[#e8e8e8] placeholder-white/20 outline-none transition-all focus:border-accent/35 focus:bg-[#1d1d1d] disabled:opacity-40 leading-relaxed"
              style={{ minHeight: '40px', maxHeight: '100px' }}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading || freeLeft === 0}
              aria-label="Send message"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-accent transition-all hover:bg-accent-hover hover:shadow-[0_0_12px_rgba(0,217,126,0.4)] disabled:cursor-not-allowed disabled:bg-[#1e1e1e] disabled:shadow-none"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                <path d="M12 6.5L1 1.5l1.5 5L1 11.5z" fill="#000" />
              </svg>
            </button>
          </div>

          {/* Disclaimer */}
          <p className="shrink-0 py-1.5 pb-2.5 text-center text-[10px] text-white/20">
            Kairos AI · Powered by Claude ·{' '}
            <a href="/pricing" className="text-white/30 hover:text-accent transition-colors">
              Get free API key →
            </a>
          </p>
        </div>
      )}

      <style>{`
        @keyframes kc-slide {
          from { opacity: 0; transform: translateY(20px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
