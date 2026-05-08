# KAIROS — Master Brief (Memória do Elefante)

> Última atualização: 2026-05-08 | Versão: 4.0 | Autor: CTO Soberano

---

## 1. O Negócio

- **Produto**: KAIROS — infraestrutura anti-fraude global. Não é "um anti-virus". É a camada de inteligência partilhada que entra entre cada utilizador e cada checkout/email/link.
- **Modelo**:
  - **B2B API** por uso (cêntimos por chamada).
  - **B2B White-label** via x-api-key e tenant isolation.
  - **B2C** via extensão de browser (`packages/browser-extension`).
- **North Star**: dominar a detecção de DNA de fraude antes que a fraude se materialize. O fosso é a **rede de inteligência partilhada**.

---

## 2. Arquitectura real (sem teatro)

### Runtime
- **Node.js ≥ 18**, puro. **Zero dependências externas** em produção.
- **Porta**: 8787 (configurável via `PORT`).
- **Persistência**: ficheiros JSON/JSONL atómicos em `.kairos-data/` (migrável para Postgres sem refactor).

### Pacotes em `packages/`

| Pacote | Função |
|---|---|
| `sniper-engine` | Motor de scoring (8 camadas + DNA de scam). Veredicto + fingerprint reproduzível. |
| `sniper-api` | HTTP server (auth, rate limit por tenant, audit trail, webhooks, GDPR endpoints, Stripe). |
| `sniper-db` | Persistência: tenants, api_keys (hash SHA-256), verifications JSONL, metrics. |
| `sniper-scraper` | Fetch HTTPS com SSRF guard + extractor de sinais HTML. |
| `reputation-graph` | Grafo cross-tenant com adapter (JSON/Redis), decay temporal, exportação assinada e PII hash. |
| `webhook-outbox` | Entrega assíncrona com HMAC-SHA256, retry exponencial e auditoria. |
| `vault` | Cofre AES-256-GCM com KDF scrypt e detecção de adulteração. |
| `sovereign` | Runtime determinístico do `apex_ceo` + 3 task forces operacionais. |
| `compliance` | Pseudonimização de PII (salt+SHA-256), retenção, GDPR Art.15/17, envelope de lawful basis. |
| `billing` | Catálogo de planos, verificação HMAC do webhook Stripe, metering por período. |
| `kairos-cli` | CLI: stories, tenants, keys, vault, agents, sovereign, compliance, billing. |
| `browser-extension` | Manifest V3 + content + popup + background com auto-signup community. |

### Camadas do motor (verifyPayload)

1. Core content risk (regex multi-língua)
2. Guru-scam detection
3. Reputation/complaint forensics
4. NLP heuristic (scam matrix de 7 dimensões)
5. Reputation linguistic forensics + curated DB
6. Deep checkout & link inspection
7. Fuzzy n-gram match (catch playbooks novos sem regex)
8. **Network intelligence** (cross-tenant reputation graph)

Fusão ponderada → score 0-100 → decisão `allow|review|block` → DNA fingerprint + família.

### Endpoints HTTP

| Rota | Auth | Função |
|---|---|---|
| `GET /` | público | Landing page |
| `GET /dashboard` | público | CEO dashboard com métricas reais |
| `GET /api/dashboard` | público | JSON das métricas |
| `GET /health` | público | Status |
| `POST /verify` | x-api-key | Verificação completa |
| `POST /scan-url` | x-api-key | Scrape + verifica um URL |
| `POST /api/verify-public` | rate-limit IP | Endpoint freemium |
| `GET /api/dna/families` | público | Top famílias de scam no audit trail |
| `GET /api/intel/top` | x-api-key | Top entidades no grafo de reputação |
| `GET /api/verifications/recent` | x-api-key | Audit trail do tenant |
| `POST /api/community/signup` | rate-limit IP | Signup anónimo (extensão B2C) |
| `GET /gdpr/export?subject=...` | público | GDPR Art.15 — acesso por pseudónimo |
| `POST /gdpr/erase` | público | GDPR Art.17 — apagamento por pseudónimo |
| `POST /billing/stripe/webhook` | HMAC | Receptor de eventos Stripe (subscriptions, invoices) |
| `GET /api/billing/plans` | público | Catálogo de planos |
| `GET /api/taskforces` | público | Composição das 3 task forces + sovereign overlay |

---

## 3. Os 18 agentes em 3 task forces + sovereign overlay

Após purga dos 4 agentes teatrais, os 18 agentes operacionais foram redistribuídos por task force para o Blitzscaling. Cada agente pertence a **uma só** força. Cadeia de comando antiga (`discovery → design → execution → gate → sovereign`) mantém-se em cima, agora horizontalmente paralelizada.

### Infrastructure Force — escala global, performance, dados
`architect`, `data-engineer`, `dev`, `devops`. Detém Redis, multi-região, integridade dos dados, hot path.

### Growth Force — extensão de browser, B2C, conversão
`pm`, `ux-design-expert`, `agent_ghost`, `agent_psycho`, `agent_copywriter`. Detém distribuição faceless, copy multilíngue, UX, neuromarketing ético.

### B2B & Security Force — bancos, compliance, contratos
`qa`, `po`, `sm`, `agent_sales`, `agent_growth`. Detém pilotos institucionais, signed feeds, qualidade, compliance, pricing/Stripe.

### Sovereign Overlay — autoridade transversal
`apex_ceo`, `aiox-master`, `analyst`, `squad-creator`. Toma decisões finais, gere framework, alinha discovery e cria novos agentes.

CLI: `kairos taskforce:list`. API: `GET /api/taskforces`.

---

## 4. ADRs

- **ADR-001** — Pro-SaaS Foundation (`docs/architecture/adr-001-pro-saas-foundation.md`)
- **ADR-002** — Sovereign, Vault, DNA (`docs/architecture/adr-002-sovereign-vault-dna.md`)
- **ADR-003** — Network Intelligence Graph + Distribution Surface (`docs/architecture/adr-003-network-graph-distribution.md`)
- **ADR-004** — Legal Shield, Redis-ready Adapter, Billing, Task Forces (`docs/architecture/adr-004-legal-shield-redis-billing.md`)
- **Privacy** — `docs/legal/privacy-policy.md`
- **DPA** — `docs/legal/dpa-template.md`

---

## 5. Política de qualidade (não-negociável)

1. **Zero deps externas em produção**. Toda a stack assenta em `node:fs`, `node:crypto`, `node:http`, `node:https`, `node:net`.
2. **Audit trail**: cada verificação tem `requestId`, `dnaFingerprint` e envelope de compliance.
3. **Rate limiting**: por tenant (autenticado) e por IP (público), configurável por plano.
4. **Cofre obrigatório** para qualquer chave de terceiros (Stripe, Google Safe Browsing, Sentry, etc.). Hardcoded keys em código = fail no `qa`.
5. **SSRF guard** em qualquer scraper.
6. **HMAC** em qualquer webhook outbound *e inbound* (Stripe).
7. **OSINT-only**: nenhum módulo persiste PII em texto claro. Tudo passa por `@kairos/compliance`.
8. **GDPR-ready**: endpoints Art.15 e Art.17 existem, são determinísticos e estão testados.
9. **135+ testes verdes** antes de qualquer merge.

---

## 6. KPIs operacionais (medidos, não inventados)

- Verificações totais → `readGlobalMetrics().verifyRequests`
- Bloqueios → `.blocked`
- Em revisão → `.review`
- Permitidos → `.allowed`
- Valor estimado protegido → `.estimatedProtectedValueEur`
- Famílias de scam mais activas → `GET /api/dna/families`
- Entidades mais flagged → `GET /api/intel/top`

Todos os números na homepage e dashboard saem destes contadores. **Nada fabricado.**

---

## 7. CLI operacional

```bash
# Stories
kairos init-story 1.1.1 --title "Migrate sniper-db to Postgres"
kairos validate-story 1.1.1

# Tenants & keys
kairos tenant:create --id banco-millennium --plan b2b-pilot --rate 240
kairos key:create --tenant banco-millennium --label production
kairos key:revoke --key ksk_...

# Vault
kairos vault:init                              # KAIROS_MASTER_PASSPHRASE no env
kairos vault:set --name STRIPE_SECRET --value "sk_live_..."
kairos vault:get --name STRIPE_SECRET
kairos vault:list
kairos vault:rotate --newPassphrase "..."

# Sovereign + task forces
kairos agents:list
kairos taskforce:list
kairos sovereign:decide --task "Add /scan-pdf endpoint with security, audit, scale tests"

# Compliance / GDPR
kairos compliance:purge --retention 90
kairos compliance:export --subject "scam@evil.com"
kairos compliance:erase  --subject "scam@evil.com"

# Billing
kairos billing:plans
kairos billing:usage --tenant kairos-internal
```

---

## 8. Roadmap real

### Fase 1 — fundação (concluída)
- API + auth + tenants + vault + DNA + sovereign + scraper + browser extension stub.

### Fase 2 — Triple Attack (concluída nesta sessão — ver ADR-004)
- **Legal Shield**: pacote `compliance` + GDPR endpoints + retenção + privacy policy + DPA template.
- **Scalability**: adapter pattern no `reputation-graph` (JSON default, Redis-ready) + replicador dual-write.
- **B2C Growth**: `POST /api/community/signup` + auto-provisioning na extensão sem PII.
- **Monetização**: `billing` package + Stripe webhook HMAC + plan-to-rate-limit + usage metering.
- **Orchestration**: 3 task forces operacionais (`kairos taskforce:list`).

### Fase 3 — execução comercial
- Publicar a extensão na Chrome Web Store (Growth Force).
- Activar `KAIROS_RG_ADAPTER=redis` em multi-região (Infrastructure Force).
- Fechar primeiros pilotos B2B com banco e gateway (B2B & Security Force) usando `kairos_b2b_pilot`.
- Cron de `compliance:purge` + cron de export de usage para Stripe.

### Fase 4 — escala Series A
- Migração `sniper-db` para Postgres/Supabase quando ultrapassarmos 1M verificações/dia.
- Sharding Redis multi-cluster com hash-slot consistente.
- Feed assinado público (`signFeed`) consumível por governos, browsers e motores de busca.

---

## 9. O fosso defensivo

Nenhum concorrente que comece hoje consegue replicar o **grafo de reputação cross-tenant** sem ter o mesmo volume de tráfego histórico. Cada nova verificação aumenta a vantagem composta. É um efeito de rede puro: quanto mais clientes usam, mais inteligente fica para todos. Esse é o lock-in.

A juntar ao grafo, a partir desta sessão temos **três fossos suplementares**:
1. **Legal**: arquitectura OSINT-only com pseudonimização compulsória — qualquer concorrente que copie a feature precisa de reescrever a infraestrutura para ter direito a vender a bancos europeus.
2. **Distribuição**: extensão de browser com signup anónimo de 2 cliques. O custo de aquisição cai para zero e o grafo cresce com cada utilizador novo.
3. **Comercial**: 5 planos pré-cabledos no código, do free aos 499€ institucionais. O ciclo de vendas é assimptótico em CAC.
