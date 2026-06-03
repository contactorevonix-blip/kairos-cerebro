# MEMORY — Squad process-mapper

**Última actualização:** 2026-06-03
**Squad:** process-mapper
**Status:** OPERACIONAL — 26/26 = 100%

## O que este squad já mapeou

### Processos (D1) — 7/7 ✅
sdc · qa-loop · spec-pipeline · brownfield · agent-authority · story-lifecycle · planning-tracks

### Agentes (D2) — 14/14 ✅
authority-map (12 agentes) · handoff-flows (4 flows)

### Estrutura (D3) — 2/2 ✅
aiox-layers (L1-L4) · squad-anatomy (22 pastas)

### Ficheiros (D4) — 230/230 ✅
task-index (213 tasks) · rules-index (15 rules)

### Evolução (D5) — 2/2 ✅
timeline (19 eventos) · process-debt (0 issues)

## Agentes e bases DNA

| Agente | Base | Score |
|--------|------|-------|
| flow-architect | Gene Kim (DevOps Handbook 2016) | 88/100 |
| agent-cartographer | Rummler-Brache (Improving Performance 1990) | ~85/100 |
| map-validator | W.E. Deming (Out of the Crisis 1982) | 82/100 |
| evolution-tracker | Tom Gilb (Competitive Engineering 2005) | 80/100 |
| cartographer-chief | Original | — |
| process-auditor | Gene Kim Current State Map | — |
| structure-mapper | Original (.claude/CLAUDE.md) | — |

## Decisões tomadas

- Gate pré-criação: UserPromptSubmit hook síncrono, regex `^[@*]\S*(create|draft)`, bypass `--skip-map-gate`
- process-registry.yaml: 224 entradas (11 rules + 213 tasks)
- ADR-PM-002: gate só activo APÓS EPIC-PM-001 Done ✅
- Voice DNA fraco (68%) no alan-nicolas — docs institucionais. Novos minds: usar livros publicados Tier 0

## O que falta completar

- `hooks/process-map-updater.cjs` — FR-05 actualização automática (PostToolUse)
- Smoke tests formais por agente (3 por agente × 7 = 21 total)
