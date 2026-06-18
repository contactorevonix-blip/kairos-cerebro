---
name: aiox-cerebro-stress-test
description: Meta-validation de @aiox-cerebro (Kronos) — 8 stress tests. Score 6/8 PASS = GOOD WITH CAUTION. 2 gaps estruturais antes de auditar framework inteiro.
metadata:
  type: project
---

@aiox-cerebro (Kronos) foi stress-tested (8 testes) antes de ser confiado para auditar todo o AIOX+KAIROS_CEREBRO. Resultado: **6/8 PASS — GOOD WITH CAUTION**.

**Why:** Antes de usar Kronos como motor de auditoria de gaps do framework, era preciso validar que o próprio Kronos é fiável. Meta-validation feita em 2026-06-18 (CONT55).

**How to apply:** Kronos PODE ser usado para auditoria de instalação/squad/agent-quality/gaps, MAS com 2 caveats conhecidos:

1. **TEST 7 FAIL (CRITICAL — layer-awareness):** Kronos NÃO conhece o modelo L1-L4 nem as deny rules de `.claude/settings.json`. O canonical-baseline.yaml e os task workflows não têm dimensão de boundary. Logo: NÃO usar Kronos para detectar "ficheiro no L1 que devia ser L3" ou "template L2 modificado". Para auditoria de boundary, usar deny rules + enforce-quality-gates.cjs, não Kronos.
2. **TEST 8 PARTIAL (HIGH — contradictions):** Kronos detecta gaps de ficheiros e qualidade de agentes, mas NÃO tem step para detectar transições de status inválidas (story-lifecycle) nem features inventadas em stories. Conhece os estados (Draft→Ready→...→Done) mas não os valida. Para contradições constitucionais a nível de story, usar @qa/@po.

**Tudo o resto sólido:** dependency files todos existem (7 tasks, 3 templates, 1 checklist com 5 blocking items, canonical-baseline). CRITICAL_LOADER_RULE garante determinismo. Traceability [SOURCE:] forte (Art.IV). Self-audit workflow existe.

Ver também [[epic5-constitution-validation]] para drift de constitution.
