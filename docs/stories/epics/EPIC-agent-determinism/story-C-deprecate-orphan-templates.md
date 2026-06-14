---
epic: EPIC-agent-determinism
story: C
title: "Deprecar/remover templates órfãos activation-instructions-*"
status: Done
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
Done

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
- [x] Grep por `activation-instructions-template` e `activation-instructions-inline-greeting` em `.claude/skills/` e `.aiox-core/development/agents/`
- [x] Confirmar zero referências (órfãos) ou documentar referências encontradas
- [x] Redigir proposta de deprecação (formato propose-modification)
- [x] Encaminhar proposta para @aiox-master

## Dev Notes
- Ficheiros alvo (L2, read-only para esta story): `.aiox-core/product/templates/activation-instructions-template.md`, `.aiox-core/product/templates/activation-instructions-inline-greeting.yaml`.
- Caminho de execução em L2: `@aiox-master *propose-modification` (ver `.claude/rules/enforcement-gates.md` — boundary não-overridável a nível de hook).

## Risk
- **Risco:** remover um template ainda usado por upstream/clone tooling. **Mitigação:** AC-C1 (grep) + decisão preferir "marcar DEPRECATED" antes de "remover" se houver qualquer dúvida.

## Change Log
| Data | Autor | Alteração |
|---|---|---|
| 2026-06-13 | @pm (Morgan) | Story criada (Draft) a partir de F4 |
| 2026-06-13 | @po (Pax) | Validated GO (8/10) — Status: Draft → Ready. F4 reconfirmada (ambos os templates presentes em L2). Caminho de governança (propose-modification, NÃO edição directa L2) verificado correcto contra enforcement-gates.md |
| 2026-06-13 | @po (Pax) | Re-validation GO (8/10) confirmada. F4 re-verificada: 2 templates órfãos presentes em product/templates/ (L2). AC-C1 (órfandade) PRÉ-VALIDADA pelo @po: grep dos nomes exactos `activation-instructions-template`/`activation-instructions-inline-greeting` = ZERO refs em .claude/skills/ e .aiox-core/development/agents/ (os hits de `activation-instructions` são a chave YAML genérica, não refs ao template). Boundary L2→propose-modification correcto. Executor @skill-craftsman existe |
| 2026-06-14 | @skill-craftsman (Anvil) | Status: Ready → InProgress. Re-confirmado AC-C1 via Grep tool independente: `activation-instructions-template` e `activation-instructions-inline-greeting` = ZERO matches em `.claude/skills/` e `.aiox-core/development/agents/` (4 greps, todos 0 resultados). Confirma pré-validação do @po |
| 2026-06-14 | @skill-craftsman (Anvil) | Status: InProgress → InReview. Criada proposta de deprecação em `docs/architecture/proposals/propose-deprecate-activation-instructions-templates.md` (AC-C2/AC-C3): justificação padrão abandonado (GreetingBuilder/greeting-builder.js, "Option A" v2.0, Story 6.1.2.5) vs padrão real (native context, zero JS execution, STEP 1-6 inline com STEP 5.5 handoff check), evidência do grep AC-C1, acção recomendada = marcar DEPRECATED (não remover, conforme Risk), caminho de execução `@aiox-master *propose-modification`. AC-C4: nenhum SKILL.md ou processo de activação alterado por esta story |
| 2026-06-14 | @qa (Quinn) | Quality gate **PASS**. Status: InReview → Done. 3/3 quality_gate_tools PASS (orphan_reference_check, deprecation_marker_validation, l2_governance_path_check). AC-C1/AC-C2/AC-C3/AC-C4 todos verificados independentemente. Commit revisto: a777208 |

## File List
- `docs/architecture/proposals/propose-deprecate-activation-instructions-templates.md` (criado — proposta de deprecação para @aiox-master *propose-modification)

## QA Results

**Reviewer:** @qa (Quinn) · **Date:** 2026-06-14 · **Commit reviewed:** `a777208`
**Gate Verdict:** **PASS** · **Status transition:** InReview → Done

### Quality Gate Tools

| Tool | AC | Result | Evidence |
|------|----|--------|----------|
| `orphan_reference_check` | AC-C1 | **PASS** | 4 independent Greps for exact filenames `activation-instructions-template` and `activation-instructions-inline-greeting` in `.claude/skills/` and `.aiox-core/development/agents/` → 0 matches each. Corroborates @po pre-validation and @skill-craftsman re-check. |
| `deprecation_marker_validation` | AC-C2, AC-C3 | **PASS** | Proposal specifies: (a) both exact L2 paths with version metadata; (b) justification — abandoned GreetingBuilder/`greeting-builder.js` v2.0 / "Option A" inline-logic (Story 6.1.2.5) vs canonical "native context, zero JS execution" STEP 1-6 inline; (c) recommended action = add `DEPRECATED` header, do NOT remove (per Risk mitigation); (d) explicit references to EPIC-agent-determinism, Story C, finding F4. |
| `l2_governance_path_check` | AC-C2, AC-C5(epic) | **PASS** | Proposal performs no Write/Edit on L2 (`.aiox-core/product/templates/` files unmodified — confirmed mtime + git diff). Commit `a777208` touches only L4: the proposal doc + this story. Documented execution path = `@aiox-master *propose-modification` with concrete invocation examples. Both L2 target files still present (not directly removed). |

### Acceptance Criteria Traceability

| AC | Verdict | Notes |
|----|---------|-------|
| AC-C1 (orphandade) | MET | Zero references confirmed independently. |
| AC-C2 (governance proposal) | MET | propose-modification proposal complete with justification + recommended action. |
| AC-C3 (rastreabilidade) | MET | Canonical pattern documented; epic/story/F4 referenced. |
| AC-C4 (não-regressão) | MET | `git show --stat a777208`: 2 files (proposal + story). Zero SKILL.md / activation-process changes. |

### Notes / Observations
- Non-blocking: 7 incidental name hits exist in registry/manifest/inventory artifacts (`entity-registry.yaml`, `install-manifest.yaml`, `service-registry.json`, etc.). These are file-path catalog entries, **not** functional consumers of the templates — they do not affect orphan status or the verdict. AC-C1 scope (`.claude/skills/`, `.aiox-core/development/agents/`) is clean.
- Boundary discipline exemplary: the story correctly produced an L4 proposal rather than touching L2 directly, fully aligned with `enforcement-gates.md` (Art. VI-VII, non-overridable at hook layer).

### Gate (machine-readable)
```yaml
storyId: EPIC-agent-determinism/Story-C
verdict: PASS
commitReviewed: a777208
quality_gate_tools:
  orphan_reference_check: PASS
  deprecation_marker_validation: PASS
  l2_governance_path_check: PASS
issues: []
```
