# CLAUDE.md — SaaS API System
# Template version: 1.0.0 | system-factory/templates/saas-api
# Gerado pelo FORGE — preencher com dados reais do projecto

---

## 1. Project Identity

**Nome:** {PROJECT_NAME}
**Missão:** {ONE_LINE_MISSION}
**Tipo:** SaaS API
**Stack:** Node.js + Express + PostgreSQL + Stripe + Railway
**URL Produção:** {PRODUCTION_URL}
**GitHub:** {GITHUB_URL}
**Status:** {ACTIVE/BETA/DEVELOPMENT}

---

## 2. Architecture Principles

1. **API-First** — a API é o produto; a UI é opcional e secundária
2. **Security by Default** — rate limiting, auth, e input validation em cada endpoint
3. **Tenant Isolation** — dados de clientes nunca se misturam; RLS enforça isto
4. **Deterministic Billing** — cada acção com custo é auditável e reversível
5. **Graceful Degradation** — serviços externos em falha não derrubam o core

---

## 3. Agent Authority Matrix

| Operação | Agent | Bloqueado para |
|----------|-------|---------------|
| `git push` / `gh pr create` | @devops EXCLUSIVO | todos os outros |
| Story creation | @sm EXCLUSIVO | — |
| Story validation | @po EXCLUSIVO | — |
| Implementation | @dev | — |
| DB migrations | @data-engineer | @dev directo |
| Architecture decisions | @architect | — |

---

## 4. Hook Configuration

Hooks activos neste projecto:

| Hook | Evento | Ficheiro | Propósito |
|------|--------|---------|-----------|
| Commit lint | PreToolUse[Bash(git commit*)] | pre-commit-lint.cjs | Bloqueia termos depreciados |
| Push authority | PreToolUse[Bash(git push*)] | enforce-git-push-authority.cjs | Só @devops faz push |
| Post observer | PostToolUse | post-tool-use-observer.cjs | Log de todas as tool calls |
| Session start | SessionStart | session-start.cjs | Injeta contexto no início |
| Task verify | TaskCompleted | prompt handler | Verifica antes de fechar |
| Config audit | ConfigChange | config-change-audit.cjs | Audita mudanças de config |

---

## 5. Database Conventions

**Naming:**
- Tabelas: `snake_case` plural (ex: `api_keys`, `usage_events`)
- Colunas: `snake_case` (ex: `created_at`, `user_id`)
- Primary keys: `id UUID DEFAULT gen_random_uuid()`
- Foreign keys: `{table_singular}_id`

**Obrigatório em cada tabela:**
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

**RLS:** Activar em todas as tabelas com dados de cliente. Pattern:
```sql
ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON {table}
  USING (tenant_id = current_setting('app.tenant_id')::UUID);
```

---

## 6. API Design Standards

**Base URL:** `/v1/`
**Versioning:** URL path versioning (`/v1/`, `/v2/`)
**Authentication:** `Authorization: Bearer {API_KEY}`

**Response format:**
```json
{
  "data": {},
  "meta": { "request_id": "uuid", "timestamp": "iso8601" },
  "error": null
}
```

**Error format:**
```json
{
  "data": null,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Retry after 60 seconds.",
    "retry_after": 60
  }
}
```

**HTTP Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request (validation error)
- 401: Unauthorized (missing/invalid API key)
- 403: Forbidden (valid key, no permission)
- 404: Not Found
- 429: Rate Limited
- 500: Internal Server Error (never expose stack traces)

---

## 7. Security Rules

**NUNCA:**
- Secrets em código ou git (`.env` está em `.gitignore`)
- Stack traces em respostas de produção
- SQL concatenation (usar queries parametrizadas)
- Dados de um tenant visíveis para outro

**SEMPRE:**
- Rate limiting em todos os endpoints públicos
- Input validation com schema (Joi, Zod, ou equiv)
- Helmet.js ou equiv para headers de segurança
- HTTPS em produção (enforçado pelo Railway)

**API Keys:**
- Geradas com `crypto.randomBytes(32).toString('hex')`
- Armazenadas como hash (bcrypt ou SHA-256)
- Prefixadas com identificador (`kc_live_`, `kc_test_`)
- Rotação disponível via API

---

## 8. Testing Requirements

**Coverage mínimo:** 80% nas áreas críticas

**Tipos obrigatórios:**
- Unit tests: lógica de negócio isolada
- Integration tests: endpoints com DB real (test DB)
- Smoke tests: endpoints críticos em staging antes de prod

**Pattern de test:**
```javascript
describe('POST /v1/score', () => {
  it('returns 401 without API key', async () => { ... });
  it('returns 400 with invalid input', async () => { ... });
  it('returns 200 with valid input', async () => { ... });
  it('response includes all contract fields', async () => { ... });
});
```

**Antes de qualquer PR:** `npm test` deve passar 100%.

---

## 9. Deployment Pipeline

**Branches:**
- `main` → produção automática (Railway)
- `staging` → staging automático (Railway)
- `feat/*` → preview deployments (opcional)

**CI/CD (.github/workflows):**
1. `claude-review.yml` — Claude review em PRs
2. `deploy-railway.yml` — Deploy automático em push para main

**Processo de release:**
1. Testes passam localmente (`npm test`)
2. PR criado com descrição clara
3. Claude review automático
4. Merge para main → deploy automático
5. Health check confirma (`/health → {"status":"ok"}`)

---

## 10. Performance Benchmarks

| Endpoint | P50 | P95 | P99 |
|----------|-----|-----|-----|
| `GET /health` | < 10ms | < 50ms | < 100ms |
| `POST /v1/score` | < 200ms | < 500ms | < 1000ms |
| `GET /v1/usage` | < 100ms | < 300ms | < 500ms |

**Alertas:** P95 > 1s em qualquer endpoint crítico → investigar imediatamente.

---

## 11. Error Handling Patterns

**4 tipos de erro:**

1. **Validation Error (400)** — input inválido, mensagem clara para o cliente
2. **Auth Error (401/403)** — sem stack trace, mensagem genérica
3. **Business Error (4xx)** — regra de negócio violada, código de erro específico
4. **System Error (500)** — logado internamente, mensagem genérica para cliente

**Pattern:**
```javascript
try {
  // operação
} catch (error) {
  if (error instanceof ValidationError) {
    return res.status(400).json({ error: { code: error.code, message: error.message } });
  }
  // Sistema: log completo, resposta genérica
  logger.error({ error, requestId }, 'Unhandled error');
  return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
}
```

---

## 12. Observability & Monitoring

**Logging:**
- Estruturado (JSON) em produção
- Campos obrigatórios: `timestamp`, `level`, `message`, `requestId`, `tenantId`
- Nunca logar: passwords, API keys, PII sem masking

**Métricas a monitorar:**
- Request rate por endpoint
- Error rate por endpoint e por tenant
- Response time (P50, P95, P99)
- Database query time
- External API call success rate

**Alerts críticos:**
- Error rate > 1% em 5 minutos
- P95 response time > 1s em 5 minutos
- Database connections > 80% do pool

---

## 13. Development Workflow

**Branches:**
```
main (produção)
└── feat/{story-id}-{description}
└── fix/{issue-description}
└── chore/{description}
```

**Commit format:**
```
feat: add /v1/score endpoint [Story 1.1]
fix: correct rate limiting per tenant [Story 1.2]
chore: update dependencies
```

**PR checklist antes de criar:**
- [ ] `npm test` passa
- [ ] Sem secrets no código
- [ ] CLAUDE.md actualizado se necessário
- [ ] Story marcada como InReview

---

## 14. Onboarding Checklist

5 passos para começar a trabalhar neste projecto:

1. **Clone e setup:**
   ```bash
   git clone {GITHUB_URL}
   cd {PROJECT_NAME}
   cp .env.example .env
   npm install
   ```

2. **Variáveis de ambiente:**
   - `DATABASE_URL` — PostgreSQL connection string
   - `STRIPE_SECRET_KEY` — Stripe API key (test mode)
   - `JWT_SECRET` — random string ≥ 32 chars

3. **Base de dados:**
   ```bash
   npm run db:migrate
   npm run db:seed  # dados de teste
   ```

4. **Correr localmente:**
   ```bash
   npm run dev  # porta 3000
   curl localhost:3000/health  # deve retornar {"status":"ok"}
   ```

5. **Correr testes:**
   ```bash
   npm test  # deve passar 100%
   ```

---

## 15. Quality Gates

**Antes de qualquer commit:**
- Testes passam localmente
- Sem secrets no diff
- Sem `console.log` de debug em produção

**Antes de qualquer PR:**
- `npm test` 100% pass
- `npm run lint` clean
- Story actualizada (InReview)

**Antes de qualquer deploy para produção:**
- PR reviewed (Claude review + human)
- Staging testado (smoke tests)
- Health check passa após deploy

---

## Secções Específicas SaaS API

## 16. Rate Limiting

**Strategy:** Token bucket por API key

**Defaults:**
- `POST /v1/score`: 100 req/min por key
- `GET /v1/usage`: 1000 req/min por key
- Global: 10000 req/min por IP

**Headers de resposta:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640000000
```

---

## 17. Billing & Metering

**Modelo:** Pay-per-use + subscription tiers

**Eventos billable** (registar em `usage_events`):
- Cada chamada a `/v1/score` → 1 crédito
- Eventos com custo computacional → X créditos

**Stripe integration:**
- Webhooks: `payment_succeeded`, `subscription_updated`, `subscription_deleted`
- Customer ID sincronizado com `tenants.stripe_customer_id`

---

## 18. API Keys Management

**Criação:** POST /v1/keys → gera key com prefixo + hash armazenado
**Rotação:** POST /v1/keys/{id}/rotate → nova key, antiga deprecada em 24h
**Revogação:** DELETE /v1/keys/{id} → imediata

---

## 19. Multi-tenancy

**Isolamento:** Por `tenant_id` em cada tabela + RLS PostgreSQL
**Configuração:** `current_setting('app.tenant_id')` injectado em cada request
**Limites:** Por plano (requests/dia, features disponíveis)

---

## 20. Webhooks (se aplicável)

**Outgoing webhooks:**
- Retry: 3 tentativas com backoff exponencial (1s, 5s, 30s)
- Signature: `HMAC-SHA256` com secret do tenant
- Payload: sempre JSON com `event_type` e `data`
