# Story PM-2.1: process-mapper — Agent Maps (swim-lanes + authority diagrams)

## Status
**Done**

## Story
**As a** Pedro, **I want** diagramas visuais de autoridade para os 12 agentes AIOX — swim-lanes, operações exclusivas, e handoffs — **so that** qualquer dev saiba imediatamente quem pode fazer o quê sem ter de ler o agent-authority.md.

## Epic Context
- **Epic:** EPIC-PM-002 | **Spec:** FEAT-04 | **Complexidade:** M
- **Depends on:** PM-1.1 Done ✅ · PM-1.2 Done ✅
- **Source:** `.claude/rules/agent-authority.md`

## Acceptance Criteria
1. `docs/process-maps/agents/authority-map.html` existe e abre sem erros
2. 12 agentes visíveis com swim-lanes (1 coluna por agente)
3. Operações EXCLUSIVE marcadas visivelmente (cor vermelha)
4. Operações BLOCKED com indicação visual distinta (cinzento/riscado)
5. Handoffs explícitos com seta entre lanes
6. `docs/process-maps/agents/handoff-flows.html` existe com os 4 flows canónicos
7. `docs/process-maps/figma/agents/authority-map.svg` existe

## Tasks / Subtasks
- [x] Criar `squads/process-mapper/scripts/generate-swimlane.js`
- [x] Gerar `docs/process-maps/agents/authority-map.html` (12 agentes swim-lanes)
- [x] Gerar `docs/process-maps/agents/handoff-flows.html` (4 flows canónicos)
- [x] Verificar AC 1-7 — todos PASS

## Change Log
| Data | Agente | Acção |
|------|--------|-------|
| 2026-06-03 | @sm/@po | Story criada + 9/10 GO |
| 2026-06-03 | @dev (Dex) | InProgress |
