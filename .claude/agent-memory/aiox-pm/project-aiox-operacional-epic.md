---
name: project-aiox-operacional-epic
description: EPIC-AIOX-OPS criado 2026-06-08 para fechar o gap recorrente "configurado mas não operacionalizado" do AIOX
metadata:
  type: project
---

# EPIC-AIOX-OPERACIONAL (AIOX-OPS) — PHASE 5

Criado 2026-06-08 por @pm. 7 stories (41sp), namespace 5.x. Ficheiro: `docs/stories/epics/EPIC-AIOX-OPERACIONAL.md`. Story 5.1 (Hook Automation Audit) pronta para @po.

**Why:** Tensão recorrente no STATE.md sessão após sessão — "AIOX, SYNAPSE, enforcement hooks are CONFIGURED but NOT OPERATIONALIZED". PHASE 1-4 entregaram 117sp de infraestrutura de automação, mas nunca houve verificação em runtime de que tudo funciona sem direcção manual.

**How to apply:** Quando o Pedro falar de "fazer o AIOX funcionar/automático/operacional", este epic é o veículo. Caminho crítico: 5.1 (audit) → 5.4/5.5/5.6 (paralelo) → 5.7 (doc viva + GAP fix). 5.2 e 5.3 em paralelo desde o início.

## GAPs verificados por inspecção directa (não inventados — Art. IV)

- **G1:** 25 hooks em settings.json nunca auditados em runtime (só afirmados no STATE.md). → Story 5.1
- **G2:** Story 1.20 `post-push-handoff-consolidate.js` tem ZERO testes apesar de Change Log afirmar. → Story 5.2
- **G3:** `AIOX-OPERACIONAL.md` não existe (8 audits dispersos em docs/AIOX-*.md, nenhum é fonte única). → Story 5.7
- **G4:** `core-config.yaml` L362-368 tem `autoClaude.specPipeline/execution/qa = false` — decisão não documentada. → Story 5.3
- **G5:** Scripts hook .js sem versioning/manifesto. → Story 5.2
- **G6:** Story 1.19 doc CCM auto-identifica-se como "Story 1.16" (rot pós-renumber). → Story 5.7
- **G7:** CLI completeness (aiox-tasks vs 213 tasks no registry) não verificada. → Story 5.5

## Nota factual descoberta

`state-sync.js` NÃO é hook órfão — é dependência interna chamada por `post-story-update.js` (que SIM está registado). Não confundir com GAP.

Relacionado: [[feedback-no-invention-verify-gaps]]
