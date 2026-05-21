'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export const metadata = {
  title: 'Code Examples — KairosCheck',
  description: 'Integration examples in JavaScript, Python, Go, and cURL.',
}

const EXAMPLES = {
  javascript: {
    name: 'JavaScript / Node.js',
    description: 'Using the official KairosCheck SDK',
    code: `// npm install @kairos/sdk
import { KairosClient } from '@kairos/sdk'

const client = new KairosClient({
  apiKey: process.env.KAIROS_API_KEY
})

// Basic check
const result = await client.check({
  email: 'customer@gmail.com',
  ip: '177.70.100.200'
})

console.log(\`Score: \${result.score} / 100\`)
console.log(\`Decision: \${result.decision}\`)
console.log(\`Check ID: \${result.check_id}\`)

// With full details
if (result.decision === 'decline') {
  console.log('Flagged signals:', result.active_flags)
  console.log('Explanation:', result.explanation.summary)
}`,
  },
  
  javascript_fetch: {
    name: 'JavaScript (fetch API)',
    description: 'No SDK required — use native fetch',
    code: `const checkFraud = async (email, ip) => {
  const response = await fetch('https://api.kairoscheck.net/v1/check', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${process.env.KAIROS_API_KEY}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      ip
    })
  })

  if (!response.ok) {
    throw new Error(\`API Error: \${response.status}\`)
  }

  return response.json()
}

// Usage
const result = await checkFraud('test@example.com', '177.70.100.200')
console.log(\`Fraud Score: \${result.score}\`)`,
  },

  react: {
    name: 'React / Next.js',
    description: 'Server Action pattern (recommended)',
    code: `// lib/kairos.ts
'use server'

import { KairosClient } from '@kairos/sdk'

const client = new KairosClient({
  apiKey: process.env.KAIROS_API_KEY!
})

export async function checkCustomer(email: string, ip: string) {
  return await client.check({ email, ip })
}

// app/components/SignupForm.tsx
'use client'
import { checkCustomer } from '@/lib/kairos'
import { useState } from 'react'

export function SignupForm() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const ip = formData.get('ip') as string

    try {
      const result = await checkCustomer(email, ip)
      
      if (result.score > 70) {
        // Block or require additional verification
        alert('Customer needs additional verification')
      } else {
        // Accept customer
        setResult(result)
      }
    } catch (error) {
      console.error('Fraud check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return <form onSubmit={handleSubmit}>{/* ... */}</form>
}`,
  },

  python: {
    name: 'Python',
    description: 'Using requests library',
    code: `import os
import requests
from typing import TypedDict

class CheckResult(TypedDict):
    score: int
    decision: str
    active_flags: list[str]
    check_id: str

def check_fraud(email: str, ip: str) -> CheckResult:
    """Check customer for fraud signals"""
    
    response = requests.post(
        'https://api.kairoscheck.net/v1/check',
        headers={
            'Authorization': f'Bearer {os.getenv("KAIROS_API_KEY")}',
            'Content-Type': 'application/json'
        },
        json={
            'email': email,
            'ip': ip
        }
    )
    
    response.raise_for_status()
    return response.json()

# Usage
try:
    result = check_fraud('customer@example.com', '177.70.100.200')
    print(f"Score: {result['score']}")
    print(f"Decision: {result['decision']}")
except requests.exceptions.RequestException as e:
    print(f"Fraud check failed: {e}")`,
  },

  python_django: {
    name: 'Python (Django)',
    description: 'Integration with Django signals',
    code: `# models.py
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
import requests
import os

class User(models.Model):
    email = models.EmailField()
    ip_address = models.GenericIPAddressField()
    fraud_check_id = models.CharField(max_length=100, blank=True)
    fraud_score = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

@receiver(post_save, sender=User)
def check_user_fraud(sender, instance, created, **kwargs):
    """Automatically check new users for fraud"""
    if not created or not instance.email or not instance.ip_address:
        return
    
    try:
        response = requests.post(
            'https://api.kairoscheck.net/v1/check',
            headers={
                'Authorization': f'Bearer {os.getenv("KAIROS_API_KEY")}',
                'Content-Type': 'application/json'
            },
            json={
                'email': instance.email,
                'ip': instance.ip_address
            }
        )
        
        result = response.json()
        instance.fraud_score = result['score']
        instance.fraud_check_id = result['check_id']
        
        # Block if score too high
        if result['score'] > 75:
            instance.is_blocked = True
        
        instance.save(update_fields=['fraud_score', 'fraud_check_id', 'is_blocked'])
    except Exception as e:
        print(f"Fraud check failed: {e}")`,
  },

  go: {
    name: 'Go',
    description: 'Using the official SDK',
    code: `package main

import (
    "fmt"
    "os"
    "github.com/kairos-io/sdk-go"
)

func main() {
    client := sdk.NewClient(os.Getenv("KAIROS_API_KEY"))
    
    result, err := client.Check(sdk.CheckRequest{
        Email: "customer@example.com",
        IP:    "177.70.100.200",
    })
    
    if err != nil {
        fmt.Printf("Error: %v\\n", err)
        return
    }
    
    fmt.Printf("Score: %d\\n", result.Score)
    fmt.Printf("Decision: %s\\n", result.Decision)
    fmt.Printf("Check ID: %s\\n", result.CheckID)
    
    if result.Score > 70 {
        fmt.Println("Customer flagged for review")
    }
}`,
  },

  go_http: {
    name: 'Go (net/http)',
    description: 'Using standard library',
    code: `package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "os"
)

type CheckRequest struct {
    Email string \`json:"email"\`
    IP    string \`json:"ip"\`
}

type CheckResponse struct {
    Score   int    \`json:"score"\`
    Decision string \`json:"decision"\`
    CheckID  string \`json:"check_id"\`
}

func checkFraud(email, ip string) (*CheckResponse, error) {
    req := CheckRequest{
        Email: email,
        IP:    ip,
    }
    
    body, _ := json.Marshal(req)
    
    httpReq, _ := http.NewRequest(
        "POST",
        "https://api.kairoscheck.net/v1/check",
        bytes.NewBuffer(body),
    )
    
    httpReq.Header.Set("Authorization", \`Bearer \${os.Getenv("KAIROS_API_KEY")}\`)
    httpReq.Header.Set("Content-Type", "application/json")
    
    resp, err := http.DefaultClient.Do(httpReq)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
    
    data, _ := io.ReadAll(resp.Body)
    
    var result CheckResponse
    json.Unmarshal(data, &result)
    return &result, nil
}`,
  },

  curl: {
    name: 'cURL',
    description: 'Command-line testing',
    code: `# Basic check
curl -X POST https://api.kairoscheck.net/v1/check \\
  -H "Authorization: Bearer kc_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "customer@example.com",
    "ip": "177.70.100.200"
  }'

# Pretty-printed response
curl -s -X POST https://api.kairoscheck.net/v1/check \\
  -H "Authorization: Bearer kc_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "customer@example.com",
    "ip": "177.70.100.200"
  }' | jq .

# Check with multiple fields
curl -X POST https://api.kairoscheck.net/v1/check \\
  -H "Authorization: Bearer kc_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "customer@gmail.com",
    "ip": "177.70.100.200",
    "cpf": "529.982.247-25",
    "cep": "01310-100"
  }'`,
  },

  bash: {
    name: 'Bash Script',
    description: 'Batch checking with error handling',
    code: `#!/bin/bash

API_KEY="kc_live_YOUR_KEY"
API_URL="https://api.kairoscheck.net/v1/check"

check_customer() {
    local email=$1
    local ip=$2
    
    response=$(curl -s -X POST "$API_URL" \\
        -H "Authorization: Bearer $API_KEY" \\
        -H "Content-Type: application/json" \\
        -d "{
            \\"email\\": \\"$email\\",
            \\"ip\\": \\"$ip\\"
        }")
    
    score=$(echo "$response" | jq -r '.score')
    decision=$(echo "$response" | jq -r '.decision')
    
    if [ "$score" -gt 70 ]; then
        echo "BLOCKED: $email (score: $score)"
        return 1
    else
        echo "ACCEPTED: $email (score: $score)"
        return 0
    fi
}

# Example: check from CSV
while IFS=',' read -r email ip; do
    check_customer "$email" "$ip"
done < customers.csv`,
  },
}

export default function ExamplesPage() {
  const [copied, setCopied] = useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')

  function copyCode(code: string, id: string) {
    navigator.clipboard.writeText(code)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const currentExample = EXAMPLES[selectedLanguage as keyof typeof EXAMPLES]

  return (
    <div>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ color: 'var(--kc-text-primary)', fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>
          Code Examples
        </h1>
        <p style={{ color: 'var(--kc-text-secondary)', fontSize: '15px', lineHeight: 1.6 }}>
          Ready-to-use code samples in your favorite language. All examples assume you have set <code style={{ background: 'var(--kc-bg-surface)', padding: '2px 6px', borderRadius: '3px', color: 'var(--kc-accent)', fontFamily: 'monospace' }}>KAIROS_API_KEY</code> environment variable.
        </p>
      </div>

      {/* Language Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--kc-border-subtle)', paddingBottom: '12px', overflowX: 'auto' }}>
        {Object.entries(EXAMPLES).map(([key, example]) => (
          <button
            key={key}
            onClick={() => setSelectedLanguage(key)}
            style={{
              background: selectedLanguage === key ? 'var(--kc-bg-surface)' : 'transparent',
              color: selectedLanguage === key ? 'var(--kc-accent)' : 'var(--kc-text-muted)',
              border: selectedLanguage === key ? '1px solid var(--kc-border-subtle)' : 'none',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: selectedLanguage === key ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 150ms ease',
              whiteSpace: 'nowrap',
            }}
          >
            {example.name}
          </button>
        ))}
      </div>

      {currentExample && (
        <div style={{ marginBottom: '40px' }}>
          <div style={{ marginBottom: '12px' }}>
            <h2 style={{ color: 'var(--kc-text-primary)', fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
              {currentExample.name}
            </h2>
            <p style={{ color: 'var(--kc-text-muted)', fontSize: '13px', margin: 0 }}>
              {currentExample.description}
            </p>
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
              {currentExample.code}
            </pre>

            <button
              onClick={() => copyCode(currentExample.code, selectedLanguage)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: copied === selectedLanguage ? 'var(--kc-success)' : 'var(--kc-bg-elevated)',
                color: copied === selectedLanguage ? '#000' : 'var(--kc-text-secondary)',
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
              {copied === selectedLanguage ? (
                <>
                  <Check size={14} />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Error Handling Section */}
      <div style={{
        border: '1px solid var(--kc-border-subtle)',
        borderRadius: '12px',
        background: 'var(--kc-bg-surface)',
        padding: '20px',
        marginBottom: '32px',
      }}>
        <h3 style={{
          color: 'var(--kc-text-primary)',
          fontSize: '16px',
          fontWeight: 700,
          marginBottom: '12px',
        }}>
          Error Handling Best Practices
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="grid-cols-1 lg:grid-cols-2">
          {[
            {
              code: '400',
              title: 'Bad Request',
              detail: 'Invalid input — validate all fields before sending',
              action: 'Show user-friendly error message'
            },
            {
              code: '401/403',
              title: 'Authentication Failed',
              detail: 'API key missing, invalid, or revoked',
              action: 'Contact support — API key issue'
            },
            {
              code: '429',
              title: 'Rate Limited',
              detail: 'Too many requests — see Retry-After header',
              action: 'Implement exponential backoff'
            },
            {
              code: '500',
              title: 'Server Error',
              detail: 'Temporary service issue',
              action: 'Retry with exponential backoff, then fail safe'
            },
          ].map(err => (
            <div key={err.code} style={{
              background: 'var(--kc-bg-base)',
              borderRadius: '8px',
              border: '1px solid var(--kc-border-subtle)',
              padding: '12px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
              }}>
                <span style={{
                  background: 'var(--kc-danger)',
                  backgroundImage: 'linear-gradient(135deg, var(--kc-danger)15, var(--kc-danger)08)',
                  color: 'var(--kc-danger)',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                }}>
                  {err.code}
                </span>
                <span style={{ color: 'var(--kc-text-primary)', fontSize: '13px', fontWeight: 600 }}>
                  {err.title}
                </span>
              </div>
              <div style={{ color: 'var(--kc-text-secondary)', fontSize: '12px', lineHeight: 1.5, marginBottom: '8px' }}>
                {err.detail}
              </div>
              <div style={{ color: 'var(--kc-text-muted)', fontSize: '11px', fontStyle: 'italic' }}>
                → {err.action}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rate Limiting */}
      <div style={{
        border: '1px solid var(--kc-border-subtle)',
        borderRadius: '12px',
        background: 'var(--kc-bg-surface)',
        padding: '20px',
      }}>
        <h3 style={{
          color: 'var(--kc-text-primary)',
          fontSize: '16px',
          fontWeight: 700,
          marginBottom: '12px',
        }}>
          Rate Limits by Plan
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }} className="grid-cols-1 lg:grid-cols-3">
          {[
            { plan: 'Free', limit: '100 req/day', burst: '10/min' },
            { plan: 'Pro', limit: '10,000 req/day', burst: '100/min' },
            { plan: 'Enterprise', limit: 'Custom', burst: 'Custom' },
          ].map(tier => (
            <div key={tier.plan} style={{
              background: 'var(--kc-bg-base)',
              borderRadius: '8px',
              border: '1px solid var(--kc-border-subtle)',
              padding: '12px',
            }}>
              <div style={{ color: 'var(--kc-text-primary)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                {tier.plan}
              </div>
              <div style={{ color: 'var(--kc-accent)', fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>
                {tier.limit}
              </div>
              <div style={{ color: 'var(--kc-text-muted)', fontSize: '11px' }}>
                Burst: {tier.burst}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
