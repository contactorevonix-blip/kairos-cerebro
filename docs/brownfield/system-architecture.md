# Phase 1: System Architecture Assessment — KAIROS_CEREBRO

**Date:** 2026-06-03  
**Agent:** @architect (Aria)  
**Status:** COMPLETED  

---

## Executive Summary

**KAIROS_CEREBRO** is a dual-purpose repository:
1. **AIOX Framework** — Meta-framework for AI-orchestrated development (squads, agents, workflows)
2. **Kairos Check** — Fraud detection API (backend + frontend, production code)

The production system is **microservice-lite**: 10 specialized packages coordinated via event bus, deployed across Railway (backend), Vercel (frontend), and PostgreSQL (data).

---

## Core Architecture

### High-Level Structure

```
KAIROS_CEREBRO (repo root)
├── .aiox-core/          → AIOX framework (L1: immutable)
├── packages/            → Production code (L4: mutable)
│   ├── sniper-engine/   → Fraud scoring engine
│   ├── sniper-api/      → Express API server
│   ├── web/             → Next.js frontend (Vercel)
│   ├── sniper-db/       → Database abstraction
│   ├── reputation-graph/→ Graph-based reputation data
│   ├── billing/         → Stripe integration
│   ├── vault/           → Credential storage
│   ├── compliance/      → Regulatory compliance
│   └── [7 more]
├── squads/              → Team/workflow definitions (L4)
├── docs/                → Documentation & specs (L4)
├── lib/                 → Shared utilities (event-bus, mailer)
└── scripts/             → Build & deployment scripts
```

### Layer Model (AIOX)

| Layer | Scope | Mutability | Path |
|-------|-------|------------|------|
| **L1** | Framework core, Constitution | IMMUTABLE | `.aiox-core/core/`, `bin/aiox.js` |
| **L2** | Framework templates, tasks | EXTEND-ONLY | `.aiox-core/development/` |
| **L3** | Project config, agent memory | MUTABLE* | `.aiox-core/data/`, `core-config.yaml` |
| **L4** | Product code, squads, docs | ALWAYS MUTABLE | `packages/`, `squads/`, `docs/` |

*L3 changes require deny-rule exceptions

---

## Production System (L4 - Mutable)

### Package Diagram

```
┌─────────────────────────────────────────────────────────┐
│  sniper-api (Express)                                   │
│  ├─ rate-limit.js         → Rate limiting                │
│  ├─ stripe-checkout.js    → Payment flow                │
│  ├─ stripe-webhook.js     → Stripe events               │
│  ├─ auth.js               → API authentication          │
│  ├─ chat-handler.js       → Real-time chat              │
│  ├─ email-sender.js       → Transactional email        │
│  ├─ [pages]               → Landing, pricing, dashboard│
│  └─ server.js / app.js    → Server bootstrap            │
└─────────────────────────────────────────────────────────┘
           │
           ├─→ sniper-engine (Core logic)
           │   ├─ core.js              → Main scoring logic
           │   ├─ reputation.js        → Score aggregation
           │   ├─ dna.js               → DNA-based heuristics
           │   ├─ nlp-heuristic.js     → NLP scoring
           │   ├─ domain-heuristic.js  → Domain analysis
           │   ├─ geo.js               → Geolocation checks
           │   ├─ checkout-inspector.js→ Checkout behavior
           │   ├─ guru-scam.js         → Scam detection
           │   ├─ ngram.js             → N-gram analysis
           │   ├─ graph/               → Reputation graph
           │   │   ├─ storage.js       → Graph persistence
           │   │   ├─ aggregator.js    → Score aggregation
           │   │   └─ engine-integration.js
           │   └─ api.js               → Engine API
           │
           ├─→ sniper-db
           │   └─ index.js             → DB abstraction layer
           │
           ├─→ reputation-graph
           │   ├─ storage.js           → PostgreSQL + Redis
           │   ├─ replicator.js        → Cache sync
           │   ├─ adapters/            → JSON, Redis backends
           │   └─ index.js
           │
           ├─→ billing
           │   └─ index.js             → Stripe integration
           │
           ├─→ vault
           │   └─ index.js             → Secrets management
           │
           ├─→ compliance
           │   └─ index.js             → GDPR, regulatory
           │
           └─→ webhook-outbox
               └─ index.js             → Outbox pattern for webhooks

┌─────────────────────────────────────────────────────────┐
│  web (Next.js)                                          │
│  ├─ /app/dashboard       → User dashboard              │
│  ├─ /api/                → API routes (proxies)        │
│  │   ├─ /auth/[...nextauth]  → Authentication         │
│  │   ├─ /check           → Fraud check endpoint       │
│  │   ├─ /chat            → Chat endpoint              │
│  │   └─ /stripe/         → Billing routes             │
│  ├─ /components/         → React UI components        │
│  ├─ /hooks/              → Custom React hooks         │
│  ├─ /lib/                → Utilities (auth, db, stripe│
│  ├─ schema.prisma        → Data model (Prisma ORM)   │
│  └─ DESIGN_SYSTEM.md     → Component library spec     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  lib/                                                   │
│  ├─ event-bus.js         → Async event coordination    │
│  └─ outreach-mailer.js   → Email service              │
└─────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Fraud Check Flow

```
1. API Request (sniper-api)
   ↓
2. Rate Limit Check (rate-limit.js)
   ↓
3. Authentication (auth.js)
   ↓
4. Score Request → sniper-engine
   │
   ├─→ Core Scoring (core.js)
   │   ├─ Reputation lookup (reputation-graph)
   │   ├─ DNA analysis (dna.js)
   │   ├─ NLP heuristics (nlp-heuristic.js)
   │   ├─ Domain checks (domain-heuristic.js)
   │   ├─ Geo analysis (geo.js)
   │   └─ Checkout inspection (checkout-inspector.js)
   │
   └─→ Aggregation (graph/aggregator.js)
   ↓
5. Cache result (reputation-graph storage)
   ↓
6. Return score + metadata (sniper-api)
   ↓
7. Event emission (event-bus.js)
   ├─ Usage tracking
   ├─ Compliance logging
   └─ Webhook outbox (webhook-outbox)
```

### Billing Flow

```
1. User subscribes → stripe-checkout.js
   ↓
2. Stripe creates subscription
   ↓
3. Webhook arrives → stripe-webhook.js
   ↓
4. Update user account in PostgreSQL
   ↓
5. Emit event (event-bus.js)
   ↓
6. Billing module reconciles
```

---

## Deployment Architecture

### Current Stack

| Component | Platform | Tech |
|-----------|----------|------|
| **Backend** (sniper-api) | Railway | Node.js |
| **Frontend** (web) | Vercel | Next.js |
| **Database** | PostgreSQL | Prisma ORM |
| **Cache** | Redis (optional) | reputation-graph |
| **Payments** | Stripe | External API |
| **Email** | SendGrid/SMTP | outreach-mailer |

### Environment Boundaries

```
Local Development
├─ Node.js v24 (from STATE.md)
├─ PostgreSQL (local or containerized)
├─ npm/yarn dependency management
└─ Husky + lint pre-commit hooks

↓

Railway (Backend Staging/Prod)
├─ sniper-api + all packages bundled
├─ PostgreSQL managed database
├─ Environment variables (.env)
└─ Automated CI/CD (git push → deploy)

↓

Vercel (Frontend Staging/Prod)
├─ Next.js build + optimization
├─ Serverless functions (/api routes)
├─ Edge network + caching
└─ Automated deployments (git push)
```

---

## Architectural Patterns

### 1. **Package-Based Modularity**
- Each `package/` is a logical domain (engine, api, billing, etc.)
- Clear separation of concerns
- Independent testing + versioning possible

### 2. **Layered Scoring (sniper-engine)**
- Multiple heuristics applied in parallel
- Reputation graph as shared state
- Aggregation combines signals into final score

### 3. **Event-Driven Architecture**
- `event-bus.js` coordinates async operations
- Usage tracking, compliance logging, webhooks decoupled
- Outbox pattern ensures reliability

### 4. **API Gateway (sniper-api)**
- Single entry point for all clients
- Rate limiting, authentication, authorization
- Frontend proxies through Next.js `/api` routes

### 5. **Data Abstraction**
- `sniper-db/index.js` abstracts database operations
- Prisma schema defines entity model
- Repository pattern (implied)

### 6. **Compliance by Design**
- `compliance/index.js` for GDPR, audit trails
- Vault for secrets management
- Event logs for non-repudiation

---

## Key Constraints & Decisions

### 1. **Single-Threaded Node.js**
- CPU-bound sniper-engine could bottleneck under high load
- Current mitigation: Rate limiting at API layer
- Future consideration: Worker processes or go-based scorer

### 2. **Reputation Graph Storage**
- Supports both JSON (file-based) and Redis backends
- Production uses Redis for cache, PostgreSQL for primary
- Replication lag possible in distributed setups

### 3. **Next.js Full-Stack**
- Frontend + serverless API in one deployment
- Prisma client bundled in frontend build
- Database connection pooling required

### 4. **AIOX Framework Coexistence**
- AIOX (L1-L3) is framework/governance; production code is L4
- Deny rules prevent accidental framework modifications
- Squads live in L4 (can be extended, modified, deleted)

### 5. **Stripe Dependency**
- Billing tightly coupled to Stripe API
- Webhook reliability critical (outbox pattern mitigates)
- PCI compliance delegated to Stripe

---

## Integration Points

| Service | Type | Module |
|---------|------|--------|
| **Stripe** | Payment processor | billing/, stripe-checkout.js, stripe-webhook.js |
| **PostgreSQL** | Primary database | sniper-db/, web/prisma |
| **Redis** | Cache | reputation-graph/adapters/redis-adapter.js |
| **Email** | Transactional + outreach | outreach-mailer.js, email-sender.js |
| **OSINT sources** | Data enrichment | sniper-scraper/, live-reputation.js |
| **Webhooks** | Customer notifications | webhook-outbox/ |

---

## Technology Inventory

### Backend
- **Runtime:** Node.js v24
- **HTTP Server:** Express.js
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Cache:** Redis (optional)
- **Utilities:** event-bus, outreach-mailer

### Frontend
- **Framework:** Next.js
- **UI Library:** React
- **3D Graphics:** Three.js (shield visualization)
- **Auth:** NextAuth.js
- **Design System:** Custom component library (DESIGN_SYSTEM.md)

### Devops
- **Deployment:** Railway (backend), Vercel (frontend)
- **Version Control:** Git + GitHub
- **CI/CD:** GitHub Actions (implicit via Railway/Vercel integrations)
- **Code Review:** CodeRabbit automated review

### Development Framework
- **Meta-Framework:** Synkra AIOX (governance, agents, workflows)
- **Package Manager:** npm
- **Linting:** ESLint
- **Build Tool:** (esbuild or tsc for packages)

---

## Known Technical Debt (Observations)

1. **No explicit error boundary strategy** across packages
2. **Rate limiting is API-level only** (no distributed rate limiting for multi-instance)
3. **Reputation graph replication** possible inconsistencies in high-concurrency
4. **Limited observability** — no structured logging or distributed tracing visible
5. **Database connection pooling** likely needed for Vercel edge functions

---

## Next Steps (Phase 2-3)

Phase 2 (@data-engineer) will audit:
- Database schema (Prisma DDL review)
- Index strategy and query patterns
- Data migration capabilities

Phase 3 (@ux-design-expert) will audit:
- Frontend component structure
- API response contracts for frontend
- Accessibility and performance

---

## Files Created

- ✅ `docs/brownfield/system-architecture.md` (this file)

## Status

**Phase 1: COMPLETED**

Ready for Phase 2 (@data-engineer) to begin database audit.
