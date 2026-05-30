# CLAUDE.md — Data Pipeline System
# Template version: 1.0.0 | system-factory/templates/data-pipeline
# Gerado pelo FORGE — preencher com dados reais do projecto

---

## 1. Project Identity

**Nome:** {PROJECT_NAME}
**Missão:** {ONE_LINE_MISSION}
**Tipo:** Data Pipeline / Job Processing System
**Stack:** Node.js + BullMQ + PostgreSQL + Railway (+ Redis para filas)
**URL Produção:** {PRODUCTION_URL}
**GitHub:** {GITHUB_URL}
**Status:** {ACTIVE/BETA/DEVELOPMENT}

---

## 2. Architecture Principles

1. **Idempotency by Default** — processar o mesmo evento N vezes produz o mesmo resultado
2. **At-Least-Once Delivery** — assumir que mensagens podem chegar repetidas; nunca perder dados
3. **Stage Isolation** — cada stage do pipeline é independente e testável isoladamente
4. **Observable Flow** — cada evento é rastreável da ingestão à conclusão (correlation ID)
5. **Backpressure-Aware** — o sistema degrada graciosamente sob carga, não colapsa

---

## 3. Agent Authority Matrix

| Operação | Agent | Bloqueado para |
|----------|-------|---------------|
| `git push` / `gh pr create` | @devops EXCLUSIVO | todos os outros |
| Story creation | @sm EXCLUSIVO | — |
| Story validation | @po EXCLUSIVO | — |
| Implementation (workers, jobs) | @dev | — |
| DB migrations / schema | @data-engineer | @dev directo |
| Architecture / topologia de filas | @architect | — |

---

## 4. Hook Configuration

Hooks activos neste projecto:

| Hook | Evento | Ficheiro | Propósito |
|------|--------|---------|-----------|
| Commit lint | PreToolUse[Bash(git commit*)] | pre-commit-lint.cjs | Bloqueia termos depreciados |
| Push authority | PreToolUse[Bash(git push*)] | enforce-git-push-authority.cjs | Só @devops faz push |
| Post observer | PostToolUse | post-tool-use-observer.cjs | Log de todas as tool calls |
| Session start | SessionStart | session-start.cjs | Injecta contexto no início |
| Config audit | ConfigChange | config-change-audit.cjs | Audita mudanças de config de filas |

---

## 5. Database Conventions

**Naming:**
- Tabelas: `snake_case` plural (ex: `raw_events`, `processed_records`)
- Colunas: `snake_case`
- Primary keys: `id UUID DEFAULT gen_random_uuid()`

**Obrigatório em cada tabela de eventos:**
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
idempotency_key TEXT UNIQUE NOT NULL,
status          TEXT NOT NULL DEFAULT 'pending',
created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
processed_at    TIMESTAMPTZ
```

**Índices críticos:** `idempotency_key` (UNIQUE), `status` + `created_at` (para varredura de pendentes).

**Outbox pattern:** escrever evento + estado na mesma transação para garantir consistência DB ↔ fila.

---

## 6. API Design Standards

**Ingestion endpoint:** `POST /ingest/{source}` — aceita, valida, enfileira, devolve `202 Accepted`.

**Resposta de ingestão:**
```json
{ "accepted": true, "jobId": "uuid", "idempotencyKey": "..." }
```

**Status endpoint:** `GET /jobs/{id}` → estado actual e tentativas.

**Regra:** endpoints de ingestão devolvem rapidamente (202) e delegam o processamento à fila. Nunca processar de forma síncrona no request.

---

## 7. Security Rules

**NUNCA:**
- Secrets em código (connection strings, tokens de fonte externa)
- Processar payload sem validação de schema
- Confiar em `idempotency_key` fornecida pelo cliente sem a combinar com hash do payload

**SEMPRE:**
- Validar e autenticar a fonte na ingestão (HMAC signature ou API key)
- Sanitizar dados antes de persistir
- Mascarar PII nos logs do pipeline
- Limitar tamanho de payload na ingestão

---

## 8. Testing Requirements

**Coverage mínimo:** 85% nos processadores e na lógica de transformação

**Tipos obrigatórios:**
- Unit: transformações puras, validações de schema
- Idempotency tests: processar o mesmo evento 2x → 1 só resultado
- Integration: worker + DB + fila real (Redis de teste)
- Replay tests: reprocessar a DLQ não duplica

**Pattern:**
```javascript
describe('processOrderEvent', () => {
  it('processes a new event once', async () => { ... });
  it('is idempotent — same event twice yields one record', async () => { ... });
  it('routes to DLQ after max retries', async () => { ... });
});
```

---

## 9. Deployment Pipeline

**Branches:** `main` → produção (Railway), `feat/*` → preview.

**Serviços Railway:** API de ingestão + worker(s) + Redis + PostgreSQL.

**Processo de release:**
1. Testes (incl. idempotency) passam localmente
2. PR + review
3. Merge → deploy automático
4. Verificar que workers reconectam às filas sem perder jobs in-flight
5. Confirmar lag das filas estabiliza

**Graceful shutdown:** workers terminam o job actual antes de sair (`SIGTERM` handler), nunca a meio.

---

## 10. Performance Benchmarks

| Métrica | Target |
|---------|--------|
| Ingestion latency (P95) | < 100ms |
| Throughput por worker | ≥ {N} jobs/s |
| Queue lag (P95) | < 30s |
| Job processing time (P95) | < {N}ms |
| DLQ rate | < 0.1% |

**Alertas:** queue lag a crescer monotonicamente → escalar workers; DLQ rate > 1% → investigar.

---

## 11. Error Handling Patterns

**3 categorias de erro:**

1. **Transient (retry):** timeout de rede, fonte indisponível → retry com backoff
2. **Permanent (DLQ):** payload inválido, schema incompatível → mover para DLQ, não fazer retry
3. **Poison (alert):** erro que crasha o worker repetidamente → isolar e alertar

**Pattern:**
```javascript
try {
  await processEvent(job.data);
} catch (e) {
  if (e instanceof ValidationError) throw new UnrecoverableError(e.message); // → DLQ
  throw e; // transient → BullMQ faz retry com backoff
}
```

---

## 12. Observability & Monitoring

**Logging:** estruturado (JSON) com `correlationId` propagado por todos os stages.

**Métricas obrigatórias por stage:**
- Throughput (jobs/s)
- Queue lag (segundos)
- Error rate e DLQ rate
- Processing time (P50/P95/P99)
- Retry count distribution

**Dashboards:** painel por fila com depth, active, completed, failed, delayed.

**Alerts:** lag crescente, DLQ rate elevado, worker sem heartbeat > 60s.

---

## 13. Development Workflow

**Branches:**
```
main (produção)
└── feat/{story-id}-{description}
└── fix/{issue-description}
```

**Commit format:**
```
feat: add stripe webhook ingestion stage [Story 3.1]
fix: ensure idempotency key includes payload hash [Story 3.2]
```

**PR checklist:**
- [ ] Idempotency tests passam
- [ ] DLQ behaviour testado
- [ ] `npm test` + `npm run lint` clean
- [ ] Métricas novas instrumentadas

---

## 14. Onboarding Checklist

1. **Clone e setup:**
   ```bash
   git clone {GITHUB_URL}
   cd {PROJECT_NAME}
   cp .env.example .env
   npm install
   ```

2. **Variáveis de ambiente:**
   - `DATABASE_URL` — PostgreSQL
   - `REDIS_URL` — Redis (filas BullMQ)
   - `SOURCE_HMAC_SECRET` — verificação de assinatura das fontes

3. **Infra local:**
   ```bash
   docker compose up -d  # postgres + redis
   npm run db:migrate
   ```

4. **Correr:**
   ```bash
   npm run dev:api      # ingestão
   npm run dev:worker   # processamento
   ```

5. **Testes:**
   ```bash
   npm test
   ```

---

## 15. Quality Gates

**Antes de qualquer commit:**
- Idempotency tests passam
- Sem secrets no diff

**Antes de qualquer PR:**
- `npm test` 100% (incl. replay/DLQ)
- `npm run lint` clean

**Antes de deploy:**
- Verificar graceful shutdown
- Confirmar que migrations são backwards-compatible (deploy sem downtime)

---

## Secções Específicas Data Pipeline

## 16. Data Contracts

**Cada evento tem um schema versionado.** Schema definido com Zod (ou Joi) e versionado explicitamente.

```javascript
const OrderEventV1 = z.object({
  schemaVersion: z.literal(1),
  orderId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().length(3),
});
```

**Regras de versioning:**
- `schemaVersion` obrigatório em todos os eventos
- Mudanças backwards-compatible (campo opcional novo) → mesma major version
- Breaking changes (remover/renomear campo, mudar tipo) → nova major version + handler dedicado
- Manter handlers de versões antigas até toda a fila drenar a versão antiga

**Validação na fronteira:** todo evento é validado contra o seu schema na ingestão. Evento que falha validação → DLQ imediato (nunca entra no pipeline).

---

## 17. Idempotency Strategy

**Objectivo:** processar o mesmo evento 2x nunca duplica efeitos.

**Mecanismo:**
1. Cada evento tem `idempotency_key = hash(source + businessKey + payloadHash)`
2. Antes de processar, `INSERT ... ON CONFLICT (idempotency_key) DO NOTHING`
3. Se já existe → skip (já foi processado), marcar job como completo
4. Operações downstream (chamadas externas) usam a mesma key como dedup token quando suportado

**Regras:**
- A `idempotency_key` é derivada do conteúdo, nunca aleatória
- Efeitos colaterais (emails, cobranças) registam a key antes de executar
- Tabela de dedup com TTL/retenção definida (ex: 30 dias) para não crescer infinitamente

---

## 18. Retry & Backoff

**Estratégia:** exponential backoff com jitter, via BullMQ.

```javascript
{
  attempts: 5,
  backoff: { type: 'exponential', delay: 1000 }, // 1s, 2s, 4s, 8s, 16s
}
```

**Regras:**
- Só fazer retry de erros transientes (rede, 5xx de fonte externa, timeouts)
- Erros permanentes (validação, 4xx) → `UnrecoverableError` → DLQ sem retry
- Jitter para evitar thundering herd quando uma dependência recupera
- Após `attempts` esgotadas → mover para Dead Letter Queue

**Dead Letter Queue (DLQ):**
- Fila separada onde param os jobs que falharam definitivamente
- Inspeccionável e reprocessável manualmente após fix
- Replay da DLQ respeita idempotency (não duplica)
- Alertar quando entram itens na DLQ

---

## 19. Pipeline Monitoring

**Métricas por stage (não só globais):**

| Métrica | Descrição | Alerta |
|---------|-----------|--------|
| Throughput | jobs processados/s por stage | queda súbita |
| Lag | tempo entre enqueue e início de processamento | > 30s P95 |
| Error rate | % jobs que falham por stage | > 1% |
| DLQ rate | % jobs que acabam na DLQ | > 0.1% |
| Retry distribution | quantos jobs precisam de N retries | pico anómalo |
| In-flight | jobs activos por worker | saturação do pool |

**Correlation tracing:** `correlationId` gerado na ingestão e propagado por todos os stages, permitindo seguir um evento end-to-end nos logs.

**Health endpoint:** `GET /health` reporta conectividade a Redis + DB + depth de cada fila.
