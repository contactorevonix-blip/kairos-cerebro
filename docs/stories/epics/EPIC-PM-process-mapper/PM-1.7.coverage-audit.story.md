# Story PM-1.7: process-mapper — Coverage Audit (process-auditor Tier 0)

## Status
**Done**

## Story
**As a** Pedro, **I want** um script que audite quantos % dos processos AIOX estão mapeados, **so that** saiba exactamente o que falta e priorize o trabalho de mapeamento.

## Epic Context
- **Epic:** EPIC-PM-001 | **Spec:** FEAT-03 | **Complexidade:** M
- **Depends on:** PM-1.3 a PM-1.6 Done ✅

## Acceptance Criteria
1. `node squads/process-mapper/scripts/coverage-audit.js` executa sem erros
2. `docs/process-maps/coverage-report.md` é gerado com: % global, breakdown por domínio, lista de gaps
3. % de cobertura é calculada com dados reais dos ficheiros existentes (não inventado)
4. Os 4 processos mapeados (SDC/QA Loop/Spec Pipeline/Brownfield) aparecem como MAPPED
5. As ~100+ tasks em `.aiox-core/development/tasks/` aparecem como gaps no domínio File Maps
6. Script executa em < 10 segundos

## Tasks / Subtasks
- [x] Criar `squads/process-mapper/scripts/coverage-audit.js`
- [x] Gerar `docs/process-maps/coverage-report.md` (dados reais: 4/250 = 2%)
- [x] Verificar AC 1-6 — todos PASS

## Change Log
| Data | Agente | Acção |
|------|--------|-------|
| 2026-06-03 | @sm (River) | Story criada — Draft |
| 2026-06-03 | @po (Pax) | 9/10 GO — Ready |
| 2026-06-03 | @dev (Dex) | InProgress |
