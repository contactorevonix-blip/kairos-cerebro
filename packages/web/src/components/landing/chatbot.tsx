'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

const QA = [
  {
    q: 'What is Kairos Check?',
    a: 'Kairos Check is a real-time fraud detection API for developers. Send a domain, email, IP, or phone — get a verdict (BLOCK / ALLOW) and risk score in under 100ms. No ML setup required.',
  },
  {
    q: 'How fast is the API?',
    a: 'p50 latency is 47ms. p99 is under 120ms. Distributed edge nodes ensure your users never notice the check. You can also run checks async after checkout completes.',
  },
  {
    q: 'How do I get started?',
    a: 'Sign up, grab your API key, and make your first request in under 5 minutes. SDKs for Node.js, Python, Go, and PHP. Free tier includes 500 checks/month — no credit card required.',
  },
];

type Message = { role: 'user' | 'ai'; text: string };

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Hi! Ask me anything about Kairos Check — how it works, pricing, integrations.' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing]);

  function handleSend(text?: string) {
    const msg = text ?? input.trim();
    if (!msg) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setTyping(true);
    const match = QA.find(qa =>
      msg.toLowerCase().includes(qa.q.toLowerCase().split(' ').slice(0,2).join(' ').toLowerCase())
    );
    const answer = match?.a ?? 'Great question! Check our docs at kairoscheck.net/docs or email hello@kairoscheck.net.';
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { role: 'ai', text: answer }]);
    }, 900);
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.28, ease }}
            style={{
              width: 380, height: 520,
              background: '#fff',
              borderRadius: 20,
              boxShadow: '0 24px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,0,0,0.06)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="flex items-center gap-2.5">
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#00DC82', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageCircle size={14} color="#000" />
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>Ask AI</span>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', padding: 4 }}>
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  {m.role === 'user' ? (
                    <div style={{ background: '#1a1a1a', color: '#fff', borderRadius: '18px 18px 4px 18px', padding: '10px 14px', fontSize: 14, maxWidth: '80%', lineHeight: 1.55 }}>
                      {m.text}
                    </div>
                  ) : (
                    <div style={{ maxWidth: '88%' }}>
                      <p style={{ fontSize: 14, color: '#222', lineHeight: 1.65 }}>{m.text}</p>
                    </div>
                  )}
                </div>
              ))}
              {typing && (
                <div className="flex gap-1 items-center" style={{ paddingLeft: 2 }}>
                  {[0,1,2].map(i => (
                    <motion.div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#ccc' }}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Suggestion chips */}
            {messages.length === 1 && (
              <div style={{ padding: '0 14px 10px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {QA.map(qa => (
                  <button key={qa.q} onClick={() => handleSend(qa.q)}
                    className="text-xs rounded-full transition-colors cursor-pointer"
                    style={{
                      padding: '6px 12px',
                      border: '1px solid #e5e5e5',
                      background: 'transparent',
                      color: '#666',
                      fontFamily: 'var(--font-geist-sans)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#00DC82'; e.currentTarget.style.color = '#00DC82'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e5e5'; e.currentTarget.style.color = '#666'; }}
                  >
                    {qa.q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div style={{ borderTop: '1px solid #f0f0f0', padding: '12px 14px', display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask a question..."
                style={{ flex: 1, background: '#f5f5f5', border: 'none', borderRadius: 12, padding: '9px 14px', fontSize: 14, color: '#111', outline: 'none' }}
              />
              <button onClick={() => handleSend()} disabled={!input.trim()}
                style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: input.trim() ? '#1a1a1a' : '#eee',
                  border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 150ms',
                }}>
                <Send size={14} color={input.trim() ? '#fff' : '#aaa'} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        className="group fixed bottom-6 right-6 z-50"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <div className="relative flex items-center gap-2.5 bg-[#00DC82] rounded-full pl-4 pr-5 py-3 transition-shadow duration-300"
          style={{
            boxShadow: '0 0 0 1px rgba(0,220,130,0.37), 0 8px 32px rgba(0,220,130,0.25), 0 2px 8px rgba(0,0,0,0.4)',
          }}
        >
          {/* Ping */}
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-50" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
          </span>

          <MessageCircle size={17} color="#000" strokeWidth={2.5} />
          <span style={{ color: '#000', fontWeight: 600, fontSize: 14, letterSpacing: '-0.01em', fontFamily: 'var(--font-geist-sans)' }}>
            Ask AI
          </span>
        </div>
      </motion.button>
    </div>
  );
}
