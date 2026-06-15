# EPIC-12 PRD — Agent Framework Testing Phase 1

**Status:** Ready for Story Creation  
**Created:** 2026-06-15 (Cont 42)  
**Owner:** @pm (Morgan) / @po (Pax)

---

## 1. EXECUTIVE SUMMARY

**What:** Comprehensive testing of AIOX framework agents (12), workflows (4), and gates (7) to validate synchronization and remediate audit gaps.

**Why:** Morgan's audit (Cont 40) identified 31 operational gaps + 21 ambiguities. EPIC-12 testing provides evidence trail for each gap remediation and validates framework integrity.

**Success:** 100% agent file coverage, zero agents skipped, all gaps explained/remediated, all workflows end-to-end tested.

**Effort:** 40-50 story points  
**Timeline:** 2-3 weeks  
**Team:** @dev (implementation), @qa (gates), @sm (story creation), @pm (PRD)

---

## 2. BUSINESS CONTEXT

### Problem Statement

Current AIOX framework state:
- 12 agents exist, but coverage is incomplete
- Agent activation chain has gaps (session field missing)
- @devops authority gates block certain operations
- Workflow state machine has edge case ambiguities
- 31 specific operational gaps verified
- 21 ambiguities in responsibility boundaries + state transitions

**Impact:**
- Cannot trust agent execution without validation
- Framework sync status unknown
- Cannot deploy with confidence

### Solution

Execute **Phase 1 Agent Framework Testing** — a structured, end-to-end audit using stories and quality gates to:
1. **Validate** each agent's syntax, dependencies, and workflow integration
2. **Test** all 4 primary workflows (SDC, QA Loop, Spec Pipeline, Brownfield)
3. **Enforce** all 7 constitutional gates (Art. I-VII)
4. **Remediate** all 31 gaps identified by Morgan
5. **Clarify** all 21 ambiguities (documentation updates)

---

## 3. SCOPE & CONSTRAINTS

### In Scope

✅ **12 Agents (all):**
- @dev, @qa, @architect, @pm, @po, @sm, @analyst, @data-engineer, @devops, @ux-design-expert, @aiox-master, @squad-creator

✅ **4 Workflows (all):**
- Story Development Cycle (SDC)
- QA Loop (iterative review)
- Spec Pipeline (pre-implementation)
- Brownfield Discovery (legacy assessment)

✅ **7 Gates (all):**
- Art. I: CLI First
- Art. II: Agent Authority (devops exclusive)
- Art. III: Story-Driven Development
- Art. IV: No Invention
- Art. V: Quality First
- Art. VI: Absolute Imports
- Art. VII: Framework Boundary

✅ **31 Gaps (all) + 21 Ambiguities (all):**
- Each gap receives testing task
- Each ambiguity receives documentation task
- Evidence trail required

### Out of Scope

❌ Implementation of new features (testing only)  
❌ Fixing L1/L2 code (L4 only, or escalate via `*propose-modification`)  
❌ Performance optimization (identified but not fixed in Phase 1)  
❌ New agent creation (testing existing agents only)

---

## 4. ACCEPTANCE CRITERIA

**Epic Success = ALL of the following:**

| Criterion | Target | How Measured |
|-----------|--------|--------------|
| **Agent Coverage** | 12/12 agents tested | Each agent has passing story (12.1-12.12) |
| **No Agents Skipped** | 0 skipped | @qa gate verifies all 12 stories PASS |
| **Workflow Testing** | 4/4 workflows end-to-end | SDC, QA Loop, Spec Pipeline, Brownfield all tested |
| **Gate Enforcement** | 7/7 gates verified active | Constitutional gates (Art. I-VII) all operational |
| **Gap Remediation** | 31/31 gaps explained | Story 12.6 (gap evidence) traces each gap to testing task or L1/L2 escalation |
| **Ambiguity Clarification** | 21/21 ambiguities documented | Documentation updates in `.claude/rules/` or story AC clarify all 21 |
| **File Coverage** | 100% | No orphaned agent files, all dependencies loaded |
| **QA Gate Result** | PASS on all stories | No FAIL verdicts, PASS or CONCERNS with notes |

---

## 5. TECHNICAL APPROACH (MAESTRO/SPECA Framework)

### Layer Validation (MAESTRO)

Each agent story follows MAESTRO multi-layer audit pattern:

| Layer | Agent Focus | Testing Task |
|-------|------------|--------------|
| **L1** Core Logic | @aiox-master | Verify agent definition, core commands load |
| **L2** Templates | @sm | Verify agent story templates apply correctly |
| **L3** Config | @po | Verify agent memory files, rules load |
| **L4** Runtime | @dev | Verify agent executes in real workflow |

### Specification Tracing (SPECA)

Each story validates agent against documented spec:
1. **Component mapping** — Agent file → `.claude/CLAUDE.md` specification
2. **Dependency tracing** — Agent commands → documented outputs
3. **Workflow integration** — Agent role in SDC/QA Loop/Spec Pipeline/Brownfield
4. **Gap comparison** — Actual vs Morgan's audit findings

---

## 6. STORY BREAKDOWN (12 Stories, ~4-5sp each)

### Core Agents (Stories 12.1-12.6) — Week 1

| Story | Agent | Focus | Effort |
|-------|-------|-------|--------|
| **12.1** | @dev | Developer implementation, YOLO/Interactive modes, CodeRabbit integration | 5sp |
| **12.2** | @qa | QA gates (PASS/CONCERNS/FAIL verdicts), evidence validation | 4sp |
| **12.3** | @architect | Architecture decisions, tech stack validation, design authority | 4sp |
| **12.4** | @pm | PRD creation, epic orchestration, requirements tracing | 4sp |
| **12.5** | @po | Story validation (10-point checklist), backlog management | 4sp |
| **12.6** | @sm | Story creation from templates, epic context tracking | 4sp |

**Week 1 Subtotal:** 25sp

### Specialist Agents (Stories 12.7-12.12) — Week 2

| Story | Agent | Focus | Effort |
|-------|-------|-------|--------|
| **12.7** | @analyst | Research tasks, evidence gathering, gap analysis | 4sp |
| **12.8** | @data-engineer | Schema design, migrations, RLS policies | 4sp |
| **12.9** | @devops | git operations (exclusive), CI/CD, MCP management | 5sp |
| **12.10** | @ux-design-expert | UX/UI design, accessibility, component design | 4sp |
| **12.11** | @aiox-master | Framework governance, agent orchestration, constitutional enforcement | 5sp |
| **12.12** | @squad-creator | Squad creation, agent cloning, team orchestration | 4sp |

**Week 2 Subtotal:** 30sp

### Integration & Gap Remediation — Week 3

**Story 12.13** (implicit): Cross-story gap remediation + documentation updates  
**Story 12.14** (implicit): Integration testing (all workflows validated end-to-end)

**Week 3 Subtotal:** 10-15sp (depends on gap complexity)

**Total:** 40-50sp ✓

---

## 7. MORGAN'S AUDIT INTEGRATION

### 31 Gaps — Testing Mapping

**16 Operational Gaps:**
- Gap #1-#5: Agent activation chain issues → Stories 12.11, 12.1-12.6 test
- Gap #6-#10: @devops authority enforcement → Story 12.9 (devops testing)
- Gap #11-#16: Workflow state machine issues → Stories 12.1-12.6, workflow integration tests

**15 Kronos Ultra-Deep Gaps:**
- Gaps #17-#31: Framework infrastructure + integration → Stories 12.11, 12.12 + cross-story integration

**Evidence Collection (Story 12.6 expanded):**
- Create gap traceability matrix: Gap ID → Story ID → AC tested → Result (PASS/ESCALATE)
- Escalate unfixable L1/L2 gaps via `*propose-modification` with evidence

### 21 Ambiguities — Documentation Mapping

**11 Operational Ambiguities:**
- Story status edge cases → Updated in `.claude/rules/story-lifecycle.md`
- @sm vs @po boundaries → Updated in `.claude/rules/agent-authority.md`
- Workflow state transitions → Updated in `.claude/rules/workflow-execution.md`

**10 Kronos Ambiguities:**
- Agent handoff protocol → HANDOFF-CONT41-TO-CONT42 becomes template
- Registry sync timing → Documented in `.aiox-core/data/registry-update-log.md`

---

## 8. ACCEPTANCE CRITERIA PER STORY

### Generic AC (applies to all 12.1-12.12)

Each agent testing story MUST have:

```markdown
## Acceptance Criteria

### 1. Agent Definition Loaded
- [ ] Agent file (.claude/agents/{agent-name}.md) exists and is readable
- [ ] Agent persona, commands, dependencies clearly documented
- [ ] Agent authority scope matches Constitution (Art. II) and agent-authority.md

### 2. Dependencies & Commands Validated
- [ ] All agent commands (*command) are defined and documented
- [ ] All referenced tools (Bash, Edit, Read, etc.) available
- [ ] All agent-specific rules loaded (from .claude/rules/)

### 3. Memory Files Loaded
- [ ] Agent memory exists: .claude/agent-memory/{agent-name}/MEMORY.md
- [ ] Auto-memory imports working (if applicable)
- [ ] Previous session context accessible

### 4. Workflow Integration Tested
- [ ] Agent tested in Story Development Cycle (create → validate → implement → review → push)
- [ ] Agent tested in [1 other workflow: QA Loop OR Spec Pipeline OR Brownfield]
- [ ] No workflow blockers identified

### 5. Morgan's Gaps Addressed
- [ ] [Gap #X] verified as working OR escalated with reason
- [ ] [Gap #Y] verified as working OR escalated with reason
- [ ] (n=2-3 gaps per agent)

### 6. Constitutional Gates Tested
- [ ] Agent actions enforced against Art. II (agent authority) gate
- [ ] Agent actions enforced against Art. III (story-driven) gate
- [ ] Agent actions enforced against Art. VII (framework boundary) gate

### 7. No Dangling References
- [ ] All agent file references are valid (no 404s)
- [ ] All dependent files exist
- [ ] Cross-references verified (agent → rules, agent → workflows)

### 8. Documentation Complete
- [ ] Agent role updated in PROJECT.md (if new)
- [ ] Agent tested scenarios documented in FILE LIST
- [ ] Any ambiguities from Morgan's audit clarified in story notes

### 9. QA Gate Ready
- [ ] No TypeScript errors (if applicable)
- [ ] No syntax errors in agent definition
- [ ] All AC checkboxes passing

### 10. Ready for Implementation (@dev)
- [ ] No blockers identified
- [ ] All test prerequisites met
- [ ] Clear next steps documented
```

---

## 9. QUALITY GATES (QA Checkpoint)

### Per-Story Gate (Stories 12.1-12.12)

**Gate Rule:** `@qa *qa-gate story={story-id}`

**Verdict Options:**
- ✅ **PASS** — All AC met, zero gaps, ready for integration
- ⚠️ **CONCERNS** — AC met but with notes (ambiguities clarified in story notes)
- ❌ **FAIL** — AC not met, return to @dev for fixes
- 🔇 **WAIVED** — Blocked by L1/L2 escalation, documented

### Epic Gate (Final, after all 12 stories)

**Gate Rule:** `@qa *qa-gate epic=EPIC-12`

**Verdict:** ALL stories PASS or (CONCERNS with complete notes) → EPIC-12 PASS

---

## 10. SUCCESS METRICS

### Quantitative

| Metric | Target | Unit |
|--------|--------|------|
| Agent Coverage | 12/12 | agents |
| Gap Remediation | 31/31 | gaps (explained/resolved) |
| Ambiguity Clarification | 21/21 | ambiguities (documented) |
| Workflow Testing | 4/4 | workflows |
| Gate Enforcement | 7/7 | gates verified |
| QA Verdicts | 12x PASS or CONCERNS | stories |
| File Coverage | 100% | of agent files |

### Qualitative

- [ ] Framework consistency validated (no contradictions between agent definitions)
- [ ] Authority boundaries clear (no role confusion)
- [ ] Workflow state machine understood (edge cases documented)
- [ ] Governance rules enforceable (gates work as designed)
- [ ] Team confidence high (ready for production agent deployment)

---

## 11. DEPENDENCIES & BLOCKERS

### Pre-Requisites (MUST be done before 12.1)

- [ ] Morgan's audit read and extracted (31 gaps + 21 ambiguities details)
- [ ] 6 diagnostic commands executed (real framework data)
- [ ] EPIC-12 PRD approved (this document)

### Known Blockers

| Blocker | Impact | Mitigation |
|---------|--------|-----------|
| Gap #4, #11 require L1/L2 changes | 2 gaps unfixable in L4 | Escalate via `*propose-modification`, document in story 12.6 |
| Agent memory not loaded (session field missing) | Blocks activation | Story 12.11 addresses session field gap |
| @devops gate might be overly restrictive | Might FAIL story 12.9 | Adjust gate rules post-testing, document |

---

## 12. RESOURCES & REFERENCES

### Key Documents (Read Before Stories)

1. **Morgan's Audit** — `docs/audits/` or STATE.md lines 1-100
   - Extract: All 31 gaps with details
   - Extract: All 21 ambiguities with details

2. **Constitution** — `.aiox-core/constitution.md`
   - Reference: Art. I-VII enforcement rules

3. **Agent Authority** — `.claude/rules/agent-authority.md`
   - Reference: Agent delegation matrix

4. **Story Lifecycle** — `.claude/rules/story-lifecycle.md`
   - Reference: Status transitions, QA gate verdicts

5. **Framework Architecture** — `docs/ARCHITECTURE.md` (from Story 10.1)
   - Reference: Layer map, boundaries

### Research Document

- **Framework Audit Skills Research** — `docs/research/2026-06-15-framework-audit-skills/`
  - MAESTRO checklist (§ 3.1) — use for L1-L4 validation
  - SPECA methodology (§ 3.2) — use for specification tracing
  - Authority matrices (§ 4.2) — use for agent role testing
  - Gap categories (§ 2.1) — use to classify Morgan's gaps

---

## 13. TIMELINE

### Cont 42 (This Session) — ~4 hours

- [ ] Create EPIC-12 PRD (this document) — 30 min
- [ ] Create 12 testing stories (12.1-12.12) — 45 min
- [ ] @po validate all stories (10-point checklist) — 15 min
- [ ] Stories ready for @dev — All stories "Ready" status

### Cont 43-44 — Week 1-2

- [ ] @dev implements stories 12.1-12.6 (core agents) — ~3-4 days
- [ ] @qa gates each story — continuous
- [ ] @dev implements stories 12.7-12.12 (specialist agents) — ~3-4 days
- [ ] @qa final verification — day 10

### Cont 45 — Week 3

- [ ] Gap remediation + integration testing — 3-5 days
- [ ] Documentation updates (21 ambiguities) — 1-2 days
- [ ] Final QA gate (EPIC-12 verdict) — 1 day
- [ ] @devops push to remote — done

---

## 14. OWNERSHIP & ESCALATION

| Role | Responsibility |
|------|-----------------|
| **@pm (Morgan)** | EPIC-12 PRD (this doc), goal-setting, stakeholder comms |
| **@sm (River)** | Create 12 testing stories, epic context, dependencies |
| **@po (Pax)** | Validate 12 stories (10-point checklist), approvals |
| **@dev (Dex)** | Implement all 12 stories, bug fixes, integration |
| **@qa (Quinn)** | QA gates, verdict decisions, evidence validation |
| **@architect (Aria)** | Design review, architecture implications, L1/L2 escalations |
| **@devops (Gage)** | Final push, release management, CI/CD verification |

### Escalation Path

Gap unfixable in L4 → Story notes → @architect → `*propose-modification` → @aiox-master decision

---

## 15. SIGN-OFF

**PRD Status:** ✅ READY FOR STORY CREATION

**Approved By:** @pm (this session)  
**Reviewed By:** @po (pending)  
**Next Action:** @sm *create-story EPIC=12, create 12 testing stories

---

**End of PRD**
