# PRD — AIOX Governance Documentation & Organization

**Document:** Product Requirements Definition  
**Epic ID:** EPIC-AIOX-GOVERNANCE-2 (Organization & Documentation)  
**Date:** 2026-06-25  
**Owner:** @pm (Morgan)  
**Status:** DRAFT  

---

## Executive Summary

KAIROS_CEREBRO project structure is **intentionally organized** using 4 layers (L1-L4) and a backward-compatible agent activation strategy (shims + skills). However, **documentation is fragmented**, making it difficult for initiates to:

- Understand agent connectivity (which agent reads from which folder)
- See the agent activation flow (agents/ → shims → skills)
- Follow the correct process for creating/modifying agents
- Know which configurations are authoritative

**This PRD documents the existing structure and makes it discoverable.**

---

## Vision

### Current State (Disorganized Documentation)
- Agent definitions exist in 3 locations (agents/, commands/, skills/)
- Relationship between layers is implicit (not documented)
- Agent authority matrix exists but not tied to code locations
- No visual maps or checklists for agent onboarding

### Desired State (Clear Organization)
- **Single source of truth** for agent definitions (skills/)
- **Clear activation flow** documented and mapped
- **Agent connectivity matrix** showing folder dependencies
- **Onboarding checklist** for creating/modifying agents
- **Authority enforcement** clearly tied to configurations

---

## Problem Statement

### FR-1: Agent Connectivity Unclear
**Problem:** A developer can't easily answer:
- "What does agent X depend on?"
- "Which folders does agent X read from?"
- "What's the canonical definition of agent X?"
- "How do I create a new agent?"

**Impact:** 
- New team members get confused
- Agents are duplicated instead of reused (violates IDS Article IV-A)
- Configuration inconsistencies are hard to catch

### FR-2: Activation Flow Implicit
**Problem:** The shim → skill → persona flow is not documented:
- `.claude/agents/squad-chief.md` exists
- `.claude/commands/AIOX/agents/squad-chief.md` exists (shim)
- `.claude/skills/AIOX/agents/squad-chief/SKILL.md` exists (canonical)
- Relationship is not obvious

**Impact:**
- Developers modify wrong file
- Shim changes get lost when skill is updated
- Maintenance burden increases over time

### FR-3: Authority Configuration Not Mapped
**Problem:** Agent authority (Art. II) is defined in:
- `.claude/CLAUDE.md` (prose)
- `.aiox-core/constitution.md` (principles)
- `.claude/rules/agent-authority.md` (detailed rules)
- `.claude/agents/aiox-devops.md` (agent definition)

Which is source of truth? How do they sync?

**Impact:**
- Authority violations not caught (gates not hooked up)
- Multiple versions of truth
- Rule escalation protocol can't work (no single registry)

### FR-4: Folder Structure Not Documented
**Problem:** Top-level folders have no README or purpose statement:
- `.claude/` — what goes here?
- `.aiox-core/` — is this modifiable?
- `.aiox/` — runtime state?
- `.synapse/` — ?

**Impact:**
- Files end up in wrong places
- Duplication spreads (L1/L2 boundary not understood)
- Framework Boundary (Art. VII) violations increase

---

## Requirements

### Functional Requirements (FR)

#### FR-1: Agent Connectivity Matrix
**Requirement:** Document each agent's dependencies and file locations.

**Output:** `.claude/.docs/AGENT-CONNECTIVITY-MAP.md`
```markdown
| Agent | Primary Def | Shim Location | Skill Location | Reads From | Writes To | Authority |
|-------|------------|-----------------|----------------|-----------|----------|-----------|
| aiox-sm | .claude/agents/aiox-sm.md | .claude/commands/AIOX/agents/aiox-sm.md | .claude/skills/AIOX/agents/aiox-sm/SKILL.md | .aiox-core/development/tasks/ | docs/stories/ | Story creation |
| ... | ... | ... | ... | ... | ... | ... |
```

**Success Criteria:**
- All ~59 agents documented (29 in `.claude/agents/` + 59 `SKILL.md` canonical definitions; note naming reconciliation may be needed)
- Shim + Skill locations included
- Read/write dependencies listed
- Authority field shows exclusive operations

**Note on Sizing (5 SP):** Mapping ~59 agents is ambitious for 5 SP. Story accepts reconciliation of naming (`.claude/agents/aiox-sm.md` vs `skills/AIOX/agents/sm/SKILL.md`) and canoncial set deduplication in scope.

#### FR-2: Activation Flow Documentation
**Requirement:** Visual diagram + prose explaining shim → skill activation.

**Output:** `.claude/.docs/AGENT-ACTIVATION-FLOW.md`
```
1. User types: `/AIOX:agents:squad-chief`
   ↓
2. Legacy shim loads: .claude/commands/AIOX/agents/squad-chief.md
   ↓
3. Shim header redirects: "Read .claude/skills/AIOX/agents/squad-chief/SKILL.md"
   ↓
4. Skill payload executes (canonical activation)
   ↓
5. Agent persona loaded from .claude/agents/squad-chief.md (fallback)
```

**Success Criteria:**
- Flow diagram (ASCII or visual reference)
- Step-by-step prose
- Explains why 3 layers (backward compatibility)
- Shows circuit breaker (what if shim fails?)

#### FR-3: Authority Configuration Registry
**Requirement:** Single source of truth for agent authority, tied to files.

**Output:** `.aiox-core/data/agent-authority-registry.yaml`
```yaml
agents:
  aiox-devops:
    exclusive_operations:
      - git push
      - gh pr create
      - MCP add/remove
    rule_source: .claude/rules/agent-authority.md (Art. II)
    agent_definition: .claude/agents/aiox-devops.md
    hook_enforcement: .claude/hooks/enforce-agent-authority.cjs
    status: ACTIVE
```

**Success Criteria:**
- Covers all exclusive operations
- Links to source rules + agent definition + enforcement hook
- Covers all 9 agents with exclusive authority
- Enables automated validation

#### FR-4: Folder Structure Reference
**Requirement:** Explain purpose and rules for each top-level folder.

**Output:** `.claude/.docs/FOLDER-STRUCTURE.md`
```markdown
## .claude/
- **Purpose:** Agent definitions, CLI configuration, development rules
- **Mutability:** Mixed (see FR-VII boundary rules)
- **Key Files:** CLAUDE.md, settings.json, agents/, skills/, rules/
- **Do NOT Put Here:** Source code, user data, runtime state

## .aiox-core/
- **Purpose:** AIOX framework core (immutable L1) + templates (L2)
- **Mutability:** NEVER (protected by deny rules)
- **Key Files:** constitution.md, development/tasks/, core-config.yaml
- **Do NOT Put Here:** Agent definitions, user-specific rules, stories

## .aiox/
- **Purpose:** Runtime state, handoffs, task logs, session memory
- **Mutability:** ALWAYS (ephemeral)
- **Key Files:** task-logs/, handoffs/, gate-logs/, error-log.jsonl
- **Do NOT Put Here:** Source code, framework rules, permanent documentation
```

**Success Criteria:**
- All 9 top-level folders covered
- Purpose + mutability clear
- Examples of what goes where
- Linked to L1-L4 boundary rules

### Non-Functional Requirements (NFR)

#### NFR-1: Discoverability
**Requirement:** Documentation should be findable in <2 clicks from project root.

**Acceptance:**
- README.md links to governance docs
- `.claude/.docs/` is well-organized
- CLAUDE.md references the governance docs

#### NFR-2: Maintainability
**Requirement:** Documentation should be auto-validated and stay in sync.

**Acceptance:**
- Hook validates agent definitions match registry
- Weekly sync check between .claude/agents/ and .aiox-core/

#### NFR-3: Completeness
**Requirement:** Every major concept (agent, task, rule) should be documented.

**Acceptance:**
- 0 undefined references in governance docs
- Every agent has entry in connectivity matrix
- Every folder has purpose statement

---

## Implementation Plan (Stories)

### EPIC-AIOX-GOVERNANCE-2.S1: Agent Connectivity Matrix
**Story Points:** 5  
**Owner:** @sm → @dev  
**Acceptance Criteria:**
- [ ] Matrix created in `.claude/.docs/AGENT-CONNECTIVITY-MAP.md`
- [ ] All ~58-59 agents listed with dependencies (canonical SKILL.md count, reconcile naming)
- [ ] Read/Write columns filled
- [ ] Authority operations documented
- [ ] Validated by @po (connectivity is accurate)

### EPIC-AIOX-GOVERNANCE-2.S2: Activation Flow Documentation
**Story Points:** 3  
**Owner:** @sm → @dev  
**Acceptance Criteria:**
- [ ] Activation flow diagram created
- [ ] Shim → Skill → Fallback flow explained
- [ ] Circuit breaker logic documented
- [ ] Code examples provided (for new agents)
- [ ] Validated by @qa (clarity + correctness)

### EPIC-AIOX-GOVERNANCE-2.S3: Authority Registry & Hooks (Implementation)
**Story Points:** 8  
**Owner:** @sm → @dev (with @qa gate)  
**Type:** Standard SDC with build + tests (not pure documentation)  
**Acceptance Criteria:**
- [ ] `agent-authority-registry.yaml` created in `.aiox-core/data/`
- [ ] All 9 exclusive operations mapped (git push, PR, MCP, stories, etc.)
- [ ] Links to source rules (`.claude/rules/agent-authority.md`) + enforcement hooks verified
- [ ] New validation hook created (`.claude/hooks/validate-authority-registry.cjs`) and tested
- [ ] Tests for registry validation (>90% coverage, >5 edge cases)
- [ ] Hook integrated into @dev workflow (runs on agent activation)
- [ ] @qa validates: PASS gate (correctness + completeness)

### EPIC-AIOX-GOVERNANCE-2.S4: Folder Structure Guide
**Story Points:** 3  
**Owner:** @sm → @dev  
**Acceptance Criteria:**
- [ ] `.claude/.docs/FOLDER-STRUCTURE.md` created
- [ ] 9 top-level folders documented
- [ ] L1-L4 boundary rules linked
- [ ] Examples of correct placement provided
- [ ] README.md updated (link to guide)

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Agent Clarity** | 100% of agents documented | Checklist in connectivity matrix |
| **Onboarding Time** | <2h for new team member | Time to create first agent correctly |
| **Rule Violations** | 0 IDS REUSE misses | Monthly audit of agents/ folder |
| **Documentation Freshness** | <1 week sync lag | Drift check: does registry match code? |
| **Accessibility** | <2 clicks from root | Link from README → docs |

---

## Timeline & Effort

| Phase | Duration | What |
|-------|----------|------|
| **S1 + S2** | 1 week | Connectivity matrix + activation flow (low risk, high clarity) |
| **S3** | 2 weeks | Authority registry + hooks (medium complexity) |
| **S4** | 3-5 days | Folder structure guide (mostly writing) |
| **Validation** | 3-5 days | @po validation + @qa testing |
| **Total** | 3-4 weeks | Delivery to production |

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Authority registry out of sync with code | Hook violations slip through | Weekly sync validation hook (S3) |
| Documentation becomes outdated | Team loses trust | Auto-generated docs where possible |
| Folder restructuring too risky | Refactor blocked | Only document, don't move files |

---

## Success Criteria (Epic Level)

✅ **EPIC-AIOX-GOVERNANCE-2 is DONE when:**
1. All 4 stories are DONE (S1-S4)
2. @po validates completeness (>90% coverage)
3. @qa PASS gate (tests + validation)
4. Team can answer: "Create an agent in 2 minutes" (using the docs)

---

## Notes

This PRD documents the EXISTING structure, not a redesign. No folders will be moved, no code will be refactored.

**Scope Clarification:**
- S1 + S2 + S4 = Pure documentation (markdown, diagrams, guides)
- S3 = Implementation (YAML registry + validation hook + tests >90% + @qa gate)

**Actual Agent Count (Real Codebase):**
- `.claude/agents/` = 29 definitions (legacy)
- `.claude/skills/AIOX/agents/*/SKILL.md` = ~58-59 definitions (canonical)
- Naming may diverge; S1 must reconcile and deduplicate

**Next Step:** PRD approved by @po → @sm creates 4 stories → proceed per SDC standard flow.

---

**Author:** Orion (@aiox-master)  
**Created:** 2026-06-25  
**Status:** DRAFT (ready for @po validation)
