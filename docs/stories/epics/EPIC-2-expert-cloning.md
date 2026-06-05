---
epic_id: EPIC-2
title: Expert Cloning CCM Squad — Full Research + Infrastructure
status: Backlog
created: 2026-06-05
priority: High
complexity: HIGH (3 agents, 4 stories, 4-5 weeks)
---

# EPIC-2: Expert Cloning CCM Squad

**Vision:** Clone 3 expert specialists (System Architect, Governance Designer, Operational Excellence) to elevate CCM squad from generalist to specialist-driven decision-making.

**Outcomes:**
- ✅ 3x faster architecture decisions
- ✅ 100% Constitutional compliance (zero governance conflicts)
- ✅ 99.5%+ SLO achievement (infrastructure confidence)
- ✅ 40% reduction in architecture debt cycles

**Timeline:** 4-5 weeks  
**Team:** @analyst (research), @dev (infrastructure), @architect (review), @po (validation)  
**Investment:** ~150 hours development + $200/mo infrastructure

---

## 📋 Stories Breakdown

### Story 2.1: STARLITE Research — Expert Discovery
**Assigned to:** @analyst (Atlas)  
**Duration:** 4 weeks  
**Story Points:** 13sp (research-heavy)

#### Objective
Execute full STARLITE framework to identify 3 expert profiles per domain gap:
1. System Complexity Architect (multi-agent orchestration)
2. Governance & Authority Designer (Constitutional authority)
3. Operational Excellence (agent infrastructure + SLOs)

#### Acceptance Criteria
- [ ] Phase 1: Systematic search complete (3 days)
  - Searched Anthropic internals + community + comparative platforms
  - Identified 3+ candidates per expert domain
  - Sources documented (GitHub, blogs, papers, talks)
  
- [ ] Phase 2: Expert identification (5 days)
  - Deep dives on each candidate completed
  - Voice patterns extracted (50+ communication examples)
  - Decision frameworks documented (GitHub code, written decisions)
  - Heuristics identified (quick rules, patterns)
  
- [ ] Phase 3: Mining + DNA extraction (10 days)
  - Voice DNA complete (tone, vocabulary, signature phrases, teaching style)
  - Thinking DNA complete (mental models, heuristics, blind spots, triggers)
  - Knowledge base documented (papers, code, case studies, contextual)
  - Skills audit complete (4-tier stack per expert)
  
- [ ] Phase 4: Validation & synthesis (5 days)
  - Cross-checked findings (consensus across sources)
  - Identified conflicts (where experts disagree)
  - Decision matrix created (performance vs complexity trade-offs)
  - Effectiveness tested (can patterns be applied?)
  
- [ ] Gate 1: Research approval
  - [ ] All 3 expert profiles documented (80%+ confidence)
  - [ ] Evidence sources verified + linked
  - [ ] Braistorm notes on CCM squad applications
  - [ ] Pedro approves findings OR requests refinement

#### File List
- `docs/stories/epics/expert-cloning/research-findings.md` — Validated expert profiles
- `docs/stories/epics/expert-cloning/voice-dna-expert-1.md` — System Architect voice
- `docs/stories/epics/expert-cloning/voice-dna-expert-2.md` — Governance voice
- `docs/stories/epics/expert-cloning/voice-dna-expert-3.md` — DevOps voice
- `docs/stories/epics/expert-cloning/thinking-dna-expert-*.md` — Thinking patterns (x3)
- `docs/stories/epics/expert-cloning/braistorm-ccm-applications.md` — CCM integration notes

#### Dependencies
- Requires: EXPERT-SPECIALIZATIONS.md approval
- Enables: Story 2.2 (infrastructure can start day 3 of research)

---

### Story 2.2: Infrastructure Build — MCP Docker + Vector DB
**Assigned to:** @dev (Dex)  
**Duration:** 1 week  
**Story Points:** 8sp

#### Objective
Build MCP Docker server + Supabase vector database infrastructure to load and inject expert 9-layer DNA into Claude prompts.

#### Acceptance Criteria
- [ ] MCP Docker server (Node.js)
  - [ ] Loads 9-layer DNA from Vector DB
  - [ ] Injects DNA into Claude system prompts
  - [ ] Manages expert state (memory, context, metrics)
  - [ ] Exposes REST API (invoke expert, validate, measure)
  - [ ] Dockerfile + docker-compose.yaml created
  - [ ] .env.example with all required vars
  - [ ] Runs locally without errors
  
- [ ] Vector DB schema (Supabase + pgvector)
  - [ ] Tables created: expert_identities, voice_dna, thinking_dna, skills, knowledge, rules, validation, integration
  - [ ] pgvector embeddings setup (for similarity search)
  - [ ] RLS policies implemented (squad-based access control)
  - [ ] Indexes created (fast lookup by topic, pattern, skill)
  - [ ] Migrations documented
  - [ ] Seed data ready (from research findings)
  
- [ ] Integration tests
  - [ ] MCP server health check passes
  - [ ] Vector DB queries return results <100ms
  - [ ] DNA injection working (prompts include 9 layers)
  - [ ] State management functional (memory persistence)
  - [ ] 10+ test scenarios pass (85%+ coverage)
  
- [ ] Gate 2: Infrastructure validation
  - [ ] All tests passing
  - [ ] Cost model validated ($200/mo for production scale)
  - [ ] Documentation complete (deployment guide)
  - [ ] @architect approves architecture

#### File List
- `infrastructure/mcp-docker/Dockerfile`
- `infrastructure/mcp-docker/docker-compose.yaml`
- `infrastructure/mcp-docker/src/mcp-server.js` — Main server
- `infrastructure/mcp-docker/src/dna-injector.js` — DNA injection logic
- `infrastructure/supabase/schema.sql` — Complete DDL
- `infrastructure/supabase/migrations/001-expert-schema.sql`
- `tests/infrastructure/mcp-server.test.js`
- `docs/infrastructure/DEPLOYMENT.md` — Local + Railway setup
- `docs/infrastructure/COST-MODEL.md` — $200/mo analysis

#### Dependencies
- Requires: Story 2.1 research complete (DNA profiles ready)
- Enables: Story 2.3 (PoC needs infrastructure)

---

### Story 2.3: Proof of Concept — Clone Expert #1
**Assigned to:** @dev (Dex) + @analyst (Atlas)  
**Duration:** 2 weeks  
**Story Points:** 8sp

#### Objective
Clone Expert #1 (System Complexity Architect), validate fidelity 85%+, and test reproducibility 95%+.

#### Acceptance Criteria
- [ ] Expert #1 clone built
  - [ ] System prompt created (9 layers injected)
  - [ ] DNA loaded from Vector DB
  - [ ] Operational in local MCP Docker environment
  
- [ ] Fidelity audit (10+ scenarios)
  - [ ] Decision pattern match: 85%+ (expert gives 3+ alternatives consistently)
  - [ ] Vocabulary match: 80%+ (signature phrases, terminology)
  - [ ] Architecture alignment: 80%+ (known preferences match recommendations)
  - [ ] Confidence calibration: High (stated confidence ≈ actual accuracy)
  - [ ] All measurements documented + scored
  
- [ ] Reproducibility test
  - [ ] Another person (not Pedro) uses expert
  - [ ] Without Pedro's guidance
  - [ ] Follows e2e playbook exactly
  - [ ] Validates: Same decisions? Same recommendations? 95%+ match
  - [ ] Test results documented
  
- [ ] Playbook documentation (e2e clone procedure)
  - [ ] Step-by-step guide created (docs/recipes/clone-expert-e2e.md)
  - [ ] Can be followed by anyone
  - [ ] Time estimates accurate
  
- [ ] Gate 3: PoC validation
  - [ ] Fidelity 85%+ achieved
  - [ ] Reproducibility 95%+ validated
  - [ ] Braistorm insights documented (Expert #1 value to CCM)
  - [ ] Cost <$30/month for single expert
  - [ ] Decision: Scale to Expert #2 & #3

#### File List
- `squads/expert-system-architect/SYSTEM_PROMPT.md` — 9-layer injection
- `squads/expert-system-architect/dna-extraction.md` — Research findings for this expert
- `docs/recipes/clone-expert-e2e.md` — Step-by-step playbook
- `tests/poc/fidelity-audit-expert-1.md` — Fidelity scores + evidence
- `tests/poc/reproducibility-test.md` — Another person's validation
- `docs/poc/expert-1-braistorm.md` — Applications in CCM squad

#### Dependencies
- Requires: Story 2.2 infrastructure ready
- Enables: Story 2.4 (scale planning uses Expert #1 learnings)

---

### Story 2.4: Scale Planning — Roadmap Expert #2 & #3
**Assigned to:** @pm (Morgan)  
**Duration:** 1 week  
**Story Points:** 5sp

#### Objective
Finalize expert cloning playbook and plan scaling to Expert #2 & #3.

#### Acceptance Criteria
- [ ] E2E playbook finalized
  - [ ] docs/recipes/clone-expert-e2e.md complete + reviewed
  - [ ] Can be used by any future cloning effort
  - [ ] Includes all lessons from Expert #1 PoC
  
- [ ] Expert #2 & #3 planning
  - [ ] Research depth defined (can parallelize or sequence)
  - [ ] PoC effort estimated (days per expert)
  - [ ] Infrastructure scaling assessed (cost impact)
  
- [ ] Capacity planning
  - [ ] Team allocation estimated (hours per expert)
  - [ ] Timeline forecast (parallel vs sequential)
  - [ ] Cost projection (scaling from $30/mo to $200/mo)
  - [ ] Dependencies identified
  
- [ ] New Epic created (or stories added to backlog)
  - [ ] EPIC-3 or 2.5-2.7: Scale Expert Cloning
  - [ ] Stories for Expert #2 clone
  - [ ] Stories for Expert #3 clone
  - [ ] Success metrics inherited from Expert #1

#### File List
- `docs/recipes/clone-expert-e2e.md` — Final version
- `docs/planning/expert-cloning-roadmap.md` — 4-week outlook
- `docs/planning/expert-cloning-capacity.md` — Team + cost analysis
- `docs/stories/epics/EPIC-3-expert-scaling.md` — Next epic sketch

#### Dependencies
- Requires: Story 2.3 PoC complete + learnings documented
- Output: Ready for 2-week sprint per expert (Expert #2, Expert #3)

---

## 📊 Epic Dependencies & Timeline

```
Week 1:
  ├─ Story 2.1 Phase 1 (systematic search) — 3 days
  ├─ Story 2.2 starts (can begin day 3)
  └─ Gate: Proceed with full research?

Weeks 2-4:
  ├─ Story 2.1 Phases 2-4 (parallel expert mining)
  ├─ Story 2.2 complete by end Week 2
  ├─ Story 2.3 starts Week 2.5 (infrastructure ready)
  └─ Gate: Research findings approved?

Week 4-5:
  ├─ Story 2.3 PoC complete + validated
  ├─ Story 2.4 scaling planning
  └─ Gate: Ready to scale to Expert #2 & #3?

POST-EPIC:
  └─ EPIC-3: Scale Expert Cloning (Expert #2 & #3, 2-3 weeks each)
```

---

## ✅ Success Criteria (Epic Level)

### Research Quality
- ✅ 3 experts identified per gap (9 total)
- ✅ 80%+ confidence on all profiles
- ✅ Voice DNA + Thinking DNA extracted + verified
- ✅ Knowledge base documented with sources

### Infrastructure Quality
- ✅ MCP Docker operational locally
- ✅ Vector DB <100ms query latency
- ✅ 10+ integration tests pass
- ✅ Deployment guide complete

### PoC Validation
- ✅ Fidelity 85%+ achieved (Expert #1)
- ✅ Reproducibility 95%+ validated
- ✅ E2E playbook complete + tested
- ✅ Cost model confirmed ($200/mo at scale)

### Team Readiness
- ✅ All agents trained on expert cloning process
- ✅ Documentation clear + accessible
- ✅ Next epic (Expert #2 & #3) ready to start

---

## 🎯 Post-Epic Value Delivery

After EPIC-2 complete:

**Immediate (Weeks 1-5):**
- System Complexity Architect operational → 3x faster architecture decisions
- Infrastructure documentation complete → foundation for scaling

**Short-term (Weeks 6-12):**
- Expert #2 & #3 cloned → governance + infrastructure specialization
- CCM squad now 10 agents (7 + 3 experts)
- Decision quality metrics showing 40% improvement

**Medium-term (Weeks 12+):**
- Squad can handle 10x complexity (scale from 7→20+ effective agents)
- Incident response 50% faster
- Architecture debt cycles reduced 40%

---

## 📝 Notes for Execution

### For @analyst (Atlas)
- Use STARLITE framework exactly as documented
- Validate all sources (never assume)
- Extract both explicit + implicit patterns
- Document everything with evidence trails

### For @dev (Dex)
- Infrastructure must be reproducible (anyone can spin up)
- Tests must be comprehensive (85%+ coverage minimum)
- Cost modeling critical (must be accurate to ±$10)
- Document assumptions (token costs, rate limits, etc)

### For @pm (Morgan)
- Gate decisions are binary (approve or request refinement)
- No scope creep (3 experts, not more)
- Timeline is binding (4-5 weeks, not open-ended)
- Success metrics must be measurable

### For @architect (Aria)
- Review infrastructure design (must be scalable)
- Validate authority boundaries (no conflicts)
- Approve before @dev starts (avoid rework)

---

## 📌 Related Documents

- `EXPERT-SPECIALIZATIONS.md` — Detailed 9-layer specs per expert
- `EXPERT-CLONING-SCOPE.md` — Complete scope + value + pré-requisites
- `project-expert-clone-architecture.md` — Technical blueprint (memory)
- `project-ccm-squad-research-plan.md` — STARLITE framework (memory)

---

**Status:** Ready for backlog → first sprint  
**Next Action:** Move Story 2.1 to "In Progress" when @analyst ready  
**Review Date:** After Gate 1 (research approval)

