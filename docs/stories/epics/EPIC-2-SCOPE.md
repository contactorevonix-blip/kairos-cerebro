# EPIC-2 Scope Definition — Expert Cloning CCM Squad

**Research Completion Date:** 2026-06-05  
**Analyst:** Atlas (Research phase only)  
**Status:** Ready for Architecture Review

---

## I. Executive Summary

EPIC-2 delivers **expert agent cloning infrastructure** to elevate the CCM squad from generalist to specialist-driven decision-making. The epic is scoped to research, infrastructure, and single PoC validation (Expert #1). Scaling to Expert #2 & #3 is deferred to EPIC-3.

**Total Epic Effort:** ~150-160 hours | **Timeline:** 4.5-5.5 weeks | **Cost:** $200/mo infrastructure

---

## II. Constitution Audit — Boundaries for EPIC-2

### Article I: CLI First (NON-NEGOTIABLE)
**Implication for EPIC-2:**
- ✅ Expert clones MUST be invocable via CLI (`@expert-name` or MCP command)
- ✅ Vector DB queries MUST be accessible via API, not UI-only
- ✅ MCP Docker server is CLI-first infrastructure
- ❌ EPIC-2 does NOT include dashboard/UI for managing experts
- **Boundary:** CLI operational → then observe-only dashboards (EPIC-3+)

**EPIC-2 Compliance:** PASS (MCP Docker + CLI invocation architecture)

---

### Article II: Agent Authority (NON-NEGOTIABLE)
**Implication for EPIC-2:**
- @analyst owns research findings (Story 2.1)
- @dev owns infrastructure build (Story 2.2)
- @architect owns design approval (gates Story 2.2 & 2.3)
- @po validates PoC fidelity (Story 2.3)
- @devops NOT needed (no git push within epic; happens at completion)

**Authority Conflicts?** NONE DETECTED. Clear ownership per story.

**EPIC-2 Compliance:** PASS

---

### Article III: Story-Driven Development (MUST)
**Implication for EPIC-2:**
- 4 stories required: Story 2.1 (research), 2.2 (infra), 2.3 (PoC), 2.4 (planning)
- Each story has acceptance criteria + file list
- Progress tracked via checkboxes
- All stories complete before epic merge

**EPIC-2 Compliance:** PASS (all stories documented in EPIC-2-expert-cloning.md)

---

### Article IV: No Invention (MUST)
**Implication for EPIC-2:**
- Expert selection MUST be research-backed (not "sounds good")
- Infrastructure patterns MUST be validated (MCP Docker + Vector DB are production-proven)
- Fidelity targets MUST be data-driven (85%+ based on benchmarks, not wishes)
- No features outside scope (3 experts only, not "as many as possible")

**EPIC-2 Compliance:** PASS (STARLITE research framework ensures rigor)

---

### Article V: Quality First (MUST)
**Implication for EPIC-2:**
- Research findings: 80%+ confidence (evidence-backed)
- Infrastructure: 85%+ test coverage, <100ms Vector DB latency
- PoC: Fidelity audit + reproducibility validation
- All gates pass before handoff

**EPIC-2 Compliance:** PASS (gates at each story)

---

### Article VI: Absolute Imports (SHOULD)
**Implication for EPIC-2:**
- MCP Docker code uses absolute imports (@/ aliases)
- No ../../../ relative paths in infrastructure code

**EPIC-2 Compliance:** PASS (architectural standard)

---

## III. Middleware Enforcement Patterns Research

### Fastify Gates & Constitutional Enforcement (NOT in EPIC-2)

**Finding:** Constitutional enforcement gates (Art. I-II blocking) are a **separate concern** from expert cloning.

**Gate Categories:**
1. **API boundary enforcement** — git push, PR creation, MCP add/remove (BLOCKED)
2. **Agent authority validation** — @devops-only operations (ENFORCED)
3. **Audit logging** — all violations logged to AuditLog (REQUIRED)

**Pattern:** Fastify middleware + 403 Forbidden response + audit entry

**Why NOT in EPIC-2?**
- EPIC-2 focuses on **expert agent cloning** (decision-making quality)
- Constitutional gates are **framework infrastructure** (governance enforcement)
- Gates live in core API layer, not expert layer
- Story 2.1 (Constitutional Gates Enforcement in Kairos Check) handles this separately

**Boundary Decision:** Gates are OUT of EPIC-2 scope. They belong in Kairos Check's API hardening (Story 2.1).

---

## IV. EPIC-2 Scope Definition

### IN SCOPE (Approved)

#### Story 2.1: STARLITE Research — Expert Discovery (13sp)
- Identify 3 expert profiles per domain (9 total)
- Extract voice DNA + thinking DNA
- Validate findings (80%+ confidence)
- Output: DNA profiles ready for Vector DB
- **No working clone; research only**

#### Story 2.2: Infrastructure Build (8sp)
- MCP Docker server (Node.js)
- Supabase Vector DB schema (pgvector, RLS, indexes)
- Integration tests (85%+ coverage)
- Deployment guides
- Cost tracking ($200/mo model)

#### Story 2.3: Proof of Concept (8sp)
- Clone Expert #1 (System Complexity Architect)
- Fidelity audit (85%+ target)
- Reproducibility validation (95%+)
- E2E playbook
- Refinement loop (max 2 iterations, 3-5 days each)

#### Story 2.4: Scale Planning (5sp)
- Finalize E2E playbook
- Plan Expert #2 & #3 scaling
- Capacity + cost forecast
- Create EPIC-3 skeleton

**Total:** 34 story points | 4.5-5.5 weeks

---

### OUT OF SCOPE (Deferred to EPIC-3 or Future)

#### ❌ Expert #2 & #3 Cloning
- Reason: Expert #1 PoC must validate approach first
- Timeline: After EPIC-2 gates pass (Week 5)
- Location: EPIC-3 (Expert Scaling)

#### ❌ Dashboard UI for Expert Management
- Reason: Article I (CLI First) — dashboards are secondary
- Timeline: Post-EPIC-2 observability (future iteration)
- Location: EPIC-4+ (observability layer)

#### ❌ Constitutional Gates Enforcement
- Reason: Framework infrastructure, not expert cloning
- Timeline: Kairos Check Story 2.1 (separate project)
- Location: Kairos Check API layer

#### ❌ Advanced Vector DB Optimizations
- Reason: $200/mo model sufficient for 3 experts; optimization is future
- Timeline: Only if cost >$250/mo in production
- Location: Infrastructure optimization epic (future)

#### ❌ Multi-Model Support (Claude + GPT + others)
- Reason: Scope limited to Claude
- Timeline: Future expansion
- Location: Cross-LLM expert epic (future)

---

## V. Pronto vs Future Decision Matrix

| Capability | EPIC-2 Status | Timeline | Reason |
|---|---|---|---|
| Expert #1 clone | ✅ PRONTO | Week 4-5 | PoC validation |
| Expert #2 clone | ❌ FUTURE | EPIC-3 | Depends on #1 success |
| Expert #3 clone | ❌ FUTURE | EPIC-3 | Depends on #1 success |
| Vector DB pgvector | ✅ PRONTO | Week 2 | Core infrastructure |
| Vector DB optimization (cost) | ❌ FUTURE | EPIC-3+ | Monitor $200/mo model |
| MCP Docker local | ✅ PRONTO | Week 2 | Development environment |
| MCP Docker Railway production | ❌ FUTURE | EPIC-3 | After PoC validated |
| CLI invocation (`@expert-name`) | ✅ PRONTO | Week 3-4 | Core functionality |
| Dashboard UI | ❌ FUTURE | EPIC-4+ | Article I (CLI First) |
| Constitutional gates | ❌ FUTURE | Kairos Check | Separate project |
| Audit logging (expert decisions) | ✅ PRONTO | Week 3-4 | Observability baseline |
| Advanced caching (Vector DB) | ❌ FUTURE | EPIC-3+ | Performance optimization |

---

## VI. Risk Assessment & Mitigation

### High Risk: Research Fidelity <80%
**Probability:** Medium (expert domain complexity)  
**Impact:** Restart PoC, delay Expert #1 validation  
**Mitigation:** STARLITE framework ensures rigor; @po validation gate catches gaps  
**EPIC-2 Gate 1:** Research approval only if 80%+ confidence

### Medium Risk: MCP Docker Cost Overrun
**Probability:** Low (cost model based on benchmarks)  
**Impact:** Budget impact ~$100-200/mo per expert  
**Mitigation:** Cost tracking setup; alert on >$250/mo  
**EPIC-2 Gate 2:** Cost model validated before @dev starts

### Medium Risk: Vector DB Query Latency
**Probability:** Low (pgvector proven, <100ms expected)  
**Impact:** Expert clone response time >2s (unacceptable)  
**Mitigation:** Benchmark queries; add indexes; timeout fallback  
**EPIC-2 Gate 2:** <100ms query latency verified

### Low Risk: Expert Hallucination (New — from @architect feedback)
**Probability:** Medium (LLM-inherent)  
**Impact:** Clone gives wrong advice with confidence  
**Mitigation:** Fidelity audit + confidence calibration; flag uncertain answers  
**EPIC-2 Gate 3:** Hallucination audit documented; uncertainty detection enabled

---

## VII. Success Metrics (Epic-Level Gates)

### Gate 1: Research Approval (End of Story 2.1)
- [ ] 3 expert profiles documented (80%+ confidence)
- [ ] Voice DNA + thinking DNA extracted + verified
- [ ] Evidence sources linked (GitHub, blogs, papers, talks)
- [ ] Knowledge base documented (skills, heuristics, blind spots)
- [ ] @architect + @po approve findings OR request refinement

**Exit Criteria:** Research APPROVED (not working clone)

---

### Gate 2: Infrastructure Validation (End of Story 2.2)
- [ ] MCP Docker runs locally without errors
- [ ] Vector DB <100ms query latency (benchmarked)
- [ ] 85%+ test coverage
- [ ] Deployment guide complete
- [ ] Cost model validated ($200/mo ±$10)
- [ ] @architect approves infrastructure design
- [ ] Risk mitigation documented

**Exit Criteria:** Infrastructure READY for PoC

---

### Gate 3: PoC Validation (End of Story 2.3)
- [ ] Fidelity 85%+ achieved (Expert #1)
- [ ] Reproducibility 95%+ validated (another person)
- [ ] Hallucination audit complete (80%+ calibration score)
- [ ] E2E playbook documented + tested
- [ ] Cost <$30/month for single expert
- [ ] Decision: Scale to Expert #2 & #3 (EPIC-3)

**Exit Criteria:** PoC VALIDATED; ready for scaling

---

### Gate 4: Planning Completion (End of Story 2.4)
- [ ] E2E playbook finalized (any engineer can follow)
- [ ] Expert #2 & #3 roadmap documented
- [ ] Capacity plan complete (team hours, timeline, cost)
- [ ] EPIC-3 skeleton created
- [ ] Next sprint ready to start

**Exit Criteria:** Scaling infrastructure ready

---

## VIII. Dependency & Sequence

```
Week 1:
  ├─ Story 2.1 Phase 1 (systematic search)
  ├─ Story 2.2 starts (day 3 of research)
  └─ Gate 1 decision point (approve or refine research)

Weeks 2-4:
  ├─ Story 2.1 Phases 2-4 (expert mining)
  ├─ Story 2.2 complete (day 10)
  ├─ Story 2.3 starts (week 2.5 post-Gate 1)
  └─ Gate 2 decision point (approve infrastructure)

Week 4-5:
  ├─ Story 2.3 PoC + validation loop (3-5 days buffer)
  ├─ Story 2.4 scaling planning
  └─ Gate 3 decision point (approve PoC; proceed to Expert #2 & #3)

Gate 4: Ready for EPIC-3
```

---

## IX. Agent Collaboration & Authority

| Agent | Role | Scope | Authority |
|---|---|---|---|
| @analyst | Research Lead | Story 2.1 + Story 2.3 validation | DNA extraction, fidelity assessment |
| @dev | Infrastructure Lead | Story 2.2 + Story 2.3 build | MCP Docker, Vector DB, tests |
| @architect | Design Reviewer | Gates 2 & 3 approval | Architecture sign-off |
| @po | Fidelity Validator | Story 2.3 Gate 3 | PoC acceptance |
| @pm | Planning Lead | Story 2.4 | EPIC-3 planning |

**No conflicts detected.** Clear ownership per story.

---

## X. Lessons Learned Framework (for EPIC-3+)

After EPIC-2 complete, capture:
- **What worked:** Research patterns, infrastructure choices, PoC process
- **What didn't:** Fidelity gaps, cost surprises, latency issues
- **Next optimizations:** Scaling implications, team learnings

Document in: `docs/recipes/clone-expert-e2e.md` (Story 2.4 owns)

---

## XI. Related Documents

- `EPIC-2-expert-cloning.md` — Full epic breakdown (4 stories)
- `docs/stories/epics/expert-cloning/EXPERT-SPECIALIZATIONS.md` — 9-layer specs
- `memory/project-expert-clone-architecture.md` — Technical blueprint
- `memory/project-ccm-squad-research-plan.md` — STARLITE framework
- `.aiox-core/constitution.md` — Full Constitution (Art. I-VI)

---

## XII. Approval & Next Steps

**Research Completion:** ✅ EPIC-2 Scope audit complete  
**Next Action:** @architect reviews scope document  
**Timeline:** Move Story 2.1 to "In Progress" after approval  
**Review Cadence:** Gate decisions at end of each story

---

**Status:** Research phase complete — Ready for Architecture Review  
**Analyst Signature:** Atlas (🔍 Decoder)  
**Date:** 2026-06-05

