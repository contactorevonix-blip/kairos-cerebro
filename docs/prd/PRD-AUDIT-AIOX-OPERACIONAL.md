# PRD — Auditoria AIOX Operacional 100%

**Product:** AIOX Framework Operational Readiness  
**Owner:** Morgan (@pm)  
**Status:** DRAFT  
**Created:** 2026-06-08  
**Target Release:** End of Session 2026-06-08 (Cont 8)

---

## Executive Summary

PHASE 1-4 entregaram 117sp e construíram a **infraestrutura de automação** do AIOX framework (hooks de enforcement, agent activation tracking, handoff consolidation, state sync). Tudo está **configurado** em ficheiros (`settings.json`, `.claude/rules/`, `.synapse/`), mas não foi **auditado** para verificar funcionamento real.

Esta auditoria vai:
1. ✅ Verificar que todos os 25 hooks registados funcionam de facto
2. ✅ Confirmar que 9 domínios críticos estão em conformidade (Art. I-VII)
3. ✅ Gerar AUDIT-REPORT.md como fonte única de verdade operacional
4. ✅ Unblock EPIC 5.x (Stories 5.1-5.8 de operacionalization)

**Constraint:** Zero invenção (Art. IV) — cada achado deve ter origem rastreável (ficheiro, linha, git log, métricas).

---

## Problem Statement

### Hoje
- 25 hooks registados em `settings.json` — nenhum auditado em runtime
- `.aiox-core/` configurado — não verificado se está protegido (L1/L2 deny rules)
- `.synapse/` agent definitions existem — não testadas ponta-a-ponta
- `.claude/rules/` (10 rules) documentadas — não verificadas contra código
- STATE.md reporta "AIOX CONFIGURED but NOT OPERATIONALIZED" desde PHASE 2

### Risco
- Hooks podem estar partidos (não detectado)
- Framework boundary (L1-L4) pode ter furos (scripts podem editar L1)
- Agent authority (Art. II) pode estar violado sem detecção
- Documentation pode estar desincronizada com comportamento real
- EPIC 5.x stories não podem começar sem baseline auditado

### Success Criteria
Após auditoria:
- [ ] AUDIT-REPORT.md gerado (8+ páginas, rastreável)
- [ ] 9 domínios 100% auditados (0 skipped)
- [ ] Cada achado tem origem (ficheiro:linha ou commit)
- [ ] Zero invenções (0 "provavelmente funciona")
- [ ] Bloqueadores identificados para EPIC 5.x
- [ ] Stories 5.1-5.8 desbloqueadas com requisitos claros

---

## Requirements

### Functional Requirements (FR)

| ID | Requirement | Source | Verification |
|---|---|---|---|
| **FR1** | Auditar 9 domínios (Framework, Automação, Agentes, CI/CD, Código, Testes, Docs, Config, AGENTS.md) | AUDIT-PLAN.md § 2 | 9/9 domínios com ≥ 3 verificações cada |
| **FR2** | Para cada verificação: registar estado (✅ / ❌ / ⚠️) com evidência | AUDIT-PLAN.md § Rastreabilidade Rigorosa | 100% das verificações têm origem documentada |
| **FR3** | Gerar AUDIT-REPORT.md (8+ páginas) com achados, recomendações e rastreabilidade | AUDIT-PLAN.md § Deliverable | Report ≥ 8 páginas, estruturado por domínio |
| **FR4** | Verificar Art. IV compliance (No Invention): nenhum statement assumido | AUDIT-PLAN.md § Art. IV Compliance | Sem "provavelmente", "deve estar", "assume-se" |
| **FR5** | Identificar bloqueadores para EPIC 5.x | AUDIT-PLAN.md § Bloqueadores | Cada bloqueador: descrição + fix requerida |
| **FR6** | Cross-reference STATE.md GAPs: cada GAP mapeado a story de fix (5.1-5.8) | EPIC-AIOX-OPERACIONAL.md § Stories | Todos os 7 GAPs (G1-G7) têm story correspondente |

### Non-Functional Requirements (NFR)

| ID | Requirement | Target |
|---|---|---|
| **NFR1** | Effort | 12-14 story points |
| **NFR2** | Documentação | AUDIT-REPORT.md em Markdown, links rastreáveis |
| **NFR3** | Rastreabilidade | Cada finding: ficheiro, linha, ou commit hash |
| **NFR4** | Conformidade | AIOX Constitution Art. I-VII e rules `.claude/rules/*` |
| **NFR5** | Zero invenção | 0 suposições — tudo verificado |

### Constraints

| Constraint | Impact |
|---|---|
| **L1/L2 NEVER modify** | Framework core protegido — deny rules apenas auditar |
| **Art. IV strict** | Nenhuma descoberta sem origem documentada |
| **Task-first** | Auditoria é task dentro de workflow SDC |
| **No feedback loops** | Auditoria → relatório, não iterativa |

---

## Scope

### IN Scope
- ✅ Auditar `.aiox/`, `.aiox-core/data/`, `.synapse/`, `.claude/`
- ✅ Testar hooks em runtime (smoke tests com input simulado)
- ✅ Verificar conformidade com Constitution (Art. I-VII)
- ✅ Rastrear todos os achados a origem (ficheiro/linha/commit)
- ✅ Documentar bloqueadores para EPIC 5.x
- ✅ Gerar AUDIT-REPORT.md (fonte única de verdade)

### OUT of Scope
- ❌ Modificar `.aiox-core/core/` (L1 — framework core)
- ❌ Reescrever automação (apenas auditar)
- ❌ Criar novas features (EPIC 5.x stories fazem isso)
- ❌ Mudar Constitution ou regras (apenas verificar conformidade)
- ❌ Auditar Kairos Check product code (apenas AIOX framework)

---

## 9 Auditoria Domains

| # | Domain | Files/Folders | Key Checks | Effort |
|---|--------|---|---|---|
| **D1** | AIOX Framework (`.aiox` + `.aiox-core`) | 50+ | L1 protection, version consistency, registry completeness | 2sp |
| **D2** | Automação Claude Code (`.claude` + hooks) | 25+ | Hook registry vs actual files, deny/allow rules, test coverage | 2sp |
| **D3** | Sistema de Agentes (`.synapse` + agent definitions) | 30+ | Agent definitions, command registry, authority matrix, metrics | 2sp |
| **D4** | CI/CD & Deployment (`.github` + Railway/Vercel) | 15+ | Workflow existence, pre-commit/pre-push, deployment parity | 2sp |
| **D5** | Código do Projeto (`packages/` + `src/`) | 40+ | Absolute imports, lint/type errors, coverage baseline | 2sp |
| **D6** | Testes & Qualidade (`tests/` + `audits/`) | 30+ | Test suite structure, hook tests (Story 1.20), coverage | 2sp |
| **D7** | Documentação & State (`docs/` + PROJECT.md + STATE.md) | 50+ | Story inventory, CLAUDE.md references, staleness, gaps | 2sp |
| **D8** | Config Root-Level (ficheiros raiz) | 10+ | package.json, tsconfig.json, .releaserc.json, versions | 1sp |
| **D9** | AGENTS.md (meta-reference) | 1 | AIOX version, squad activation, agent shortcuts, sync | 1sp |

**Total effort:** 12-14sp (domínios D1-D6 = 12sp bulk, D7-D9 = 0-2sp variable)

---

## Acceptance Criteria

### AC1: All 9 Domains Audited
- [ ] D1 (Framework): L1 protection verified, no edits detected, config versioned
- [ ] D2 (Automation): 25 hooks checked, registry vs files match, rules aligned
- [ ] D3 (Agents): All 12 agents loaded, commands registered, authority matrix valid
- [ ] D4 (CI/CD): Workflows exist, pre-hooks work, Railway/Vercel integrated
- [ ] D5 (Code): Imports absolute, lint/type clean, coverage ≥ baseline
- [ ] D6 (Tests): Suite structure clear, Story 1.20 tests present, coverage tracked
- [ ] D7 (Docs): Stories numbered, CLAUDEs reference framework, STATE recent
- [ ] D8 (Config): Versions aligned, scripts documented, release config present
- [ ] D9 (AGENTS.md): Version current, squads functional, shortcuts verified

### AC2: AUDIT-REPORT.md Generated
- [ ] 8+ pages (A4 equivalent)
- [ ] Executive summary with total issues + severity breakdown
- [ ] 1 section per domain (D1-D9) with findings + rastreability
- [ ] Sync verification (config vs runtime, definitions vs registry)
- [ ] Art. IV compliance score (% statements with source)
- [ ] Bloqueadores para EPIC 5.x listed + actionable
- [ ] Next actions clear (fix, monitor, or document)

### AC3: Rastreabilidade 100%
- [ ] Cada issue: ficheiro path + linha (se código) ou commit hash
- [ ] Cada verificação: verde (✅), red (❌), ou orange (⚠️)
- [ ] Sem frases vagas ("provavelmente funciona", "deve estar")
- [ ] Metrics citadas com timestamp (`.synapse/metrics/hook-metrics.json` updated when?)

### AC4: Art. IV Compliance (No Invention)
- [ ] Zero assumções — tudo verificado
- [ ] Cada finding tem origem documentada
- [ ] Blockers vs warnings vs info claramente marcados
- [ ] Recomendações são accionáveis (fix descrição concreta)

### AC5: Bloqueadores para EPIC 5.x
- [ ] Cada bloqueador crítico tem story de fix (5.1-5.7)
- [ ] Critical / High / Medium severidade clara
- [ ] Dependency map: qual story fix qual bloqueador
- [ ] Timeline: bloqueadores devem estar resolvidos antes de qual story?

### AC6: Stories Desbloqueadas
- [ ] Stories 5.1-5.8 podem ser criadas após audit
- [ ] Cada story tem requisito claro (mapa para issue do audit)
- [ ] Nenhuma ambiguidade entre audit findings e story scope

---

## Timeline

| Phase | Duration | Owner | Output |
|---|---|---|---|
| **Execution** | 12-14 story points | @analyst | AUDIT-REPORT.md draft |
| **Review** | 2-3sp | @architect | Validation + fix recommendations |
| **Approval** | 1-2sp | @pm | Sign-off, EPIC 5.x approved |
| **Stories** | 2-3sp | @sm | Stories 5.1-5.8 created |

**Total:** 17-22sp (audit + review + stories creation)

---

## Success Metrics

After audit completion:

| Metric | Baseline | Target | Owner |
|---|---|---|---|
| Hooks passing smoke tests | Unaudited | 25/25 (100%) | @analyst / @qa |
| Framework boundary violations | Unknown | 0 found | @analyst |
| Documented GAPs | 7 (EPIC 5.x) | 7 mapped to stories | @analyst |
| AUDIT-REPORT.md pages | — | ≥ 8 | @analyst |
| Rastreability coverage | — | 100% | @analyst |
| Stories 5.1-5.8 unblocked | ❌ | ✅ | @sm |

---

## Deliverables

### Primary Deliverable
- **AUDIT-REPORT.md** (`docs/AUDIT-REPORT.md`)
  - Executive summary (2-3 pages)
  - Domain findings (1 page each, 9 pages)
  - Sync verification (1-2 pages)
  - Bloqueadores & next actions (1 page)
  - Appendix: raw findings data (if >20 pages total)

### Supporting Artifacts
- AUDIT-PLAN.md (reference — já existe)
- EPIC-AIOX-OPERACIONAL.md updated with audit findings
- STATE.md updated (session summary, GAPs resolved status)

---

## Stakeholders & Approvals

| Stakeholder | Role | Approval Gate |
|---|---|---|
| **@analyst** | Executor | Runs audit, produces report |
| **@architect** | Validator | Reviews report, identifies architecture issues |
| **@pm** | Product Owner | Approves report, sign-off for EPIC 5.x |
| **Pedro** | User | Final approval before stories begin |

---

## Related Documents

- [AUDIT-PLAN.md](../AUDIT-PLAN.md) — detailed verification checklist
- [EPIC-AIOX-OPERACIONAL.md](stories/epics/EPIC-AIOX-OPERACIONAL.md) — stories 5.1-5.8 definition
- [Constitution.md](../.aiox-core/constitution.md) — Art. I-VII reference
- [STATE.md](../STATE.md) — known GAPs (G1-G7)

---

## Notes

- **Version Control:** PRD is source of truth; changes via @pm approval only
- **Risk:** If audit uncovers 10+ blockers, escalate to @architect before proceeding
- **Escalation:** If @analyst cannot complete audit in 12-14sp, report blockers immediately
- **Timeline:** Audit must complete before stories 5.1-5.8 can be created

---

**Approved by:** Morgan (@pm)  
**Next step:** @analyst reads AUDIT-PLAN.md + this PRD, then executes *execute-audit
