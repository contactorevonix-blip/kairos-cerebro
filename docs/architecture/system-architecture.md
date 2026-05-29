# System Architecture — Kairos Check
**Gerado por:** @architect (Aria) — Brownfield Discovery Fase 1
**Data:** 2026-05-24
**Versão:** 1.0

---

## 1. Visão Geral do Sistema

**Kairos Check** é uma API de scoring anti-fraude OSINT-first, GDPR-native, construída em Node.js puro (zero dependências externas em produção).

O sistema analisa texto, URLs e entidades para detectar padrões de fraude e devolver uma pontuação de risco com veredicto.

---

## 2. Stack Tecnológico

| Camada | Tecnologia | Notas |
|---|---|---|
| Runtime | Node.js ≥ 18 | Zero dependências em produção |
| HTTP Server | `http` stdlib | Sem Express, sem frameworks |
| Base de dados | JSON on-disk | `.kairos-data/` — ficheiros JSON |
| Criptografia | `crypto` stdlib | AES-256-GCM, scrypt, SHA-256 |
| Billing | Stripe (sem SDK) | Protocolo directo via HMAC |
| Deploy | Railway + Docker | Região: europe-west4 (Frankfurt) |
| Frontend | `packages/web` | Não analisado (Fase 3) |

---

## 3. Arquitectura de Packages (Monorepo)

```
kairos-cerebro/
├── packages/
│   ├── sniper-engine/     ← Motor de scoring (core do produto)
│   ├── sniper-api/        ← HTTP server + endpoints REST
│   ├── sniper-db/         ← Camada de persistência (JSON on-disk)
│   ├── sniper-scraper/    ← Scraping de URLs para análise
│   ├── billing/           ← Planos, Stripe, metering de uso
│   ├── compliance/        ← GDPR: pseudonymização, retenção, direitos
│   ├── reputation-graph/  ← Inteligência cross-tenant (rede de reputação)
│   ├── vault/             ← Secrets cifrados (AES-256-GCM)
│   ├── webhook-outbox/    ← Entrega de webhooks
│   └── web/               ← Frontend (a analisar na Fase 3)
├── lib/
│   ├── event-bus.js       ← Event bus central (EventEmitter + JSONL)
│   └── outreach-mailer.js ← Email via Resend
├── bin/
│   ├── kairos.js          ← CLI principal (orchestrador)
│   ├── supervisor.js      ← Monitor de anomalias + rollback
│   ├── stats.js           ← MRR + LTV + unit economics
│   ├── pipeline.js        ← Pipeline de dados
│   ├── radar.js           ← Market intelligence
│   └── responder.js       ← Respostas a leads
└── .kairos-data/          ← Dados em runtime (gitignored)
```

---

## 4. Fluxo de Dados Principal

```
Cliente (API)
    ↓ POST /verify
sniper-api/server.js
    ↓ authenticate()        ← verifica API key
    ↓ consumeUnits()        ← rate limiting por tenant
    ↓ verifyPayload()
sniper-engine/core.js       ← scoring engine
    ├── Padrões de texto    ← HIGH_RISK_PATTERNS (PT + EN)
    ├── DNA fingerprint     ← 7 chromosomas de fraude
    ├── Reputação          ← reputation-graph lookup
    └── Compliance check    ← pseudonymização PII
    ↓ resultado
sniper-api/app.js
    ├── recordVerification() ← sniper-db
    ├── updateGlobalMetrics() ← sniper-db
    └── dispatchScamEvent()  ← event-bus
    ↓ resposta JSON
Cliente
```

---

## 5. Motor de Scoring — 8 Camadas

O `sniper-engine` aplica 8 camadas de análise:

| Camada | O que detecta |
|---|---|
| Padrões de texto | Frases de fraude (PT + EN) |
| DNA Scam | 7 chromosomas: urgência, ROI irreal, método vago, autoridade falsa, FOMO, fuga de identidade, funil de pagamento |
| URL Analysis | URLs suspeitas, dominios de risco |
| Scraper Integration | Conteúdo real das páginas |
| Reputation Graph | Histórico cross-tenant da entidade |
| Billing Context | Plano e limites do tenant |
| Compliance Layer | GDPR antes de persistir |
| Audit Chain | Registo tamper-evident |

---

## 6. Segurança

| Mecanismo | Implementação |
|---|---|
| Autenticação | API keys por tenant (HMAC) |
| Cifração em repouso | AES-256-GCM (vault) |
| PII | Pseudonymização via scrypt+SHA-256 antes de persistir |
| GDPR | Art.6 (base legítima), Art.15 (acesso), Art.17 (erasure) |
| Stripe webhooks | Verificação HMAC-SHA256 directa (sem SDK) |
| Rate limiting | Por tenant, por período |
| Audit trail | Imutável, tamper-evident |

---

## 7. Deployment

```
GitHub → Railway CI → Docker Build → Deploy europa-west4
                                         ↓
                                   /health (deep probe)
                                   DB writable + audit chain + vault
```

- **Builder:** Dockerfile (não nixpacks) — soberania total
- **Health check:** `/health` — 30s timeout
- **Restart policy:** ON_FAILURE, máx 5 retries
- **Réplicas:** 1 (escala horizontal planeada)

---

## 8. Débitos Técnicos Identificados (Nível Sistema)

### CRÍTICOS
| ID | Débito | Impacto |
|---|---|---|
| DT-001 | Base de dados JSON on-disk — não escala | Perda de dados em multi-replica, sem transactions |
| DT-002 | Sem testes unitários na maioria dos packages | Regressões silenciosas em produção |
| DT-003 | `docs/` inexistente — sem documentação do produto | AIOX não funciona, onboarding impossível |

### ALTOS
| ID | Débito | Impacto |
|---|---|---|
| DT-004 | Sem PostgreSQL — dados em ficheiros JSON por tenant | Impossível fazer queries, relatórios, ou backup consistente |
| DT-005 | `packages/web` não analisado — frontend desconhecido | Risco de inconsistência UI/API |
| DT-006 | `.aiox/` inexistente — memória do sistema ausente | Handoffs, project-status e logs do AIOX falham |
| DT-007 | Sem variáveis de ambiente documentadas em `.env.example` completo | Onboarding novo dev = horas de debugging |

### MÉDIOS
| ID | Débito | Impacto |
|---|---|---|
| DT-008 | `sniper-db` usa JSON puro — sem índices nem queries | Performance O(n) em todas as leituras |
| DT-009 | Event bus persiste em JSONL mas sem rotação de logs | Ficheiro cresce indefinidamente |
| DT-010 | `outreach-mailer.js` em `lib/` — deveria ser package | Acoplamento incorrecto |
| DT-011 | Múltiplos scripts em `bin/` sem orquestração clara | Confusion sobre o que correr e quando |

---

## 9. Pontos de Integração

| Integração | Package | Status |
|---|---|---|
| Stripe Billing | `billing/` | Activo — sem SDK, HMAC directo |
| Resend Email | `lib/outreach-mailer.js` | Activo |
| Redis (reputation) | `reputation-graph/adapters/` | Opcional — default: JSON |
| Railway Deploy | `railway.toml` + `Dockerfile` | Activo |

---

## 10. Perguntas para Especialistas

**Para @data-engineer (Fase 2):**
- O `sniper-db` usa JSON — há planos para migrar para PostgreSQL? Qual a dimensão actual dos ficheiros `.kairos-data/`?
- O `reputation-graph` tem adaptador Redis — está activo em produção ou só o JSON?
- Existem migrations versionadas ou os schemas são implícitos?

**Para @ux-design-expert (Fase 3):**
- O `packages/web` — é um frontend completo ou uma landing page? Qual o framework?
- Existem páginas de dashboard para o tenant ver as suas verificações?
- O design system está definido ou é CSS inline/ad-hoc?

---

*Fase 1 completa. Próximo: @data-engineer — Fase 2 (Database)*
