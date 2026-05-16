'use client';
import { useState } from 'react';

const tabs = [
  {
    id: 'js',
    label: 'JavaScript',
    code: `// Install: no SDK needed — just fetch
const res = await fetch('https://kairoscheck.net/api/check', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer kc_live_<your-key>',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ domain: 'suspicious-shop.io' }),
});

const { verdict, score, signals } = await res.json();

if (verdict === 'BLOCK') {
  throw new Error('Signup denied — fraud detected');
}`,
  },
  {
    id: 'python',
    label: 'Python',
    code: `import requests

response = requests.post(
    'https://kairoscheck.net/api/check',
    headers={'Authorization': 'Bearer kc_live_<your-key>'},
    json={'domain': 'suspicious-shop.io'},
)

data = response.json()

if data['verdict'] == 'BLOCK':
    raise ValueError(f"Fraud detected — score {data['score']}")`,
  },
  {
    id: 'curl',
    label: 'cURL',
    code: `curl -X POST https://kairoscheck.net/api/check \\
  -H "Authorization: Bearer kc_live_<your-key>" \\
  -H "Content-Type: application/json" \\
  -d '{"domain":"suspicious-shop.io"}'

# Response:
# {"verdict":"BLOCK","score":94,"signals":["newly-registered","scam-pattern"],"ms":138}`,
  },
  {
    id: 'php',
    label: 'PHP',
    code: `$response = file_get_contents('https://kairoscheck.net/api/check', false,
  stream_context_create(['http' => [
    'method'  => 'POST',
    'header'  => "Authorization: Bearer kc_live_<your-key>\\r\\nContent-Type: application/json\\r\\n",
    'content' => json_encode(['domain' => 'suspicious-shop.io']),
  ]])
);

$data = json_decode($response, true);

if ($data['verdict'] === 'BLOCK') {
  http_response_code(403);
  exit('Signup denied');
}`,
  },
];

export default function Integration() {
  const [active, setActive] = useState('js');
  const [copied, setCopied] = useState(false);
  const current = tabs.find(t => t.id === active)!;

  const copy = async () => {
    await navigator.clipboard.writeText(current.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="border-t border-white/[0.06] py-20 md:py-28">
      <div className="mx-auto max-w-[1100px] px-6">
        <div className="mb-12 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent/70">Integration</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
              Works with{' '}
              <span className="gradient-text">any stack.</span>
            </h2>
            <p className="mt-3 text-base text-white/45">
              One REST endpoint. No SDK. No agent. No contract.
              Copy, paste, ship in 30 minutes.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-white/30">
            {['Node.js', 'Python', 'PHP', 'Go', 'Ruby', 'Java', 'Any HTTP'].map(lang => (
              <span key={lang} className="rounded-full border border-white/[0.07] px-3 py-1">{lang}</span>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0d0d0d]">
          {/* Tab bar */}
          <div className="flex items-center gap-1 border-b border-white/[0.07] px-4 py-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  active === tab.id
                    ? 'bg-accent/10 text-accent'
                    : 'text-white/35 hover:text-white/70'
                }`}
              >
                {tab.label}
              </button>
            ))}
            <button
              onClick={copy}
              className="ml-auto flex items-center gap-1.5 rounded-md border border-white/[0.07] px-3 py-1.5 text-xs text-white/35 transition-all hover:border-white/20 hover:text-white/70"
              aria-label="Copy code"
            >
              {copied ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#00d97e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span className="text-accent">Copied</span>
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M8 4V2.5A1.5 1.5 0 006.5 1H2.5A1.5 1.5 0 001 2.5v4A1.5 1.5 0 002.5 8H4" stroke="currentColor" strokeWidth="1.2"/></svg>
                  Copy
                </>
              )}
            </button>
          </div>

          {/* Code */}
          <pre className="overflow-x-auto p-6 text-sm leading-relaxed text-white/60 font-mono">
            <code>{current.code}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}
