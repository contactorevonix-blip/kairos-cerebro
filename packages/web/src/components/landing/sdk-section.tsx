'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ShieldCheck, GitBranch, Download, Copy, Check } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

/* ── SDK ICONS ─────────────────────────────────────────────── */
const SDKS = [
  { id: 'nodejs',  label: 'Node.js', abbr: 'N',   color: '#68a063', bg: '#68a06320' },
  { id: 'nextjs',  label: 'Next.js', abbr: 'N↑',  color: '#fff',    bg: '#ffffff10' },
  { id: 'python',  label: 'Python',  abbr: 'Py',  color: '#3776ab', bg: '#3776ab20' },
  { id: 'go',      label: 'Go',      abbr: 'Go',  color: '#00acd7', bg: '#00acd720' },
  { id: 'php',     label: 'PHP',     abbr: 'php', color: '#8892bf', bg: '#8892bf20' },
  { id: 'ruby',    label: 'Ruby',    abbr: 'Rb',  color: '#cc342d', bg: '#cc342d20' },
  { id: 'cli',     label: 'CLI',     abbr: '>_',  color: '#00DC82', bg: '#00DC8220' },
  { id: 'rust',    label: 'Rust',    abbr: 'Rs',  color: '#f74c00', bg: '#f74c0020' },
  { id: 'java',    label: 'Java',    abbr: 'Ja',  color: '#f89820', bg: '#f8982020' },
  { id: 'dotnet',  label: '.NET',    abbr: '.N',  color: '#512bd4', bg: '#512bd420' },
  { id: 'bun',     label: 'Bun',     abbr: 'B',   color: '#fbf0df', bg: '#fbf0df15' },
  { id: 'deno',    label: 'Deno',    abbr: 'D',   color: '#ffffff', bg: '#ffffff10' },
] as const;

type SdkId = typeof SDKS[number]['id'];

/* ── TABS ──────────────────────────────────────────────────── */
const TABS = ['Node.js', 'Next.js', 'Python', 'Go', 'PHP', 'Express', 'Hono', 'Bun', 'Astro'] as const;
type TabName = typeof TABS[number];

const TAB_META: Record<TabName, { abbr: string; color: string }> = {
  'Node.js':  { abbr: 'N',   color: '#68a063' },
  'Next.js':  { abbr: 'N↑',  color: '#ffffff' },
  'Python':   { abbr: 'Py',  color: '#3776ab' },
  'Go':       { abbr: 'Go',  color: '#00acd7' },
  'PHP':      { abbr: 'php', color: '#8892bf' },
  'Express':  { abbr: 'Ex',  color: '#888888' },
  'Hono':     { abbr: 'H',   color: '#e36002' },
  'Bun':      { abbr: 'B',   color: '#fbf0df' },
  'Astro':    { abbr: 'A',   color: '#ff5d01' },
};

/* ── SYNTAX TOKENS ─────────────────────────────────────────── */
type Token = { t: string; c?: string };
type Line  = Token[];

const KW  = '#c084fc';
const STR = '#86efac';
const PR  = '#67e8f9';
const FN  = '#fbbf24';
const PUN = '#555555';
const CMT = '#3a3a3a';
const NUM = '#fb923c';

function kw(t: string): Token  { return { t, c: KW }; }
function str(t: string): Token { return { t, c: STR }; }
function pr(t: string): Token  { return { t, c: PR }; }
function fn(t: string): Token  { return { t, c: FN }; }
function pun(t: string): Token { return { t, c: PUN }; }
function cmt(t: string): Token { return { t, c: CMT }; }
function num(t: string): Token { return { t, c: NUM }; }
function tx(t: string): Token  { return { t, c: '#ccc' }; }

const CODE: Record<TabName, Line[]> = {
  'Node.js': [
    [kw('import'), tx(' { KairosCheck } '), kw('from'), tx(' '), str("'@kairos/check'"), pun(';')],
    [],
    [kw('const'), tx(' kairos '), pun('='), kw(' new'), tx(' '), fn('KairosCheck'), pun('('), str("'kc_live_xxxxxxxxx'"), pun(');')],
    [],
    [kw('const'), tx(' result '), pun('='), kw(' await'), tx(' kairos.'), fn('check'), pun('({')],
    [tx('  '), pr('domain'), pun(': '), str("'suspicious-deals99.com'"), pun(',')],
    [tx('  '), pr('ip'), pun(': '), str("'45.33.32.156'"), pun(',')],
    [tx('  '), pr('email'), pun(': '), str("'user@tempmail.xyz'")],
    [pun('});')],
    [],
    [kw('if'), tx(' (result.'), pr('verdict'), tx(' '), pun('==='), tx(' '), str("'BLOCK'"), pun(') {')],
    [tx('  '), kw('return'), tx(' res.'), fn('status'), pun('('), num('403'), pun(').'), fn('json'), pun('({'), tx(' '), pr('error'), pun(': '), str("'Blocked'"), tx(' '), pun('});')],
    [pun('}')],
    [],
    [tx('console.'), fn('log'), pun('('), tx('result'), pun(');'), tx(' '), cmt("// { verdict: 'ALLOW', score: 0.12 }")],
  ],
  'Next.js': [
    [kw('import'), tx(' { KairosCheck } '), kw('from'), tx(' '), str("'@kairos/check'"), pun(';')],
    [kw('import'), tx(' { NextResponse } '), kw('from'), tx(' '), str("'next/server'"), pun(';')],
    [],
    [kw('const'), tx(' kairos '), pun('='), kw(' new'), tx(' '), fn('KairosCheck'), pun('('), tx('process.env.'), pr('KC_API_KEY'), pun(');')],
    [],
    [kw('export async function'), tx(' '), fn('POST'), pun('('), tx('req'), pun(': '), tx('Request'), pun(') {')],
    [tx('  '), kw('const'), tx(' '), pun('{'), tx(' '), pr('domain'), pun(','), tx(' '), pr('email'), tx(' '), pun('}'), tx(' '), pun('='), kw(' await'), tx(' req.'), fn('json'), pun('();')],
    [tx('  '), kw('const'), tx(' result '), pun('='), kw(' await'), tx(' kairos.'), fn('check'), pun('({'), tx(' '), pr('domain'), pun(','), tx(' '), pr('email'), tx(' '), pun('});')],
    [],
    [tx('  '), kw('if'), tx(' (result.'), pr('verdict'), tx(' '), pun('==='), tx(' '), str("'BLOCK'"), pun(') {')],
    [tx('    '), kw('return'), tx(' NextResponse.'), fn('json'), pun('({'), tx(' '), pr('error'), pun(': '), str("'Blocked'"), tx(' '), pun('},'), tx(' '), pun('{'), tx(' '), pr('status'), pun(': '), num('403'), tx(' '), pun('});')],
    [tx('  '), pun('}')],
    [],
    [tx('  '), kw('return'), tx(' NextResponse.'), fn('json'), pun('({'), tx(' '), pr('ok'), pun(': '), kw('true'), tx(' '), pun('});')],
    [pun('}')],
  ],
  'Python': [
    [kw('from'), tx(' kairos_check '), kw('import'), tx(' KairosCheck')],
    [kw('from'), tx(' fastapi '), kw('import'), tx(' FastAPI, HTTPException')],
    [],
    [tx('kairos '), pun('='), tx(' '), fn('KairosCheck'), pun('('), str("'kc_live_xxxxxxxxx'"), pun(')')],
    [],
    [tx('app '), pun('='), tx(' '), fn('FastAPI'), pun('()')],
    [],
    [pun('@'), tx('app.'), fn('post'), pun('('), str("'/check'"), pun(')')],
    [kw('async def'), tx(' '), fn('check_fraud'), pun('('), tx('domain'), pun(': '), tx('str'), pun(', '), tx('email'), pun(': '), tx('str'), pun(') -> '), tx('dict'), pun(':')],
    [tx('    result '), pun('='), kw(' await'), tx(' kairos.'), fn('check'), pun('(')],
    [tx('        '), pr('domain'), pun('='), tx('domain'), pun(','), tx(' '), pr('email'), pun('='), tx('email')],
    [tx('    '), pun(')')],
    [],
    [tx('    '), kw('if'), tx(' result.verdict '), pun('=='), tx(' '), str("'BLOCK'"), pun(':')],
    [tx('        '), kw('raise'), tx(' '), fn('HTTPException'), pun('('), pr('status_code'), pun('='), num('403'), pun(')')],
    [],
    [tx('    '), kw('return'), tx(' '), pun('{'), str("'ok'"), pun(': '), kw('True'), pun('}')],
  ],
  'Go': [
    [kw('import'), tx(' '), str('"github.com/kairoscheck/go"')],
    [],
    [kw('func'), tx(' '), fn('CheckFraud'), pun('('), tx('w http.ResponseWriter, r '), pun('*'), tx('http.Request'), pun(') {')],
    [tx('  client '), pun(':='), tx(' kairos.'), fn('New'), pun('('), str('"kc_live_xxxxxxxxx"'), pun(')')],
    [],
    [tx('  result, _ '), pun(':='), tx(' client.'), fn('Check'), pun('('), tx('r.Context'), pun('(), &'), tx('kairos.CheckRequest'), pun('{')],
    [tx('    '), pr('Domain'), pun(': '), str('"suspicious-deals99.com"'), pun(',')],
    [tx('    '), pr('IP'), pun(': '), str('"45.33.32.156"'), pun(',')],
    [tx('    '), pr('Email'), pun(': '), str('"user@tempmail.xyz"'), pun(',')],
    [tx('  '), pun('})')],
    [],
    [tx('  '), kw('if'), tx(' result.Verdict '), pun('=='), tx(' '), str('"BLOCK"'), pun(' {')],
    [tx('    '), tx('w.WriteHeader('), num('403'), tx(')')],
    [tx('    '), kw('return')],
    [tx('  '), pun('}')],
    [pun('}')],
  ],
  'PHP': [
    [pun('<?php'), kw(' use'), tx(' Kairos\\Check\\KairosCheck;')],
    [],
    [tx('$kairos '), pun('='), kw(' new'), tx(' '), fn('KairosCheck'), pun('('), str("'kc_live_xxxxxxxxx'"), pun(');')],
    [],
    [tx('$result '), pun('='), tx(' $kairos->'), fn('check'), pun('([')],
    [tx("  '"), pr('domain'), tx("'"), pun(' => '), str("'suspicious-deals99.com'"), pun(',')],
    [tx("  '"), pr('ip'), tx("'"), pun(' => '), str("'45.33.32.156'"), pun(',')],
    [tx("  '"), pr('email'), tx("'"), pun(' => '), str("'user@tempmail.xyz'")],
    [pun(']);')],
    [],
    [kw('if'), tx(' ($result->verdict '), pun('==='), tx(' '), str("'BLOCK'"), pun(') {')],
    [tx('  '), fn('http_response_code'), pun('('), num('403'), pun(');')],
    [tx('  '), fn('exit'), pun('('), str("'Blocked'"), pun(');')],
    [pun('}')],
  ],
  'Express': [
    [kw('const'), tx(' { KairosCheck } '), pun('='), kw(' require'), pun('('), str("'@kairos/check'"), pun(');')],
    [kw('const'), tx(' express '), pun('='), kw(' require'), pun('('), str("'express'"), pun(');')],
    [],
    [kw('const'), tx(' kairos '), pun('='), kw(' new'), tx(' '), fn('KairosCheck'), pun('('), tx('process.env.'), pr('KC_API_KEY'), pun(');')],
    [kw('const'), tx(' app '), pun('='), tx(' '), fn('express'), pun('();')],
    [],
    [tx('app.'), fn('use'), pun('('), kw('async'), tx(' (req, res, next) '), pun('=>'), tx(' {')],
    [tx('  '), kw('const'), tx(' result '), pun('='), kw(' await'), tx(' kairos.'), fn('check'), pun('({')],
    [tx('    '), pr('ip'), pun(': '), tx('req.ip'), pun(','), tx(' '), pr('email'), pun(': '), tx('req.body?.email')],
    [tx('  '), pun('});')],
    [],
    [tx('  '), kw('if'), tx(' (result.'), pr('verdict'), tx(' '), pun('==='), tx(' '), str("'BLOCK'"), pun(')'), kw(' return'), tx(' res.'), fn('sendStatus'), pun('('), num('403'), pun(');')],
    [tx('  '), fn('next'), pun('();')],
    [pun('});')],
  ],
  'Hono': [
    [kw('import'), tx(' { Hono } '), kw('from'), tx(' '), str("'hono'"), pun(';')],
    [kw('import'), tx(' { KairosCheck } '), kw('from'), tx(' '), str("'@kairos/check'"), pun(';')],
    [],
    [kw('const'), tx(' app '), pun('='), kw(' new'), tx(' '), fn('Hono'), pun('();')],
    [kw('const'), tx(' kairos '), pun('='), kw(' new'), tx(' '), fn('KairosCheck'), pun('('), tx('Bun.env.'), pr('KC_API_KEY'), pun(');')],
    [],
    [tx('app.'), fn('use'), pun('('), str("'/*'"), pun(','), kw(' async'), tx(' (c, next) '), pun('=>'), tx(' {')],
    [tx('  '), kw('const'), tx(' result '), pun('='), kw(' await'), tx(' kairos.'), fn('check'), pun('({')],
    [tx('    '), pr('ip'), pun(': '), tx('c.req.header('), str("'cf-connecting-ip'"), pun(')')],
    [tx('  '), pun('});')],
    [],
    [tx('  '), kw('if'), tx(' (result.'), pr('score'), tx(' '), pun('>'), tx(' '), num('0.8'), pun(')'), kw(' return'), tx(' c.'), fn('json'), pun('({'), pr('error'), pun(': '), str("'Blocked'"), pun('},'), num('403'), pun(');')],
    [tx('  '), kw('return'), kw(' await'), tx(' '), fn('next'), pun('();')],
    [pun('});')],
  ],
  'Bun': [
    [kw('import'), tx(' { KairosCheck } '), kw('from'), tx(' '), str("'@kairos/check'"), pun(';')],
    [],
    [kw('const'), tx(' kairos '), pun('='), kw(' new'), tx(' '), fn('KairosCheck'), pun('('), tx('Bun.env.'), pr('KC_API_KEY'), pun(');')],
    [],
    [tx('Bun.serve({')],
    [tx('  '), pr('port'), pun(': '), num('3000'), pun(',')],
    [tx('  '), kw('async'), tx(' '), fn('fetch'), pun('('), tx('req'), pun(') {')],
    [tx('    '), kw('const'), tx(' result '), pun('='), kw(' await'), tx(' kairos.'), fn('check'), pun('({')],
    [tx('      '), pr('ip'), pun(': '), tx('new URL(req.url).hostname')],
    [tx('    '), pun('});')],
    [],
    [tx('    '), kw('if'), tx(' (result.'), pr('verdict'), tx(' '), pun('==='), tx(' '), str("'BLOCK'"), pun(')'), kw(' return'), kw(' new'), tx(' '), fn('Response'), pun('('), str("'Blocked'"), pun(', {'), tx(' '), pr('status'), pun(': '), num('403'), tx(' '), pun('});')],
    [tx('    '), kw('return'), kw(' new'), tx(' '), fn('Response'), pun('('), str("'OK'"), pun(');')],
    [tx('  '),pun('}')],
    [pun('});')],
  ],
  'Astro': [
    [pun('---')],
    [kw('import'), tx(' { KairosCheck } '), kw('from'), tx(' '), str("'@kairos/check'"), pun(';')],
    [],
    [kw('const'), tx(' kairos '), pun('='), kw(' new'), tx(' '), fn('KairosCheck'), pun('('), kw('import'), pun('.'), tx('meta.env.'), pr('KC_API_KEY'), pun(');')],
    [],
    [kw('const'), tx(' result '), pun('='), kw(' await'), tx(' kairos.'), fn('check'), pun('({')],
    [tx('  '), pr('ip'), pun(': '), tx("Astro.clientAddress"), pun(',')],
    [tx('  '), pr('email'), pun(': '), tx("Astro.locals.email")],
    [pun('});')],
    [],
    [kw('if'), tx(' (result.'), pr('verdict'), tx(' '), pun('==='), tx(' '), str("'BLOCK'"), pun(') {')],
    [tx('  '), kw('return'), tx(' '), fn('Astro.redirect'), pun('('), str("'/blocked'"), pun(', '), num('403'), pun(');')],
    [pun('}')],
    [pun('---')],
  ],
};

function CodeLine({ tokens }: { tokens: Token[] }) {
  if (!tokens || tokens.length === 0) return <div style={{ height: '1.8em' }} />;
  return (
    <div style={{ display: 'flex', whiteSpace: 'pre' }}>
      {tokens.map((tk, i) => (
        <span key={i} style={{ color: tk.c ?? '#ccc', fontStyle: tk.c === CMT ? 'italic' : 'normal' }}>
          {tk.t}
        </span>
      ))}
    </div>
  );
}

export default function SdkSection() {
  const [activeTab, setActiveTab] = useState<TabName>('Node.js');
  const [activeSdk, setActiveSdk] = useState<SdkId>('nodejs');
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const lines = (CODE[activeTab] || []).map(line => line.map(t => t.t).join('')).join('\n');
    navigator.clipboard.writeText(lines).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <section className="section-y" style={{ background: '#000', borderTop: '1px solid #1a1a1a' }}>
      <div className="container-kc">

        {/* App Icon */}
        <motion.div className="flex justify-center mb-10"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }} viewport={{ once: true, margin: '-80px' }}
        >
          <div style={{ position: 'relative', width: 160, height: 160 }}>
            {/* Glow */}
            <div style={{
              position: 'absolute', inset: -2,
              background: 'linear-gradient(180deg, rgba(0,220,130,0.14) 0%, rgba(124,58,237,0.08) 50%, rgba(0,220,130,0.06) 100%)',
              borderRadius: 34, filter: 'blur(1px)',
            }} />
            <div style={{
              width: 160, height: 160, borderRadius: 32,
              background: 'linear-gradient(145deg, #111 0%, #0a0a0a 100%)',
              border: '1px solid rgba(0,220,130,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 0 1px rgba(0,220,130,0.08), 0 20px 80px rgba(0,220,130,0.15), 0 8px 32px rgba(0,0,0,0.8)',
              position: 'relative',
            }}>
              <ShieldCheck size={72} color="rgba(255,255,255,0.88)" strokeWidth={1.5} />
            </div>
          </div>
        </motion.div>

        {/* Heading */}
        <motion.div className="text-center mb-4"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.1 }} viewport={{ once: true, margin: '-80px' }}
        >
          <h2 style={{ fontSize: 52, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            <span style={{ color: '#fff' }}>Ship protected</span>
            <br />
            <span style={{
              background: 'linear-gradient(90deg, #00DC82 0%, #00b4d8 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>this weekend.</span>
          </h2>
        </motion.div>

        <motion.p className="text-center mb-14"
          style={{ fontSize: 17, color: '#555', maxWidth: 580, margin: '0 auto 56px', lineHeight: 1.6 }}
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.15 }} viewport={{ once: true, margin: '-80px' }}
        >
          One npm install away. Protect your app in under 10 minutes with SDKs for every stack.
        </motion.p>

        {/* SDK Icons */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-10"
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.2 }} viewport={{ once: true, margin: '-80px' }}
        >
          {SDKS.map(sdk => {
            const active = activeSdk === sdk.id;
            return (
              <div key={sdk.id} className="flex flex-col items-center gap-2 cursor-pointer group"
                onClick={() => setActiveSdk(sdk.id as SdkId)}>
                <div style={{
                  width: 72, height: 72, background: active ? sdk.bg : '#0f0f0f',
                  border: `1px solid ${active ? sdk.color + '40' : '#1a1a1a'}`,
                  borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: active ? `0 0 20px ${sdk.color}18` : 'none',
                  transition: 'all 200ms',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-geist-mono)', fontWeight: 700, fontSize: 13,
                    color: active ? sdk.color : '#444',
                    transition: 'color 200ms',
                  }}>{sdk.abbr}</span>
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 500,
                  color: active ? '#fff' : '#444',
                  transition: 'color 200ms',
                }}>{sdk.label}</span>
              </div>
            );
          })}
        </motion.div>

        {/* Code Block */}
        <motion.div
          style={{ maxWidth: 860, margin: '0 auto', background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 16, overflow: 'hidden' }}
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.25 }} viewport={{ once: true, margin: '-80px' }}
        >
          {/* Tabs bar */}
          <div style={{
            background: '#0d0d0d', borderBottom: '1px solid #1a1a1a',
            padding: '12px 16px', display: 'flex', gap: 4, alignItems: 'center',
            overflowX: 'auto',
          }}>
            {TABS.map(tab => {
              const meta = TAB_META[tab];
              const active = activeTab === tab;
              return (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '5px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: active ? '#1a1a1a' : 'transparent',
                    outline: active ? '1px solid #2a2a2a' : 'none',
                    fontSize: 13, color: active ? '#fff' : '#444',
                    transition: 'all 150ms', whiteSpace: 'nowrap', flexShrink: 0,
                  }}
                >
                  <span style={{
                    width: 16, height: 16, borderRadius: 4, fontSize: 9,
                    background: active ? meta.color : '#222',
                    color: active ? '#000' : '#555',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-geist-mono)', fontWeight: 700, flexShrink: 0,
                  }}>{meta.abbr.length > 2 ? meta.abbr[0] : meta.abbr}</span>
                  {tab}
                </button>
              );
            })}
            <button onClick={handleCopy} style={{
              marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer',
              color: copied ? '#00DC82' : '#333', display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 12, padding: '4px 8px', borderRadius: 6, transition: 'color 150ms', flexShrink: 0,
            }}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>

          {/* Code area */}
          <div style={{ padding: '20px 0', minHeight: 280, position: 'relative', overflowX: 'auto' }}>
            <AnimatePresence mode="wait">
              <motion.div key={activeTab}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.15 }}
              >
                {(CODE[activeTab] || []).map((line, i) => (
                  <div key={i} style={{ display: 'flex', paddingRight: 24 }}>
                    <span style={{
                      fontFamily: 'var(--font-geist-mono)', fontSize: 12,
                      color: '#2a2a2a', width: 48, textAlign: 'right', paddingRight: 20,
                      userSelect: 'none', flexShrink: 0, lineHeight: 1.8,
                    }}>{i + 1}</span>
                    <div style={{ flex: 1, fontFamily: 'var(--font-geist-mono)', fontSize: 14, lineHeight: 1.8 }}>
                      <CodeLine tokens={line} />
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom bar */}
          <div style={{
            borderTop: '1px solid #1a1a1a', padding: '12px 24px',
            display: 'flex', gap: 24, alignItems: 'center',
          }}>
            {[
              { icon: GitBranch, label: 'View on GitHub' },
              { icon: Download, label: 'Download SDK' },
            ].map(({ icon: Icon, label }) => (
              <button key={label} style={{
                display: 'flex', alignItems: 'center', gap: 6, background: 'none',
                border: 'none', cursor: 'pointer', color: '#444', fontSize: 13,
                transition: 'color 150ms', padding: 0,
              }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#444')}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
