---
name: cont55-reconciliation-design
description: CONT55 — design das estruturas #26-#30 é RECONCILIAÇÃO, não greenfield. 4 ADRs + verdict por estrutura. Maioria redundante com qa-loop.yaml/learned-patterns/state-machine canónico
metadata:
  type: project
---

# CONT55 — Reconciliation Design (estruturas #26-#30)

**Verdict por estrutura (após ler framework real):**
- #26 QA Scoring → REJEITAR aritmética agregada do report. Framework já tem `qa-gate-tmpl.yaml` (decision_matrix PASS/CONCERNS/FAIL/WAIVED) + `story-lifecycle.md` (7 checks). Criar L3 `qa-scoring-config.yaml` que parametriza thresholds-por-condição, NÃO soma de pontos.
- #27 Dependency Graph → ÚNICA genuinamente nova. Criar L3 `.aiox-core/data/story-dependencies.yaml`. Fonte única = só `depends_on` (derivar `blocks` por inversão). Cycle-detection via Kahn no advisory CLI.
- #28 Handoff State Machine → REJEITAR vocabulário DRAFT/READY_FOR_REVIEW/CLOSED. Lifecycle canónico (Draft/Ready/InProgress/InReview/Done) já em story-lifecycle.md + state-machine-schema.json. NÃO criar story-lifecycle-strict.yaml. Handoff-compaction já em agent-handoff.md/tmpl.
- #29 Escalation → REJEITAR triggers de TEMPO (blocked_1h/4h). qa-loop.yaml já escala por iteration-count (maxIterations:5) + triggers event-driven (max_iterations_reached/verdict_blocked/fix_failure/manual). Estender, não duplicar.
- #30 Decision Log → ACEITAR JSONL append-only. REJEITAR auto-compression (quebra imutabilidade). Reusar formato gate-logs real (.aiox/gate-logs/*.jsonl). LEARNED → learned-patterns.yaml (já existe).

**ROI numbers ($7.5M etc):** Art. IV No Invention → marcar TBD/unverified. 3 valores divergentes na própria skill.

**Why:** Evitar que @sm crie stories 13.3-13.6 a construir duplicados que colidem com L2 existente.
**How to apply:** Stories devem ser EXTEND/CONFIG (L3) + advisory CLI, não novos templates L2. Mudanças L2 requerem @aiox-master *propose-modification. Ver [[cont55-discovery-squad-validation]].
