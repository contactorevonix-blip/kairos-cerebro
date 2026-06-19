---
name: epic12-viability
description: EPIC-12 design validation — Three-Surface agent trap, 3 synapse/** boundary blocks, pipeline merge-point sequencing. Verdict AJUSTAR.
metadata:
  type: project
---

EPIC-12 (3 bloqueadores B1/B3/B2, 15 Critical Files) validado a 2026-06-19. Verdict: **AJUSTAR antes de proceder** (design viável, 1 premissa quebrada + 3 violações de boundary).

**Why:** Pedro desenhou EPIC-12 a tocar L1/L2 com flags de boundary. Precisava validar existência real dos ficheiros, camadas e merge points antes de build.

**How to apply:** Usar como baseline para qualquer story de EPIC-12. Os 4 ajustes obrigatórios estão abaixo.

## Three-Surface Agent Trap (pior que a "Two-Shim" da memória de auto-context)
Existem TRÊS superfícies de agente, não duas:
1. `.aiox-core/development/agents/*.md` — SOURCE (L2, git-tracked)
2. `.claude/commands/AIOX/agents/*.md` + `.claude/skills/AIOX/agents/*/SKILL.md` — GERADOS por `ide-sync/transformers/claude-code.js` (index.js linhas 63-64, 234, 252, 509)
3. `.claude/agents/aiox-*.md` (11 ficheiros) — HAND-AUTHORED subagent defs (frontmatter name/model:opus/tools:). **NENHUM gerador escreve aqui** (grep zero matches). B1 quer modificar #3 → risco de 3 cópias a divergir, não de órfão.

## Boundary blocks (verificado contra .claude/settings.json)
- `synapse/**` está em DENY (linhas 439-440): bloqueia task-resolver.js, session-manager.js, canonical-json.js. Rotear via `@aiox-master *propose-modification` OU mover task-resolver para L3 `.aiox-core/data/`.
- `config-cache.js` está em ALLOW explícito (linhas 451-452) → writable apesar de ser L1. Excepção feliz para B2.
- `development/scripts/*.js` (pipeline, agent-config-loader) NÃO listados → default-deny L2.

## Merge point: unified-activation-pipeline.js (31KB)
Tocado por B1+B2+B3 (3x). É single entry point das 12 activações (ACT-6). Recomendação: **PR-0 fundação** (introduz hook slots, estabiliza assinatura) → depois B2 → B1 → B3 em slots. Gate de regressão obrigatório: 255 testes EPIC-ACT (4 suites) por PR.

## Colisão de tests
Design propõe `tests/tasks/task-discovery.test.js` mas `tests/tasks/discovery.test.js` JÁ existe (REUSE check IDS).

Relacionado: [[project-control-plane-design]], auto-context memory project_two_shim_architecture.
