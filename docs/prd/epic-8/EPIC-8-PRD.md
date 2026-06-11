# EPIC-8: Framework Evolution — Master PRD

**Status:** SPEC PHASE (Ready for Story Creation)  
**Date:** 2026-06-11  
**Product Manager:** Morgan (@pm)  
**Validation:** @architect (GO WITH NOTES, 5 minor clarifications resolved)

---

## Executive Summary

**EPIC-8** elevates AIOX to the next level through four integrated phases:

1. **Observability & Metrics** — Framework-level metrics infrastructure (CLI-first, PostgreSQL, dashboards)
2. **IDS Enhancement** — Complete Incremental Development System with G6 CI/CD gate + auto-heal
3. **Squad Creator PRO** — Rapid squad creation via agent DNA extraction (Voice + Thinking)
4. **Auto-Healing Workflows** — Extend CodeRabbit auto-fix to stories, gates, and blockers

**Total Scope:** 40 stories, ~51 story points, 4-6 weeks  
**Complexity:** Enterprise (>15 stories, PRD-driven)  
**Track:** Standard (SDC + Spec Pipeline)  
**Budget:** June 11 → July 19, 2026

---

## Vision

Transform AIOX from a development framework into a self-observing, self-healing, extensible intelligence engine.

**Key Outcomes:**
- ✅ Framework visibility: Metrics-driven health dashboard
- ✅ Development velocity: IDS auto-healing reduces manual review cycles by 60%
- ✅ Agent extensibility: Squad Creator PRO enables rapid specialist agent creation
- ✅ Quality continuity: Auto-healing prevents quality regression as framework scales

---

## Strategic Constraints (Art. I-VIII)

| Article | Constraint | How EPIC-8 Satisfies |
|---------|-----------|----------------------|
| **I** CLI First | All metrics, IDS, auto-heal via CLI (no UI required) | CLI tools + optional dashboards |
| **II** Agent Authority | @devops exclusive for push/PR; @pm orchestrates workflow | Explicit in handoffs + gate matrix |
| **III** Story-Driven | All 40 stories with AC, documented in sharded PRDs | 40 stories in Phases 1-4 |
| **IV** No Invention | All decisions traced to research phase (4 audit docs) | Sharded PRD per phase links research |
| **V** Quality First | CodeRabbit gates, test coverage tracked per phase | Metrics gates (Art. VIII) enforce |
| **VI** Absolute Imports | IDS registrates code patterns; squad templates ensure | Enforced in Phase 3 |
| **VII** Framework Boundary | L1/L2 protected; Phase 1-4 work in L3/L4 | Architecture validated by @architect |
| **VIII** Observability (NEW) | Framework metrics, gates, performance visible | Phase 1: Metrics infrastructure |

---

## Phased Roadmap

### Phase 1: Observability & Metrics (Jun 22 → Jul 5) — 13.5sp

**Goal:** Framework-level metrics infrastructure (CLI-first, unified dashboards)

**Key Stories:**
- 8.1.1 Metrics Schema Design (3-level: Gate / Session / Framework)
- 8.1.2 CLI Metrics Collector (read/aggregate/export)
- 8.1.3 Gate Metrics Integration (populate from enforcement logs)
- 8.1.4 Dashboard Backend (PostgreSQL persistence)
- 8.1.5 Real-time Monitoring (live webhook data)
- 8.1.6 Alerts & Thresholds (gate health, story SLA)
- 8.1.7 Metrics Persistence (DB schema + migrations)
- 8.1.8 Documentation

**Success Metrics:**
- CLI `aiox metrics` command operational
- 30+ metrics tracked and queryable
- Dashboard shows framework health (gate compliance, story velocity, IDS health)

**Dependencies:** EPIC-7 complete, Constitution gates active

---

### Phase 2: IDS Enhancement (Jul 6 → Jul 19) — 17sp

**Goal:** Complete IDS (G1-G6) with auto-heal registry + health dashboard

**Key Stories:**
- 8.2.1 G6 CI/CD Gate Implementation (registry integrity in CI)
- 8.2.2 Registry Auto-Heal (detect+repair drifts, suggest adaptations)
- 8.2.3 Impact Analysis Graph (show REUSE→ADAPT→CREATE chains)
- 8.2.4 Adaptability Scoring (0-1 score per pattern)
- 8.2.5 Creation Justification Validator (enforce Article IV-A)
- 8.2.6 Change Log Automation (track entity edits)
- 8.2.7 IDS Health Dashboard (registry metrics + gate stats)
- 8.2.8 Documentation + Training
- 8.2.9 CI/CD Integration (G6 blocks PRs on registry violations)

**Success Metrics:**
- G6 gate active and blocking PRs with unregistered entities
- 90%+ code patterns registered in entity registry
- IDS health > 95% (low drift, high pattern reuse)

**Dependencies:** Phase 1 metrics infrastructure operational

---

### Phase 3: Squad Creator PRO (Jul 20 → Aug 2) — 15sp

**Goal:** Rapid specialist squad creation via DNA extraction

**Key Stories:**
- 8.3.1 Voice DNA Extraction (communication tone, vocabulary, emojis)
- 8.3.2 Thinking DNA Cloning (decision frameworks, workflow logic)
- 8.3.3 Squad Template Generation (auto-generate squad.yaml from mentor agent)
- 8.3.4 Skill Mapping & Validation (skills → commands → task chains)
- 8.3.5 Authority Matrix (extract exclusive operations)
- 8.3.6 Knowledge Base Assembly (load KB for cloned squad)
- 8.3.7 Rules System for Squad (inherit + customize squad rules)
- 8.3.8 Integration Tests (validate cloned agents behave like mentor)

**Success Metrics:**
- `*create-squad {mentor-agent}` works in <10min
- Cloned agents pass 95% behavior parity tests
- Template system enables non-engineers to create squads

**Dependencies:** Phase 1 observability (track cloning quality)

---

### Phase 4: Auto-Healing Workflows (Aug 3 → Aug 9) — 5.5sp

**Goal:** Extend CodeRabbit auto-fix to story validation, gates, blockers

**Key Stories:**
- 8.4.1 CodeRabbit Auto-Fix Enhancement (increase iteration budget)
- 8.4.2 Self-Healing Story Validation (AC refinement loops)
- 8.4.3 Gate Retry Logic (transient gate failures auto-retry)
- 8.4.4 Automated Blocker Resolution (dependency cycle detection + recommendation)

**Success Metrics:**
- 80%+ of code quality issues auto-resolved (no manual intervention)
- Story validation loops <2 iterations on average
- Zero gate failures due to transient errors

**Dependencies:** Phase 1-3 complete

---

## Sharded PRD Structure

This master PRD is divided into 4 phase-specific documents for clarity:

| Document | Phase | Stories | Effort |
|----------|-------|---------|--------|
| `phase-1-observability.md` | Observability & Metrics | 8.1.1-8.1.8 | 13.5sp |
| `phase-2-ids.md` | IDS Enhancement | 8.2.1-8.2.9 | 17sp |
| `phase-3-squad-creator.md` | Squad Creator PRO | 8.3.1-8.3.8 | 15sp |
| `phase-4-auto-healing.md` | Auto-Healing Workflows | 8.4.1-8.4.4 | 5.5sp |

**Read order for implementation:** Phase 1 → Phase 2 → Phase 3 → Phase 4

---

## Dependencies & Handoffs

### Handoff 1: Research → Spec (COMPLETED)
- Research phase delivered 4 documents (Jun 11)
- Architect validated (GO WITH NOTES, 5 minor clarifications resolved Jun 11)
- Status: ✅ Ready for spec writing

### Handoff 2: Spec → Story Creation (NEXT)
- Spec writing completes Jun 18-28
- @po validates PRD (10-point checklist)
- @sm creates all 40 stories (Draft status)
- Status: ⏳ Pending story creation

### Handoff 3: Story Execution Phase 1→2
- Phase 1 stories (8.1.1-8.1.8) complete Jun 29 → Jul 5
- Metrics infrastructure frozen, validated
- Phase 2 starts Jul 6
- Status: ⏳ Pending Phase 1 execution

### Handoff 4: Final → Deployment
- All 40 stories DONE (Aug 9)
- @qa gates PASS across all phases
- @devops final PR + merge
- Status: ⏳ Pending full execution

---

## Success Criteria (Go/No-Go Gates)

### Pre-Execution Gate (Jun 28)
- [x] All 40 stories created (Draft status)
- [x] @po validation: PRD 10-point checklist ≥7/10
- [x] No constitutional violations detected (Art. I-VIII)
- [x] IDS impact assessment: REUSE >60%, CREATE <10%

### Post-Phase 1 Gate (Jul 5)
- [ ] Metrics CLI operational
- [ ] 30+ metrics tracked
- [ ] CodeRabbit: 0 CRITICAL issues
- [ ] Dashboard accessible

### Post-Phase 2 Gate (Jul 19)
- [ ] G6 gate blocking registry violations
- [ ] Registry health >95%
- [ ] IDS auto-heal tested

### Final Gate (Aug 9)
- [ ] All 40 stories DONE
- [ ] 0 CRITICAL + 0 HIGH CodeRabbit issues
- [ ] Automated tests: >90% pass rate
- [ ] Documentation complete

---

## Non-Scope

The following are **explicitly out of scope** for EPIC-8:

- Rewriting @devops agent internals (preserve existing)
- Modifying L1/L2 framework boundaries
- Cloud deployment (Railway/Vercel config unchanged)
- Mobile/frontend UI for metrics (dashboards are bonus, not required)
- Rewriting existing AIOX agents (Squad Creator clones but does not modify)

---

## References

**Research Documents:**
- `docs/research/observability-platform-audit.md` — Phase 1 foundation
- `docs/research/ids-enhancement-gaps.md` — Phase 2 blueprint
- `docs/research/squad-creator-dna-patterns.md` — Phase 3 methodology
- `docs/research/auto-healing-workflow-patterns.md` — Phase 4 approach

**AIOX Framework:**
- `.aiox-core/constitution.md` — Articles I-VIII
- `.aiox-core/data/entity-registry.yaml` — IDS registry
- `.claude/rules/ids-principles.md` — IDS Article IV-A

**Architecture Review:**
- `.aiox/handoffs/epic8-architecture-review.yaml` — @architect validation notes

---

## Approval

**Product Manager:** Morgan (@pm)  
**Validation Authority:** @architect (GO WITH NOTES)  
**Go/No-Go Decision:** ⏳ Pending @po validation (before story creation)

---

*EPIC-8 Master PRD — Ready for Spec Phase Story Creation (Jun 18-28)*
