# EPIC-002: Framework Standardization — KAIROS_CEREBRO
**Gerado por:** @sm (River)
**Data:** 2026-05-31
**Contexto:** Auditoria completa @aiox-master detectou gaps críticos vs. padrão canónico AIOX

---

## Descrição

Blindar o KAIROS_CEREBRO com o padrão canónico AIOX completo. A auditoria identificou o SYNAPSE engine quebrado, 4 squads sem slash commands, e estrutura de ficheiros inconsistente.

---

## Goal do Epic

**KAIROS_CEREBRO 100% sincronizado com padrão AIOX — SYNAPSE activo, todos os squads activáveis por slash command.**

---

## Stories

| Story | Título | Prioridade | Executor | Esforço | Status |
|---|---|---|---|---|---|
| 2.1 | SYNAPSE hook entry point | P0 | @dev | 2h | Draft |
| 2.2 | Commands + Skills sync (4 squads) | P1 | @dev | 3h | Draft |
| 2.3 | Squad structure fixes | P2 | @dev | 1h | Draft |

---

## Gaps Identificados (Auditoria 2026-05-31)

| Gap | Severidade | Story |
|---|---|---|
| `synapse-engine.cjs` inexistente — SYNAPSE completamente quebrado | CRÍTICO | 2.1 |
| 4 squads sem `.claude/commands/` — slash cmds não funcionam | CRÍTICO | 2.2 |
| 4 squads sem `.claude/skills/` — activation pipeline incompleto | ALTO | 2.2 |
| `aiox-cerebro/agents/` vazia | ALTO | 2.3 |
| `readme.md` lowercase em squad-creator | MÉDIO | 2.3 |
| `mind-research-loop.md` na pasta errada | MÉDIO | 2.3 |

---

*EPIC-002 — KAIROS_CEREBRO Framework Standardization*
