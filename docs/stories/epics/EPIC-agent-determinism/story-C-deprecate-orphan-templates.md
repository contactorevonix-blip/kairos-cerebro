---
epic: EPIC-agent-determinism
story: C
title: "Deprecar/remover templates órfãos activation-instructions-*"
status: Draft
priority: P2
executor: "@skill-craftsman"
quality_gate: "@qa"
quality_gate_tools: [orphan_reference_check, deprecation_marker_validation, l2_governance_path_check]
effort: 1h
traces_to: [F4]
depends_on: []
layer: L2
---

# Story C — Deprecar/remover templates órfãos activation-instructions-*

## Status
Draft

## Story
**Como** mantenedor do framework AIOX no kairos-cerebro,
**Quero** que os templates de activação ABANDONADOS sejam claramente deprecados/removidos,
**Para** que ninguém os use por engano como referência futura, perpetuando o padrão errado.

## Contexto / Problema (rastreável a F4)
Em `.aiox-core/product/templates/` (L2) existem dois templates que descrevem um padrão de activação ABANDONADO:
- `activation-instructions-template.md` (v2.0, padrão GreetingBuilder/greeting-builder.js)
- `activation-instructions-inline-greeting.yaml` ("Option A", v2.0)

Nenhum corresponde ao padrão REAL em uso ("native context, zero JS execution", STEP 1-6 inline). Mantê-los sem marca de deprecação cria risco de adopção errada.

## Constraint crítica de boundary
Ambos os ficheiros estão em **L2** (`.aiox-core/product/templates/`). **NÃO podem ser editados/removidos directamente.** O caminho correcto é **proposta via `@aiox-master *propose-modification`** (deprecação documentada). Esta story produz a proposta e a documentação; a execução da remoção/marca em L2 é feita pelo fluxo de governança.

## Acceptance Criteria
1. **AC-C1 (F4):** Confirmar (re-verificar) que `activation-instructions-template.md` e `activation-instructions-inline-greeting.yaml` não são referenciados por nenhum dos SKILL.md dos 11 agentes nem pelo ideSync (grep por nome em `.claude/skills/` e `.aiox-core/development/agents/`).
2. **AC-C2 (governança):** Preparar uma proposta `@aiox-master *propose-modification` que especifica a deprecação dos 2 templates, com justificação (padrão abandonado vs padrão REAL) e a acção recomendada (adicionar header `DEPRECATED` + razão, OU remoção).
3. **AC-C3 (rastreabilidade):** A proposta documenta explicitamente que o padrão canónico é "native context, zero JS execution" e referencia este epic/story.
4. **AC-C4 (não-regressão):** Nenhum SKILL.md ou processo de activação muda como resultado desta story (os templates já estão órfãos).

## Scope
**IN:**
- Verificar órfandade dos 2 templates (grep de referências).
- Produzir a proposta de deprecação para @aiox-master.
- Documentar a decisão.

**OUT:**
- Editar/remover directamente ficheiros em L2 (proibido — via governança).
- Outros templates de `product/templates/` (78 ficheiros) — fora de scope.

## Tasks / Subtasks
- [ ] Grep por `activation-instructions-template` e `activation-instructions-inline-greeting` em `.claude/skills/` e `.aiox-core/development/agents/`
- [ ] Confirmar zero referências (órfãos) ou documentar referências encontradas
- [ ] Redigir proposta de deprecação (formato propose-modification)
- [ ] Encaminhar proposta para @aiox-master

## Dev Notes
- Ficheiros alvo (L2, read-only para esta story): `.aiox-core/product/templates/activation-instructions-template.md`, `.aiox-core/product/templates/activation-instructions-inline-greeting.yaml`.
- Caminho de execução em L2: `@aiox-master *propose-modification` (ver `.claude/rules/enforcement-gates.md` — boundary não-overridável a nível de hook).

## Risk
- **Risco:** remover um template ainda usado por upstream/clone tooling. **Mitigação:** AC-C1 (grep) + decisão preferir "marcar DEPRECATED" antes de "remover" se houver qualquer dúvida.

## Change Log
| Data | Autor | Alteração |
|---|---|---|
| 2026-06-13 | @pm (Morgan) | Story criada (Draft) a partir de F4 |

## File List
_(a preencher pelo executor)_

## QA Results
_(a preencher por @qa)_
