'use client'

import Link from 'next/link'
import { ArrowRight, Play, BookOpen, Zap, Code } from 'lucide-react'

export const metadata = {
  title: 'API Reference — KairosCheck',
  description: 'Complete documentation and fraud detection API reference.',
}

const H2_STYLE: React.CSSProperties = {
  color: 'var(--kc-text-primary)',
  fontSize: '20px',
  fontWeight: 700,
  marginTop: '32px',
  marginBottom: '16px',
  paddingBottom: '8px',
  borderBottom: '1px solid var(--kc-border-subtle)',
}

const H3_STYLE: React.CSSProperties = {
  color: 'var(--kc-text-secondary)',
  fontSize: '15px',
  fontWeight: 600,
  marginTop: '20px',
  marginBottom: '8px',
}

const P_STYLE: React.CSSProperties = {
  color: 'var(--kc-text-secondary)',
  fontSize: '14px',
  lineHeight: 1.7,
  margin: '8px 0',
}

const BADGE: React.CSSProperties = {
  display: 'inline-block',
  background: 'var(--kc-accent)',
  backgroundImage: 'linear-gradient(135deg, var(--kc-accent)15, var(--kc-accent)08)',
  color: 'var(--kc-accent)',
  borderRadius: '4px',
  padding: '2px 8px',
  fontSize: '11px',
  fontWeight: 600,
  fontFamily: 'monospace',
  marginRight: '8px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}

const CODE_STYLE: React.CSSProperties = {
  background: 'var(--kc-bg-elevated)',
  border: '1px solid var(--kc-border-subtle)',
  borderRadius: '8px',
  padding: '16px 20px',
  fontFamily: 'monospace',
  fontSize: '12px',
  color: 'var(--kc-text-primary)',
  overflowX: 'auto',
  lineHeight: 1.6,
  margin: '12px 0',
  display: 'block',
  whiteSpace: 'pre-wrap',
  wordWrap: 'break-word',
}

const CARD_STYLE: React.CSSProperties = {
  border: '1px solid var(--kc-border-subtle)',
  borderRadius: '8px',
  background: 'var(--kc-bg-surface)',
  padding: '16px',
  marginBottom: '12px',
}

export default function DocsPage() {
  return (
    <div>
      {/* Hero */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ color: 'var(--kc-text-primary)', fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>
          API Reference
        </h1>
        <p style={{ ...P_STYLE, fontSize: '16px' }}>
          Fraud detection OSINT-first. PT-BR nativo. Resposta em &lt;300ms. Zero black boxes.
        </p>
        <p style={{ color: 'var(--kc-text-muted)', fontSize: '13px', margin: '12px 0 0' }}>
          Base URL: <code style={{ fontFamily: 'monospace', color: 'var(--kc-accent)' }}>https://kairoscheck.net</code>
        </p>
      </div>

      {/* Quick Links */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '32px' }} className="grid-cols-1 lg:grid-cols-4 md:grid-cols-2">
        {[
          { icon: Play, label: 'Try Playground', href: '/docs/playground' },
          { icon: Code, label: 'Code Examples', href: '/docs/examples' },
          { icon: BookOpen, label: 'Risk Signals', href: '/docs/signals' },
          { icon: Zap, label: 'Rate Limits', href: '/docs/rate-limits' },
        ].map((link, i) => {
          const Icon = link.icon
          return (
            <Link key={i} href={link.href} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              borderRadius: '8px',
              background: 'var(--kc-bg-surface)',
              border: '1px solid var(--kc-border-subtle)',
              textDecoration: 'none',
              color: 'var(--kc-text-primary)',
              transition: 'all 150ms ease',
              fontSize: '13px',
              fontWeight: 600,
            }}>
              <Icon size={16} style={{ color: 'var(--kc-accent)' }} />
              {link.label}
              <span style={{ marginLeft: 'auto' }}>→</span>
            </Link>
          )
        })}
      </div>

      {/* Authentication */}
      <h2 style={H2_STYLE}>Authentication</h2>
      <p style={P_STYLE}>All API requests require an API key in the Authorization header. Get one free in your dashboard.</p>
      <code style={CODE_STYLE}>
        {`Authorization: Bearer kc_live_abc123...`}
      </code>

      {/* API Endpoint */}
      <h2 style={H2_STYLE}>POST /v1/check</h2>
      <p style={P_STYLE}>Analyze an identity (email, IP, phone, CPF, CNPJ) and return a fraud score 0-100 with full explanation.</p>

      <h3 style={H3_STYLE}>Basic Example</h3>
      <code style={CODE_STYLE}>
        {`curl -X POST https://kairoscheck.net/v1/check \\
  -H "Authorization: Bearer kc_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "customer@gmail.com",
    "ip": "177.70.100.200"
  }'`}
      </code>

      <h3 style={H3_STYLE}>Complete Example (PT-BR)</h3>
      <code style={CODE_STYLE}>
        {`curl -X POST https://kairoscheck.net/v1/check \\
  -H "Authorization: Bearer kc_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "customer@gmail.com",
    "ip": "177.70.100.200",
    "cpf": "529.982.247-25",
    "cep": "01310-100"
  }'`}
      </code>

      {/* Request Body */}
      <h3 style={H3_STYLE}>Request Body (all optional, at least one required)</h3>
      <div style={{ background: 'var(--kc-bg-surface)', border: '1px solid var(--kc-border-subtle)', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
        {[
          { field: 'email', type: 'string', desc: 'Email address' },
          { field: 'ip', type: 'string', desc: 'IPv4 address' },
          { field: 'phone', type: 'string', desc: 'Phone with international prefix (+55...)' },
          { field: 'cpf', type: 'string', desc: 'CPF (with or without punctuation)' },
          { field: 'cnpj', type: 'string', desc: 'CNPJ (with or without punctuation)' },
          { field: 'cep', type: 'string', desc: 'Brazilian postal code' },
        ].map((f, i, arr) => (
          <div key={f.field} style={{
            display: 'flex',
            gap: '16px',
            padding: '10px 16px',
            alignItems: 'flex-start',
            borderBottom: i < arr.length - 1 ? '1px solid var(--kc-border-subtle)' : 'none',
          }}>
            <code style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--kc-accent)', minWidth: '80px', fontWeight: 600 }}>{f.field}</code>
            <code style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--kc-text-muted)', minWidth: '60px' }}>{f.type}</code>
            <span style={{ color: 'var(--kc-text-secondary)', fontSize: '13px' }}>{f.desc}</span>
          </div>
        ))}
      </div>

      {/* Response */}
      <h3 style={H3_STYLE}>Response (200 OK)</h3>
      <code style={CODE_STYLE}>
        {`{
  "check_id": "chk_1779321479404_f3c6c8f0",
  "score": 87,
  "band": "high",
  "decision": "decline",
  "confidence": 0.92,
  "execution_time_ms": 265,

  "active_flags": [
    "tor_exit_node",
    "disposable_email_domain"
  ],

  "explanation": {
    "summary": "High risk: Tor IP + disposable email",
    "top_factors": [
      {
        "flag": "tor_exit_node",
        "weight": 45,
        "description": "IP detected as Tor exit node"
      },
      {
        "flag": "disposable_email_domain",
        "weight": 28,
        "description": "Email uses temporary service"
      }
    ],
    "recommendations": [
      "Decline transaction",
      "Request additional verification"
    ]
  },

  "meta": {
    "model_version": "rules-v1.0",
    "sources_total": 4,
    "sources_succeeded": 4
  }
}`}
      </code>

      {/* Risk Bands */}
      <h2 style={H2_STYLE}>Risk Bands</h2>
      <div style={{ background: 'var(--kc-bg-surface)', border: '1px solid var(--kc-border-subtle)', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
        {[
          { band: 'safe', range: '0–25', decision: 'accept', desc: 'No signals detected. Process normally.' },
          { band: 'low', range: '26–50', decision: 'accept', desc: 'Minor signals. Accept but monitor.' },
          { band: 'medium', range: '51–70', decision: 'review', desc: 'Additional verification recommended.' },
          { band: 'high', range: '71–85', decision: 'decline', desc: 'High risk. Request KYC or decline.' },
          { band: 'critical', range: '86–100', decision: 'decline', desc: 'Critical risk. Block immediately.' },
        ].map((b, i, arr) => {
          const color = ['safe', 'low'].includes(b.band) ? 'var(--kc-success)' : b.band === 'medium' ? 'var(--kc-warning)' : 'var(--kc-danger)'
          return (
            <div key={b.band} style={{
              display: 'flex',
              gap: '16px',
              padding: '10px 16px',
              alignItems: 'center',
              borderBottom: i < arr.length - 1 ? '1px solid var(--kc-border-subtle)' : 'none',
            }}>
              <code style={{ fontFamily: 'monospace', fontSize: '13px', color, minWidth: '65px', fontWeight: 600 }}>{b.band}</code>
              <code style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--kc-text-muted)', minWidth: '60px' }}>{b.range}</code>
              <span style={{ background: color + '18', color, borderRadius: '4px', padding: '1px 7px', fontSize: '11px', fontWeight: 500, minWidth: '60px', textAlign: 'center' }}>{b.decision}</span>
              <span style={{ color: 'var(--kc-text-secondary)', fontSize: '13px' }}>{b.desc}</span>
            </div>
          )
        })}
      </div>

      {/* HTTP Status Codes */}
      <h2 style={H2_STYLE}>HTTP Status Codes</h2>
      <div style={{ background: 'var(--kc-bg-surface)', border: '1px solid var(--kc-border-subtle)', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
        {[
          { code: '200', desc: 'Check executed successfully' },
          { code: '400', desc: 'Bad request — invalid input' },
          { code: '401', desc: 'API key missing or invalid' },
          { code: '403', desc: 'API key revoked or subscription inactive' },
          { code: '429', desc: 'Rate limit exceeded — see Retry-After header' },
          { code: '500', desc: 'Server error — retry with backoff' },
        ].map((e, i, arr) => (
          <div key={e.code} style={{
            display: 'flex',
            gap: '16px',
            padding: '10px 16px',
            borderBottom: i < arr.length - 1 ? '1px solid var(--kc-border-subtle)' : 'none',
          }}>
            <code style={{ fontFamily: 'monospace', fontSize: '13px', color: parseInt(e.code) < 400 ? 'var(--kc-success)' : 'var(--kc-danger)', minWidth: '40px', fontWeight: 600 }}>{e.code}</code>
            <span style={{ color: 'var(--kc-text-secondary)', fontSize: '13px' }}>{e.desc}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{
        marginTop: '40px',
        padding: '28px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, var(--kc-accent)08, var(--kc-accent)03)',
        border: '1px solid var(--kc-border-accent)',
        borderRadius: '12px',
      }}>
        <p style={{ color: 'var(--kc-text-primary)', fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>
          Ready to integrate?
        </p>
        <p style={{ color: 'var(--kc-text-muted)', fontSize: '14px', marginBottom: '16px' }}>
          Create your free API key and run your first check in minutes.
        </p>
        <Link href="/dashboard/keys" style={{
          background: 'var(--kc-accent)',
          color: '#000',
          textDecoration: 'none',
          borderRadius: '8px',
          padding: '10px 24px',
          fontSize: '14px',
          fontWeight: 600,
          display: 'inline-block',
          transition: 'all 150ms ease',
        }}>
          Generate Free API Key →
        </Link>
      </div>

      {/* Related Pages */}
      <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }} className="grid-cols-1 lg:grid-cols-3">
        {[
          { title: 'Live Playground', desc: 'Test the API without coding', href: '/docs/playground' },
          { title: 'Code Examples', desc: 'Node.js, Python, Go, React', href: '/docs/examples' },
          { title: 'Rate Limits', desc: 'Plans, quotas, and pricing', href: '/docs/rate-limits' },
        ].map((page, i) => (
          <Link key={i} href={page.href} style={{
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid var(--kc-border-subtle)',
            background: 'var(--kc-bg-surface)',
            textDecoration: 'none',
            transition: 'all 150ms ease',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}>
            <span style={{ color: 'var(--kc-text-primary)', fontSize: '13px', fontWeight: 600 }}>{page.title}</span>
            <span style={{ color: 'var(--kc-text-muted)', fontSize: '12px' }}>{page.desc}</span>
            <span style={{ color: 'var(--kc-accent)', fontSize: '12px', marginTop: '4px', fontWeight: 500 }}>Learn more →</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
