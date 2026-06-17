---
name: epic11-not-epic12
description: EPIC-11 e EPIC-12 são a MESMA epic (agent audit/testing). Usar EPIC-11, nunca criar EPIC-12.
metadata:
  type: project
---

EPIC-11 ("Agent Infrastructure Readiness & Audit Program") e a proposta EPIC-12 ("Agent Framework Testing Phase 1") são a MESMA epic com nomes/framing diferentes. Mesmo objectivo: auditar+certificar cada agente do framework para production-readiness.

**Why:** EPIC-12 foi proposto no handoff Cont 41 (doc, não PRD). EPIC-11 foi formalizado como PRD por Orion no dia seguinte (`docs/prd/EPIC-11-AGENT-INFRASTRUCTURE-READINESS.md`). São o mesmo pensamento em dois artefactos. EPIC-11 sobreviveu e já está em execução: Story 11.1 entregue (commit 12088c0, "Audit Framework 8 sections"), 11.2 (@sm River audit, piloto) em curso. Task-logs 11.1.json/11.2.json existem.

**How to apply:** NUNCA criar EPIC-12 — seria duplicado (viola Art. IV No Invention). Continuar EPIC-11. Dois ajustes de scope em aberto: (1) squad-creator (12º agente) só estava na proposta EPIC-12 — adicionar como story extra se Pedro quiser; (2) os 31 gaps + 21 ambiguidades do audit Morgan Cont 40 são REMEDIAÇÃO (corrigir o broken), conceptualmente distintos de EPIC-11 (certificar prontidão) — decidir se entram em 11.x ou epic própria. PRD diz "DRAFT/awaiting approval" mas está desactualizado: está IN PROGRESS. Ver [[project-aiox-operacional-epic]].
