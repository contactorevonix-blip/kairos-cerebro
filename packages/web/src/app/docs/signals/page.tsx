'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { ChevronDown, Filter } from 'lucide-react'

export const metadata = {
  title: 'Risk Signals — KairosCheck',
  description: 'Complete documentation of all fraud detection signals and their weights.',
}

const RISK_SIGNALS = [
  {
    category: 'Email Intelligence',
    description: 'Email address validation and reputation',
    signals: [
      {
        signal: 'disposable_email_domain',
        weight: 28,
        severity: 'medium',
        description: 'Email uses a disposable/temporary service (mailinator, yopmail, temp-mail, etc.)',
        indicators: ['Temporary services commonly used in fraud', 'Legitimate users rarely use these'],
      },
      {
        signal: 'email_no_mx_record',
        weight: 22,
        severity: 'medium',
        description: 'Email domain exists but has no valid MX (mail exchange) records',
        indicators: ['Domain cannot receive email', 'May indicate intentionally non-functional setup'],
      },
      {
        signal: 'email_typo_similar_major',
        weight: 18,
        severity: 'low',
        description: 'Email domain is a typo variant of a major service (e.g., gmial.com instead of gmail.com)',
        indicators: ['Common in phishing attempts', 'Can fool inattentive users'],
      },
    ],
  },
  {
    category: 'IP & Network',
    description: 'IP address reputation and anonymization detection',
    signals: [
      {
        signal: 'tor_exit_node',
        weight: 45,
        severity: 'high',
        description: 'IP address is a known Tor network exit node',
        indicators: ['Highest anonymization indicator', 'Strongly correlated with fraud'],
      },
      {
        signal: 'vpn_detected',
        weight: 32,
        severity: 'medium',
        description: 'IP belongs to a VPN provider (classified by ASN)',
        indicators: ['Common in fraud rings', 'Legitimate uses exist but less common in B2C'],
      },
      {
        signal: 'proxy_detected',
        weight: 28,
        severity: 'medium',
        description: 'IP identified as proxy or anonimizer service',
        indicators: ['Hides true origin', 'Often used for fraud evasion'],
      },
      {
        signal: 'datacenter_ip',
        weight: 22,
        severity: 'low',
        description: 'IP belongs to known cloud datacenter (AWS, Azure, GCP, Linode, etc.)',
        indicators: ['Legitimate businesses use datacenters', 'Also used in large-scale attacks'],
      },
      {
        signal: 'ip_abuse_reports',
        weight: 24,
        severity: 'medium',
        description: 'IP has abuse history in public blacklists',
        indicators: ['Flagged by Spamhaus, Project Honey Pot, or similar', 'Indicates previous malicious activity'],
      },
      {
        signal: 'geolocation_mismatch',
        weight: 16,
        severity: 'low',
        description: 'IP geolocation does not match stated address',
        indicators: ['May indicate spoofing or intentional misrepresentation', 'False positives possible with VPNs'],
      },
    ],
  },
  {
    category: 'Document Verification',
    description: 'CPF, CNPJ, and other document validation',
    signals: [
      {
        signal: 'invalid_cpf',
        weight: 60,
        severity: 'critical',
        description: 'CPF (Brazilian personal ID) fails checksum validation (Module 11)',
        indicators: ['Mathematically invalid document', 'Clear sign of fabrication'],
      },
      {
        signal: 'invalid_cnpj',
        weight: 60,
        severity: 'critical',
        description: 'CNPJ (Brazilian business ID) fails checksum validation',
        indicators: ['Same as CPF — mathematical invalidity', 'Business fraud indicator'],
      },
      {
        signal: 'cpf_generated_date_invalid',
        weight: 40,
        severity: 'high',
        description: 'CPF encoded issue date is in the future or invalid',
        indicators: ['CPF checksum valid but timestamp impossible', 'Forged document'],
      },
      {
        signal: 'cpf_sequential_digits',
        weight: 35,
        severity: 'high',
        description: 'CPF contains all identical digits (111.111.111-11, etc.)',
        indicators: ['Red flag even if checksum technically valid', 'Test or obvious fake'],
      },
    ],
  },
  {
    category: 'Phone & SMS',
    description: 'Phone number reputation and carrier detection',
    signals: [
      {
        signal: 'phone_disposable_provider',
        weight: 26,
        severity: 'medium',
        description: 'Phone number belongs to temp SMS service',
        indicators: ['Used to bypass SMS verification', 'SMS spoofing services'],
      },
      {
        signal: 'phone_voip_provider',
        weight: 20,
        severity: 'low',
        description: 'Number is VoIP (Skype, Google Voice, etc.) not carrier',
        indicators: ['Harder to verify', 'Legitimate but higher friction'],
      },
      {
        signal: 'phone_carrier_mismatch',
        weight: 12,
        severity: 'low',
        description: 'Phone number prefix does not match claimed country',
        indicators: ['May indicate regional spoofing', 'False positives with traveling users'],
      },
    ],
  },
  {
    category: 'Behavioral & Content',
    description: 'Linguistic patterns and behavioral indicators',
    signals: [
      {
        signal: 'nlp_scam_language_detected',
        weight: 38,
        severity: 'high',
        description: 'Text content matches common fraud scripts (urgency, all-caps, threats)',
        indicators: ['NLP trained on scam corpus', 'Detects classical phishing templates'],
      },
      {
        signal: 'excessive_special_chars',
        weight: 16,
        severity: 'low',
        description: 'Input contains unusual density of special characters',
        indicators: ['May be encoding attack or injection attempt', 'Legitimate but suspicious'],
      },
      {
        signal: 'url_shortener_detected',
        weight: 20,
        severity: 'low',
        description: 'Message contains bit.ly, tinyurl, or similar shortened URL',
        indicators: ['Hard to see true destination', 'Common in phishing'],
      },
    ],
  },
  {
    category: 'Geolocation & Timezone',
    description: 'Location consistency checks',
    signals: [
      {
        signal: 'timezone_mismatch_severe',
        weight: 14,
        severity: 'low',
        description: 'Timezone from IP and claimed address differ significantly',
        indicators: ['May be spoofing or traveling', 'Lower confidence signal alone'],
      },
      {
        signal: 'location_velocity_high',
        weight: 18,
        severity: 'medium',
        description: 'Distance between current and previous known location exceeds physical travel limit',
        indicators: ['Impossible travel (2 checks from Tokyo → NYC in 1 hour)', 'Requires account history'],
      },
    ],
  },
]

const SEVERITY_COLORS = {
  critical: '#e11d48',
  high: '#ea580c',
  medium: '#f59e0b',
  low: '#10b981',
}

export default function SignalsPage() {
  const [expandedSignals, setExpandedSignals] = useState<Set<string>>(new Set())
  const [filterSeverity, setFilterSeverity] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string | null>(null)

  function toggleSignal(signal: string) {
    const newSet = new Set(expandedSignals)
    newSet.has(signal) ? newSet.delete(signal) : newSet.add(signal)
    setExpandedSignals(newSet)
  }

  const categories = filterCategory ? 
    RISK_SIGNALS.filter(c => c.category === filterCategory) :
    RISK_SIGNALS

  const totalWeight = RISK_SIGNALS.reduce((sum, cat) => 
    sum + cat.signals.reduce((s, sig) => s + sig.weight, 0), 0
  )

  return (
    <div>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ color: 'var(--kc-text-primary)', fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>
          Risk Signals Reference
        </h1>
        <p style={{ color: 'var(--kc-text-secondary)', fontSize: '15px', lineHeight: 1.6, marginBottom: '16px' }}>
          Complete documentation of all fraud detection signals. Each signal has a documented weight that contributes to the final fraud score.
        </p>
        
        <div style={{
          background: 'var(--kc-bg-surface)',
          border: '1px solid var(--kc-border-subtle)',
          borderRadius: '8px',
          padding: '12px 16px',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          fontSize: '13px',
        }}>
          <span style={{ color: 'var(--kc-text-muted)' }}>Total max weight:</span>
          <span style={{ color: 'var(--kc-accent)', fontWeight: 700 }}>{totalWeight} pts</span>
          <span style={{ color: 'var(--kc-text-muted)' }}>→ Score capped at 100</span>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilterCategory(null)}
          style={{
            background: filterCategory === null ? 'var(--kc-bg-elevated)' : 'var(--kc-bg-surface)',
            color: filterCategory === null ? 'var(--kc-accent)' : 'var(--kc-text-secondary)',
            border: '1px solid' + (filterCategory === null ? ' var(--kc-border-accent)' : ' var(--kc-border-subtle)'),
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
        >
          All Categories
        </button>

        {RISK_SIGNALS.map(cat => (
          <button
            key={cat.category}
            onClick={() => setFilterCategory(cat.category)}
            style={{
              background: filterCategory === cat.category ? 'var(--kc-bg-elevated)' : 'var(--kc-bg-surface)',
              color: filterCategory === cat.category ? 'var(--kc-text-primary)' : 'var(--kc-text-secondary)',
              border: '1px solid' + (filterCategory === cat.category ? ' var(--kc-border-normal)' : ' var(--kc-border-subtle)'),
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
          >
            {cat.category}
          </button>
        ))}
      </div>

      {/* Signals */}
      {categories.map(category => (
        <div key={category.category} style={{ marginBottom: '32px' }}>
          <h2 style={{
            color: 'var(--kc-text-primary)',
            fontSize: '18px',
            fontWeight: 700,
            marginBottom: '8px',
          }}>
            {category.category}
          </h2>
          <p style={{
            color: 'var(--kc-text-muted)',
            fontSize: '13px',
            marginBottom: '16px',
          }}>
            {category.description}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {category.signals.map(signal => (
              <motion.div key={signal.signal}>
                <button
                  onClick={() => toggleSignal(signal.signal)}
                  style={{
                    width: '100%',
                    background: expandedSignals.has(signal.signal) ? 'var(--kc-bg-elevated)' : 'var(--kc-bg-surface)',
                    border: '1px solid var(--kc-border-subtle)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  {/* Weight Badge */}
                  <div style={{
                    background: SEVERITY_COLORS[signal.severity] + '15',
                    color: SEVERITY_COLORS[signal.severity],
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    minWidth: '50px',
                    textAlign: 'center',
                  }}>
                    {signal.weight}pt
                  </div>

                  {/* Signal Name */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      color: 'var(--kc-text-primary)',
                      fontSize: '13px',
                      fontWeight: 600,
                      fontFamily: 'monospace',
                      marginBottom: '2px',
                    }}>
                      {signal.signal}
                    </div>
                    <div style={{
                      color: 'var(--kc-text-muted)',
                      fontSize: '12px',
                      lineHeight: 1.4,
                    }}>
                      {signal.description}
                    </div>
                  </div>

                  {/* Chevron */}
                  <ChevronDown
                    size={18}
                    style={{
                      color: 'var(--kc-text-muted)',
                      transform: expandedSignals.has(signal.signal) ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 200ms ease',
                      flexShrink: 0,
                    }}
                  />
                </button>

                {/* Expanded Content */}
                {expandedSignals.has(signal.signal) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{
                      background: 'var(--kc-bg-base)',
                      border: '1px solid var(--kc-border-subtle)',
                      borderTop: 'none',
                      borderBottomLeftRadius: '8px',
                      borderBottomRightRadius: '8px',
                      padding: '12px 16px',
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{
                        color: 'var(--kc-text-muted)',
                        fontSize: '11px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '6px',
                      }}>
                        Severity: <span style={{
                          color: SEVERITY_COLORS[signal.severity],
                          textTransform: 'capitalize',
                          fontWeight: 700,
                        }}>
                          {signal.severity}
                        </span>
                      </div>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <div style={{
                        color: 'var(--kc-text-muted)',
                        fontSize: '11px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '6px',
                      }}>
                        Key Indicators
                      </div>
                      {signal.indicators.map((indicator, i) => (
                        <div key={i} style={{
                          color: 'var(--kc-text-secondary)',
                          fontSize: '12px',
                          lineHeight: 1.5,
                          paddingLeft: '16px',
                          marginBottom: '4px',
                          position: 'relative',
                        }}>
                          <span style={{ position: 'absolute', left: 0, color: 'var(--kc-text-muted)' }}>•</span>
                          {indicator}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      {/* Score Calculation Example */}
      <div style={{
        border: '1px solid var(--kc-border-subtle)',
        borderRadius: '12px',
        background: 'var(--kc-bg-surface)',
        padding: '20px',
        marginTop: '40px',
      }}>
        <h3 style={{
          color: 'var(--kc-text-primary)',
          fontSize: '16px',
          fontWeight: 700,
          marginBottom: '12px',
        }}>
          Example: How the Score is Calculated
        </h3>

        <div style={{ background: 'var(--kc-bg-base)', borderRadius: '8px', padding: '12px', fontFamily: 'monospace', fontSize: '12px', lineHeight: 1.6, color: 'var(--kc-text-secondary)', marginBottom: '12px', overflowX: 'auto' }}>
          {`Request: email="temp@mailinator.com" ip="1.2.3.4" (Tor exit node)

Active signals:
  + disposable_email_domain:  28pt
  + tor_exit_node:           +45pt
  ──────────────────────────────────
  = 73pt → Band: HIGH → Decision: DECLINE

Confidence:  92% (both signals extremely strong)
Explanation: High-risk email + Tor anonymization`}
        </div>

        <div style={{
          background: 'var(--kc-accent)',
          backgroundImage: 'linear-gradient(135deg, var(--kc-accent)08, var(--kc-accent)03)',
          border: '1px solid var(--kc-border-accent)',
          borderRadius: '8px',
          padding: '12px',
          color: 'var(--kc-text-secondary)',
          fontSize: '12px',
          lineHeight: 1.5,
        }}>
          <strong style={{ color: 'var(--kc-text-primary)' }}>Note:</strong> Final score is capped at 100. Some signal combinations can theoretically exceed 100, so we normalize to the 0-100 scale.
        </div>
      </div>
    </div>
  )
}
