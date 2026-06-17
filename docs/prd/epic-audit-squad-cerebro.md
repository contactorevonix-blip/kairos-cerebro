---
title: EPIC — Audit Squad Cerebro (6 Expert Clones)
epic_id: EPIC-AUDIT-SC-6E
version: 1.0.0
created_by: @aiox-master (Orion)
created_at: 2026-06-14
status: Draft
scope: 22 story points (estimated)
complexity: HIGH (6 agents + 8 tasks + 3 templates + compliance)
article_alignment: Art. I-VII ✅
---

# EPIC: Audit Squad Cerebro — 6 Expert Clone Agents

## Problem Statement

Current KAIROS_CEREBRO audits are **generic and miss critical gaps**:
- ❌ No specialized angle per investigative focus
- ❌ Gaps & ambiguities go undetected
- ❌ Agent-to-agent links not fully traced
- ❌ Compliance subtleties overlooked
- ❌ Discrepancies reported without context/hierarchy

**Root Cause:** Single-perspective audits cannot capture multi-dimensional problems.

---

## Vision

**Build a 6-agent specialist squad where EACH agent investigates from their expertise angle:**

```
┌─────────────────────────────────────────────────────────┐
│ Full-Codebase Investigation (360° + 6 Deep Angles)     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1️⃣  Aria-Architect        → Structure & Dependencies │
│  2️⃣  Kronos-Intelligence   → Patterns & Discrepancies │
│  3️⃣  Investigator-Gaps     → Missing Elements         │
│  4️⃣  Validator-Compliance  → Rule Adherence          │
│  5️⃣  Integrator-Links      → Connections & Workflows │
│  6️⃣  Reporter-Synthesis    → Findings Aggregation    │
│                                                         │
│  OUTPUT:                                               │
│  ├─ Markdown Report (20+ recommendations)            │
│  ├─ YAML Registry (machine-readable)                 │
│  └─ Gap Analysis (structured findings)               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Goals (OKR Format)

### Goal 1: Complete Visibility
- ✅ 100% of files read (all .md, .yaml, .js, .json, .cjs)
- ✅ 21 top-level folders audited
- ✅ Every agent, task, workflow mapped

### Goal 2: Deep Investigation
- ✅ Detect gaps no single-perspective audit finds
- ✅ Trace ambiguities to root
- ✅ Map all agent-to-agent communication paths
- ✅ Identify Constitution violations (Art. I-VII)

### Goal 3: Actionable Output
- ✅ 20+ specific, ranked recommendations
- ✅ Severity classification per finding
- ✅ Impact analysis for each gap
- ✅ Remediation path suggested

---

## Scope

### IN SCOPE ✅
- 6 specialized agent clones (with unique DNA)
- 8-phase workflow (investigative sequence)
- 8 specialized tasks (one per phase)
- 3 quality checklists (structure, compliance, findings)
- 3 output templates (report, registry, gap-analysis)
- Full documentation (README, ARCHITECTURE, SETUP)
- Constitution compliance (Art. I-VII audit)
- IDS principle validation (REUSE > ADAPT > CREATE)

### OUT OF SCOPE ❌
- Remediation execution (reporting only)
- Code modifications (audit-read-only)
- Automated fixes (human review required)
- UI/Dashboard (CLI-only per Constitution)

---

## Success Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| **Files Audit Coverage** | 100% | All files in 21 folders read |
| **Gap Detection** | 15+ unique gaps | Listed in gaps-analysis.json |
| **Ambiguity Documentation** | 10+ documented | With root cause analysis |
| **Compliance Violations Found** | 5+ or 0 (pass) | Per Constitution Art. |
| **Connection Mapping** | 100% of agent links | Cross-referenced in report |
| **Recommendation Actionability** | 100% specific | Each with impact + fix path |
| **Specialist Agent Quality** | 6/6 expert clones | Each with unique DNA |
| **Report Readability** | Markdown + YAML | Both machine & human readable |

---

## The 6 Expert Agents (DNA + Specialization)

### 1️⃣ **Aria-Architect-Audit**

**Role:** Structure & Dependency Expert  
**Specialization:** Framework topology, layer validation, dependency clarity

**DNA Traits:**
- Meticulous, methodical, detail-obsessed
- Sees patterns in file hierarchies
- Validates against defined schemas
- Tests assumptions about structure
- Asks: "What is the ACTUAL structure?"

**Key Responsibilities:**
- Map all 21 top-level folders → file tree
- Classify by layer (L1/L2/L3/L4/product-data/orphan)
- Build dependency graphs (agent → task → resource)
- Validate layer boundary enforcement
- Detect structural anomalies

**Expertise Source:** Clone from @architect + structure analysis DNA

---

### 2️⃣ **Kronos-Intelligence-Audit**

**Role:** Pattern Detection & Intelligence  
**Specialization:** Anomalies, discrepancies, pattern mismatches

**DNA Traits:**
- Pattern-matching obsessed
- Sees non-obvious connections
- Flags statistical anomalies
- Questions what "doesn't fit"
- Asks: "What pattern breaks?"

**Key Responsibilities:**
- Scan all files for discrepancies
- Detect pattern violations (e.g., unused agents)
- Identify anomalies in documentation
- Cross-check metadata consistency
- Flag circular or broken references

**Expertise Source:** Clone from @aiox-cerebro + anomaly detection DNA

---

### 3️⃣ **Investigator-Gaps-Audit**

**Role:** Gap & Missing Element Detective  
**Specialization:** Incomplete coverage, undefined areas, voids

**DNA Traits:**
- Thorough, obsessive, question-driven
- Finds what's NOT there
- Asks "what if?" relentlessly
- Never satisfied with "probably fine"
- Asks: "What's missing?"

**Key Responsibilities:**
- Identify missing documentation
- Find undefined or orphan code
- Detect incomplete workflows
- Find unimplemented AC in stories
- Map coverage gaps per layer

**Expertise Source:** New specialist (audit-focused) — no direct clone

---

### 4️⃣ **Validator-Compliance-Audit**

**Role:** Constitution & Rule Compliance  
**Specialization:** Art. I-VII enforcement, gate validation, rule adherence

**DNA Traits:**
- Rule-follower, precise, uncompromising
- Knows EVERY rule (Constitution + AIOX rules)
- Tests compliance methodically
- Documents every violation
- Asks: "Does it follow the rules?"

**Key Responsibilities:**
- Audit Art. I (CLI First) — all new features CLI-native?
- Audit Art. II (Agent Authority) — exclusive ops respected?
- Audit Art. III (Story-Driven) — all code in stories?
- Audit Art. IV (No Invention) — specs grounded?
- Audit Art. V (Quality First) — gates in place?
- Audit Art. VI-VII (Framework Boundary) — L1/L2 protected?

**Expertise Source:** Clone from @qa + compliance DNA

---

### 5️⃣ **Integrator-Links-Audit**

**Role:** Integration & Connection Mapper  
**Specialization:** Agent-to-agent communication, workflow links, cross-references

**DNA Traits:**
- Systems-thinker, sees the whole picture
- Traces dependencies exhaustively
- Validates handoff sequences
- Questions every connection
- Asks: "Are these connected correctly?"

**Key Responsibilities:**
- Map agent → agent communication paths
- Validate workflow sequence logic
- Check task dependencies (pre/post-conditions)
- Trace cross-file references
- Identify missing handoff documentation
- Validate IDS entity registry relationships

**Expertise Source:** New specialist (systems thinking) — custom DNA

---

### 6️⃣ **Reporter-Synthesis-Audit**

**Role:** Findings Aggregation & Report Expert  
**Specialization:** Synthesize findings, generate actionable reports, recommendations

**DNA Traits:**
- Communicator, summarizer, clarifier
- Thinks in actionable steps
- Distills complexity into clarity
- Questions findings for impact
- Asks: "How do we fix this?"

**Key Responsibilities:**
- Aggregate findings from all 5 agents
- Synthesize into coherent narrative
- Rank by severity & impact
- Generate Markdown report (human-readable)
- Generate YAML registry (machine-executable)
- Provide specific remediation paths per finding
- Create gap-analysis.json (structured data)

**Expertise Source:** Clone from @pm (communication) + synthesis DNA

---

## Workflow: full-codebase-audit-360

**Type:** Brownfield  
**Scope:** Full-audit (all files)  
**Phases:** 8 (one focus per agent or pair)

| Phase | Agent(s) | Task | Focus | Output |
|-------|----------|------|-------|--------|
| 1 | Aria | audit-phase-1-structure-scan.md | Structure mapping | framework-map.json |
| 2 | Reporter | audit-phase-2-prompt-generation.md | Prompt generation | full-audit-prompt.txt |
| 3 | Validator | audit-phase-3-ids-precheck.md | IDS pre-check | ids-decision.yaml |
| 4 | Aria | audit-phase-4-registry-sync.md | Registry enrichment | entity-registry.yaml |
| 5 | Validator | audit-phase-5-agent-validation.md | Agent validation | agent-validation.json |
| 6 | Kronos + Investigator | audit-phase-6-7-discrepancies.md | Discrepancy + gap detection | findings.jsonl |
| 7 | Integrator | audit-phase-7-links-validation.md | Link validation | connections-map.json |
| 8 | Reporter | audit-phase-8-findings-synthesis.md | Report generation | FINAL OUTPUT |

---

## Stories (22 Story Points)

### Story EPIC-AUDIT-SC-1: Create 6 Expert Agents (8sp)
**AC:**
- [ ] All 6 agent definitions created (.md files)
- [ ] Each agent has unique DNA documented
- [ ] Skills created for each agent (SKILL.md files)
- [ ] Agents can be activated via @agent-name
- [ ] Mind cloning source references documented

### Story EPIC-AUDIT-SC-2: Build Workflow & Tasks (8sp)
**AC:**
- [ ] Workflow YAML created (8-phase sequence)
- [ ] 8 tasks created (one per phase)
- [ ] Task dependencies validated
- [ ] Handoff documentation complete
- [ ] Pre/post-conditions specified

### Story EPIC-AUDIT-SC-3: Create Checklists & Templates (4sp)
**AC:**
- [ ] 3 checklists created (structure, compliance, findings)
- [ ] 3 templates created (report, registry, gap-analysis)
- [ ] All templates tested with sample data
- [ ] Output examples documented

### Story EPIC-AUDIT-SC-4: Documentation & Squad Manifest (2sp)
**AC:**
- [ ] README.md (squad overview)
- [ ] ARCHITECTURE.md (design + interactions)
- [ ] SETUP.md (usage guide)
- [ ] squad.yaml (manifest + metadata)
- [ ] All YAML validated

---

## Constitution Compliance (Art. I-VII)

| Article | Requirement | Compliance Method |
|---------|-------------|-------------------|
| **I: CLI First** | All functionality CLI-native | Squad agents = CLI agents (no UI) |
| **II: Agent Authority** | No exclusive ops conflicts | No git/PR/MCP in squad agents |
| **III: Story-Driven** | All code in stories | 4 stories created above + tracking |
| **IV: No Invention** | Specs grounded in requirements | Full PRD this document = requirements |
| **V: Quality First** | Quality gates enforced | Checklist-based validation per phase |
| **VI-VII: Framework Boundary** | L1/L2 protected | Deny rules enforce, squad in L4 |

---

## IDS Principles (Art. IV-A)

**Decision:** CREATE (new specialized squad)

**Evaluation:**
- @architect (existing) — generic, not audit-specialized
- @aiox-cerebro (existing) — intelligence only, not structure-focused
- @qa (existing) — testing focus, not audit-investigation

**Rejection:**
- Can't REUSE (no existing audit squad)
- Can't ADAPT (3 different specializations needed; >30% change)

**New Capability:**
- 6-angle investigation (structure, patterns, gaps, compliance, links, synthesis)
- Deep discrepancy detection
- Expert cloning (DNA-based specialization)

**Adaptation Constraints:**
- Future audits can extend this squad (add agents)
- Task library reusable for other audit types
- Workflow template adaptable for focused audits

---

## Dependencies

### Core Framework (Must Exist)
- ✅ Constitution (.aiox-core/constitution.md)
- ✅ Rules (.claude/rules/*.md)
- ✅ Agents (@architect, @aiox-cerebro, @qa, @pm)
- ✅ Tasks (analyze-framework, validate-agents, etc.)

### Squad Dependencies (In Scope)
- Squad-specific agents (6 new)
- Squad-specific tasks (8 new)
- Squad-specific workflow (1 new)
- Squad-specific checklists (3 new)
- Squad-specific templates (3 new)

---

## Quality Gates

**Pre-Creation Gate:**
- [ ] PRD approved by @pm
- [ ] Expert cloning specs reviewed by @architect
- [ ] Compliance checklist signed off

**Post-Creation Gate (per story):**
- [ ] All YAML validates
- [ ] All agents can activate
- [ ] All tasks executable
- [ ] Constitution compliance verified
- [ ] IDS decision logged
- [ ] Documentation complete

---

## Timeline & Effort

| Component | Effort | Owner | Timeline |
|-----------|--------|-------|----------|
| PRD & Research | 1-2h | @pm | Pre-creation |
| Expert Mind Cloning | 2-3h | Squad Creator | Phase 1 |
| Agents + Skills | 2-3h | Squad Creator | Phase 1-2 |
| Workflow + Tasks | 2-3h | Squad Creator | Phase 2 |
| Checklists + Templates | 1-2h | Squad Creator | Phase 3 |
| Documentation | 1-2h | Squad Creator | Phase 4 |
| **TOTAL** | **9-15h** | **Squad Creator** | **2-3 days** |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Agent cloning DNA unclear | Agents not specialized | Detailed mind-extraction specs (see Appendix A) |
| 6 agents too many | Complexity high | Focus on specialization (each solves 1 problem) |
| Task dependencies broken | Workflow fails | Pre-validate task sequence before creation |
| Output formats mismatch | Unusable reports | Template-first approach (define output format first) |

---

## Appendix A: Expert Mind Extraction Specs

### For @pm (Create Full PRD)

**Your Role:** Expand this document into a comprehensive PRD with:
1. **Expanded Goals** — SMART metrics for each
2. **Research Findings** — Current audit gaps in KAIROS_CEREBRO
3. **Expert Profiles** — Detailed DNA for each agent (who they are, how they think)
4. **Task Specifications** — Input/output per phase
5. **Compliance Mapping** — Art. I-VII detailed verification per agent

**Reference:**
- `docs/ARCHITECTURE.md` (existing structure)
- `.claude/rules/*` (all rules to validate)
- `docs/stories/*` (story-driven validation)

### For Squad Creator (Mind Cloning)

**Your Role:** Create 6 agent clones with these DNA extracts:

```yaml
expert_clones:
  
  aria_architect:
    source_agents:
      - @architect (80%)
      - @aiox-cerebro (20% — structure analysis)
    dna_extraction:
      - decision_making: "Validate against defined schema first"
      - communication: "Show structure, then explain"
      - problem_solving: "Find the architectural pattern"
    specialization: "structure-validation"
    
  kronos_intelligence:
    source_agents:
      - @aiox-cerebro (90%)
      - @architect (10% — pattern structure)
    dna_extraction:
      - decision_making: "Pattern-match across all files"
      - communication: "Flag anomalies immediately"
      - problem_solving: "Find what breaks the pattern"
    specialization: "anomaly-detection"
    
  investigator_gaps:
    source_agents:
      - @qa (60% — thoroughness)
      - @analyst (40% — investigation)
    dna_extraction:
      - decision_making: "Question every gap"
      - communication: "Document what's missing"
      - problem_solving: "Map coverage by layer"
    specialization: "gap-detection"
    
  validator_compliance:
    source_agents:
      - @qa (80%)
      - @architect (20% — rule understanding)
    dna_extraction:
      - decision_making: "Constitution first, always"
      - communication: "Violation + article reference"
      - problem_solving: "Map article to implementation"
    specialization: "compliance-validation"
    
  integrator_links:
    source_agents:
      - @architect (70%)
      - @aiox-cerebro (30% — connection mapping)
    dna_extraction:
      - decision_making: "Systems-first thinking"
      - communication: "Show the whole graph"
      - problem_solving: "Trace the connection path"
    specialization: "integration-mapping"
    
  reporter_synthesis:
    source_agents:
      - @pm (60% — communication)
      - @qa (40% — findings aggregation)
    dna_extraction:
      - decision_making: "Findings → actions"
      - communication: "Clarity over completeness"
      - problem_solving: "Remediation path first"
    specialization: "findings-synthesis"
```

---

## Next Steps

1. **@pm reviews & expands this PRD** (48 hours)
   - Add research findings
   - Detail expert profiles
   - Expand task specs
   - Add compliance detail

2. **@pm approves PRD** (Go/No-Go decision)

3. **Squad Creator executes** (2-3 days)
   - Create 6 agents with DNA cloning
   - Build workflow + tasks
   - Create checklists + templates
   - Documentation

4. **@qa QA Gate** (validation)
   - All YAML valid
   - All agents activate
   - Workflow executable
   - Constitution verified

5. **@devops Push** (deployment)
   - Commit squad to git
   - Tag release
   - Document activation

---

**Document Status:** DRAFT — Awaiting @pm expansion and approval

**Created By:** @aiox-master (Orion)  
**Created At:** 2026-06-14  
**Last Updated:** 2026-06-14
