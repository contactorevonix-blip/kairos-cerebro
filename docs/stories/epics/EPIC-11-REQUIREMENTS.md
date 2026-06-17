# EPIC-11 — Agent Infrastructure Readiness & Certification

**Epic ID:** EPIC-11 (AIR)  
**Phase:** Agent Readiness Foundation (pre-requisite to all agent-driven workflows)  
**Status:** DRAFT  
**Created:** 2026-06-14 (Session Cont 38)  
**Owner:** @pm (Morgan)  
**Track:** Standard (9 stories, 98sp) — per `.claude/rules/planning-tracks.md`  
**Source PRD:** `docs/prd/EPIC-11-AGENT-INFRASTRUCTURE-READINESS.md`

---

## 1. Problem & Vision

### Problem

The 11 AIOX agents (@dev, @qa, @pm, @po, @sm, @architect, @analyst, @data-engineer, @ux-design-expert, @devops, @aiox-master) operate without documented **connectivity, execution linearity, or determinism scores**. Current state:

- ❓ **File connectivity unknown** — Which files does each agent reference? Do they all exist?
- ❓ **Execution trace missing** — Step-by-step input→output flow not documented
- ❓ **Gaps hidden** — Ambiguities, missing files, broken references unknown until runtime
- ❓ **Determinism undefined** — No score; non-deterministic behavior undetected

**Risk:** Agents may fail silently; gaps in authority, task assignment, or memory paths discovered only during production execution.

### Vision

**All 11 agents MUST achieve production readiness:**
- ✅ 100% file connectivity (all referenced files exist, paths correct)
- ✅ Complete execution trace (input→output documented, checkpoints defined)
- ✅ Documented gaps & fixes applied (all critical issues resolved)
- ✅ Determinism score > 8.0/10 (agent behavior predictable & repeatable)
- ✅ Certification signed by @pm + @qa (agent-ready for production workflows)

### Measurable Outcome

| Metric | Baseline | Target |
|--------|----------|--------|
| Agents audited | 0/11 | 11/11 certified |
| Average determinism score | Unknown | ≥ 8.5/10 |
| Critical gaps remaining | Unknown | 0 |
| Documentation coverage | 0% | 100% (framework + manual + matrix) |

---

## 2. Epic Scope (9 Stories, 98sp)

### Phase 1: Framework Setup

| Story | Title | SP | Owner | AC |
|-------|-------|----|----|-----|
| **11.1** | Audit Framework Definition | 8 | @config-engineer | Checklist created, template defined, example generated |

### Phase 2: Pilot Audit

| Story | Title | SP | Owner | AC |
|-------|-------|----|----|-----|
| **11.2** | @sm (River) — Full Audit & Fix | 13 | @config-engineer | All 7 files scanned, trace complete, gaps fixed, score > 8.5/10 |

### Phase 3: Parallel Audits (6 agents + batch)

| Story | Title | SP | Owner | AC |
|-------|-------|----|----|-----|
| **11.3** | @pm (Morgan) — Full Audit & Fix | 13 | @config-engineer | Same as 11.2 |
| **11.4** | @dev (Dex) — Full Audit & Fix | 21 | @config-engineer | Complex; score > 8.0/10 |
| **11.5** | @qa (Quinn) — Full Audit & Fix | 13 | @config-engineer | Same as 11.2 |
| **11.6** | @devops (Gage) — Full Audit & Fix | 21 | @config-engineer | Critical path; git authority verified |
| **11.7** | @architect + @analyst + @po — Batch | 21 | @config-engineer | 3 agents audited in parallel |
| **11.8** | @data-engineer + @ux + @aiox-master — Batch | 13 | @config-engineer | 3 agents audited in parallel |

### Phase 4: Consolidation

| Story | Title | SP | Owner | AC |
|-------|-------|----|----|-----|
| **11.9** | Readiness Matrix & Handoff | 5 | @config-engineer | Master table, narrative, handoff prepared |

---

## 3. Story Details

### Story 11.1: Audit Framework Definition (8sp)

**AC:**
- [ ] Audit checklist created (8 sections: connectivity, execution trace, gaps, invention detection, coherence, determinism, fixes, readiness)
- [ ] Report template documented (Markdown structure with all required fields)
- [ ] Example report generated (showing filled template for reference agent)
- [ ] Guidelines for interpreting determinism scores documented

**Deliverable:** `docs/AGENT-AUDIT-FRAMEWORK.md`

---

### Stories 11.2-11.8: Individual Agent Audits (13-21sp each)

**AC (per story):**
- [ ] All agent files scanned & listed (persona, rules, memory, tasks, workflows, skills)
- [ ] Execution trace complete (10+ command flows documented, input→output→checkpoint)
- [ ] Gaps identified & categorized (critical/high/medium/low)
- [ ] All critical gaps fixed & verified
- [ ] Inventions detected & corrected (agent doing more than defined?)
- [ ] Coherence verified (no contradictions in specs)
- [ ] Determinism score calculated (target: > 8.0/10, pilot > 8.5/10)
- [ ] Final report signed off by @pm + @qa

**Deliverables:** `docs/agents-ready/11.X-{agent-name}-audit-FINAL.md` (11 total)

---

### Story 11.9: Readiness Matrix & Handoff (5sp)

**AC:**
- [ ] Master readiness table created (agent name, determinism score, certification date, link to report)
- [ ] Summary narrative written (patterns identified, systemic findings, next steps)
- [ ] Production readiness statement signed (all agents certified OR conditions for certification met)
- [ ] Handoff to next workflows prepared (feeds EPIC-9, EPIC-12)

**Deliverables:**
- `docs/AGENT-READINESS-MATRIX.md`
- `docs/AGENT-EXECUTION-MANUAL.md`

---

## 4. Dependencies & Enablers

**Must complete BEFORE EPIC-11:**
- None (greenfield audit, independent)

**EPIC-11 enables AFTER:**
- **EPIC-9** (SYNAPSE Enforcement) — depends on agent authority boundaries being clarified (Story 11.6)
- **EPIC-12** (Agent Team Workflows) — depends on all agents being certified ready

---

## 5. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|-----------|
| Agent execution too complex to trace | Medium | High | Framework focuses on "happy path" first; complexity noted but not blocking |
| Gaps exceed 98sp budget | Low | Medium | Overflow stories allowed; partial certification acceptable (8.0/10 minimum) |
| Audit findings contradict prior design decisions | Low | Medium | @pm approves each finding before fix; no breaking changes without approval |
| Agent definitions change during audit cycle | Low | Low | Freeze agent definitions for 3-week cycle; document snapshot version |

---

## 6. Timeline & Resources

**Duration:** 2-3 sprints (~3 weeks, with parallelization)

| Sprint | Work | Effort |
|--------|------|--------|
| **Sprint 1** | 11.1 (framework) + 11.2 (pilot) | 8 + 13 = 21sp (~1.5 weeks, @config-engineer) |
| **Sprint 2** | 11.3-11.8 (parallel audits) | 82sp (~1 week, 6 agents in parallel) |
| **Sprint 3** | QA review + 11.9 (consolidation) | 5sp + QA loop (~0.5 weeks) |

**Resources:**
- @config-engineer (Sigil): 85% of 3 weeks (primary executor)
- @pm (Morgan): 20% of 3 weeks (oversight, approvals)
- @qa (Quinn): 15% of 3 weeks (quality gate)
- @devops (Gage): 10% of 3 weeks (final commit + push)

**Total Effort:** ~1.2 FTE over 3 weeks

---

## 7. Success Criteria

**At epic completion:**

```
✅ Agent Readiness Scorecard

@sm (River):              9.1/10 ✅ CERTIFIED
@pm (Morgan):             8.7/10 ✅ CERTIFIED
@dev (Dex):               8.2/10 ✅ CERTIFIED
@qa (Quinn):              8.9/10 ✅ CERTIFIED
@devops (Gage):           8.4/10 ✅ CERTIFIED
@architect (Aria):        8.6/10 ✅ CERTIFIED
@analyst (Alex):          8.3/10 ✅ CERTIFIED
@data-engineer (Dara):    8.8/10 ✅ CERTIFIED
@ux-design-expert (Uma):  8.0/10 ⚠️  MINIMUM CERTIFIED
@po (Pax):                8.5/10 ✅ CERTIFIED
@aiox-master (Orion):     8.6/10 ✅ CERTIFIED

AVERAGE SCORE: 8.51/10 ✅ TARGET MET (≥ 8.5)
```

---

## 8. Notes for @PM

1. **Standard workflow applies:** @pm approves → @sm creates 9 stories → @po validates → @config-engineer implements → @qa gates → @devops pushes

2. **This is a foundation epic:** Once complete, all future agent work (new agents, upgrades) follows the same audit + certification pattern.

3. **Parallel execution critical:** Stories 11.3-11.8 run in parallel; Sigil can audit 2-3 agents simultaneously. Compress 3 weeks to ~2 weeks with parallel effort.

4. **Documentation is the artifact:** The 15+ documents created are permanent; they become the "agent playbook" for the team.

5. **Overflow-friendly:** If critical gaps exceed scope, create overflow stories (11.9+) in next sprint. Current scope assumes ~5-7 gaps per agent.

---

## ✅ Sign-Off for @PM

- [ ] Vision & success criteria understood
- [ ] Scope realistic (98sp, 2-3 weeks, 11 agents)
- [ ] Resources available (Sigil + oversight team)
- [ ] Timeline acceptable
- [ ] Risks mitigated
- [ ] Ready to create EPIC-11

---

**Next:** @pm creates EPIC-11 via `*create-epic` command, then @sm creates 9 stories.

---

*EPIC-11 Requirements prepared by Orion (Claude Mastery Chief) | 2026-06-14*
