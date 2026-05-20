# ADR-009: Contratos da API Backend (Railway)

Data: 2026-05-20
Estado: Aceite — verificado no código fonte
Decisor: @Aria

## Endpoints Verificados no Código (packages/sniper-api/server.js)

---

### 1. POST /api/check-public ← DEMO SEM AUTH — JÁ EXISTE ✅

```ts
// Usado por: hero-demo.tsx (aha moment)
// Rate limit: 10 checks/hora por IP (no backend)
// Não precisa de API key

// REQUEST
fetch('https://kairoscheck.net/api/check-public', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ domain: 'suspicious.xyz' })
})

// RESPONSE (verificado no código)
interface CheckPublicResponse {
  domain: string
  score: number          // 0-100
  verdict: 'ALLOW' | 'BLOCK' | 'REVIEW'
  signals: string[]      // ex: ['suspicious-tld', 'new-domain']
  demo: true
}

// RATE LIMIT RESPONSE (429)
{
  error: 'Demo rate limit reached (10/hour). Get an API key for unlimited access.',
  upgrade: '/pricing'
}
```

---

### 2. POST /verify ← ENDPOINT PRINCIPAL (com API key)

```ts
// Usado por: api/check/route.ts (dashboard)
// Requer: Authorization: Bearer kc_live_...

// REQUEST
fetch('https://kairoscheck.net/verify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  },
  body: JSON.stringify({
    text: 'suspicious.xyz',
    // ou: text: 'user@suspicious.xyz'
    // ou: text: 'https://suspicious.xyz'
    model: 'check'  // 'swift' | 'check' | 'deep'
  })
})

// RESPONSE COMPLETA (verificada no código)
interface VerifyResponse {
  score: number                    // 0-100 — score final
  verdict: 'ALLOW' | 'BLOCK' | 'REVIEW'
  signals: string[]                // razões do score
  dominant_threat: string | null   // ex: 'nlp-behavioral'
  type: 'domain' | 'email' | 'url'
  query: string                    // o texto verificado
  graph_intelligence: {            // null se não tem C8 dados
    network_score: number
    connected_entities: number
    confidence: number
  } | null
  model: 'swift' | 'check' | 'deep'
  token_balance: number            // checks restantes do plano
  token_cost: number               // 0.5 (swift) | 1 (check) | 3 (deep)
  warning?: string                 // aviso de saldo baixo
  cached: boolean                  // true se resultado do cache
  timestamp: string                // ISO 8601
  ref: string                      // ID único do check
}
```

---

### 3. GET /health

```ts
// Usado por: status page + StatusBadge component
fetch('https://kairoscheck.net/health')
// RESPONSE
{ status: 'OPERATIONAL', version: '7.x.x', ... }
```

---

### 4. POST /api/checkout (Stripe)

```ts
// Usado por: /api/checkout/route.ts no frontend
// Chama o backend Railway que cria a Stripe session
fetch('https://kairoscheck.net/api/checkout', {
  method: 'POST',
  body: JSON.stringify({ priceId, email, planId })
})
// RESPONSE: { url: 'https://checkout.stripe.com/...' }
```

---

### 5. SCORES → UI MAPPING (verificado no código)

```ts
// Cores por score (já no globals.css):
score 0-39:  verdict ALLOW   → verde  (--kc-score-safe)
score 40-70: verdict REVIEW  → amber  (--kc-score-medium)
score 71-100: verdict BLOCK  → vermelho (--kc-score-high)

// Modelos:
swift: só C0 (domain heuristic)    → 0.5 tokens, <50ms
check: C0-C7 standard              → 1 token, <200ms  ← default
deep:  C0-C8 (com network intel)   → 3 tokens, <500ms
```

---

### 6. TOKEN BALANCE → QUOTA UI

```ts
// token_balance na resposta = checks restantes
// Para calcular quota_used:
const quota_used = monthly_limit - token_balance

// monthly_limit por plano:
// free:       100 tokens (= 100 check model)
// starter:    500 tokens
// pro:        10.000 tokens
// enterprise: 50.000 tokens

// Upgrade prompt: quando token_balance < 25% do limite
```

---

## Para @Dex — O que NÃO precisas de criar no backend

```
✅ /api/check-public — JÁ EXISTE (não criar)
✅ /verify — JÁ EXISTE (usar com API key)
✅ /health — JÁ EXISTE
✅ /api/checkout — JÁ EXISTE

CRIAR apenas no frontend (Route Handlers):
  /api/demo/route.ts         → proxy para /api/check-public
  /api/check/route.ts        → proxy para /verify (com session auth)
  /api/chat/route.ts         → Claude AI streaming (novo)
  /api/keys/route.ts         → criar/revogar API keys
  /api/webhooks/stripe/route.ts → webhooks Stripe
  /api/portal/route.ts       → Stripe Customer Portal
  /api/referral/route.ts     → referral program
```
