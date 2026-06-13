---
epic: EPIC-agent-determinism
story: A
title: "Corrigir IDE-FILE-RESOLUTION nos 11 SKILL.md"
status: Draft
priority: P0
executor: "@skill-craftsman"
quality_gate: "@qa"
quality_gate_tools: [path_resolution_validation, cross_agent_consistency_check, dependency_existence_test]
effort: 4h
traces_to: [F1]
depends_on: [D]
layer: L4
---

# Story A — Corrigir IDE-FILE-RESOLUTION nos 11 SKILL.md

## Status
Draft

## Story
**Como** agente AIOX que executa `*task`/`*workflow`,
**Quero** que a regra IDE-FILE-RESOLUTION mapeie cada tipo de dependency para o seu path REAL,
**Para** que a resolução de qualquer dependency seja determinística e nunca aponte para um ficheiro fantasma.

## Contexto / Problema (rastreável a F1)
O bloco `IDE-FILE-RESOLUTION` nos 11 SKILL.md declara uma fórmula única errada:
`Dependencies map to .aiox-core/development/{type}/{name}`.

Verificado nesta auditoria:
- `checklists/` → REAL: `.aiox-core/product/checklists/` (pm-checklist.md só existe aqui)
- `templates/` → REAL: `.aiox-core/product/templates/` (prd-tmpl.yaml só existe aqui)
- `data/` → REAL: `.aiox-core/data/` top-level (technical-preferences.md só existe aqui)
- `scripts/utils/` → REAL: `.aiox-core/infrastructure/scripts/` + `.aiox-core/development/scripts/`
- `tasks/` e `workflows/` → corretos em `.aiox-core/development/`

Bug é UPSTREAM (existe em github.com/SynkraAI/aiox-core), mas os SKILL.md em `.claude/skills/` são L4 (editáveis) — corrigir localmente.

## Pré-requisito
**Story D deve fixar a "fonte de verdade por tipo" antes desta story aplicar o mapeamento.** Se D ainda não concluiu, usar o mapeamento ground-truth verificado em F1 como baseline e revalidar após D.

## Acceptance Criteria
1. **AC-A1 (F1):** O bloco `IDE-FILE-RESOLUTION` de cada um dos 11 SKILL.md (`dev, qa, architect, pm, po, sm, analyst, data-engineer, ux-design-expert, devops, aiox-master`) substitui a fórmula única por um **mapeamento explícito por tipo**:
   - `tasks` → `.aiox-core/development/tasks/`
   - `workflows` → `.aiox-core/development/workflows/`
   - `checklists` → (path decidido na Story D — baseline `.aiox-core/product/checklists/`)
   - `templates` → (path decidido na Story D — baseline `.aiox-core/product/templates/`)
   - `data` → (path decidido na Story D — baseline `.aiox-core/data/`)
   - `scripts`/`utils` → (path decidido na Story D — baseline `.aiox-core/infrastructure/scripts/` ou `.aiox-core/development/scripts/`)
2. **AC-A2:** O exemplo inline do bloco (`Example: create-doc.md → ...`) permanece válido e aponta para o path real existente.
3. **AC-A3 (consistência):** Os 11 SKILL.md usam exactamente o mesmo texto de mapeamento (sem divergência entre agentes).
4. **AC-A4 (determinismo):** Para cada agente, TODAS as entradas declaradas no seu bloco `dependencies:` resolvem, via o novo mapeamento, para um ficheiro que existe e é legível (zero GAPs).
5. **AC-A5 (não-regressão):** O mecanismo de activação "native context, zero JS execution" (STEP 1-6) permanece inalterado; apenas o bloco IDE-FILE-RESOLUTION muda.

## Scope
**IN:**
- Editar o bloco `IDE-FILE-RESOLUTION` nos 11 SKILL.md em `.claude/skills/AIOX/agents/{agent}/SKILL.md`.
- Validar resolução de cada dependency declarada.

**OUT:**
- Alterar `dependencies:` (adicionar/remover entradas) — fora de scope.
- Alterar activation-instructions / commands / persona.
- Modificar o aiox-core upstream (proposta separada se necessário — ver Story D).
- Agentes não-core (squads, experts) — fora do conjunto dos 11.

## Tasks / Subtasks
- [ ] Aguardar/confirmar decisão de fonte de verdade da Story D
- [ ] Definir o texto canónico do mapeamento explícito por tipo
- [ ] Aplicar nos 11 SKILL.md (dev, qa, architect, pm, po, sm, analyst, data-engineer, ux-design-expert, devops, aiox-master)
- [ ] Para cada agente, listar dependencies e confirmar existência no path mapeado
- [ ] Registar quaisquer GAPs residuais para a Story E

## Dev Notes
- Path dos ficheiros: `.claude/skills/AIOX/agents/{agent}/SKILL.md` (L4).
- O bloco a alterar está nas linhas iniciais do YAML (`IDE-FILE-RESOLUTION:`), ex. linhas ~20-25 no SKILL.md do pm.
- NÃO tocar em `.aiox-core/development/agents/*.md` (fonte do ideSync, L2) — se a correcção precisar de propagar à fonte, abrir proposta via `@aiox-master *propose-modification`.

## Risk
- **Risco:** divergência entre os 11 ficheiros. **Mitigação:** AC-A3 + verificação Story E.

## Change Log
| Data | Autor | Alteração |
|---|---|---|
| 2026-06-13 | @pm (Morgan) | Story criada (Draft) a partir de F1 |

## File List
_(a preencher pelo executor)_

## QA Results
_(a preencher por @qa)_
