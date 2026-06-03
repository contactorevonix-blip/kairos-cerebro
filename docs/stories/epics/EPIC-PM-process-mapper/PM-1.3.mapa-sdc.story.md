# Story PM-1.3: process-mapper — Mapa SDC (Story Development Cycle)

## Status
**Done**

## Story
**As a** Pedro, **I want** um fluxograma HTML do SDC baseado em `.claude/rules/workflow-execution.md` e `story-lifecycle.md`, **so that** qualquer dev perceba o ciclo completo de desenvolvimento numa imagem.

## Epic Context
- **Epic:** EPIC-PM-001 | **Spec:** FEAT-01 | **Complexidade:** S
- **Depends on:** PM-1.2 Done ✅ | **Blockers para:** PM-1.7 (coverage audit usa este mapa)
- **Source files:** `.claude/rules/workflow-execution.md` · `.claude/rules/story-lifecycle.md`

## Acceptance Criteria
1. `docs/process-maps/sdc.html` existe e abre no browser sem erros
2. 4 fases visíveis: Create (@sm) · Validate (@po) · Implement (@dev) · QA Gate (@qa)
3. Status transitions visíveis nos steps: Draft→Ready→InProgress→InReview→Done
4. QA gate mostra os 4 veredictos (PASS/CONCERNS/FAIL/WAIVED)
5. Cada elemento rastreia para ficheiro real (zero invenção)
6. `docs/process-maps/figma/sdc.svg` existe

## Tasks / Subtasks
- [x] Criar `squads/process-mapper/data/processes/sdc.json` com dados reais do SDC
- [x] Gerar `docs/process-maps/sdc.html` via `generate-process-map.js --config sdc.json --output sdc.html`
- [x] Verificar AC 1-6 — todos PASS

## Change Log
| Data | Agente | Acção |
|------|--------|-------|
| 2026-06-03 | @sm (River) | Story criada — Draft |
| 2026-06-03 | @po (Pax) | 9/10 GO — Ready |
| 2026-06-03 | @dev (Dex) | InProgress |
