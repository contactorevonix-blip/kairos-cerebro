---
epic: EPIC-agent-determinism
story: D
title: "Documentar development/ vs product/ (fonte de verdade) + resolver agent-teams órfão"
status: Done
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
Done

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
- [x] Inventariar o que está em development/{checklists,templates,data} vs product/{checklists,templates} (distintos vs duplicados)
- [x] Determinar fonte de verdade por tipo com base em onde os agentes realmente resolvem dependencies
- [x] Grep `agent-teams` em .claude/skills/, .aiox-core/development/agents/, core-config.yaml
- [x] Escrever docs/architecture/dependency-source-of-truth.md
- [x] Entregar mapeamento canónico à Story A; registar decisão agent-teams

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
| 2026-06-13 | @architect (Aria) | Status: Ready → InProgress. Executada análise comparativa development/ vs product/ vs data/ top-level por tipo de dependency (tasks, workflows, checklists, templates, data, scripts/utils), com grep de `agent-teams` em `.claude/skills/`, `.aiox-core/development/agents/` e `core-config.yaml` (ZERO referências confirmadas) |
| 2026-06-13 | @architect (Aria) | Status: InProgress → InReview. Criado `docs/architecture/dependency-source-of-truth.md` (350 linhas) cobrindo AC-D1 (tabela de fonte de verdade por tipo, incl. distinção scripts/utils infrastructure/ vs development/), AC-D2 (disposição dos directórios NÃO-canónicos: development/checklists, development/templates, development/data, product/data, infrastructure/templates — todos KEEP com propósito documentado, mudanças L2 formuladas como propostas `@aiox-master *propose-modification`), AC-D3 (development/agent-teams/ confirmado órfão → decisão (b) marcar como legacy documentado, com proposta de deprecação/remoção via @aiox-master), AC-D4 (handoff explícito à Story A: bloco YAML de substituição para IDE-FILE-RESOLUTION + tabela canónica machine-readable), AC-D5 (todas as alterações L2 recomendadas formuladas como propostas, nenhuma edição directa). Pronto para quality gate @pm |
| 2026-06-13 | @pm (Morgan) | Quality gate: PASS — Status: InReview → Done. source_of_truth_decision_review=PASS (AC-D1/AC-D4: tabela 6 tipos com evidência; resolução product/ vs development/ verificada independentemente; bloco YAML drop-in accionável), overlap_documentation_check=PASS (AC-D2/AC-D5: 5 directórios não-canónicos justificados; mudanças L2 como propostas @aiox-master), orphan_resolution_validation=PASS (AC-D3: agent-teams órfão re-confirmado por grep ZERO refs; decisão legacy+removal via @aiox-master). Stories A e B DESBLOQUEADAS |

## File List
- `docs/architecture/dependency-source-of-truth.md` (novo — AC-D1 a AC-D5)

## QA Results

**Quality gate:** @pm (Morgan) — 2026-06-13
**Veredicto:** **PASS**
**Artefacto revisto:** `docs/architecture/dependency-source-of-truth.md` (350 linhas, L4)

### quality_gate_tools (3/3)

| Tool | Verdicto | Observação |
|---|---|---|
| **source_of_truth_decision_review** (AC-D1, AC-D4) | **PASS** | Tabela de fonte de verdade completa para os 6 tipos (tasks, workflows, checklists, templates, data, scripts/utils), cada um com diretório canónico + evidência. Verificado independentemente: `pm-checklist.md`/`architect-checklist.md` resolvem em `product/checklists/` (não `development/`), `prd-tmpl.yaml`/`architecture-tmpl.yaml` em `product/templates/`, `technical-preferences.md` em top-level `data/` — confirma que a fórmula única antiga estava errada para 4/6 tipos. Distinção scripts `infrastructure/` vs `development/` documentada (§2.1). AC-D4 accionável: bloco YAML drop-in para `IDE-FILE-RESOLUTION` (§5.1) + tabela machine-readable (§5.2). |
| **overlap_documentation_check** (AC-D2, AC-D5) | **PASS** | Disposição dos 5 directórios NÃO-canónicos documentada com justificação (§3.1–3.5): `development/checklists` (framework-internal), `development/templates` (scaffolding), `development/data` (authoring), `product/data` (domain refs, fallback), `infrastructure/templates` (bootstrap) — todos KEEP com propósito. Toda mudança L2 formulada como PROPOSAL via `@aiox-master *propose-modification` (self-critique reconciliação §3.1, README stale §3.6), nenhuma edição directa (§6). |
| **orphan_resolution_validation** (AC-D3) | **PASS** | `development/agent-teams/` (5 ficheiros) confirmado órfão — grep re-verificado pelo gate: ZERO referências em `.claude/skills/`, `.aiox-core/development/agents/`, `core-config.yaml`. Decisão (b) marcar como legacy documentado, com caminho de remoção coordenada (regen de manifests) via @aiox-master. Sinal extra de staleness: `team-all.yaml` referencia IDs de agente defuntos. |

### Observações
- Ground-truth F6 re-confirmado pelo gate: dev/checklists=5, product=16; dev/templates=11, product=78; dev/data=3, data top-level=22. Coincide com baseline do epic.
- Nuance de contagem divulgada honestamente: header da story diz "templates 11 vs 78" (entradas top-level); o doc reporta 35 vs 96 (file counts recursivos, porque `development/templates/` contém bundles multi-ficheiro). Ambas as vistas concordam na direcção (product/ é o store maior, agent-facing). Transparência, não invenção (Art. IV OK).
- Art. IV (No Invention): todos os achados rastreiam a F5/F6; nenhum achado inventado fora do escopo.
- Art. V/VI (Boundary): apenas L4 editado (doc + story). Nenhuma edição directa em L1/L2.

### Desbloqueio
Story D `blocks: [A, B]` → **Stories A e B DESBLOQUEADAS**. AC-D4 (§5) é o input directo para a Story A (reescrita de `IDE-FILE-RESOLUTION`) e §5.2 para a Story B (paths de config).
