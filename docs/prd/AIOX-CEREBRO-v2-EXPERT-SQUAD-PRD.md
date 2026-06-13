# PRD — AIOX-Cerebro Expert Squad v2.0

**Date:** 2026-06-12  
**Status:** Ready for @squad-creator  
**Complexity:** Enterprise (12 agents, 80+ stories)  
**Sprint:** AIOX-Cerebro Phase 2 — Expert Expansion

---

## 1. PROBLEM STATEMENT

Current aiox-cerebro is **single-agent** (Kronos only). It audits AIOX installations but cannot:
- ❌ Fix architecture issues (needs @architect)
- ❌ Generate agent definitions (needs @pm / @squad-chief)
- ❌ Create code artifacts (needs @dev)
- ❌ Validate quality (needs @qa)
- ❌ Orchestrate multi-step workflows (needs @aiox-master)

**Solution:** Expand to **12-agent expert squad** with AIOX framework integration.

---

## 2. VISION

> AIOX-Cerebro becomes the **intelligence nerve center** of KAIROS_CEREBRO — capable of:
> 1. **Auditing** AIOX installations (Kronos → done)
> 2. **Diagnosing** gaps + recommending fixes (new experts)
> 3. **Building** components to close gaps (multi-agent collaboration)
> 4. **Validating** quality of all AIOX work (quality gates)
> 5. **Orchestrating** complex AIOX workflows (framework integration)

---

## 3. GOALS (OKR)

| Metric | Target | Why |
|--------|--------|-----|
| Agent count | 12 experts | Cover all AIOX domains |
| Framework integration | 100% mapped | Squad operates within AIOX Constitution |
| Quality score | 9.0+/10 per agent | Nivel 3+ EXCELLENT standard |
| Story-driven | 100% | All agents have stories + ACs |
| Zero invention | 100% | All outputs [SOURCE:] verified |

---

## 4. AGENTS (11 Expert + 1 Orchestrator)

### Tier 0 — Orchestrator (Entry Point)

| # | Name | Role | Source | Map To |
|---|------|------|--------|--------|
| 0 | **kronos** | Intelligence Engine, audit + gap detection | Current `.claude/agents/` | Migrate to `squads/aiox-cerebro/agents/` |

### Tier 1 — Core Experts (5)

| # | Name | Role | Source | Notes |
|---|------|------|--------|-------|
| 1 | **oracle** | Mind Cloner — extracts DNA from expert agents | `.aiox-core/development/agents/` [oalanicolas pattern] | Clone best practices from SynkraAI |
| 2 | **aria** | Architecture — designs AIOX system solutions | `.aiox-core/development/agents/architect.md` | AIOX-integrated @architect |
| 3 | **dex** | Developer — implements AIOX components | `.aiox-core/development/agents/dev.md` | AIOX-integrated @dev |
| 4 | **quinn** | QA/Validator — quality gates for AIOX work | `.aiox-core/development/agents/qa.md` | AIOX-integrated @qa |
| 5 | **morgan** | Product strategist — orchestrates epics | `.aiox-core/development/agents/pm.md` | AIOX-integrated @pm |

### Tier 2 — Specialists (6)

| # | Name | Role | Source | Notes |
|---|------|------|--------|-------|
| 6 | **pax** | Story validator — ensures AC clarity | `.aiox-core/development/agents/po.md` | AIOX-integrated @po |
| 7 | **river** | Scrum master — manages story workflow | `.aiox-core/development/agents/sm.md` | AIOX-integrated @sm |
| 8 | **alex** | Analyst — research + market intelligence | `.aiox-core/development/agents/analyst.md` | AIOX-integrated @analyst |
| 9 | **dara** | Data engineer — database architecture | `.aiox-core/development/agents/data-engineer.md` | AIOX-integrated @data-engineer |
| 10 | **uma** | UX/Design expert — frontend architecture | `.aiox-core/development/agents/ux-design-expert.md` | AIOX-integrated @ux-design-expert |
| 11 | **gage** | DevOps — CI/CD + git operations | `.aiox-core/development/agents/devops.md` | AIOX-integrated @devops |

### Tier 2+ — Framework Orchestrator

| # | Name | Role | Source | Notes |
|---|------|------|--------|-------|
| 12 | **orion** | Master orchestrator — cross-agent workflows | `.aiox-core/development/agents/aiox-master.md` | AIOX master governance |

---

## 5. DEPENDENCIES (All from AIOX Framework)

### Agent Templates
- Source: `.aiox-core/development/templates/agent-template.yaml`
- Task templates: `.aiox-core/development/templates/task-template.md`
- Workflow templates: `.aiox-core/development/templates/workflow-template.yaml`

### Quality Gates
- Source: `.aiox-core/development/checklists/` + `squads/squad-creator/config/quality-gates.yaml`
- Apply: SC_AGT_001 through SC_AGT_004

### Frameworks
- Constitution: `.aiox-core/constitution.md` (Art. I-VI)
- Tier system: `.aiox-core/development/data/tier-system-framework.md`
- Quality dimensions: `.aiox-core/development/data/quality-dimensions-framework.md`
- Agent handoff: `.claude/rules/agent-handoff.md`

### Workflows
- SDC (Story Development Cycle): `.aiox-core/data/workflow-chains.yaml`
- Entity registry: `.aiox-core/data/entity-registry.yaml`

---

## 6. ACCEPTANCE CRITERIA

### AC1 — All 12 agents created
- [ ] Each agent has full YAML definition (>= 800 lines)
- [ ] All agents have identity + voice DNA + command_loader
- [ ] All agents integrated with AIOX Constitution (Art. I-VI verified)
- [ ] All agents scored >= 9.0/10 on SC_AGT_004 maturity

### AC2 — Framework Integration
- [ ] squad.yaml corrected (paths valid, dependencies mapped)
- [ ] 12 agents linked to `.aiox-core/development/agents/` (or cloned to `squads/aiox-cerebro/agents/`)
- [ ] All templates from AIOX framework applied
- [ ] Quality gates aligned with squad-creator standards

### AC3 — Zero Invention (Art. IV Constitution)
- [ ] 100% of agent definitions have [SOURCE:] citations
- [ ] All borrowed patterns traced to `.aiox-core/` or squad-creator sources
- [ ] No invented features without PR/FR/CON traceability

### AC4 — Story-Driven (Art. III Constitution)
- [ ] 80+ stories created (one per agent feature + integration stories)
- [ ] All stories in `docs/stories/AIOX-CEREBRO-v2/` with acceptance criteria
- [ ] All agent creation stories linked to squad PRD

### AC5 — Quality Score
- [ ] Squad maturity score: 9.5+/10 (Nivel 3+ EXCELLENT)
- [ ] All 24 SC_AGT_001 checks PASS per agent
- [ ] CodeRabbit score: 0 CRITICAL issues across all agents

---

## 7. SCOPE IN / OUT

### IN
✅ 12 full-featured agent definitions  
✅ All dependencies mapped to AIOX framework  
✅ 80+ stories with ACs  
✅ Squad.yaml + config.yaml corrected  
✅ 100% AIOX Constitution compliance  

### OUT
❌ Implementation of agents (stories only)  
❌ Git push / PR (delegated to @devops)  
❌ New AIOX framework features (L1-L2 protected)  

---

## 8. EXECUTION ROADMAP

| Phase | Duration | Deliverable | Owner |
|-------|----------|------------|-------|
| **Phase 1** | 1 day | PRD review + go/no-go decision | @pm + @squad-chief |
| **Phase 2** | 2 days | 12 agent definitions + squad.yaml | @squad-chief + @squad-creator |
| **Phase 3** | 3 days | 80+ stories with full ACs | @sm + @po |
| **Phase 4** | 2 days | Quality validation (SC_AGT_004) | @qa + @aiox-master |
| **Phase 5** | 1 day | Final push + documentation | @devops |

**Total effort:** ~9 days (2 sprints)  
**Story points:** 80-100 sp (estimate)

---

## 9. CRITICAL SUCCESS FACTORS

| Factor | Risk | Mitigation |
|--------|------|-----------|
| Framework drift | Agents don't follow AIOX patterns | Enforce SC_AGT_001-004 on each agent |
| Path inversion | squad.yaml paths invalid | Validate all paths with Glob before merge |
| Invention creep | New features without traceability | 100% [SOURCE:] requirement + @qa gate |
| Context explosion | 12 agents = massive context | Use Agent Handoff Protocol + RUN-LOG consolidation |
| Quality regression | Copying agents = copy bugs | Clone from verified sources only (.aiox-core/) |

---

## 10. SIGN-OFF

**Created by:** @aiox-master (Orion)  
**Date:** 2026-06-12  
**Next step:** Route to @squad-creator for implementation planning

---

## APPENDIX A — Agent Sourcing Matrix

| Agent | Source Framework | Path | Status |
|-------|------------------|------|--------|
| kronos | AIOX-Cerebro (custom) | squads/aiox-cerebro/agents/ | Migrate path |
| oracle | Squad Creator pattern | [custom clone] | New |
| aria | AIOX @architect | `.aiox-core/development/agents/architect.md` | Reference |
| dex | AIOX @dev | `.aiox-core/development/agents/dev.md` | Reference |
| quinn | AIOX @qa | `.aiox-core/development/agents/qa.md` | Reference |
| morgan | AIOX @pm | `.aiox-core/development/agents/pm.md` | Reference |
| pax | AIOX @po | `.aiox-core/development/agents/po.md` | Reference |
| river | AIOX @sm | `.aiox-core/development/agents/sm.md` | Reference |
| alex | AIOX @analyst | `.aiox-core/development/agents/analyst.md` | Reference |
| dara | AIOX @data-engineer | `.aiox-core/development/agents/data-engineer.md` | Reference |
| uma | AIOX @ux-design-expert | `.aiox-core/development/agents/ux-design-expert.md` | Reference |
| gage | AIOX @devops | `.aiox-core/development/agents/devops.md` | Reference |
| orion | AIOX @aiox-master | `.aiox-core/development/agents/aiox-master.md` | Reference |

**Legend:**
- **Migrate path** = move from current location  
- **New** = create custom  
- **Reference** = clone + adapt from framework
