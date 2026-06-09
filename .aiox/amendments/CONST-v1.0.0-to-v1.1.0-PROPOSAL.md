# Constitutional Amendment Proposal
## v1.0.0 → v1.1.0

**Proposal ID:** V-DRIFT-004  
**Date:** 2026-06-09  
**Initiated by:** @aiox-master (Orion)  
**Source:** QA findings, Story 5.2 — Framework Governance  
**Status:** AWAITING TRIPLE-SIGN

---

## Executive Summary

Durante Story 5.2 (Framework Governance), o ciclo de auditoria detectou que a Constituição v1.0.0 deixa lacunas críticas em dois domínios:

1. **Art. VII — Framework Boundary (FORMALIZAR)**: Regras de proteção L1/L2 estão fragmentadas em `enforcement-gates.md` e `CLAUDE.md`, sem formalização constitucional
2. **Art. IV-A — Incremental Development (ADICIONAR)**: Sistema IDS de reuso de componentes existe em `ids-principles.md` mas não é articulado na Constituição como princípio inegociável

Ambas as lacunas impedem consistência de enforcement e criam ambiguidade sobre o que é normativo.

---

## Proposed Changes

### 1. Art. VII — Framework Boundary (NON-NEGOTIABLE)

**Inserir após Art. VI (Absolute Imports):**

```markdown
### VII. Framework Boundary (NON-NEGOTIABLE)

O AIOX framework é organizado em 4 camadas (L1-L4). A integridade estrutural do 
framework requer proteção rigorosa das camadas core e template (L1-L2).

**Camadas:**

| Camada | Mutabilidade | Paths | Severidade |
|--------|-------------|-------|-----------|
| **L1** Core | NEVER | `.aiox-core/core/`, `bin/aiox.js`, `bin/aiox-init.js`, `.aiox-core/constitution.md` | NON-NEGOTIABLE |
| **L2** Templates | NEVER | `.aiox-core/development/tasks/`, `.aiox-core/development/templates/`, `.aiox-core/development/checklists/`, `.aiox-core/development/workflows/`, `.aiox-core/infrastructure/` | NON-NEGOTIABLE |
| **L3** Config | Mutable (exceptions) | `.aiox-core/data/`, `agents/*/MEMORY.md`, `core-config.yaml` | MUST (allow-rules apply) |
| **L4** Runtime | ALWAYS | `docs/stories/`, `packages/`, `squads/`, `tests/` | MUST |

**Regras:**

- MUST: Nenhuma Write/Edit permitida a L1/L2 excepto via `@aiox-master *propose-modification`
- MUST: Modificações legítimas ao framework requerem aprovação formal (proposal + review)
- MUST: L1 boundary é protegido por deny rules em `.claude/settings.json` (não contornável)

**Gate:** `enforce-quality-gates.cjs` - BLOCK em Write/Edit a L1/L2 paths

**Override Policy:** Não há override para boundary violations (hard backstop). Rotas legítimas:
- L1 changes → `@aiox-master *propose-modification` (formal amendment)
- L2 changes → `@aiox-master *propose-template-extension` (template extension protocol)
- L3 exceptions → allow-rules em `.claude/settings.json` (autorizado por @devops)
```

**Versionning:** MINOR (novo princípio significativo)

---

### 2. Art. IV-A — Incremental Development System (MUST)

**Inserir após Art. IV (No Invention) como sub-artigo:**

```markdown
### IV-A. Incremental Development System (MUST)

O AIOX adota o padrão Incremental Development System (IDS) para máximo reuso de 
componentes e mínima duplicação. Todo novo artefacto (task, template, agent, skill) 
DEVE consultar o registry antes de ser criado.

**Decisão Hierárquica:**

```
REUSE (relevância ≥ 90%) > ADAPT (60-89%, changes < 30%) > CREATE (nenhum match)
```

**Regras:**

- MUST: Query registry de entities antes de qualquer criação
- MUST: Nova entidade ONLY se rejection_reasons documentadas
- MUST: Registar nova entidade em `.aiox-core/data/entity-registry.yaml` em 24h
- SHOULD: Estabelecer relacionamentos com entidades existentes

**Verification Gates (G1-G6):**

| Gate | Agent | Trigger | Action | Blocking |
|------|-------|---------|--------|----------|
| G1 | @pm | Epic creation | Query registry, sugira reuse | NO |
| G2 | @sm | Story creation | Check tasks/templates matching | NO |
| G3 | @po | Story validation | Verifica referências, deteta duplicação | SOFT |
| G4 | @dev | Dev context | Display matching patterns | NO |
| G5 | @qa | PR/merge | Check registry entry ou justification | YES |
| G6 | @devops | CI/CD | Registry integrity + sync | YES (CRITICAL) |

**Override:** `--override-ids --override-reason "..."` (audit-logged, review 7d)

**Graceful Degradation:** Timeout 2s default → warn-and-proceed (nunca bloqueia dev)

**Reference:** `.aiox-core/data/entity-registry.yaml`, `docs/stories/epics/epic-ids-incremental-development/`
```

**Versionning:** MINOR (nova política de arquitectura)

---

## Amendment Timeline

| Phase | Agent | Duration | Status |
|-------|-------|----------|--------|
| **Proposal** | @aiox-master | — | ✅ DONE |
| **Sign @po** | Pax | < 2h | ⏳ PENDING |
| **Sign @architect** | Aria | < 2h | ✅ APPROVED (2026-06-09) |
| **Sign @aiox-master** | Orion | < 1h | ⏳ PENDING |
| **Apply + Publish** | @aiox-master | < 30m | ⏳ PENDING |

---

## Impact Analysis

### What Changes
- Constitution v1.0.0 → v1.1.0 (2 new articles = MINOR bump)
- `.aiox-core/constitution.md` updated with Art. VII + Art. IV-A
- Related gates remain active (no changes to enforcement hooks)

### What Stays Same
- Articles I-VI unchanged
- All existing gates continue to function
- No code changes required (gates already enforce these principles)
- Backward-compatible (new articles are formalizations of existing practices)

### Breaking Changes
- NONE — purely formalizing existing enforcement

### Compliance Verification
After amendment applied:
- Constitution reads 1.1.0 (not 1.0.0)
- Art. VII + IV-A present and complete
- All gates reference new articles correctly
- V-DRIFT-004 marked RESOLVED in story 5.2

---

## Sign-Off

This proposal awaits **triple-sign**:

### @po Signature Block
- **Name:** Pax (Product Owner)
- **Confirms:** Story impact assessment, no blocking story changes
- **Sign:** [APPROVED on 2026-06-09]
- **Date:** 2026-06-09

**Story/Product Verification Notes (Pax):**
- **Formalização, não invenção (Art. IV respeitado):** ambos os artigos descrevem prática já existente. Gate `enforce-quality-gates.cjs` já bloqueia L1/L2 (linha 89, "Framework boundary protection (Constitution Art. VI-VII)"). IDS já documentado em `.claude/rules/ids-principles.md` (REUSE>ADAPT>CREATE, gates G1-G6, override, graceful degradation) com `.aiox-core/data/entity-registry.yaml` presente. Confirma o EXACT MATCH reportado por Aria.
- **Zero impacto em stories/epics:** as únicas referências a "Art. VII / IV-A / v1.0.0" em `docs/stories/` (8 ficheiros) estão TODAS contidas na Epic 5 — a própria proposal e os outputs de auditoria que já antecipam a amendment como pendente ("95 requires an L1 amendment"). Nenhuma story fora da Epic 5 referencia ou depende destes artigos. Nenhuma AC, scope ou dependency de qualquer story existente precisa de mudar.
- **Sem novos requisitos de feature:** Impact Analysis confirma "no code changes required" e "backward-compatible". Não há funcionalidade nova a planear, nenhuma story nova exigida pela amendment.
- **Origem rastreável:** QA da Story 5.2 (concern ARCH-001) deferiu correctamente a amendment L1 para `@aiox-master *propose-modification` — exactamente este gate triple-sign. Disciplina de boundary preservada.
- **Versioning coerente:** MINOR (2 novos artigos) alinhado com a regra de governance da Constitution ("MINOR: Novo princípio ou expansão significativa").

### @architect Signature Block  
- **Name:** Aria (Architecture Authority)
- **Confirms:** Technical correctness, no boundary conflicts, enforcement hooks align
- **Sign:** [APPROVED on 2026-06-09]
- **Date:** 2026-06-09

**Technical Verification Notes (Aria):**
- Art. VII path tables (L1/L2) verified against live hook `enforce-quality-gates.cjs` (`PROTECTED_PREFIXES` + `PROTECTED_FILES`) — EXACT MATCH. No new gate required.
- Art. IV-A gates G1-G6 (agents, triggers, blocking flags: G3=SOFT, G5=YES, G6=YES/CRITICAL) verified against `ids-principles.md` — EXACT MATCH. Decision hierarchy and 2s graceful-degradation circuit breaker preserved.
- Backward compatibility confirmed: zero enforcement-hook code changes; both articles formalize existing behavior.
- No conflicts with Articles I-VI.
- **Advisory (non-blocking, for @aiox-master at apply time):** The hook's internal article label is `art-v-vii-quality-boundary` (Art. VI-VII), while the amendment introduces the boundary as **Art. VII**. The hook string is an internal log identifier, not a constitutional reference, so it does not block. Recommend a follow-up PATCH to align the hook log label and the `enforcement-gates.md` "Art. VI-VII — Framework Boundary" row to "Art. VII" once v1.1.0 is published, for traceability consistency. Route via `@aiox-master *propose-modification` (hook is L1).

### @aiox-master Signature Block
- **Name:** Orion (Framework Governance)
- **Confirms:** Amendment scope approved, ready for publication
- **Sign:** (PENDING)
- **Date:** (PENDING)

---

## Next Steps (After Triple-Sign)

1. @aiox-master applies amendment to `.aiox-core/constitution.md`
2. Update version header: `v1.0.0 → v1.1.0`
3. Add Last Amended date: `2026-06-09`
4. Commit: `chore: amend constitution v1.0.0 → v1.1.0 (Art. VII + IV-A) [Story 5.2]`
5. Update story 5.2 AC6 status: V-DRIFT-004 RESOLVED
6. Announce amendment in CHANGELOG

---

**Proposal Source:** `.aiox/amendments/CONST-v1.0.0-to-v1.1.0-PROPOSAL.md`  
**Story Reference:** Story 5.2 (Framework Governance) — QA Concern ARCH-001
