---
epic: EPIC-agent-determinism
story: D
title: "Documentar development/ vs product/ (fonte de verdade) + resolver agent-teams órfão"
status: Ready
priority: P1
executor: "@architect + @skill-craftsman"
quality_gate: "@pm"
quality_gate_tools: [source_of_truth_decision_review, overlap_documentation_check, orphan_resolution_validation]
effort: 4h
traces_to: [F5, F6]
depends_on: []
blocks: [A, B]
layer: L3/L4
---

# Story D — development/ vs product/ (fonte de verdade) + agent-teams órfão

## Status
Ready

## Story
**Como** arquitecto do framework AIOX no kairos-cerebro,
**Quero** uma decisão documentada de "fonte de verdade por tipo de dependency" entre `development/` e `product/`,
**Para** que as Stories A e B apliquem mapeamentos de path corretos e não-ambíguos, e que o overlap deixe de ser uma armadilha.

## Contexto / Problema (rastreável a F5, F6)
Overlap não documentado (counts verificados):

| Tipo | development/ | product/ | data top-level |
|---|---|---|---|
| checklists | 5 | 16 | — |
| templates | 11 | 78 | — |
| data | 3 | — | 20+ |

`development/agent-teams/` contém 5 ficheiros (`team-all`, `team-fullstack`, `team-ide-minimal`, `team-no-ui`, `team-qa-focused`) — potencialmente órfão (não referenciado por SKILL.md).

## Esta story BLOQUEIA A e B
A decisão de fonte de verdade aqui é o input que as Stories A (mapeamento IDE-FILE-RESOLUTION) e B (paths de config) precisam para serem corretas. Sequenciar D antes de A/B, ou D+A na mesma wave com a decisão fixada primeiro.

## Acceptance Criteria
1. **AC-D1 (F6 — decisão):** Produzir uma tabela de **fonte de verdade por tipo de dependency** (tasks, workflows, checklists, templates, data, scripts/utils), indicando para cada tipo qual diretório é canónico (`development/`, `product/`, `data/` top-level, `infrastructure/`) e porquê. Baseline ground-truth desta auditoria:
   - tasks → `development/tasks/`
   - workflows → `development/workflows/`
   - checklists → `product/checklists/` (onde vivem os checklists referenciados pelos agentes, ex. pm-checklist.md)
   - templates → `product/templates/` (onde vivem os templates referenciados, ex. prd-tmpl.yaml)
   - data → `.aiox-core/data/` top-level (onde vive technical-preferences.md, workflow-chains.yaml)
   - scripts/utils → `infrastructure/scripts/` e/ou `development/scripts/` (documentar distinção)
2. **AC-D2 (documentação):** A decisão é escrita num doc de arquitectura versionado (ex. `docs/architecture/dependency-source-of-truth.md`) e referenciada por este epic. Inclui o que fazer com os ficheiros do diretório NÃO-canónico (ex. `development/checklists` 5 ficheiros: legacy? duplicados? distintos?).
3. **AC-D3 (F5 — agent-teams):** Determinar se `development/agent-teams/` é referenciado por algum SKILL.md/config (grep). Decidir e documentar uma de: (a) manter + ligar (referenciar onde é consumido), (b) marcar como legacy documentado, (c) propor remoção via `@aiox-master *propose-modification` (é L2). Registar a decisão.
4. **AC-D4 (handoff para A):** O mapeamento canónico de AC-D1 é entregue à Story A como input explícito (o texto exacto a colocar no bloco IDE-FILE-RESOLUTION).
5. **AC-D5 (boundary):** Qualquer recomendação de alterar conteúdo em L2 (development/ ou product/ ou infrastructure/) é formulada como proposta `@aiox-master *propose-modification`, não como edição directa.

## Scope
**IN:**
- Análise comparativa development/ vs product/ vs data/ por tipo.
- Grep de referências a `agent-teams`.
- Doc de arquitectura com a decisão (L4).

**OUT:**
- Mover/apagar ficheiros em L2 directamente.
- Alterar SKILL.md (isso é a Story A, que consome esta decisão).

## Tasks / Subtasks
- [ ] Inventariar o que está em development/{checklists,templates,data} vs product/{checklists,templates} (distintos vs duplicados)
- [ ] Determinar fonte de verdade por tipo com base em onde os agentes realmente resolvem dependencies
- [ ] Grep `agent-teams` em .claude/skills/, .aiox-core/development/agents/, core-config.yaml
- [ ] Escrever docs/architecture/dependency-source-of-truth.md
- [ ] Entregar mapeamento canónico à Story A; registar decisão agent-teams

## Dev Notes
- Diretórios: `.aiox-core/development/{tasks,workflows,checklists,templates,data,agent-teams,scripts}`, `.aiox-core/product/{checklists,templates,data}`, `.aiox-core/data/` (top-level), `.aiox-core/infrastructure/scripts/`.
- README existem: `.aiox-core/development/README.md`, `.aiox-core/product/README.md` — ler como contexto da intenção original.
- Doc de saída (L4): `docs/architecture/...` (editável).

## Risk
- **Risco:** decisão contradiz convenção upstream do aiox-core. **Mitigação:** documentar a divergência e, se material, propor alinhamento via @aiox-master; o mapeamento local prioriza o que resolve para ficheiros reais HOJE.

## Change Log
| Data | Autor | Alteração |
|---|---|---|
| 2026-06-13 | @pm (Morgan) | Story criada (Draft) a partir de F5/F6 |
| 2026-06-13 | @po (Pax) | Validated GO (8/10) — Status: Draft → Ready. F5/F6 reconfirmadas (agent-teams 5 ficheiros presentes; counts dev vs product). blocks: [A, B] confirmado coerente com depends_on das stories A/B. PRIMEIRA da sequência a executar |
| 2026-06-13 | @po (Pax) | Re-validation GO (8/10) confirmada. F6 counts re-verificados EXACTOS: dev/checklists=5, product=16; dev/templates=11, product=78; dev/data=3, data top-level=22 (≈"20+"). F5: agent-teams 5 ficheiros presentes e grep `agent-teams` = ZERO refs em skills/agents/config (órfão confirmado → AC-D3 pré-validada). Sequenciamento D→A/B coerente (blocks vs depends_on). Quality gate @pm ≠ executor (@architect+@skill-craftsman) OK |

## File List
_(a preencher pelos executores)_

## QA Results
_(a preencher por @pm — quality gate)_
