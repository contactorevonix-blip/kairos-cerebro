# KAIROS Check — Brownfield Architecture Document

## Introduction

Este documento captura o **estado actual real** da codebase KAIROS_CEREBRO, incluindo debt técnico, workarounds, e padrões concretos. É o reference manual para agentes AI que vão contribuir para este projecto sem cometer erros clássicos de "novo no projecto".

### Escopo do Documento

Documentação completa do monorepo `C:\Users\lealp\KAIROS_CEREBRO` — motor de fraud scoring, API HTTP, storage, billing, compliance GDPR, vault de secrets, e infra CLI.

**Projecto paralelo:** `C:\Users\lealp\kairoscheck` é um repositório separado com um scaffolding Express básico (MVP antigo). **Não está integrado com este monorepo.** Ignorar para desenvolvimento neste repo.

### Change Log

| Data       | Versão | Descrição             | Autor  |
|------------|--------|-----------------------|--------|
| 2026-06-01 | 1.0    | Análise brownfield inicial | Atlas (@analyst) |

---

## Quick Reference — Ficheiros e Entry Points Críticos

| O quê | Onde |
|-------|------|
| **Entry point HTTP** | `packages/sniper-api/app.js` — `handleVerifyRequest`, `handleBatchVerifyRequest` |
| **Auth** | `packages/sniper-api/auth.js` — header `x-api-key`, SHA-256 hashed |
| **Rate limit** | `packages/sniper-api/rate-limit.js` — `consumeUnits()` por tenant |
| **Motor principal** | `packages/sniper-engine/api.js` — `verifyPayload()` |
| **Scoring core** | `packages/sniper-engine/core.js` — `scoreContentRisk()`, `riskDecision()` |
| **DNA fingerprinting** | `packages/sniper-engine/dna.js` — `buildScamDna()` |
| **Database** | `packages/sniper-db/` — JSON/JSONL, `findApiKey()`, `getTenant()`, `recordVerification()` |
| **Reputation graph** | `packages/reputation-graph/index.js` — `queryPreVerdict()`, `contribute()` |
| **Vault** | `packages/vault/index.js` — `getSecret()`, `setSecret()` |
| **Billing** | `packages/billing/index.js` — `meterUsage()`, `verifyStripeSignature()`, `PLANS` |
| **Compliance** | `packages/compliance/index.js` — `pseudonymizeText()`, `hashPii()` |
| **Webhook outbox** | `packages/webhook-outbox/index.js` — delivery com retry |
| **Scraper** | `packages/sniper-scraper/index.js` — SSRF-safe fetch + HTML extraction |
| **Dashboard UI** | `packages/sniper-api/ui.js` — `renderDashboard()`, `renderLandingPage()` |
| **CLI** | `bin/kairos.js` (entry), `packages/kairos-cli/` |
| **Dados em disco** | `.kairos-data/` (gitignored) |

---

## High Level Architecture

### Resumo Técnico

KAIROS é um motor de **fraud scoring OSINT-only**, multi-tenant, single-process. Zero dependências externas em produção — pure Node.js stdlib (sem Express, sem Stripe SDK, sem ORM). O HTTP server é escrito directamente com `http.createServer`. Tudo persiste em ficheiros JSON/JSONL no directório `.kairos-data/`.

### Stack Real

| Categoria | Tecnologia | Versão | Notas |
|-----------|------------|--------|-------|
| Runtime | Node.js | ≥ 18 | Requerido — usa `crypto.scryptSync`, `URL`, `structuredClone` |
| HTTP | `node:http` stdlib | — | **Sem Express.** Handler manual de rotas |
| Database | JSON / JSONL em disco | — | Single-process. Multi-instance requer Redis adapter |
| Persistence | `.kairos-data/` directory | — | Gitignored. Atomic writes via tmp+rename |
| Billing | Stripe (webhooks) | HMAC manual | **Sem Stripe SDK.** Protocolo implementado directamente |
| Crypto | `node:crypto` stdlib | — | AES-256-GCM, scrypt, SHA-256, HMAC |
| Test runner | `node:test` stdlib | — | 159 testes, < 15 segundos |
| CLI | Custom (`bin/kairos.js`) | — | `kairos start`, `kairos vault:*`, `kairos compliance:*`, etc. |

### Estrutura do Repositório

```text
KAIROS_CEREBRO/
├── packages/
│   ├── sniper-engine/        # Motor de scoring (8 camadas + DNA)
│   │   ├── api.js            # verifyPayload() — entry point do motor
│   │   ├── core.js           # Regex patterns (HIGH/MEDIUM/PHISHING) multi-idioma
│   │   ├── dna.js            # Scam DNA fingerprinting (7 chromosomes)
│   │   ├── guru-scam.js      # Detecção guru/cursos
│   │   ├── geo.js            # Sinais geográficos
│   │   ├── live-reputation.js # Reputação em tempo real
│   │   ├── nlp-heuristic.js  # Heurísticas NLP (dimensões)
│   │   ├── ngram.js          # Análise n-gram
│   │   └── checkout-inspector.js # Inspecção de checkout funnels
│   │
│   ├── sniper-api/           # HTTP server + handlers
│   │   ├── app.js            # handleVerifyRequest, handleBatchVerifyRequest
│   │   ├── auth.js           # API key auth (x-api-key, SHA-256 hashed)
│   │   ├── rate-limit.js     # Per-tenant rate limiting (sliding window)
│   │   ├── events.js         # Webhook event dispatch
│   │   ├── ui.js             # CEO dashboard HTML + landing page
│   │   └── landing-page.js   # Public landing page renderer
│   │
│   ├── sniper-db/            # Persistence layer (JSON/JSONL)
│   │   └── package.json      # recordVerification, findApiKey, getTenant, updateGlobalMetrics
│   │
│   ├── sniper-scraper/       # SSRF-safe web scraper
│   │   ├── fetch.js          # HTTPS fetch com SSRF guard
│   │   ├── extract.js        # HTML signal extraction
│   │   └── index.js          # Public API
│   │
│   ├── reputation-graph/     # Cross-tenant network graph
│   │   ├── index.js          # queryPreVerdict, contribute, listTopEntities, signFeed
│   │   ├── replicator.js     # Redis dual-write replicator
│   │   └── adapters/
│   │       ├── json-adapter.js   # Default (single-process, on-disk)
│   │       ├── redis-adapter.js  # Production (multi-region)
│   │       └── index.js          # createAdapter() factory
│   │
│   ├── vault/                # AES-256-GCM encrypted secret store
│   │   └── index.js          # initVault, setSecret, getSecret, rotateMasterPassphrase
│   │
│   ├── billing/              # Stripe webhook + plan catalogue + metering
│   │   └── index.js          # PLANS, verifyStripeSignature, meterUsage, claimEventId
│   │
│   ├── compliance/           # GDPR layer
│   │   └── index.js          # pseudonymizeText, hashPii, purgeStaleVerifications, exportRecordsForSubject
│   │
│   ├── webhook-outbox/       # HMAC-signed delivery + retry
│   │   └── index.js
│   │
│   ├── kairos-cli/           # Operator CLI (bin/kairos.js entry)
│   ├── sovereign/            # apex_ceo deterministic runtime + 3 task forces
│   └── browser-extension/   # Manifest V3 B2C extension
│
├── bin/
│   └── kairos.js             # CLI entry point (`npm start` → `kairos start`)
│
├── .kairos-data/             # Runtime data (GITIGNORED — nunca commitar)
│   ├── verifications.jsonl   # Audit trail (tamper-evident hash chain)
│   ├── tenants.json          # Tenant registry
│   ├── api-keys.json         # Hashed API keys
│   ├── reputation-graph.json # Cross-tenant graph
│   ├── vault.json            # Encrypted secrets (AES-256-GCM)
│   ├── usage.json            # Billing metering por tenant/mês
│   ├── stripe-processed-events.json  # Idempotency (últimos 1000 event.id)
│   ├── pii-salt              # HMAC salt para pseudonimização (chmod 600)
│   └── contributions.jsonl   # Reputation graph history
│
├── .aiox-core/               # Framework AIOX (NUNCA modificar L1/L2)
├── README.md
└── node_modules/             # dotenv, stripe (billing webhook parser apenas)
```

---

## Fluxo de uma Verificação (Golden Path)

```
POST /verify
  → auth.js: readKeyFromHeaders() → findApiKey(rawKey) → getTenant()
  → rate-limit.js: consumeUnits(`tenant:{id}`, limit, 1)
  → app.js: processVerification()
      → reputation-graph: queryPreVerdict({ text, urls })  [pre-score]
      → sniper-engine: verifyPayload({ ...payload, networkResolver })
          → core.js: scoreContentRisk()     [regex patterns]
          → guru-scam.js: scoreGuruScam()   [guru/course patterns]
          → reputation-graph via networkResolver
          → nlp-heuristic.js: analyzeNlp()  [7 dimensões]
          → geo.js: scoreGeo()              [sinais geográficos]
          → live-reputation.js             [URLs live check]
          → checkout-inspector.js           [checkout funnels]
          → dna.js: buildScamDna()          [7-chromosome fingerprint]
          → verdict: { decision, score, reasons, dominantThreat }
      → sniper-db: recordVerification(auditEntry)
      → billing: meterUsage({ tenantId, units: 1 })
      → reputation-graph: contribute({ decision, score, dnaFamily })
      → webhook-outbox: dispatchScamEvent() [se decision != 'allow']
  → Response: { verdict, trustLevel, scamDna, scoreBreakdown, audit.requestId }
```

---

## Motor de Scoring — 8 Camadas

| Camada | Ficheiro | O que faz | Score típico |
|--------|----------|-----------|--------------|
| 1. Core patterns | `core.js` | Regex HIGH (18pts), MEDIUM (8pts), PHISHING (22pts) | 0–100 |
| 2. Guru scam | `guru-scam.js` | Guru/curso patterns + fake social proof | 0–100 |
| 3. Reputation network | `reputation-graph` (pre-verdict) | Cross-tenant history com time decay | 0–100 |
| 4. NLP heuristic | `nlp-heuristic.js` | 7 dimensões semânticas | score + dimensions |
| 5. Geographic | `geo.js` | Country/region risk signals | 0–100 |
| 6. Live reputation | `live-reputation.js` | URL scanning em tempo real | 0–100 |
| 7. Checkout inspector | `checkout-inspector.js` | Checkout funnel + payment rail signals | 0–100 |
| 8. Scam DNA | `dna.js` | 7 chromosomes → SHA-256 fingerprint + family | severity + confidence |

**Decisões de output:** `block` (score ≥ 60) · `review` (score ≥ 30) · `allow` (< 30)

### Scam DNA — 7 Chromosomes

```
URGENCY · UNREALISTIC_ROI · VAGUE_METHOD · AUTHORITY_BAIT
FOMO · IDENTITY_ESCAPE · PAYMENT_RAILS
```

Fingerprint: `dna:v1:{7-byte-hex}:{sha256-prefix-16}`

**Famílias detectadas:** `guru-course-pyramid` · `crypto-pump` · `phishing-impersonation` · `romance-pig-butchering` · `fake-marketplace-checkout` · `high-pressure-unknown`

---

## API Surface Completa

| Método | Path | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/` | pública | Landing page |
| GET | `/dashboard` | pública | CEO Command Center (HTML) |
| POST | `/verify` | `x-api-key` | Verificação única |
| POST | `/verify/batch` | `x-api-key` | Batch até 50 items (`KAIROS_VERIFY_BATCH_MAX`, default 50) |
| POST | `/scan-url` | `x-api-key` | Scrape + verifica URL |
| POST | `/api/verify-public` | IP rate-limited | Freemium (sem chave) |
| POST | `/api/community/signup` | pública | Auto-provisioning B2C anónimo |
| GET | `/api/dashboard` | pública | Métricas JSON |
| GET | `/api/dna/families` | pública | Top famílias de scam |
| GET | `/api/intel/top` | `x-api-key` | Top entidades da reputation graph |
| GET | `/api/verifications/recent` | `x-api-key` | Audit trail do tenant |
| GET | `/api/taskforces` | pública | 3 task forces + sovereign overlay |
| GET | `/api/billing/plans` | pública | Catálogo de planos |
| GET | `/gdpr/export` | pseudónimo | Art.15 — acesso por subject |
| POST | `/gdpr/erase` | pseudónimo | Art.17 — apagamento por subject |
| POST | `/billing/stripe/webhook` | HMAC-SHA256 | Stripe events idempotentes |
| GET | `/health` | pública | Deep health check (vault + DB + adapter) |

---

## Modelo de Dados

### Tenant (`tenants.json`)

```json
{
  "tenantId": "string",
  "plan": "free|pro|business|b2b_pilot|enterprise",
  "rateLimitPerMinute": 120,
  "createdAt": "ISO8601"
}
```

### API Key (`api-keys.json`)

```json
{
  "keyHash": "sha256-hex",
  "tenantId": "string",
  "label": "string",
  "createdAt": "ISO8601",
  "lastUsedAt": "ISO8601"
}
```

Keys são **SHA-256 hashed antes de persistência**. A plaintext key é mostrada apenas uma vez na criação via CLI.

### Verification Record (`verifications.jsonl`)

```json
{
  "requestId": "uuid",
  "tenantId": "string",
  "timestamp": "ISO8601",
  "decision": "block|review|allow",
  "score": 0-100,
  "trustLevel": "string|null",
  "channel": "string",
  "textPreview": "string (truncado a 200 chars, PII pseudonimizado)",
  "dnaFingerprint": "dna:v1:...",
  "dnaFamily": "string|null",
  "dnaSeverity": "critical|high|medium|low|none",
  "reasonCount": 0,
  "compliance": { "dataSource": "osint", "lawfulBasis": "gdpr-art6-1f-...", ... },
  "prevHash": "sha256-hex",
  "hash": "sha256-hex"
}
```

O campo `hash` e `prevHash` formam a **audit chain tamper-evident**. Verificar com `kairos audit:verify`.

### Reputation Graph Node (`reputation-graph.json`)

```json
{
  "type": "domain|url|email|wallet",
  "id": "string (domain/url em plaintext; email/wallet como psn:sha256)",
  "score": 0-100,
  "hits": 0,
  "firstSeen": "ISO8601",
  "lastSeen": "ISO8601",
  "tenants": ["tenantId", ...],
  "decisions": { "block": 0, "review": 0, "allow": 0 },
  "dnaFamilies": { "guru-course-pyramid": 3, ... }
}
```

**Time decay:** half-life de 30 dias. Score decai exponencialmente com o tempo.

---

## Billing — Planos

| Plano | ID | Preço/mês | Rate limit/min | Webhook | Signed Feed |
|-------|-----|-----------|----------------|---------|-------------|
| Free | `kairos_free` | €0 | 30 | ✗ | ✗ |
| Pro | `kairos_pro` | €1.97 | 120 | ✗ | ✗ |
| Business | `kairos_business` | €19.97 | 600 | ✓ | ✗ |
| Institutional Pilot | `kairos_b2b_pilot` | €499 | 6.000 | ✓ | ✓ |
| Enterprise | `kairos_enterprise` | custom | 60.000 | ✓ | ✓ |

**Idempotência Stripe:** últimos 1000 `event.id` persistidos em `stripe-processed-events.json`. Sliding window (descarta os mais antigos quando > 1000).

---

## Compliance GDPR

### PII Pseudonimizado Automaticamente

| Tipo | Método |
|------|--------|
| Email | `psn:{hmac-sha256[:32]}` |
| BTC/ETH/PIX wallet | `psn:{hmac-sha256[:32]}` |
| Telefone | `[redacted-phone]` |
| CPF/NIF | `[redacted-id]` |
| Cartão bancário | `[redacted-card]` |

**Salt:** lido de `KAIROS_PII_SALT` env var ou `.kairos-data/pii-salt` (gerado automaticamente na primeira run, chmod 600).

### Direitos GDPR

```bash
kairos compliance:export --subject "email@x.com"  # Art.15
kairos compliance:erase  --subject "email@x.com"  # Art.17
kairos compliance:purge  --retention 90            # Retenção (default 90 dias)
```

---

## Vault de Secrets

**Algoritmo:** AES-256-GCM com scrypt KDF (N=16384, r=8, p=1).

```bash
kairos vault:init                                      # Inicializar vault
kairos vault:set --name STRIPE_SECRET --value sk_...  # Guardar secret
kairos vault:list                                      # Listar secrets (sem valores)
```

**Variável obrigatória:** `KAIROS_MASTER_PASSPHRASE` (mínimo 12 chars). Nunca persistida em disco. Nunca logar.

**Atomic writes:** tmp file + `fs.renameSync()`. Safe para crash durante escrita.

---

## Ambiente e Variáveis

| Variável | Default | Obrigatória | Propósito |
|----------|---------|-------------|-----------|
| `PORT` | `8787` | não | Porta do servidor |
| `KAIROS_DB_DIR` | `./.kairos-data` | não | Directório de dados |
| `KAIROS_VAULT_DIR` | `./.kairos-data` | não (com vault) | Directório do vault |
| `KAIROS_MASTER_PASSPHRASE` | — | sim (com vault) | KDF para decrypt |
| `KAIROS_PUBLIC_RATE_PER_MIN` | `10` | não | Rate limit endpoint público |
| `KAIROS_RETENTION_DAYS` | `90` | não | Janela GDPR |
| `KAIROS_PUBLIC_BASE_URL` | — | não | URL para sitemap.xml |
| `KAIROS_STRIPE_WEBHOOK_SECRET` | — | sim (Stripe) | HMAC verification |
| `KAIROS_RG_ADAPTER` | `json` | não | `json` ou `redis` |
| `KAIROS_REDIS_URL` | — | sim (Redis) | URL Redis quando adapter=redis |
| `KAIROS_RG_NAMESPACE` | `default` | não | Redis key namespace |
| `KAIROS_PII_SALT` | (auto) | não | Override do salt PII |
| `KAIROS_VERIFY_BATCH_MAX` | `50` | não | Máximo de items por batch request |

---

## Security Posture

- **API keys:** SHA-256 hashed antes de persistência. Plaintext nunca em disco.
- **Audit trail:** SHA-256 hash chain (cada record inclui hash do anterior). `kairos audit:verify` detecta qualquer tamper.
- **Vault:** AES-256-GCM, per-secret IV, auth tag detecta tamper. scrypt KDF.
- **Stripe:** HMAC-SHA256 manual, tolerância 5 minutos clock-skew, idempotência por `event.id`.
- **Scraper:** SSRF guard (rejeita IPs privados, max bytes, max redirects).
- **Headers:** CSP · HSTS · X-Content-Type-Options · COOP · Permissions-Policy · Referrer-Policy · X-Frame-Options em cada resposta.
- **PII:** Pseudonimizado via HMAC-SHA256 antes de qualquer persistência.
- **Timing attacks:** `crypto.timingSafeEqual()` para comparação de signatures Stripe.

---

## Debt Técnico e Gotchas

### ⚠️ CRÍTICO — Métricas Hardcoded no Dashboard

**Ficheiro:** `packages/sniper-api/ui.js` — função `renderDashboard()`, secção "Performance do Motor"

```javascript
// HARDCODED — NÃO são valores calculados:
<div class="bar-val">94.7%</div>   // "Precisão"
<div class="bar-val">99.9%</div>   // "Uptime"
<div class="bar-val">&lt;200µs</div>  // "Latência"
<div class="bar-val">3%</div>      // "Falsos +"
<div class="bar-val">47 países</div>  // "Cobertura"
```

**Problema:** Estes valores são strings literais HTML, não computados de dados reais. Violam a regra "NUNCA inventar dados". Um agent que tocar neste ficheiro **não deve assumir que estes valores são reais**.

**Fix necessário:** Calcular precisão e false-positive rate a partir do `verifications.jsonl`. Uptime requer monitorização externa. Latência requer instrumentação real.

### ⚠️ Single-Process by Design

O storage (JSON/JSONL) é **single-process only**. Múltiplas instâncias (clustering, Railway replicas) irão corromper dados. Para escalar horizontalmente:
- Activar Redis adapter: `KAIROS_RG_ADAPTER=redis`
- Migrar `sniper-db` para PostgreSQL (não existe migration tool ainda)

### ⚠️ Reputation Graph Adapter Cache é Singleton

`packages/reputation-graph/index.js`:
```javascript
const adapterCache = new Map();  // module-level singleton
```
Se usar `node:cluster` ou workers, cada worker tem o seu próprio map — **não partilham estado**. Solução: usar Redis adapter.

### ⚠️ Billing Metering Não é Atómico sob Carga

`billing/index.js: meterUsage()` faz read-modify-write com atomic rename. Safe contra crash, mas **não safe contra race conditions em multi-process**. Em single-process é OK.

### ⚠️ `sovereign` e `browser-extension` Não Verificados

Os packages `sovereign` (apex_ceo runtime) e `browser-extension` são mencionados no README mas não foram encontrados na scan inicial de packages. Podem estar em subdirectórios diferentes ou ainda por criar.

### ℹ️ Imports por Path Relativo

Todos os imports entre packages usam paths relativos (`require('../sniper-db')`). Não há workspace management (npm workspaces, turborepo). Se reorganizar a estrutura de pastas, todos os `require()` precisam de actualização manual.

### ℹ️ Sem Migration Tool para DB

Não existe migration tool. O schema evolui directamente nos JSON files. Se um campo novo é adicionado a `tenants.json`, records antigos não o têm — código deve lidar com `undefined` gracefully.

### ℹ️ Teste Suite — Node.js stdlib runner

O runner é `node:test` (não Jest). Sintaxe diferente: `import { test, describe } from 'node:test'`. CodeRabbit e ferramentas que esperam Jest podem não reconhecer a sintaxe.

---

## Desenvolvimento Local

### Setup

```bash
# Requer Node.js >= 18
npm install
npm start   # Boot em http://localhost:8787
```

Na primeira run, o sistema:
1. Cria `.kairos-data/` automaticamente
2. Bootstrap de demo tenants + API keys (imprime uma vez no stdout)
3. Verifica integridade da audit chain
4. Reporta se o vault está inicializado

### Comandos Frequentes

```bash
npm start                                          # Lança o servidor
npm test                                           # 159 testes, < 15 segundos
kairos audit:verify                               # Verifica tamper chain
kairos vault:init                                 # Init vault (requer KAIROS_MASTER_PASSPHRASE)
kairos vault:set --name X --value Y               # Guardar secret
kairos tenant:create --id banco-x --plan pro      # Criar tenant
kairos key:create --tenant banco-x --label prod   # Criar API key
kairos compliance:purge --retention 90            # Limpar registos antigos
kairos billing:usage --tenant kairos-internal     # Ver usage
```

### Obter a API key de teste

Na primeira run, as demo API keys são impressas no stdout. Guardar imediatamente — não são recuperáveis depois (hashed em disco).

---

## Padrões de Código Estabelecidos

### Error handling

Todos os handlers HTTP retornam `{ status, body, headers? }` e nunca lançam. Erros internos são swallowed com `logEvent()`:

```javascript
try { billing.meterUsage(...); }
catch (err) { logEvent('billing.meter.error', { message: err.message }); }
```

### Logging

Structured JSON para stdout. **Nunca incluir plaintext PII, API keys, ou passphrases nos logs.**

```javascript
function logEvent(event, data = {}) {
  console.log(JSON.stringify({ ts: new Date().toISOString(), event, ...data }));
}
```

### Atomic file writes

Padrão obrigatório para qualquer escrita a ficheiros de dados:
```javascript
const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
fs.writeFileSync(tmp, JSON.stringify(data), 'utf8');
fs.renameSync(tmp, file);
```

### PII antes de persistência

**SEMPRE** passar texto por `compliance.pseudonymizeText()` ou `compliance.hashPii()` antes de qualquer `fs.write*` que contenha input do utilizador.

### Compliance envelope

**SEMPRE** incluir em audit records:
```javascript
compliance: compliance.buildComplianceEnvelope()
// → { dataSource: 'osint', lawfulBasis: 'gdpr-art6-1f-...', ... }
```

---

## Pontos de Integração Externos

| Serviço | Propósito | Integração | Ficheiros |
|---------|-----------|------------|-----------|
| Stripe | Billing/subscriptions | Webhook HMAC-SHA256 (sem SDK) | `packages/billing/index.js` |
| Redis | Reputation graph (produção) | Adapter opcional | `packages/reputation-graph/adapters/redis-adapter.js` |
| Scraper targets | OSINT via HTTPS | SSRF-safe fetch | `packages/sniper-scraper/fetch.js` |

---

## Testes

**Runner:** `node:test` (stdlib, sem Jest)
**Contagem:** 159 testes
**Tempo:** < 15 segundos
**Cobertura actual:** não instrumentada (sem coverage report)

```bash
npm test              # Todos os testes
```

Não existem testes E2E. Não existe CI configurado neste repo (o `.github/workflows/` está em `.aiox-core`, não no produto).

---

## Apêndice — Decisões Arquitecturais (ADRs)

Os ADRs mencionados no README (`docs/architecture/adr-*.md`) **não existem no directório `docs/`** — a pasta `docs/` não existia antes desta documentação. Os ADRs podem estar no `Memoria_Elefante/` ou ainda por criar.

Referências do README:
- `adr-001-pro-saas-foundation.md`
- `adr-002-sovereign-vault-dna.md`
- `adr-003-network-graph-distribution.md`
- `adr-004-legal-shield-redis-billing.md`

---

*Gerado por @analyst (Atlas) em 2026-06-01. Baseado em leitura directa do código — zero invenção.*
