# EPIC-PM — process-mapper Squad

**Status:** In Progress
**Owner:** Pedro Leal
**Data início:** 2026-06-03

## Descrição

Squad de observabilidade de processos para o AIOX. Gera fluxogramas visuais (HTML interactivo + SVG Figma-exportável) de todos os processos, agentes, estrutura e evolução do AIOX. Actua como gate pré-criação automático.

## Referências

- PRD: `docs/prd/process-mapper/PRD.md`
- Spec: `docs/prd/process-mapper/spec.md` (v1.1 APPROVED)
- Plan: `docs/prd/process-mapper/implementation.yaml`

## Epics e Stories

| Epic | Fase | Stories | Status |
|------|------|---------|--------|
| EPIC-PM-001 | A — Process Maps Foundation | PM-1.1 a PM-1.8 | Draft |
| EPIC-PM-002 | B — Agent Maps | PM-2.1 a PM-2.4 | Pendente |
| EPIC-PM-003 | C — Structure Maps | PM-3.1 a PM-3.3 | Pendente |
| EPIC-PM-004 | D — File Maps + Automação | PM-4.1 a PM-4.3 | Pendente |
| EPIC-PM-005 | E — Evolution Tracker | PM-5.1 a PM-5.3 | Pendente |
| EPIC-PM-006 | Infra — Gate Pré-Criação | PM-6.1 a PM-6.3 | Bloqueado até PM-001 Done |
| EPIC-PM-007 | Meta — Squad Structure | PM-7.1 a PM-7.3 | Draft |

## Constraint Crítica

EPIC-PM-006 (gate pré-criação) NÃO pode começar antes de EPIC-PM-001 Done.
Gate sem mapas = bloqueio total do AIOX.
