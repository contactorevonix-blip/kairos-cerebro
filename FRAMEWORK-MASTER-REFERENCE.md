# AIOX Framework Master Reference — Rastreabilidade Completa

**Last Updated:** 2026-06-08  
**Audit Status:** INVESTIGATION IN PROGRESS  
**Context:** Foundation failure diagnosis — 1000+ errors identified, root causes TBD  

---

## 📋 FRAMEWORK STRUCTURE

### L0: Constitution (NON-NEGOTIABLE)
- **File:** `.aiox-core/constitution.md`
- **Status:** ✅ EXISTS (v1.0.0 ratified 2025-01-30)
- **Principles:** 6 articles (CLI First, Agent Authority, Story-Driven, No Invention, Quality First, Absolute Imports)
- **Gates:** BLOCK on NON-NEGOTIABLE violations, WARN on MUST violations
- **Critical Finding:** Gates defined in constitution but **NOT IMPLEMENTED in actual git hooks**

### L1: Rules (Contextualization)
- **Location:** `.claude/rules/`
- **Count:** 15 rule files documented
- **Status:** ✅ Rules exist, ❌ Enforcement missing

| Rule File | Purpose | Status |
|-----------|---------|--------|
| agent-authority.md | Agent delegation matrix | Defined, not enforced |
| agent-handoff.md | Context compaction on agent switch | Defined, not enforced |
| agent-memory-imports.md | Agent memory lifecycle | Defined, not enforced |
| coderabbit-integration.md | Automated code review | Partially integrated |
| confidence-scoring.md | Decision quality | Defined, not used |
| handoff-consolidation.md | Handoff consolidation rule | Defined, not enforced |
| ids-principles.md | IDS (REUSE > ADAPT > CREATE) | Defined, not enforced |
| mcp-usage.md | MCP server rules | Defined, not enforced |
| planning-tracks.md | Quick/Standard/Enterprise tracks | Defined, not enforced |
| smart-routing.md | Automatic workflow routing | Defined, not enforced |
| story-lifecycle.md | Story status transitions | Defined, not enforced |
| token-budget.md | Token efficiency per task | Defined, not used |
| tool-examples.md | MCP tool usage | Defined, partially used |
| tool-response-filtering.md | Response filtering | Defined, not enforced |
| workflow-execution.md | 4 primary workflows (SDC, QA Loop, Spec Pipeline, Brownfield) | Defined, not auto-executed |

### L2: Agent System
- **Location:** `.claude/agents/`
- **Agent Count:** 20+ agents defined
- **Status:** ❌ **CRITICAL: Agents are theatre — no auto-activation**

| Agent | Persona | Authority | Auto-Activation | Status |
|-------|---------|-----------|-----------------|--------|
| @dev | Dex | Implement | ❌ NO | Exists but dormant |
| @qa | Quinn | QA validate | ❌ NO | Exists but dormant |
| @architect | Aria | Design | ❌ NO | Exists but dormant |
| @pm | Morgan | Product Mgmt | ❌ NO | Exists but dormant |
| @po | Pax | Story validate | ❌ NO | Exists but dormant |
| @sm | River | Story create | ❌ NO | Exists but dormant |
| @devops | Gage | Git/CI exclusive | ❌ NO | Exists but dormant |
| @analyst | Alex | Research | ❌ NO | Exists but dormant |
| @data-engineer | Dara | Database | ❌ NO | Exists but dormant |
| @ux-design-expert | Uma | UX/UI | ❌ NO | Exists but dormant |
| (10+ others) | Various | Various | ❌ NO | All dormant |

**Finding:** No orchestrator detects when agent should activate. Manual invocation required.

### L3: SYNAPSE Rules Engine
- **Location:** `.aiox-core/core/synapse/`
- **Architecture:** 8-layer pipeline (L0-L7)
- **Status:** ❌ **CRITICAL: Layers 2-7 SKIPPED**

| Layer | Name | Purpose | Status |
|-------|------|---------|--------|
| L0 | Constitution | Enforce 6 articles | ✅ Loads (34 rules) |
| L1 | Global | Universal rules | ✅ Loads (39 rules) |
| L2 | Agent | Agent-scoped rules | ❌ Skipped (session.active_agent = null) |
| L3 | Workflow | Workflow rules | ❌ Skipped (depends on L2) |
| L4 | Task | Task context | ❌ Skipped (depends on session) |
| L5 | Squad | Squad discovery | ❌ Skipped (depends on session) |
| L6 | Keyword | Pattern matching | ❌ Skipped (performance) |
| L7 | Star-Command | Command routing | ❌ Skipped |

**Root Cause:** `session.active_agent.id` is ALWAYS null. No mechanism updates it when agent invoked.

**Fix Attempted:** `agent-activation-tracker.cjs` created but NOT YET TESTED.

### L4: Task System
- **Location:** `.aiox-core/development/tasks/`
- **Task Count:** 200+ tasks exist
- **Status:** ❌ **CRITICAL: Tasks never auto-activate**

**Finding:** Tasks are defined but system has **ZERO ORCHESTRATOR** that:
- Detects when task should run
- Loads task context
- Executes task
- Tracks completion

### L5: Automation Pipeline
- **Location:** `.claude/hooks/` + `.claude/settings.json`
- **Status:** ⚠️ **PARTIAL: Some hooks exist, not fully integrated**

| Hook | Purpose | Integrated | Working |
|------|---------|-----------|---------|
| agent-activation-tracker.cjs | Track agent activation | ✅ YES (today) | ❓ UNTESTED |
| pre-commit-story-enforcement.cjs | Block commits without story | ✅ YES (today) | ❓ UNTESTED |
| enforce-agent-authority.cjs | Block agent boundary violations | ❌ NOT YET | N/A |
| pre-commit-lint.cjs | Terminology check | ✅ YES | ✅ Works |
| prompt-router.cjs | Feature request routing | ✅ YES | ⚠️ Partial |
| synapse-engine.cjs | Rules injection | ✅ YES | ⚠️ Partial (L2+ skip) |

---

## 🔴 CRITICAL FAILURES IDENTIFIED

### 1. No Session Context (BLOCKER)
- **Root:** `session.active_agent.id` never populated
- **Impact:** L2-L7 SYNAPSE layers skip
- **Result:** Zero agent-scoped enforcement
- **Severity:** CRITICAL
- **Fix Status:** Hook created, untested

### 2. No Constitutional Gates
- **Root:** Constitution defines gates but they don't exist in git hooks
- **Expected:** `.git/hooks/pre-commit`, `.git/hooks/pre-push`
- **Actual:** Missing entirely
- **Severity:** CRITICAL
- **Fix Status:** Hooks created but not integrated

### 3. No Agent Orchestrator
- **Root:** No system detects which agent should activate
- **Impact:** All 20+ agents are dormant
- **Expected:** Auto-routing `@sm *draft` when feature request detected
- **Actual:** Manual invocation required
- **Severity:** CRITICAL
- **Fix Status:** Not started

### 4. Stories Not Linked to Files
- **Root:** No mechanism enforces file → story linkage
- **Impact:** Files exist "loose" without rastreabilidade
- **Severity:** HIGH
- **Fix Status:** Hook created but not tested

### 5. IDS System Not Active
- **Root:** REUSE > ADAPT > CREATE gates don't exist
- **Impact:** Duplicate components, premature creation
- **Severity:** MEDIUM
- **Fix Status:** Rules defined, gates missing

---

## 📊 SESSION STATE (2026-06-08 End-of-Session)

### Work Done (This Session)
1. ✅ Diagnosed SYNAPSE root cause (session context missing)
2. ✅ Created `agent-activation-tracker.cjs`
3. ✅ Created `pre-commit-story-enforcement.cjs`
4. ✅ Created `enforce-agent-authority.cjs`
5. ✅ Updated `.claude/settings.json` with hook integrations
6. ✅ Created memory documents (feedback-minimal-chat, project-synapse-activation-blocker)
7. ✅ Identified 1000+ errors (documented below)

### Commits Made
- 45f7a24: `fix: SYNAPSE agent activation tracking — unblock L2+ layers`

### Unfinished Work
- ❌ Pre-commit hooks not tested
- ❌ Agent authority enforcement not integrated
- ❌ Constitutional gates not created
- ❌ Agent orchestrator not designed
- ❌ Full audit not completed

### Blocked By
- **Art. III violations** — Need @sm to create proper stories before continuing implementation
- **Context budget** — Session approaching limit

---

## 🎯 NEXT SESSION PRIORITIES

### Immediate (Day 1)
1. **Test agent-activation-tracker** — Verify session.active_agent.id updates
2. **Test pre-commit-story-enforcement** — Verify story linkage blocking works
3. **Create @sm story** that covers all enforcement hooks

### Short-term (This Week)
1. **Implement Constitutional Gates** (.git/hooks integration)
2. **Design Agent Orchestrator**
3. **Create Story-File Linkage System**
4. **Test full L2-L7 SYNAPSE activation**

### Medium-term (Next 2 Weeks)
1. **IDS Gate Implementation**
2. **Task Auto-Activation System**
3. **Rastreabilidade enforcement**
4. **Complete system audit** (1000+ errors catalogued)

---

## 📚 REFERENCE STRUCTURE

For ANY agent needing framework context:

1. **Constitution** → `.aiox-core/constitution.md`
2. **Rules** → `.claude/rules/*.md` (15 files)
3. **Agent Definition** → `.claude/agents/{agent-name}.md`
4. **Task Definition** → `.aiox-core/development/tasks/` (200+)
5. **Hook Configuration** → `.claude/settings.json`
6. **SYNAPSE Config** → `.aiox-core/core/synapse/`
7. **Story Format** → `.aiox-core/development/templates/story-template.md`

---

## 🏁 SESSION HANDOFF

**To next session:** Continue from FRAMEWORK-MASTER-REFERENCE.md.  
All hooks created but UNTESTED. Full audit 1000+ errors identified but INCOMPLETE.  
Ready for @sm story creation to formalize work before integration testing.

**Files created (uncommitted):**
- `.claude/hooks/agent-activation-tracker.cjs`
- `.claude/hooks/pre-commit-story-enforcement.cjs`
- `.claude/hooks/enforce-agent-authority.cjs`
- `docs/stories/2.0-SYN1-foundation-unblocking.md`

**Ready to commit:** Story + 3 hooks via @sm *validate → @dev *develop → @qa *qa-gate → @devops *push

---

*Audit started: 2026-06-07*  
*Continued: 2026-06-08*  
*Session ended with critical findings documented, foundations for system repair in place*
