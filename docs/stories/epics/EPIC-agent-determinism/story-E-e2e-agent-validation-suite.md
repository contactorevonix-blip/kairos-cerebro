---
epic: EPIC-agent-determinism
story: E
title: "Suite E2E: activação + dependencies + 1 *task por agente (CI/doctor)"
status: Ready
priority: P1
executor: "@qa"
quality_gate: "@dev"
quality_gate_tools: [test_coverage_check, ci_integration_validation, regression_gate_test]
effort: 5h
traces_to: [Escopo Expandido a-e, F1, F2, F3]
depends_on: [A, B]
layer: L4
---

# Story E — Suite E2E: activação + dependencies + 1 *task por agente

## Status
Ready

## Story
**Como** responsável pela qualidade do sistema de agentes,
**Quero** uma suite automatizada que valide, para os 11 agentes core + aiox-master, o ciclo activação → dependencies → 1 *task,
**Para** que regressões de determinismo (paths fantasma, dependencies em falta) sejam detetadas em CI / `aiox doctor` e nunca cheguem a runtime.

## Contexto (rastreável a Escopo Expandido a-e do epic; valida F1, F2, F3)
A auditoria foi manual. Sem automação, os achados F1-F3 podem reaparecer (bug é upstream). Esta story formaliza a auditoria end-to-end como gate contínuo.

## Pré-requisito
Correr APÓS A e B (a suite deve passar contra o estado já corrigido; também serve de gate de aceitação para A e B).

## Acceptance Criteria
1. **AC-E1 (activação — Escopo a):** A suite verifica, para cada um dos 11 agentes + aiox-master, que o SKILL.md tem um bloco de activação STEP 1-6 bem-formado (greeting, role, status, commands, handoff suggestion 5.5, signature) e GREENFIELD GUARD presente.
2. **AC-E2 (dependencies — Escopo b; valida F1):** Para cada agente, a suite lê o bloco `dependencies:` e confirma que CADA entrada (tasks, workflows, checklists, templates, data, scripts/utils) existe e é legível no path REAL (conforme mapeamento canónico da Story D). Falha = lista de GAPs.
3. **AC-E3 (1 *task por agente — Escopo c):** Para cada agente, a suite seleciona >= 1 comando `*task {name}`, confirma que o task file referenciado existe, tem inputs/outputs definidos (Task-First), e (simulação/dry-run) que produziria o artefacto esperado.
4. **AC-E4 (handoff — Escopo d):** A suite valida que `.aiox-core/data/workflow-chains.yaml` + estrutura de `.aiox/handoffs/` produzem uma sugestão de "próximo comando" coerente para pelo menos os fluxos sm→dev→qa.
5. **AC-E5 (config — valida F2/F3):** A suite confirma que `devLoadAlwaysFiles`, `devDebugLog`, `toolsLocation` em `core-config.yaml` resolvem para paths existentes.
6. **AC-E6 (CI/doctor):** A suite é executável via um comando único (ex. `node tests/agents/agent-determinism.test.js` ou integrada em `aiox doctor`), retorna exit code != 0 em qualquer GAP, e produz um relatório legível (agente → dependency → estado).
7. **AC-E7 (verde):** Executada contra o estado pós-A/B, a suite passa (zero GAPs) para os 11 agentes + aiox-master.

## Scope
**IN:**
- Script de teste em `tests/` (L4) cobrindo AC-E1..E7.
- Relatório de GAPs.
- Integração com runner de CI / hook de `aiox doctor` (documentar como ligar).

**OUT:**
- Corrigir os SKILL.md/config (isso é A/B) — a suite só valida.
- Testar agentes não-core (squads/experts) — fora do conjunto dos 11+master (pode ser extensão futura).

## Tasks / Subtasks
- [ ] Definir lista canónica dos 11 agentes + aiox-master e os seus SKILL.md
- [ ] Implementar parser do bloco dependencies + resolução por mapeamento (Story D)
- [ ] Implementar checks AC-E1..E5
- [ ] Selecionar 1 *task por agente e implementar dry-run/existência (AC-E3)
- [ ] Implementar relatório + exit codes (AC-E6)
- [ ] Ligar a CI/aiox doctor; correr contra estado pós-A/B (AC-E7)

## Dev Notes
- SKILL.md: `.claude/skills/AIOX/agents/{agent}/SKILL.md`.
- Mapeamento de paths: consumir a decisão da Story D (`docs/architecture/dependency-source-of-truth.md`).
- workflow-chains: `.aiox-core/data/workflow-chains.yaml`; handoffs: `.aiox/handoffs/`.
- `aiox doctor` é L1 — NÃO editar o core; integrar via hook/registo permitido ou documentar o comando standalone como gate de CI.
- Preferir Node `node:test` (já usado em `tests/hooks/`).

## Risk
- **Risco:** suite frágil que falha por mudanças legítimas. **Mitigação:** asserts focados em existência/legibilidade de paths e estrutura de bloco, não em conteúdo textual volátil.

## Change Log
| Data | Autor | Alteração |
|---|---|---|
| 2026-06-13 | @pm (Morgan) | Story criada (Draft) a partir do Escopo Expandido + F1/F2/F3 |
| 2026-06-13 | @po (Pax) | Validated GO (9/10) — Status: Draft → Ready. 11 agentes core + aiox-master confirmados presentes em .claude/skills/AIOX/agents/. depends_on: [A, B] coerente (corre por último, gate de aceitação de A/B) |
| 2026-06-13 | @po (Pax) | Re-validation GO (9/10) confirmada. 11 SKILL.md re-verificados presentes (10 core: dev/qa/architect/pm/po/sm/analyst/data-engineer/ux-design-expert/devops + aiox-master). depends_on: [A,B] e ordem "por último" coerentes. node:test disponível (tests/hooks/). Nota Should-Fix herdada do epic: usar contagem canónica "11 SKILL.md (10 core + aiox-master)" em AC-E1/E2/E7 para evitar ambiguidade com o phrasing do PRD |

## File List
_(a preencher pelo executor)_

## QA Results
_(a preencher por @dev — quality gate)_
