# Task: Performance Design
# Agent: forge-architect (Atlas)
# Gate: (architecture task)

## Objectivo
Definir os benchmarks de performance para o tipo de sistema e a estratégia para os atingir: caching, optimização de base de dados e CDN quando há frontend.

## Inputs
- `outputs/{system_name}/architecture/tech-stack.yaml` (G13)
- `outputs/{system_name}/architecture/data-model.md` (G15)
- `data/system-types.yaml` (alvos de performance por tipo)

## Processo

### Passo 1 — Definir alvos (NFR de performance)
Para o tipo de sistema, definir alvos concretos: latência p95, throughput, tempo de arranque. Cada alvo é um NFR rastreável.

### Passo 2 — Caching strategy
Onde cachear (resultados OSINT, respostas idempotentes), TTLs, invalidação. Camada (in-memory, Redis, CDN).

### Passo 3 — Database optimization
Índices (de G15), connection pooling, paginação, evitar N+1, réplicas de leitura se necessário.

### Passo 4 — CDN (se frontend)
Para fullstack: assets estáticos via CDN, cache headers, edge se aplicável.

### Passo 5 — Plano de medição
Como verificar que os alvos são atingidos (load test, métricas em prod).

## Output
`outputs/{system_name}/architecture/performance-strategy.md`
```markdown
# Performance Strategy — {system_name}

## Targets (NFR)
- NFR-P1: latência p95 do /score < 800ms.
- NFR-P2: throughput >= 600 req/min por instância.

## Caching
- osint_cache: TTL 24h por (email|ip); invalidação manual via admin.

## Database
- Índices em tenant_id; pool de 10; paginação keyset; sem N+1.

## CDN
- N/A (saas-api sem frontend).

## Measurement
- Load test antes de cada release; alerta p95 em prod.
```

## Critérios de Completude
- [ ] Alvos de performance definidos como NFR rastreáveis
- [ ] Estratégia de caching com TTL e invalidação
- [ ] Optimizações de DB definidas
- [ ] CDN definida ou marcada N/A
- [ ] Plano de medição dos alvos
