import Link from 'next/link'

export const metadata = {
  title: 'API Reference — KairosCheck',
  description: 'Documentação completa da API KairosCheck. Fraud detection em PT-BR.',
}

const CODE_STYLE: React.CSSProperties = {
  background:    'var(--kc-bg-elevated)',
  border:        '1px solid var(--kc-border-subtle)',
  borderRadius:  '8px',
  padding:       '16px 20px',
  fontFamily:    'monospace',
  fontSize:      '13px',
  color:         'var(--kc-text-primary)',
  overflowX:     'auto',
  lineHeight:    1.6,
  whiteSpace:    'pre',
  display:       'block',
  margin:        '12px 0',
}

const H2_STYLE: React.CSSProperties = {
  color:        'var(--kc-text-primary)',
  fontSize:     '18px',
  fontWeight:   700,
  marginTop:    '40px',
  marginBottom: '12px',
  paddingBottom: '8px',
  borderBottom: '1px solid var(--kc-border-subtle)',
}

const H3_STYLE: React.CSSProperties = {
  color:        'var(--kc-text-secondary)',
  fontSize:     '15px',
  fontWeight:   600,
  marginTop:    '24px',
  marginBottom: '8px',
}

const P_STYLE: React.CSSProperties = {
  color:      'var(--kc-text-secondary)',
  fontSize:   '14px',
  lineHeight: 1.7,
  margin:     '8px 0',
}

const BADGE: React.CSSProperties = {
  display:       'inline-block',
  background:    'oklch(62.3% 0.214 259.815 / 15%)',
  color:         'var(--kc-accent)',
  borderRadius:  '4px',
  padding:       '2px 8px',
  fontSize:      '12px',
  fontWeight:    600,
  fontFamily:    'monospace',
  marginRight:   '8px',
}

const BANDS = [
  { band: 'safe',     range: '0–25',  decision: 'accept',  desc: 'Sem sinais de risco. Processar normalmente.' },
  { band: 'low',      range: '26–50', decision: 'review',  desc: 'Sinais menores. Aceitar mas monitorizar.' },
  { band: 'medium',   range: '51–70', decision: 'review',  desc: 'Verificação adicional recomendada.' },
  { band: 'high',     range: '71–85', decision: 'decline', desc: 'Alto risco. Solicitar KYC ou recusar.' },
  { band: 'critical', range: '86–100',decision: 'decline', desc: 'Risco crítico. Bloquear imediatamente.' },
]

const SIGNALS = [
  { signal: 'disposable_email_domain', weight: 28,  desc: 'Email em domínio descartável (mailinator, yopmail, etc.)' },
  { signal: 'email_no_mx_record',      weight: 22,  desc: 'Domínio do email sem servidor MX válido' },
  { signal: 'tor_exit_node',           weight: 45,  desc: 'IP é nó de saída da rede Tor' },
  { signal: 'vpn_detected',            weight: 32,  desc: 'IP de fornecedor VPN conhecido por ASN' },
  { signal: 'proxy_detected',          weight: 28,  desc: 'IP de proxy ou anonimizador' },
  { signal: 'datacenter_ip',           weight: 22,  desc: 'IP de datacenter cloud (AWS, GCP, Azure, etc.)' },
  { signal: 'invalid_cpf',             weight: 60,  desc: 'CPF com dígito verificador inválido (Módulo 11)' },
  { signal: 'invalid_cnpj',            weight: 60,  desc: 'CNPJ com dígito verificador inválido (Módulo 11)' },
]

export default function DocsPage() {
  return (
    <div style={{ background: 'var(--kc-bg-base)', minHeight: '100vh' }}>
      {/* Nav simples */}
      <div style={{
        borderBottom: '1px solid var(--kc-border-subtle)',
        padding:      '16px 32px',
        display:      'flex',
        alignItems:   'center',
        gap:          '16px',
      }}>
        <Link href="/" style={{ color: 'var(--kc-text-primary)', textDecoration: 'none', fontWeight: 700, fontSize: '15px' }}>
          Kairos<span style={{ color: 'var(--kc-accent)' }}>Check</span>
        </Link>
        <span style={{ color: 'var(--kc-border-strong)' }}>/</span>
        <span style={{ color: 'var(--kc-text-muted)', fontSize: '14px' }}>API Reference</span>
        <div style={{ flex: 1 }} />
        <Link href="/dashboard/keys" style={{
          background:    'var(--kc-accent)',
          color:         '#fff',
          textDecoration: 'none',
          borderRadius:  '6px',
          padding:       '6px 14px',
          fontSize:      '13px',
          fontWeight:    500,
        }}>
          Obter API Key →
        </Link>
      </div>

      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '48px 32px' }}>

        {/* Header */}
        <h1 style={{ color: 'var(--kc-text-primary)', fontSize: '30px', fontWeight: 800, marginBottom: '8px' }}>
          API Reference
        </h1>
        <p style={{ ...P_STYLE, fontSize: '16px', marginBottom: '0' }}>
          Fraud detection OSINT-first. PT-BR nativo. Resposta em &lt;300ms. Zero black boxes.
        </p>
        <p style={{ color: 'var(--kc-text-muted)', fontSize: '13px', marginTop: '8px' }}>
          Base URL: <code style={{ fontFamily: 'monospace', color: 'var(--kc-accent)' }}>https://kairoscheck.net</code>
        </p>

        {/* Autenticação */}
        <h2 style={H2_STYLE}>Autenticação</h2>
        <p style={P_STYLE}>Todas as chamadas requerem uma API key no header <code style={{ fontFamily: 'monospace', color: 'var(--kc-accent)' }}>Authorization</code>.</p>
        <code style={CODE_STYLE}>
          {`Authorization: Bearer kc_live_<a_tua_key>`}
        </code>

        {/* POST /v1/check */}
        <h2 style={H2_STYLE}>
          <span style={BADGE}>POST</span>
          /v1/check
        </h2>
        <p style={P_STYLE}>
          Analisa uma identidade (email, IP, telefone, CPF, CNPJ, CEP) e retorna um fraud score 0–100
          com explicação completa de cada decisão.
        </p>

        <h3 style={H3_STYLE}>Exemplo mínimo</h3>
        <code style={CODE_STYLE}>
          {`curl -X POST https://kairoscheck.net/v1/check \\
  -H "Authorization: Bearer kc_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"email": "suspeito@mailinator.com"}'`}
        </code>

        <h3 style={H3_STYLE}>Exemplo completo (PT-BR)</h3>
        <code style={CODE_STYLE}>
          {`curl -X POST https://kairoscheck.net/v1/check \\
  -H "Authorization: Bearer kc_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "cliente@gmail.com",
    "ip":    "177.70.100.200",
    "cpf":   "529.982.247-25",
    "cep":   "01310-100"
  }'`}
        </code>

        <h3 style={H3_STYLE}>Body (todos opcionais, pelo menos um obrigatório)</h3>
        <div style={{ background: 'var(--kc-bg-surface)', border: '1px solid var(--kc-border-subtle)', borderRadius: '8px', overflow: 'hidden', margin: '12px 0' }}>
          {[
            { field: 'email',  type: 'string', desc: 'Endereço de email' },
            { field: 'ip',     type: 'string', desc: 'Endereço IP (IPv4)' },
            { field: 'phone',  type: 'string', desc: 'Telefone com prefixo internacional (+55...)' },
            { field: 'cpf',    type: 'string', desc: 'CPF (com ou sem pontuação)' },
            { field: 'cnpj',   type: 'string', desc: 'CNPJ (com ou sem pontuação)' },
            { field: 'cep',    type: 'string', desc: 'CEP brasileiro' },
          ].map((f, i, arr) => (
            <div key={f.field} style={{
              display: 'flex', gap: '16px', padding: '10px 16px', alignItems: 'baseline',
              borderBottom: i < arr.length - 1 ? '1px solid var(--kc-border-subtle)' : 'none',
            }}>
              <code style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--kc-accent)', minWidth: '60px' }}>{f.field}</code>
              <code style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--kc-text-muted)', minWidth: '50px' }}>{f.type}</code>
              <span style={{ color: 'var(--kc-text-secondary)', fontSize: '13px' }}>{f.desc}</span>
            </div>
          ))}
        </div>

        <h3 style={H3_STYLE}>Resposta</h3>
        <code style={CODE_STYLE}>
          {`{
  "check_id":          "chk_1779321479404_f3c6c8f0",
  "score":             87,
  "band":              "high",
  "decision":          "decline",
  "confidence":        0.92,
  "execution_time_ms": 265,

  "active_flags": ["tor_exit_node", "disposable_email_domain"],

  "explanation": {
    "summary":      "Risco alto: IP Tor + email descartável",
    "top_factors":  [
      { "flag": "tor_exit_node",          "weight": 45, "description": "Conexão via rede Tor" },
      { "flag": "disposable_email_domain","weight": 28, "description": "Email descartável" }
    ],
    "recommendations": ["Bloquear transacção"]
  },

  "meta": {
    "model_version":     "rules-v1.0",
    "sources_total":     4,
    "sources_succeeded": 4
  }
}`}
        </code>

        {/* Bandas de risco */}
        <h2 style={H2_STYLE}>Bandas de risco</h2>
        <div style={{ background: 'var(--kc-bg-surface)', border: '1px solid var(--kc-border-subtle)', borderRadius: '8px', overflow: 'hidden', margin: '12px 0' }}>
          {BANDS.map((b, i) => {
            const color = ['safe','low'].includes(b.band) ? 'var(--kc-success)' : b.band === 'medium' ? 'var(--kc-warning)' : 'var(--kc-danger)'
            return (
              <div key={b.band} style={{
                display: 'flex', gap: '16px', padding: '10px 16px', alignItems: 'center',
                borderBottom: i < BANDS.length - 1 ? '1px solid var(--kc-border-subtle)' : 'none',
              }}>
                <code style={{ fontFamily: 'monospace', fontSize: '13px', color, minWidth: '65px' }}>{b.band}</code>
                <code style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--kc-text-muted)', minWidth: '60px' }}>{b.range}</code>
                <span style={{ background: color + '18', color, borderRadius: '4px', padding: '1px 7px', fontSize: '11px', fontWeight: 500, minWidth: '55px' }}>{b.decision}</span>
                <span style={{ color: 'var(--kc-text-secondary)', fontSize: '13px' }}>{b.desc}</span>
              </div>
            )
          })}
        </div>

        {/* Signals */}
        <h2 style={H2_STYLE}>Signals de risco (pesos públicos)</h2>
        <p style={P_STYLE}>Cada flag tem um peso documentado. O score final é a soma dos pesos activos, com cap em 100.</p>
        <div style={{ background: 'var(--kc-bg-surface)', border: '1px solid var(--kc-border-subtle)', borderRadius: '8px', overflow: 'hidden', margin: '12px 0' }}>
          {SIGNALS.map((s, i) => (
            <div key={s.signal} style={{
              display: 'flex', gap: '16px', padding: '10px 16px', alignItems: 'center',
              borderBottom: i < SIGNALS.length - 1 ? '1px solid var(--kc-border-subtle)' : 'none',
            }}>
              <code style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--kc-accent)', minWidth: '195px' }}>{s.signal}</code>
              <span style={{
                background: s.weight >= 40 ? 'oklch(63.7% 0.237 25.331 / 15%)' : s.weight >= 25 ? 'oklch(76.9% 0.188 70.08 / 15%)' : 'var(--kc-bg-elevated)',
                color: s.weight >= 40 ? 'var(--kc-danger)' : s.weight >= 25 ? 'var(--kc-warning)' : 'var(--kc-text-muted)',
                borderRadius: '4px', padding: '1px 7px', fontSize: '12px', fontFamily: 'monospace', fontWeight: 600, minWidth: '28px', textAlign: 'center',
              }}>
                {s.weight}
              </span>
              <span style={{ color: 'var(--kc-text-secondary)', fontSize: '13px' }}>{s.desc}</span>
            </div>
          ))}
        </div>

        {/* Rate limits */}
        <h2 style={H2_STYLE}>Rate limits & erros</h2>
        <div style={{ background: 'var(--kc-bg-surface)', border: '1px solid var(--kc-border-subtle)', borderRadius: '8px', overflow: 'hidden', margin: '12px 0' }}>
          {[
            { code: '200', desc: 'Check executado com sucesso' },
            { code: '400', desc: 'Input inválido — ver campo "error"' },
            { code: '401', desc: 'API key em falta no header' },
            { code: '403', desc: 'API key inválida ou revogada' },
            { code: '429', desc: 'Rate limit excedido — ver header Retry-After' },
          ].map((e, i, arr) => (
            <div key={e.code} style={{
              display: 'flex', gap: '16px', padding: '10px 16px',
              borderBottom: i < arr.length - 1 ? '1px solid var(--kc-border-subtle)' : 'none',
            }}>
              <code style={{ fontFamily: 'monospace', fontSize: '13px', color: parseInt(e.code) < 400 ? 'var(--kc-success)' : 'var(--kc-danger)', minWidth: '36px' }}>{e.code}</code>
              <span style={{ color: 'var(--kc-text-secondary)', fontSize: '13px' }}>{e.desc}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          marginTop: '48px', padding: '28px', textAlign: 'center',
          background: 'oklch(62.3% 0.214 259.815 / 8%)',
          border: '1px solid var(--kc-border-accent)',
          borderRadius: '12px',
        }}>
          <p style={{ color: 'var(--kc-text-primary)', fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>
            Pronto para integrar?
          </p>
          <p style={{ color: 'var(--kc-text-muted)', fontSize: '14px', marginBottom: '16px' }}>
            Gera a tua API key grátis e faz o primeiro check em minutos.
          </p>
          <Link href="/dashboard/keys" style={{
            background: 'var(--kc-accent)', color: '#fff',
            textDecoration: 'none', borderRadius: '8px',
            padding: '10px 24px', fontSize: '14px', fontWeight: 600,
            display: 'inline-block',
          }}>
            Gerar API Key grátis →
          </Link>
        </div>

      </div>
    </div>
  )
}
