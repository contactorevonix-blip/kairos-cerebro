---
story_id: "10.2"
epic: EPIC-10
title: "Agent System Single Source of Truth + Drift Audit"
status: DRAFT
executor: "@dev"
quality_gate: "@qa"
quality_gate_tools: [drift_detection_test, ideSync_validation, source_target_crossref]
effort: 8sp
risk: HIGH
---

# Story 10.2 — Agent System Single Source of Truth + Drift Audit

## Goal
Provar e documentar que o sistema de agentes tem uma fonte única de verdade (`ideSync.source: .aiox-core/development/agents`), produzir um relatório de drift entre source e os múltiplos targets, e re-sincronizar (via pipeline ideSync existente) qualquer divergência não-intencional.

## Background (verified evidence — Art. IV)
O audit Cont37 alegou "30 agentes duplicados sem fonte canónica". Inspecção directa corrige:
- Fonte única **existe**: `core-config.yaml → ideSync.source: .aiox-core/development/agents`.
- Os dirs `agents/` em `.claude/commands/*`, `.claude/skills/*`, `.codex`, `.antigravity`, `.github` são **sync targets por design**.
- `ideSync.validation.failOnDrift: true` e `strictMode: true` já configurados — mas **drift não foi auditado em runtime**.

O gap real é **provar a coerência source→targets e detectar drift**, não "criar uma fonte canónica que não existe".

## Acceptance Criteria
1. **Given** `ideSync.source` e `ideSync.targets` em `core-config.yaml`, **when** a story completa, **then** existe um drift report que compara o source com cada target e lista divergências (conteúdo, contagem, ficheiros órfãos).
2. Divergências classificadas como **intencionais** (formato por-IDE: condensed-rules, github-copilot, kimi-skill) vs **drift acidental** (conteúdo divergente que devia ser idêntico).
3. Drift acidental re-sincronizado **via pipeline ideSync existente** (não edição manual de cada target).
4. `docs/ARCHITECTURE.md` (de 10.1) ou doc dedicada documenta: fonte única, lista de targets, formato de cada target, e como correr a verificação de drift.
5. **Verify-only:** confirmar que `failOnDrift: true` dispara de facto em drift simulado (smoke test do mecanismo).
6. **No regression:** após re-sync, todos os agentes activáveis (`@dev`, `@qa`, `@pm`, etc.) continuam a activar correctamente; nenhum target perde ficheiros legítimos.

## Out of Scope
- Apagar agentes funcionais.
- Modificar a lógica do motor ideSync (L1/L2 — só consumir).
- Criar novos agentes.

## Notes for @sm
Executor @dev (auditoria + re-sync via tooling), gate @qa (regressão de activação). Risco HIGH porque re-sync mal feito parte activação de agentes. Audit-first: drift report ANTES de qualquer re-sync. Confirmar se `ideSync` tem CLI/script invocável (procurar em `.aiox-core/development/scripts` e `utils.executors → documentation-synchronizer`/`modification-synchronizer`).
