# ADR — IDS Decision Engine

**Status:** Proposed | **Date:** 2026-06-24 | **Epic:** [EPIC-IDS-OPERATIONALIZATION](../stories/epics/EPIC-IDS-OPERATIONALIZATION.md) | **Author:** @sm (River)

---

## Context

A Story 1.19 (IDS Enforcement Wiring) entregou o hook `enforce-ids.cjs`, que implementa os gates G1-G6 do Artigo IV-A (Incremental Development System) de forma **heurística**: o hook faz uma "registry heuristic scan" — uma análise textual aproximada — e regista decisões em `.aiox/gate-logs/ids-*.jsonl`, mas não expõe um score de relevância determinístico nem um comando consultável por humanos ou agentes.

Esta onda (EPIC-IDS-OPERATIONALIZATION) precisa de decidir **como** o módulo de scoring REUSE/ADAPT/CREATE deve funcionar, para que:
1. `kairos ids:recommend` (Story IDS-OPS.1) tenha uma lógica de decisão consistente e testável
2. `@sm *draft` (Story IDS-OPS.2) possa consumir essa lógica de forma previsível

---

## Decision

### 1. Scoring determinístico baseado em overlap de keywords + tipo + purpose

O Decision Engine calcula um match score (0-100%) para cada entidade candidata no `entity-registry.yaml`, combinando três sinais, todos já presentes no schema actual do registry (`entities.{type}.{name}.{keywords, purpose, type}` — ver `.aiox-core/data/entity-registry.yaml`):

| Sinal | Peso | Fonte no registry |
|-------|------|---------------------|
| Overlap de keywords (intent tokens ∩ entity.keywords) | 60% | `entity.keywords` (array) |
| Similaridade de `purpose` (overlap de tokens, não embeddings) | 30% | `entity.purpose` (string) |
| Match exacto de `type` (quando `--type` é fornecido) | 10% (bonus/penalidade) | `entity.type` |

**Porquê não usar embeddings/LLM scoring:** Art. I (CLI First) e Art. IV (No Invention) favorecem uma solução determinística, sem dependências externas, sem custo de API, e com comportamento 100% reprodutível e testável (AC2/AC3 de IDS-OPS.1 exigem coverage ≥85% — lógica determinística é trivialmente testável; lógica baseada em LLM não é).

### 2. Thresholds herdados sem alteração de `.claude/rules/ids-principles.md`

```
score >= 90%        → REUSE
60% <= score < 90%  → ADAPT
score < 60%         → CREATE
```

Estes thresholds **já estão definidos** na Constitution (Art. IV-A) e em `.claude/rules/ids-principles.md` — esta ADR não os redefine, apenas confirma que o Decision Engine os aplica sem desvio.

### 3. Reutilização da infraestrutura existente (Story 1.19) — REUSE, não CREATE

Por imposição do próprio Artigo IV-A (dogfooding), o Decision Engine **reutiliza**:
- `lib/gate-logger.cjs` para logging/métricas (não recria um novo logger)
- O circuit breaker já configurado (`failure_threshold: 5, success_threshold: 3, reset_timeout_ms: 60000`)
- O schema de log `{timestamp, gate, decision, reason, agent, operation}` já estabelecido

@dev deve confirmar via `*ids check` se a lógica de scoring heurística já existente em `enforce-ids.cjs` pode ser **extraída e promovida** a módulo reutilizável (`ADAPT`), em vez de escrever scoring do zero (`CREATE`). Esta ADR recomenda ADAPT como hipótese de trabalho, mas a decisão final cabe a @dev após o IDS check (a própria dogfood do processo que esta epic está a operacionalizar).

### 4. Graceful degradation idêntica à já estabelecida

Se o registry estiver indisponível, corrompido, ou o cálculo exceder o timeout do circuit breaker: devolver `CREATE` com aviso, nunca bloquear. Consistente com o princípio "Development NEVER blocked by IDS failures" (`.claude/rules/ids-principles.md`).

### 5. CLI-first, JSON output opcional

`kairos ids:recommend` produz output legível por humanos por padrão; uma flag `--json` (consumida por IDS-OPS.2 / `@sm *draft`) produz output estruturado parseável. Isto respeita Art. I (CLI First) — a CLI é a fonte da verdade, e a integração com `@sm` consome a CLI, não um módulo interno paralelo.

---

## Consequences

**Positivas:**
- Scoring 100% determinístico e testável sem dependências externas
- Reutiliza ao máximo a infraestrutura de Story 1.19 (gate-logger, circuit breaker, schema de log) — minimiza duplicação
- `--json` flag permite tanto uso humano (CLI directa) como consumo por agentes (IDS-OPS.2)

**Negativas / Trade-offs:**
- Scoring por overlap de keywords/tokens é mais simples que embeddings semânticos — pode gerar falsos negativos quando a intenção do utilizador usa sinónimos não presentes nos `keywords` do registry. Mitigação: o score é sempre exposto (AC3 de IDS-OPS.1), permitindo ao utilizador avaliar e decidir mesmo perto dos thresholds.
- A integração em `@sm *draft` (IDS-OPS.2) colide com o boundary L2 de `create-next-story.md` — ver "Framework Boundary Alert" na story IDS-OPS.2. Esta ADR não resolve esse bloqueador; fica documentado como decisão a tomar por @dev/@architect durante a implementação.

---

## Alternatives Considered

| Alternativa | Rejeitada porque |
|-------------|-------------------|
| Scoring via embeddings/vector similarity | Introduz dependência externa (modelo de embeddings), custo, e não-determinismo — viola Art. I e dificulta AC2 (coverage ≥85% de lógica não-determinística é frágil) |
| Recriar o logger/circuit-breaker do zero | Viola Art. IV-A (REUSE > ADAPT > CREATE) — infra já existe e está testada na Story 1.19 |
| Bloquear `*draft` até o utilizador responder à recomendação | Viola o princípio de graceful degradation; um IDS lento ou em erro nunca deve impedir desenvolvimento |

---

## References

- `.claude/rules/ids-principles.md` — thresholds e gates G1-G6
- `docs/stories/1.19.ids-enforcement-wiring.story.md` — infraestrutura base (hook, logger, circuit breaker)
- `.aiox-core/data/entity-registry.yaml` — schema das 833 entidades indexadas
- `docs/stories/epics/EPIC-IDS-OPERATIONALIZATION.md` — epic desta onda
- `docs/stories/epics/IDS-OPS.1-ids-decision-engine.story.md`
- `docs/stories/epics/IDS-OPS.2-sm-ids-integration.story.md`

---

**Created by:** @sm (River) | **Date:** 2026-06-24
