---
name: synapse-engine-internals
description: Comportamentos não-óbvios do motor SYNAPSE (8 layers, brackets, token budget) verificados em aiox-core-official
metadata:
  type: project
---

Internals do motor de injeção de contexto SYNAPSE (repo `C:/Users/lealp/aiox-core-official/`).

**Why:** Extraídos numa masterclass de pontos cegos. São estáveis (código core L1) e raramente óbvios mesmo para utilizadores avançados.
**How to apply:** Usar ao explicar/diagnosticar porque uma regra "não aparece" no início de sessão, ou ao auditar manifests.

Factos-chave (cada um verificado em código):
- **8 layers L0-L7** em `.aiox-core/core/synapse/layers/`. L0 Constitution, L1 Global+Context (funde 2 ficheiros), L2 Agent, L3 Workflow, L4 Task (síntese de sessão, NÃO lê ficheiro), L5 Squad (cache 60s, namespace `{SQUAD}_`, EXTENDS none/extend/override), L6 Keyword (dedup cross-layer via metadata.source), L7 Star-Command (regex `\*([a-z][\w-]*)`).
- **Brackets** (% contexto RESTANTE / token budget): FRESH 60-100%/800, MODERATE 40-60%/1500, DEPLETED 25-40%/2000, CRITICAL 0-25%/2500. Budget AUMENTA com depleção (reforço).
- **FRESH só corre L0,L1,L2,L7** — L3-L6 saltados. Explica regras de squad/workflow que só aparecem a meio da sessão.
- **XML_SAFETY_MULTIPLIER = 1.2** no cálculo de tokens (corrige subestimação chars/4 em XML).
- **maxContext** vem de `core-config.yaml → models.registry[active].contextWindow`, default 200000. Brackets são relativos ao modelo.
- **Degradação graciosa**: cada layer tem timeout próprio (L0/L7=5ms, L4/L5=20ms); erro/timeout → skip com warning, nunca crasha pipeline.
- **Memory bridge** escala retrieval com depleção: FRESH skip, CRITICAL ~1000 tokens. Consumer-only.

Star-commands (L7, em `.synapse/commands`): `*brief *dev *review *plan *discuss *debug *explain` + `*synapse status/debug/domains/session/reload` + `*synapse-diagnose`. `*synapse reload` invalida caches em runtime.

Relacionado: [[aiox-framework-governance]] (não modificar L1 core).
