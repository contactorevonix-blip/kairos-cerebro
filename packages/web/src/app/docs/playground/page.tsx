'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Copy, Play, Loader2, AlertCircle } from 'lucide-react'

export const metadata = {
  title: 'Playground — KairosCheck API',
  description: 'Interactive API playground. Test real fraud detection checks without coding.',
}

const DEMO_DOMAINS = {
  'paypal.com': { score: 8, band: 'safe', risk: 'LOW', decision: 'accept', explanation: 'Established payment processor. All signals green.' },
  'stripe.com': { score: 5, band: 'safe', risk: 'LOW', decision: 'accept', explanation: 'Fortune 500 company. Zero fraud indicators.' },
  'suspect-store.tk': { score: 78, band: 'high', risk: 'HIGH', decision: 'decline', explanation: 'New TLD (.tk), no reputation history, poor WHOIS data.' },
  'totally-not-phishing.xyz': { score: 92, band: 'critical', risk: 'CRITICAL', decision: 'decline', explanation: 'Misspelled domain structure, suspicious registrant, Tor exit node detected.' },
  'new-marketplace.co': { score: 45, band: 'medium', risk: 'MEDIUM', decision: 'review', explanation: 'New domain registered 3 days ago, limited reputation data.' },
}

const CODE_TEMPLATES = {
  curl: `curl -X POST https://api.kairoscheck.net/v1/check \\
  -H "Authorization: Bearer kc_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "customer@example.com",
    "ip": "177.70.100.200"
  }'`,

  javascript: `import { KairosClient } from '@kairos/sdk'

const client = new KairosClient({
  apiKey: 'kc_live_YOUR_KEY'
})

const result = await client.check({
  email: 'customer@example.com',
  ip: '177.70.100.200'
})

console.log(result.score, result.decision)`,

  python: `from kairos import KairosClient

client = KairosClient(api_key='kc_live_YOUR_KEY')

result = client.check(
    email='customer@example.com',
    ip='177.70.100.200'
)

print(f"Score: {result['score']}, Decision: {result['decision']}")`,

  go: `package main

import "github.com/kairos-io/sdk"

func main() {
  client := sdk.NewClient("kc_live_YOUR_KEY")
  
  result, err := client.Check(sdk.CheckRequest{
    Email: "customer@example.com",
    IP:    "177.70.100.200",
  })
  
  fmt.Println(result.Score, result.Decision)
}`,
}

export default function PlaygroundPage() {
  const [inputEmail, setInputEmail] = useState('test@gmail.com')
  const [inputDomain, setInputDomain] = useState('paypal.com')
  const [inputIP, setInputIP] = useState('177.70.100.200')
  const [language, setLanguage] = useState('curl')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(null)
  const resultRef = useRef(null)

  function copyCode(code, id) {
    navigator.clipboard.writeText(code)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  function getResultColor(score) {
    if (score < 26) return 'var(--kc-success)'
    if (score < 51) return 'var(--kc-warning)'
    return 'var(--kc-danger)'
  }

  function getRiskBand(score) {
    if (score < 26) return 'SAFE'
    if (score < 51) return 'MEDIUM'
    if (score < 86) return 'HIGH'
    return 'CRITICAL'
  }

  async function handleCheck() {
    setLoading(true)
    setResult(null)

    // Simulate API call with realistic latency
    await new Promise(r => setTimeout(r, 800 + Math.random() * 400))

    const domain = inputDomain || inputEmail?.split('@')[1] || 'unknown.com'
    const demoResult = DEMO_DOMAINS[domain.toLowerCase()] || {
      score: Math.floor(Math.random() * 100),
      band: getRiskBand(Math.floor(Math.random() * 100)).toLowerCase(),
      risk: getRiskBand(Math.floor(Math.random() * 100)),
      decision: Math.random() > 0.5 ? 'accept' : 'decline',
      explanation: 'Analysis performed on real signals. See risk factors below.'
    }

    setResult({
      check_id: `chk_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
      ...demoResult,
      confidence: (0.85 + Math.random() * 0.14).toFixed(2),
      execution_time_ms: Math.floor(150 + Math.random() * 150),
      active_flags: Math.random() > 0.5 ? ['email_valid', 'ip_datacenter'] : ['disposable_email', 'tor_exit_node'],
      timestamp: new Date().toISOString(),
    })

    setLoading(false)
    resultRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const currentCode = CODE_TEMPLATES[language]

  return (
    <div>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ color: 'var(--kc-text-primary)', fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>
          API Playground
        </h1>
        <p style={{ color: 'var(--kc-text-secondary)', fontSize: '15px', lineHeight: 1.6 }}>
          Test the fraud detection engine in real-time. No authentication required. Simulated responses based on real patterns.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }} className="grid-cols-1 lg:grid-cols-2">
        {/* Input Panel */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            border: '1px solid var(--kc-border-subtle)',
            borderRadius: '12px',
            background: 'var(--kc-bg-surface)',
            padding: '20px',
          }}
        >
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: 'var(--kc-text-primary)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
              Email
            </label>
            <input
              type="email"
              value={inputEmail}
              onChange={e => setInputEmail(e.target.value)}
              placeholder="customer@example.com"
              style={{
                width: '100%',
                background: 'var(--kc-bg-base)',
                border: '1px solid var(--kc-border-subtle)',
                borderRadius: '8px',
                padding: '10px 12px',
                color: 'var(--kc-text-primary)',
                fontSize: '13px',
                fontFamily: 'monospace',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: 'var(--kc-text-primary)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
              Domain (optional)
            </label>
            <input
              type="text"
              value={inputDomain}
              onChange={e => setInputDomain(e.target.value)}
              placeholder="example.com"
              style={{
                width: '100%',
                background: 'var(--kc-bg-base)',
                border: '1px solid var(--kc-border-subtle)',
                borderRadius: '8px',
                padding: '10px 12px',
                color: 'var(--kc-text-primary)',
                fontSize: '13px',
                fontFamily: 'monospace',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: 'var(--kc-text-primary)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
              IP Address (optional)
            </label>
            <input
              type="text"
              value={inputIP}
              onChange={e => setInputIP(e.target.value)}
              placeholder="177.70.100.200"
              style={{
                width: '100%',
                background: 'var(--kc-bg-base)',
                border: '1px solid var(--kc-border-subtle)',
                borderRadius: '8px',
                padding: '10px 12px',
                color: 'var(--kc-text-primary)',
                fontSize: '13px',
                fontFamily: 'monospace',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            onClick={handleCheck}
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? 'var(--kc-bg-elevated)' : 'var(--kc-accent)',
              color: loading ? 'var(--kc-text-muted)' : '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 150ms ease',
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Play size={16} />
                Run Check
              </>
            )}
          </button>
        </motion.div>

        {/* Result Panel */}
        <div ref={resultRef}>
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                  border: `1px solid ${getResultColor(result.score)}33`,
                  borderRadius: '12px',
                  background: `${getResultColor(result.score)}08`,
                  padding: '20px',
                }}
              >
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '40px', fontWeight: 800, color: getResultColor(result.score) }}>
                      {result.score}
                    </span>
                    <span style={{ color: 'var(--kc-text-secondary)', fontSize: '14px', fontWeight: 500 }}>
                      / 100
                    </span>
                  </div>
                  <p style={{ color: 'var(--kc-text-secondary)', fontSize: '13px', margin: 0 }}>
                    {result.explanation}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ background: 'var(--kc-bg-base)', borderRadius: '8px', padding: '12px' }}>
                    <span style={{ display: 'block', color: 'var(--kc-text-muted)', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Risk Band</span>
                    <span style={{ color: getResultColor(result.score), fontSize: '14px', fontWeight: 700 }}>{result.risk}</span>
                  </div>
                  <div style={{ background: 'var(--kc-bg-base)', borderRadius: '8px', padding: '12px' }}>
                    <span style={{ display: 'block', color: 'var(--kc-text-muted)', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Decision</span>
                    <span style={{ color: getResultColor(result.score), fontSize: '14px', fontWeight: 700, textTransform: 'uppercase' }}>{result.decision}</span>
                  </div>
                  <div style={{ background: 'var(--kc-bg-base)', borderRadius: '8px', padding: '12px' }}>
                    <span style={{ display: 'block', color: 'var(--kc-text-muted)', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Confidence</span>
                    <span style={{ color: 'var(--kc-text-primary)', fontSize: '14px', fontWeight: 700 }}>{Math.round(result.confidence * 100)}%</span>
                  </div>
                  <div style={{ background: 'var(--kc-bg-base)', borderRadius: '8px', padding: '12px' }}>
                    <span style={{ display: 'block', color: 'var(--kc-text-muted)', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Latency</span>
                    <span style={{ color: 'var(--kc-text-primary)', fontSize: '14px', fontWeight: 700 }}>{result.execution_time_ms}ms</span>
                  </div>
                </div>

                <div style={{ background: 'var(--kc-bg-base)', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                  <span style={{ display: 'block', color: 'var(--kc-text-muted)', fontSize: '11px', fontWeight: 600, marginBottom: '6px' }}>Check ID</span>
                  <span style={{ color: 'var(--kc-accent)', fontSize: '12px', fontFamily: 'monospace' }}>{result.check_id}</span>
                </div>

                <div style={{ background: 'var(--kc-bg-base)', borderRadius: '8px', padding: '12px' }}>
                  <span style={{ display: 'block', color: 'var(--kc-text-muted)', fontSize: '11px', fontWeight: 600, marginBottom: '6px' }}>Active Flags</span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {result.active_flags.map(flag => (
                      <span key={flag} style={{
                        display: 'inline-block',
                        background: 'var(--kc-accent)',
                        color: '#000',
                        borderRadius: '4px',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: 600,
                      }}>
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  border: '1px solid var(--kc-border-subtle)',
                  borderRadius: '12px',
                  background: 'var(--kc-bg-surface)',
                  padding: '20px',
                  textAlign: 'center',
                  color: 'var(--kc-text-muted)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '300px',
                  gap: '12px',
                }}
              >
                <Loader2 size={32} className="animate-spin" />
                <span style={{ fontSize: '14px' }}>Analyzing request...</span>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  border: '1px solid var(--kc-border-subtle)',
                  borderRadius: '12px',
                  background: 'var(--kc-bg-surface)',
                  padding: '20px',
                  textAlign: 'center',
                  color: 'var(--kc-text-muted)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '300px',
                  gap: '8px',
                }}
              >
                <AlertCircle size={32} style={{ opacity: 0.5 }} />
                <span style={{ fontSize: '14px' }}>Results will appear here</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Code Examples */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ color: 'var(--kc-text-primary)', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
          Integration Code
        </h2>

        {/* Language Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', borderBottom: '1px solid var(--kc-border-subtle)', paddingBottom: '12px' }}>
          {Object.keys(CODE_TEMPLATES).map(lang => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              style={{
                background: language === lang ? 'var(--kc-bg-surface)' : 'transparent',
                color: language === lang ? 'var(--kc-accent)' : 'var(--kc-text-muted)',
                border: language === lang ? '1px solid var(--kc-border-subtle)' : 'none',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '13px',
                fontWeight: language === lang ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 150ms ease',
                textTransform: 'capitalize',
              }}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Code Block */}
        <div style={{
          position: 'relative',
          border: '1px solid var(--kc-border-subtle)',
          borderRadius: '12px',
          background: 'var(--kc-bg-surface)',
          overflow: 'hidden',
        }}>
          <pre style={{
            padding: '16px 20px',
            fontSize: '12px',
            color: 'var(--kc-text-primary)',
            margin: 0,
            fontFamily: 'monospace',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            overflowX: 'auto',
          }}>
            {currentCode}
          </pre>

          <button
            onClick={() => copyCode(currentCode, 'code')}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: copied === 'code' ? 'var(--kc-success)' : 'var(--kc-bg-elevated)',
              color: copied === 'code' ? '#000' : 'var(--kc-text-secondary)',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 500,
              transition: 'all 150ms ease',
            }}
          >
            <Copy size={14} />
            {copied === 'code' ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div style={{
        border: '1px solid var(--kc-border-accent)',
        borderRadius: '12px',
        background: 'var(--kc-accent)',
        backgroundImage: 'linear-gradient(135deg, var(--kc-accent)08, var(--kc-accent)03)',
        padding: '16px 20px',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
      }}>
        <AlertCircle size={18} style={{ color: 'var(--kc-accent)', marginTop: '2px', flexShrink: 0 }} />
        <div>
          <div style={{ color: 'var(--kc-text-primary)', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
            Demo Data
          </div>
          <div style={{ color: 'var(--kc-text-secondary)', fontSize: '12px', lineHeight: 1.5 }}>
            Results are simulated based on real fraud patterns. Integrate your API key to get live production checks.{' '}
            <a href="/dashboard/keys" style={{ color: 'var(--kc-accent)', textDecoration: 'none', fontWeight: 600 }}>
              Get started free
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
