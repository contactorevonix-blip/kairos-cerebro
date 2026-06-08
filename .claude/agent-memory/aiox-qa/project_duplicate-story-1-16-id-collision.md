---
name: duplicate-story-1-16-id-collision
description: Colisões de ID de story em PHASE 4 (1.16 e 1.17 ambas RESOLVIDAS via renumeração); 1.20 Handoff passou CONCERNS por falta de testes
metadata:
  type: project
---

PHASE 4 / Epic 1 tem (teve) colisões de ID de story que invalidam claims de progresso agregados. Verificar sempre artefactos reais no disco — STATE.md tem sobre-relatado conclusões.

## 1.16 — RESOLVIDA (2026-06-08)
A story de Coherence foi renumerada `1.16 → 1.19` (ver Change Log de `docs/stories/1/1.19.story.md`). Já não há colisão em 1.16.
- `docs/stories/1/1.16.story.md` — **Constitutional Enforcement Gates (6sp)** — agora **Done** (QA re-review PASS, 23/23 tests, 6/6 ACs). O gate FAIL anterior foi corrigido por @dev que implementou tudo depois.

## 1.17 — RESOLVIDA (2026-06-08, re-review final)
A colisão 1.17 foi resolvida: a Handoff Consolidation foi renumerada `1.17 → 1.20` (`docs/stories/1/1.20.story.md`). 1.17 fica exclusivamente para Task-First Automation, que entretanto FOI implementada.
- `docs/stories/1/1.17.story.md` — **Task-First Automation (5sp)** — agora **Done** (QA PASS, 12/12 tests `tests/tasks/discovery.test.js`, 6/6 ACs, 213 tasks indexed, `task-auto-suggest.cjs` registado PreToolUse(Read)).
- `docs/stories/1/1.20.story.md` — **Handoff Consolidation (8sp)** — agora **Done** com gate **CONCERNS**.

## 1.20 — CONCERNS por falta de testes (2026-06-08)
Handoff Consolidation passou gate como **CONCERNS** (não FAIL): implementação funcional e todos os artefactos presentes (`.aiox/scripts/consolidate-handoffs.js`, `post-push-handoff-consolidate.js` registado como Stop hook), MAS **zero testes automatizados** — ao contrário das irmãs 1.17 (12) e 1.18 (9). O Change Log dizia "consolidation script tested" sem qualquer artefacto de teste (false claim).

**Why:** AC5 "no handoff data lost" depende de `fs.renameSync` não testado — risco de perda de dados se houver bug de grouping/threshold. TEST-001 (high) tracked como follow-up.

**How to apply:** Quando uma story de automação que move/arquiva ficheiros não tiver testes para o AC "no data lost", o veredicto mínimo é CONCERNS (nunca PASS), mesmo que o smoke-test passe. Confirmar claims de "tested" no Change Log contra glob real em `tests/`. Relacionado: [[business-squad-agent-structure]].
