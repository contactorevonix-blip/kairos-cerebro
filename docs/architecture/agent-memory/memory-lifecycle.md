# Agent Memory Lifecycle

**Version:** 1.0 | **Status:** Complete | **Date:** 2026-06-08

---

## Overview

The agent memory lifecycle defines how AIOX agent MEMORY.md files are created, populated, synchronized, and maintained throughout their lifetime.

**Goal:** Operationalize memory management — from auto-discovery to synchronization, ensuring rastreabilidade and consistency across all agent personas.

---

## Phases

### Phase 1: Discovery

**Trigger:** New agent registered in AIOX agent registry

**Process:**
1. Query agent registry (`.aiox-core/data/agents.yaml` or runtime registry)
2. Check if agent has MEMORY.md in `.claude/agents/{agentId}/`
3. If missing, flag as "requires memory creation"

**Output:** Discovery list of agents without MEMORY.md

**Timing:** On-demand or scheduled (weekly scan)

---

### Phase 2: Creation

**Trigger:** Agent discovered without MEMORY.md

**Process:**
1. Create `.claude/agents/{agentId}/MEMORY.md`
2. Populate frontmatter:
   - `name:` (agent ID, kebab-case)
   - `description:` (single-line summary)
   - `metadata.type:` (user, feedback, project, reference)
3. Add empty sections:
   - MEMORY Index (will populate in Phase 3)
   - Context for future sessions

**File Format:**
```markdown
---
name: {agent-id}
description: {one-line summary}
metadata:
  type: {user|feedback|project|reference}
---

# Memory Index — {Agent Name}

[Will be populated from discovery requirements]
```

**Output:** Valid MEMORY.md file (empty, ready for population)

**Timing:** Within 1 hour of discovery

---

### Phase 3: Population

**Trigger:** MEMORY.md created and ready

**Sources:**
1. Agent personality file (`.aiox-core/development/agents/{agentId}.md`)
2. Agent skill definitions (`.claude/skills/AIOX/agents/{agentId}/`)
3. Agent CLAUDE.md imports (`.claude/agents/{agentId}/CLAUDE.md`)
4. Handoff artifacts (`.aiox/handoffs/`)
5. Historical context (previous sessions, decisions)

**Population Strategy:**

| Memory Type | Source | When | Who |
|------------|--------|------|-----|
| **User Profile** | Agent personality + skill files | Agent creation | Skill Craftsman |
| **Feedback** | Session interactions + corrections | Each session | Agent + @aiox-master |
| **Project Context** | Epic/story context | Story creation | @sm / @po |
| **References** | External resources | On-demand | Agent using skill |

**Example Populations:**

**User Memory:**
```markdown
- [Agent Role](memory-filename.md) — Role description, expertise area
- [Preferences](preferences.md) — Communication style, response formats
```

**Feedback Memory:**
```markdown
- [Decision Pattern](feedback-decisions.md) — How agent makes choices
- [Approved Workflow](feedback-workflows.md) — Validated approaches
```

**Project Memory:**
```markdown
- [Current Epic](epic-context.md) — Active epic goals
- [Story Dependencies](story-deps.md) — Story execution constraints
```

**Timing:** Continuous (populated as context emerges)

**Output:** MEMORY.md with 2-5 memory entries per section

---

### Phase 4: Synchronization

**Trigger:** Agent personality changes, new feedback, new project context

**Sync Frequency:**
- **Daily:** Check for new feedback/decisions
- **Weekly:** Review project context changes
- **Monthly:** Full memory audit

**Sync Process:**
1. Detect changes in source files (agent definitions, skill updates)
2. Extract new memory requirements
3. Check for conflicts (memory vs. reality)
4. Merge or flag for manual review
5. Update MEMORY.md with change log entry

**Conflict Resolution:**
- **Conflict:** Memory describes behavior, reality contradicts
- **Resolution:** Manual review by agent + @aiox-master
- **Lock:** Prevent concurrent updates during resolution

**Output:** Updated MEMORY.md with audit trail

**Timing:** Asynchronous, max 24h latency

---

### Phase 5: Validation

**Trigger:** On-demand or pre-agent-use

**Validation Checks:**
1. ✅ Frontmatter valid (required fields present)
2. ✅ Memory entries have name + description
3. ✅ All entries linked in MEMORY Index
4. ✅ Token budget not exceeded (max 5000 tokens per agent)
5. ✅ Rastreabilidade log has entries
6. ✅ No orphaned or duplicate entries

**Output:** Validation report (pass/fail + fixes)

**Timing:** Real-time (< 2s)

---

## Directory Structure

```
.claude/agents/
├── {agentId}/
│   ├── MEMORY.md              ← Agent memory (this file)
│   ├── CLAUDE.md              ← Agent-specific instructions (optional)
│   └── memory-imports.md      ← Links to external memory sources (optional)
├── config-engineer/MEMORY.md
├── hooks-architect/MEMORY.md
├── skill-craftsman/MEMORY.md
└── squad-chief/MEMORY.md

docs/architecture/agent-memory/
├── memory-lifecycle.md        ← This document
├── memory-sync-rules.md       ← Sync protocols
└── discovery-process.md       ← Discovery algorithm
```

---

## Memory Frontmatter

All MEMORY.md files MUST include:

```yaml
---
name: {agent-id}                    # kebab-case agent ID (required)
description: {one-line summary}     # What memory is for (required)
metadata:
  type: user|feedback|project|reference  # Memory category (required)
  created_at: ISO8601 timestamp     # When created (auto-set)
  updated_at: ISO8601 timestamp     # Last update (auto-set)
  version: "1.0"                    # Schema version (required)
---
```

---

## Memory Index Format

Every MEMORY.md MUST include an index section:

```markdown
# Memory Index — {Agent Name}

## User Profile
- [Role](filename.md) — Agent's role and responsibilities
- [Communication Style](filename.md) — Tone and preferences

## Feedback & Decisions
- [Approved Patterns](filename.md) — Validated workflows
- [Constraints](filename.md) — Boundaries and rules

## Project Context
- [Current Epic](filename.md) — Active work
- [Story Dependencies](filename.md) — Cross-story constraints

## External References
- [Resource Name](url) — Purpose and usage
```

---

## Rastreabilidade

All changes to MEMORY.md MUST be logged:

```markdown
## Change Log

| Date | Agent | Action | Reason |
|------|-------|--------|--------|
| 2026-06-08 | @sm | Created MEMORY.md | Story 1.14 Phase 2 |
| 2026-06-08 | @po | Added project context | Epic PHASE-4 context |
| 2026-06-09 | @dev | Updated feedback | Decision: API design pattern |
```

**Rastreabilidade Requirements:**
- Every change must have WHO (agent), WHEN (date), WHAT (change), WHY (reason)
- Changes linked to story IDs where applicable
- Sync operations logged with source and destination

---

## Automation Hooks

**When:** Phase 3-5 can be automated via hooks

**Hook Points:**
1. **PreToolUse:** Check if MEMORY.md exists for active agent
2. **PostToolUse:** Log agent decisions to feedback memory
3. **UserPromptSubmit:** Update project context from prompt analysis
4. **StoryCreate:** Inject story context into agent memory

**Hook Implementation:** See `.claude/hooks/agent-memory-sync.cjs` (Story 1.17)

---

## Success Metrics (After Full Implementation)

| Metric | Target | Status |
|--------|--------|--------|
| Memory coverage | 100% of agents | ✅ Doc complete |
| Population latency | < 24h | ✅ Defined |
| Sync frequency | Daily checks | ✅ Defined |
| Validation pass rate | 100% | ✅ Checks specified |
| Rastreabilidade | 100% of changes | ✅ Log format defined |

---

**Document:** AC1 ✅ COMPLETE | AC2 ✅ DEFINED | AC3 ✅ DEFINED | AC4 → next doc
