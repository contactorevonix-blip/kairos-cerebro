'use client'

import { motion } from 'motion/react'
import { AlertCircle, TrendingUp, Zap, Shield } from 'lucide-react'

export const metadata = {
  title: 'Rate Limits & Quotas — KairosCheck',
  description: 'Rate limiting policies, quota management, and best practices.',
}

export default function RateLimitsPage() {
  return (
    <div>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ color: 'var(--kc-text-primary)', fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>
          Rate Limits & Quotas
        </h1>
        <p style={{ color: 'var(--kc-text-secondary)', fontSize: '15px', lineHeight: 1.6 }}>
          API rate limiting and quota management. Understand our pricing, limits, and how to optimize your usage.
        </p>
      </div>

      {/* Plans Overview */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{
          color: 'var(--kc-text-primary)',
          fontSize: '24px',
          fontWeight: 700,
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--kc-border-subtle)',
        }}>
          Pricing Plans
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }} className="grid-cols-1 lg:grid-cols-3">
          {[
            {
              name: 'Starter',
              price: '$0/mo',
              description: 'Perfect for testing',
              features: [
                '100 checks/day',
                '10 req/min burst',
                'Community support',
                'All 9 fraud layers',
                'API documentation',
              ],
              cta: 'Get Started',
              featured: false,
            },
            {
              name: 'Professional',
              price: '$99/mo',
              description: 'For growing platforms',
              features: [
                '10,000 checks/day',
                '100 req/min burst',
                '50 req/sec sustained',
                'Email support (24h)',
                'Webhook integrations',
                'Custom webhooks',
                'Usage analytics',
              ],
              cta: 'Start Free Trial',
              featured: true,
            },
            {
              name: 'Enterprise',
              price: 'Custom',
              description: 'Unlimited scale',
              features: [
                'Unlimited checks',
                'Custom rate limits',
                '1:1 support',
                'SLA guarantee (99.9%)',
                'Custom integrations',
                'Dedicated account',
                'On-premise option',
              ],
              cta: 'Contact Sales',
              featured: false,
            },
          ].map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                border: plan.featured ? '2px solid var(--kc-accent)' : '1px solid var(--kc-border-subtle)',
                borderRadius: '12px',
                background: plan.featured ? 'linear-gradient(135deg, var(--kc-accent)08, var(--kc-accent)03)' : 'var(--kc-bg-surface)',
                padding: '24px',
                position: 'relative',
              }}
            >
              {plan.featured && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '16px',
                  background: 'var(--kc-accent)',
                  color: '#000',
                  borderRadius: '4px',
                  padding: '4px 12px',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}>
                  Popular
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: 'var(--kc-text-primary)', fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
                  {plan.name}
                </h3>
                <p style={{ color: 'var(--kc-text-muted)', fontSize: '12px', margin: 0 }}>
                  {plan.description}
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--kc-accent)', marginBottom: '4px' }}>
                  {plan.price}
                </div>
              </div>

              <ul style={{ marginBottom: '20px', paddingLeft: 0, listStyle: 'none' }}>
                {plan.features.map((feature, j) => (
                  <li key={j} style={{
                    color: 'var(--kc-text-secondary)',
                    fontSize: '13px',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--kc-accent)' }} />
                    {feature}
                  </li>
                ))}
              </ul>

              <button style={{
                width: '100%',
                background: plan.featured ? 'var(--kc-accent)' : 'var(--kc-bg-elevated)',
                color: plan.featured ? '#000' : 'var(--kc-text-primary)',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 16px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}>
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Rate Limiting Details */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{
          color: 'var(--kc-text-primary)',
          fontSize: '24px',
          fontWeight: 700,
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--kc-border-subtle)',
        }}>
          Rate Limiting Strategy
        </h2>

        <div style={{ background: 'var(--kc-bg-surface)', border: '1px solid var(--kc-border-subtle)', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
          <h3 style={{ color: 'var(--kc-text-primary)', fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>
            Token Bucket Algorithm
          </h3>
          <p style={{ color: 'var(--kc-text-secondary)', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
            We use a token bucket algorithm with two separate buckets:
          </p>
          <ul style={{ color: 'var(--kc-text-secondary)', fontSize: '13px', lineHeight: 1.8, paddingLeft: '20px', margin: '12px 0 0' }}>
            <li><strong>Per-second burst:</strong> Short-term traffic spikes (up to 100 req/min on Pro)</li>
            <li><strong>Per-day quota:</strong> Long-term usage limits (10,000 checks/day on Pro)</li>
          </ul>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }} className="grid-cols-1 lg:grid-cols-2">
          {[
            {
              icon: Zap,
              title: 'Burst Limit',
              description: 'Short-term allowance for traffic spikes. Refreshes every minute.',
              example: 'Pro plan: up to 100 requests/minute',
            },
            {
              icon: TrendingUp,
              title: 'Daily Quota',
              description: 'Total checks per calendar day (UTC). Resets at 00:00 UTC.',
              example: 'Pro plan: 10,000 checks/day',
            },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <div key={i} style={{
                background: 'var(--kc-bg-surface)',
                border: '1px solid var(--kc-border-subtle)',
                borderRadius: '12px',
                padding: '16px',
              }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: 'var(--kc-accent)',
                    backgroundImage: 'linear-gradient(135deg, var(--kc-accent)15, var(--kc-accent)08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--kc-accent)',
                  }}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h4 style={{ color: 'var(--kc-text-primary)', fontSize: '14px', fontWeight: 700, margin: '0 0 2px' }}>
                      {item.title}
                    </h4>
                  </div>
                </div>
                <p style={{ color: 'var(--kc-text-secondary)', fontSize: '12px', lineHeight: 1.5, margin: '0 0 8px' }}>
                  {item.description}
                </p>
                <div style={{
                  background: 'var(--kc-bg-base)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  color: 'var(--kc-accent)',
                  fontWeight: 600,
                }}>
                  {item.example}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* HTTP Headers */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{
          color: 'var(--kc-text-primary)',
          fontSize: '24px',
          fontWeight: 700,
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--kc-border-subtle)',
        }}>
          Rate Limit Response Headers
        </h2>

        <p style={{ color: 'var(--kc-text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
          Every API response includes these headers to track your usage:
        </p>

        <div style={{
          background: 'var(--kc-bg-base)',
          borderRadius: '12px',
          border: '1px solid var(--kc-border-subtle)',
          padding: '0',
          overflow: 'hidden',
        }}>
          {[
            {
              header: 'X-RateLimit-Limit',
              example: '100',
              description: 'Your current burst limit (requests per minute)',
            },
            {
              header: 'X-RateLimit-Remaining',
              example: '87',
              description: 'Requests remaining in the current minute',
            },
            {
              header: 'X-RateLimit-Reset',
              example: '1705881240',
              description: 'Unix timestamp when the burst bucket resets',
            },
            {
              header: 'X-Quota-Remaining',
              example: '9842',
              description: 'Daily quota remaining (checks remaining today)',
            },
            {
              header: 'X-Quota-Reset',
              example: '1705881600',
              description: 'Unix timestamp when daily quota resets (00:00 UTC)',
            },
            {
              header: 'Retry-After',
              example: '12',
              description: 'Seconds to wait before retrying (only on 429 status)',
            },
          ].map((h, i, arr) => (
            <div key={h.header} style={{
              display: 'grid',
              gridTemplateColumns: '200px 1fr',
              gap: '16px',
              padding: '12px 16px',
              borderBottom: i < arr.length - 1 ? '1px solid var(--kc-border-subtle)' : 'none',
              alignItems: 'center',
            }}>
              <div>
                <code style={{
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  color: 'var(--kc-accent)',
                  fontWeight: 600,
                  background: 'var(--kc-bg-surface)',
                  padding: '2px 6px',
                  borderRadius: '3px',
                }}>
                  {h.header}
                </code>
              </div>
              <div>
                <div style={{ color: 'var(--kc-text-secondary)', fontSize: '13px', marginBottom: '4px' }}>
                  {h.description}
                </div>
                <code style={{
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  color: 'var(--kc-text-muted)',
                  background: 'var(--kc-bg-base)',
                  padding: '2px 4px',
                  borderRadius: '3px',
                }}>
                  Example: {h.example}
                </code>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error Responses */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{
          color: 'var(--kc-text-primary)',
          fontSize: '24px',
          fontWeight: 700,
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--kc-border-subtle)',
        }}>
          Rate Limit Errors
        </h2>

        {[
          {
            status: '429',
            error: 'Too Many Requests',
            cause: 'Rate limit exceeded (burst or daily quota)',
            response: '{"error": "rate_limit_exceeded", "retry_after": 12}',
            action: 'Wait for Retry-After seconds, then retry',
          },
          {
            status: '400',
            error: 'Bad Request',
            cause: 'Invalid input data',
            response: '{"error": "invalid_email", "details": "email must be a valid address"}',
            action: 'Fix the input and retry',
          },
          {
            status: '401',
            error: 'Unauthorized',
            cause: 'Missing or invalid API key',
            response: '{"error": "invalid_api_key"}',
            action: 'Check API key in Authorization header',
          },
          {
            status: '503',
            error: 'Service Unavailable',
            cause: 'Temporary service issue',
            response: '{"error": "service_unavailable"}',
            action: 'Retry with exponential backoff',
          },
        ].map((err, i) => (
          <div key={err.status} style={{
            background: 'var(--kc-bg-surface)',
            border: '1px solid var(--kc-border-subtle)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '12px',
          }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                background: 'var(--kc-danger)',
                backgroundImage: 'linear-gradient(135deg, var(--kc-danger)15, var(--kc-danger)08)',
                color: 'var(--kc-danger)',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '12px',
                fontFamily: 'monospace',
                fontWeight: 700,
                minWidth: '45px',
                textAlign: 'center',
              }}>
                {err.status}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: 'var(--kc-text-primary)', fontSize: '14px', fontWeight: 700, margin: 0 }}>
                  {err.error}
                </h3>
                <p style={{ color: 'var(--kc-text-muted)', fontSize: '12px', margin: '2px 0 0' }}>
                  {err.cause}
                </p>
              </div>
            </div>

            <div style={{
              background: 'var(--kc-bg-base)',
              borderRadius: '6px',
              padding: '10px 12px',
              marginBottom: '10px',
              fontFamily: 'monospace',
              fontSize: '11px',
              color: 'var(--kc-text-secondary)',
              overflowX: 'auto',
            }}>
              {err.response}
            </div>

            <p style={{ color: 'var(--kc-text-secondary)', fontSize: '12px', margin: 0 }}>
              <strong>Action:</strong> {err.action}
            </p>
          </div>
        ))}
      </div>

      {/* Best Practices */}
      <div style={{
        border: '1px solid var(--kc-border-subtle)',
        borderRadius: '12px',
        background: 'var(--kc-bg-surface)',
        padding: '20px',
      }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <Shield size={20} style={{ color: 'var(--kc-accent)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h3 style={{ color: 'var(--kc-text-primary)', fontSize: '16px', fontWeight: 700, margin: 0, marginBottom: '8px' }}>
              Best Practices
            </h3>
            <ul style={{ color: 'var(--kc-text-secondary)', fontSize: '13px', lineHeight: 1.8, paddingLeft: '20px', margin: 0 }}>
              <li><strong>Cache results:</strong> Store fraud scores for 24h to avoid duplicate checks</li>
              <li><strong>Exponential backoff:</strong> On errors, wait 1s, 2s, 4s, 8s before retrying</li>
              <li><strong>Monitor headers:</strong> Track X-Quota-Remaining to predict when you'll hit limits</li>
              <li><strong>Batch wisely:</strong> Use burst limit for time-sensitive checks only. Batch routine checks during off-peak.</li>
              <li><strong>Upgrade early:</strong> If approaching daily quota, plan an upgrade in advance</li>
              <li><strong>Contact support:</strong> For usage patterns that don't fit our plans, we can help</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
