# SYNAPSE Rules ↔ Enforcement Audit (Complete)

**Date:** 2026-06-12 (Session Cont 35)  
**Scope:** All 16 rules vs 22 hooks  
**Status:** CRITICAL GAPS IDENTIFIED

---

## Summary Table

| Rule File | Severity | Scope | Hook Status | Coverage | Gap |
|-----------|----------|-------|-------------|----------|-----|
| **agent-authority.md** | MUST | 6 agent operations (git, epic, story, etc) | ✅ enforce-agent-authority.cjs | 33% | Missing @pm, @po, @sm enforcement |
| **story-lifecycle.md** | MUST | 5 status transitions (Draft→Ready→InProgress→InReview→Done) | ❌ NONE | 0% | **CRITICAL: Anyone can change story status** |
| **enforcement-gates.md** | MUST | 6 Constitutional articles (Art. I-VII) | ✅ 4 hooks (art-ii, iii, iv, v-vii) | 65% | Art. I (CLI First) not auto-blocked |
| **ids-principles.md** | MUST | IDS registry, pre-commit checks, artifact reuse | ⚠️ ids-pre-push.js | 40% | No runtime IDS validation |
| **workflow-execution.md** | SHOULD | 4 workflows (SDC, QA Loop, Spec, Brownfield) | ❌ NONE | 0% | Workflows are manual, not enforced |
| **planning-tracks.md** | SHOULD | Track routing (Quick/Standard/Enterprise) | ❌ NONE | 0% | No auto-detection of complexity |
| **coderabbit-integration.md** | SHOULD | CodeRabbit auto-heal in dev phase | ✅ Integrated in hooks | 70% | Needs self-healing retry logic |
| **agent-handoff.md** | SHOULD | Handoff protocol on agent switches | ❌ NONE | 0% | No automatic handoff creation |
| **handoff-consolidation.md** | SHOULD | 5+ handoff consolidation into RUN-LOG | ❌ NONE | 0% | Manual process |
| **mcp-usage.md** | SHOULD | MCP governance (@devops exclusive) | ⚠️ Implicit in agent-authority | 30% | No specific MCP enforcement hook |
| **tool-examples.md** | INFO | Tool selection guidance | ❌ NONE | 0% | Reference docs only, not enforced |
| **tool-response-filtering.md** | INFO | Response token reduction | ❌ NONE | 0% | No auto-filtering |
| **smart-routing.md** | SHOULD | Automatic workflow routing | ❌ NONE | 0% | Manual routing |
| **confidence-scoring.md** | SHOULD | Confidence tiers for decisions | ❌ NONE | 0% | No auto-scoring |
| **token-budget.md** | INFO | Token efficiency per task | ❌ NONE | 0% | No auto-enforcement |
| **agent-memory-imports.md** | SHOULD | Agent memory lifecycle | ❌ NONE | 0% | No validation |

---

## Critical Gaps (Blocking Issues)

### 🔴 GAP-1: Story Status Transitions (0% enforcement)
**Rule:** story-lifecycle.md  
**Defines:** Only @po can Draft→Ready, only @dev can Ready→InProgress, only @qa can InReview→Done  
**Enforcement:** NONE  
**Risk:** CRITICAL — Anyone can edit `.story.md` and change status field  
**Impact:** Quality gate completely bypassed  
**Hook Needed:** `enforce-story-lifecycle.cjs`

### 🔴 GAP-2: Agent Exclusive Commands (33% enforcement)
**Rule:** agent-authority.md  
**Defines:** @pm *create-epic, *execute-epic (exclusive); @po *validate-story (exclusive); @sm *draft (exclusive)  
**Enforcement:** None (all these are manual)  
**Risk:** HIGH — Any agent can invoke @pm commands  
**Impact:** Delegation matrix ignored  
**Hooks Needed:** `enforce-pm-commands.cjs`, `enforce-po-commands.cjs`

### 🔴 GAP-3: Workflow Automation (0% enforcement)
**Rule:** workflow-execution.md  
**Defines:** 4 workflows (SDC, QA Loop, Spec Pipeline, Brownfield) with phases, gates, transitions  
**Enforcement:** Manual — no automation  
**Risk:** MEDIUM — Workflows can be skipped (e.g., skip @po validation)  
**Impact:** Process bottleneck; teams do their own thing  
**Hooks Needed:** Workflow state machine enforcement

---

## Medium Gaps (Non-Blocking but Important)

| Gap | Rule | Defines | Missing | Impact |
|-----|------|---------|---------|--------|
| **MCP Governance** | mcp-usage.md | @devops exclusive | No specific hook | MCP changes by non-@devops logged but not blocked |
| **Handoff Protocol** | agent-handoff.md | Auto-create on agent switch | No hook | Handoffs created manually or not at all |
| **IDS Runtime** | ids-principles.md | Runtime REUSE/ADAPT checks | Pre-commit only | Post-commit violations not caught |
| **Smart Routing** | smart-routing.md | Auto-route by task type | Manual routing | Overhead, inconsistent paths |

---

## What Needs to Happen (Phases 2-4)

### Phase 2: Design (3sp)
For each gap:
- Write acceptance criteria
- Design hook logic
- Map triggers (which tool? which pattern?)
- Decide: BLOCK vs WARN

### Phase 3: Build (8-12sp)
Create:
- **enforce-story-lifecycle.cjs** (2sp) — Block status transitions from wrong agents
- **enforce-pm-commands.cjs** (2sp) — Block @pm commands from other agents
- **enforce-po-commands.cjs** (2sp) — Block @po commands from other agents
- **enforce-agent-commands.cjs** (2sp) — Validate @agent invocations
- **enforce-absolute-imports.cjs** (2sp) — Block `../../../` in code
- **workflow-state-machine.cjs** (2sp) — Enforce workflow phases
- Update `.claude/settings.json` — register all new hooks
- Update templates, workflows, commands as needed

### Phase 4: Test (2sp)
- Unit tests (6+ per new hook)
- Manual tests (e.g., try to change story status from @dev → should BLOCK)
- Gate logs validation
- Metrics collection

---

## Next Steps for Pedro

**Choose:**
1. **Proceed with Phase 2-4** — Create Spec Pipeline, then stories 1.17-1.25 (15-17sp total, Enterprise Flow)
2. **Pause and reassess** — These gaps suggest bigger framework refactor needed
3. **Incremental** — Do GAP-1 (story-lifecycle) first, then others

**My recommendation:** Do GAP-1 + GAP-2 now (critical), defer GAP-3 (workflows can wait for next sprint).

**Which?**
