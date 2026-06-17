---
story_id: "10.3"
epic: EPIC-10
title: "Task Schema Normalization + Lifecycle + Circular-Ref Verify"
status: DRAFT
executor: "@dev"
quality_gate: "@qa"
quality_gate_tools: [schema_validation, version_normalization_test, circular_ref_verify]
effort: 8sp
risk: HIGH
---

# Story 10.3 — Task Schema Normalization + Lifecycle + Circular-Ref Verify

## Goal
Normalizar o campo `version` em todas as 218 tasks para o formato canónico, definir e aplicar uma política de lifecycle (`status` field) ao subset crítico, e **fechar formalmente** o claim de circular references com evidência verify-only (provar que não existem).

## Background (verified evidence — Art. IV)
O audit Cont37 alegou 8 schema violations, 3 circular refs e `task_id` 100%. Inspecção directa corrige e confirma:
- **REAL (fix):** version variants não-canónicos — 6 ficheiros `version: 2`, 1 `Version: 1` (capitalizado, `squad-creator-publish.md:63`), 1 `version: "1...` (aspas, `story-checkpoint.md:14`).
- **REAL (fix):** lifecycle ausente — `status:` em 7/218, `superseded_by:` em 0/218.
- **FALSO (verify-only):** "3 circular task references" — `qa-gate.md` Prerequisites NÃO referencia `validate-next-story`; zero loops literais `next:`/`prerequisite:` nos 4 ficheiros do story-cycle. Única cross-ref = sugestão advisory em `create-next-story.md:782` (correcta).
- **FALSO (verify-only):** `task_id` 218/218 → na verdade 5/218; 163 usam header `task:` V1.

## Acceptance Criteria
1. **Given** as 218 tasks, **when** a story completa, **then** todas usam o formato de `version` canónico (decisão documentada: ex. `version: 1.0.0` minúsculo, sem aspas) — 0 variants não-canónicos restantes.
2. Os ficheiros `version: 2` (environment-bootstrap, improve-self, run-workflow-engine, security-scan, setup-mcp-docker, sync-documentation) avaliados: confirmar se `2` é intencional (task genuinamente v2) ou erro — normalizar conforme.
3. `squad-creator-publish.md:63` (capitalizado) e `story-checkpoint.md:14` (aspas) corrigidos.
4. Política de lifecycle definida: campo `status` (active/deprecated/planning) documentado e aplicado ao subset crítico de tasks (mínimo: as do story-cycle + as referenciadas em rules).
5. **Verify-only (F7):** evidência documentada de que NÃO existem circular references nos 4 story-cycle tasks (provar, não corrigir). AC fecha o finding do audit com prova.
6. **Verify-only (F8):** inconsistência `task:` vs `task_id:` documentada; decisão se uniformizar header (fora do scope de fix se aditivo demais — documentar como tech-debt se assim for).
7. **No regression:** nenhuma alteração à lógica de qualquer task; só metadata. Tasks continuam invocáveis.

## Out of Scope
- Alterar a lógica/conteúdo executável de qualquer task.
- Adicionar `superseded_by` a todas as 218 (só onde aplicável).
- "Corrigir" circular refs (não existem — AC 5 é verify-only).

## Notes for @sm
Executor @dev (edição de metadata + validação), gate @qa. Risco HIGH porque edita L2 (`.aiox-core/development/tasks/`). `boundary.frameworkProtection: false` activo até 2026-06-19; se re-activar antes da execução, rotear via `@aiox-master *propose-modification`. Mudança é puramente normalizadora/aditiva, backward-compatible. AC 5 e AC 6 são verify-only — desmentem findings falsos do audit com evidência, não introduzem fix.
