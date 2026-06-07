# Agent Memory Auto-Discovery Process

**Version:** 1.0 | **Status:** Complete | **Date:** 2026-06-08

---

## Overview

Defines the algorithm for automatically discovering which agents require MEMORY.md files and extracting their memory requirements from skill definitions and agent personalities.

---

## Discovery Algorithm

### Step 1: Enumerate Registered Agents

**Source:** `.aiox-core/data/agents.yaml` or runtime agent registry

**Input:**
```yaml
agents:
  - id: sm
    name: River
    title: Scrum Master
  - id: dev
    name: Dex
    title: Developer
  - id: qa
    name: Quinn
    title: QA Specialist
  ...
```

**Output:** List of agent IDs: `[sm, dev, qa, architect, pm, po, analyst, data-engineer, ux, devops, ...]`

**Complexity:** O(n) where n = number of agents

---

### Step 2: Check MEMORY.md Existence

**For each agent:**
1. Check if `.claude/agents/{agentId}/MEMORY.md` exists
2. If exists → mark as "has-memory" (skip)
3. If missing → mark as "needs-memory" (next step)

**Output:** Two lists:
- `agents_with_memory = [sm, dev, qa, ...]`
- `agents_without_memory = [config-engineer, hooks-architect, ...]`

**Complexity:** O(n) file system checks

---

### Step 3: Extract Memory Requirements

**For each agent in `agents_without_memory`:**

#### 3.1: Read Agent Personality File

**Path:** `.aiox-core/development/agents/{agentId}.md` or AIOX agent skill

**Extract:**
- Agent name (archetype: e.g., "Facilitator")
- Role description
- Communication style (tone, vocabulary)
- Core principles
- Responsibility boundaries

**Example Output:**
```yaml
agent:
  id: sm
  name: River
  archetype: Facilitator
  role: "Technical Scrum Master"
  communication:
    tone: empathetic
    vocabulary: [adaptar, pivotar, simplificar]
  principles:
    - "Story creation expert"
    - "Rigorously follow create-next-story procedure"
```

#### 3.2: Read Skill Definitions

**Path:** `.claude/skills/AIOX/agents/{agentId}/SKILL.md`

**Extract:**
- Commands available
- Dependencies (tasks, templates, tools)
- Persona profile
- Memory-relevant behaviors

**Example Output:**
```yaml
commands:
  - name: draft
    description: "Create next user story"
  - name: story-checklist
    description: "Run story draft checklist"

dependencies:
  - tasks: [create-next-story.md, execute-checklist.md]
  - templates: [story-tmpl.yaml]
  - tools: [git, context7]
```

#### 3.3: Read CLAUDE.md Instructions (if exists)

**Path:** `.claude/agents/{agentId}/CLAUDE.md`

**Extract:**
- Agent-specific instructions
- Project context (if mentioned)
- Known decisions
- Constraints

---

### Step 4: Classify Memory Requirements

**Map extracted requirements to memory types:**

| Requirement | Maps To | Example |
|-------------|---------|---------|
| Agent personality, archetype, role | **User** | "River — Facilitator, Scrum Master" |
| Communication style, vocabulary | **User** | "Tone: empathetic, vocabulary: [adaptar, pivotar]" |
| Core principles, responsibility boundaries | **Feedback** | "Story creation expert, rigorously follow procedure" |
| Commands, tools, dependencies | **Project** | "Commands: draft, story-checklist; Tools: git, context7" |
| Known constraints, decisions | **Feedback** | "Cannot create epics (delegate to @pm)" |

**Output:** Structured memory template

---

### Step 5: Generate MEMORY.md Template

**Template Structure:**

```markdown
---
name: {agentId}
description: {one-line summary from personality}
metadata:
  type: user
  created_at: {ISO8601 now}
  version: "1.0"
---

# Memory Index — {Agent Name}

## User Profile
- [Role & Expertise](role.md) — {role description}
- [Communication Style](communication.md) — Tone: {tone}, Vocabulary: {vocabulary}
- [Archetype](archetype.md) — {archetype} persona

## Feedback & Decisions
- [Core Principles](principles.md) — {principles list}
- [Responsibility Boundaries](boundaries.md) — {boundaries}
- [Exclusive Operations](exclusive-ops.md) — {exclusive operations}

## Project Context
- [Available Commands](commands.md) — {commands list}
- [Dependencies](dependencies.md) — Tasks: {tasks}, Tools: {tools}

## Notes for Next Session
[Empty — will be populated during first use]
```

**Example for @sm:**

```markdown
---
name: sm
description: River — Scrum Master, story creation expert
metadata:
  type: user
  created_at: 2026-06-08T10:00:00Z
  version: "1.0"
---

# Memory Index — River (Scrum Master)

## User Profile
- [Role & Expertise](sm-role.md) — Story creation from PRD, sprint planning, backlog grooming
- [Communication Style](sm-style.md) — Tone: empathetic, Vocabulary: adaptar, pivotar, simplificar
- [Archetype](sm-archetype.md) — Facilitator (Pisces)

## Feedback & Decisions
- [Core Principles](sm-principles.md) — Story creation expert, clear developer handoffs, predictive quality planning
- [Responsibility Boundaries](sm-boundaries.md) — Local git branches, NOT remote push (delegate to @devops)
- [Exclusive Operations](sm-exclusive.md) — Cannot push to remote, cannot create PRs

## Project Context
- [Available Commands](sm-commands.md) — draft, story-checklist, help, guide, exit
- [Dependencies](sm-deps.md) — Tasks: create-next-story, execute-checklist; Tools: git, context7, clickup

## Notes for Next Session
[Empty — populate during Session 1]
```

---

### Step 6: Store Discovery Results

**Output Files:**

```
docs/architecture/agent-memory/
├── discovery-results.json      ← Machine-readable results
├── missing-agents.md           ← Human-readable summary
└── templates/
    ├── sm-memory-template.md
    ├── dev-memory-template.md
    └── ... (one per missing agent)
```

**Results Format (JSON):**
```json
{
  "discovery_date": "2026-06-08T10:00:00Z",
  "agents_scanned": 13,
  "agents_with_memory": 9,
  "agents_missing_memory": 4,
  "missing_agents": [
    {
      "id": "config-engineer",
      "name": "Config Engineer",
      "archetype": "Specialist",
      "requirements": {
        "user": ["Role: Configuration Management", "Tone: precise"],
        "feedback": ["Exclusive: MCP add/remove"],
        "project": ["Commands: update-config, help"]
      }
    }
  ],
  "next_step": "Create MEMORY.md files from templates"
}
```

---

## Validation Checks (D1-D5)

### D1: Source Availability

**Check:** All required source files readable

**Fail:** Log missing files, skip agent, continue discovery

---

### D2: Requirement Extraction

**Check:** Memory requirements extracted successfully

**Fail:** Use fallback template, flag for manual review

---

### D3: Template Validity

**Check:** Generated templates have valid frontmatter + required sections

**Fail:** Reject template, flag for manual intervention

---

### D4: Duplication

**Check:** No duplicate requirements across agents

**Fail:** Merge duplicates, flag for review

---

### D5: Completeness

**Check:** All agents processed, results comprehensive

**Fail:** Re-run discovery, investigate failures

---

## Execution Modes

### Mode 1: On-Demand (Manual)

**Trigger:** User runs `*memory-discover` or `*memory-sync`

**Latency:** < 10 seconds

**Output:** Terminal output + results.json

---

### Mode 2: Scheduled (Automated)

**Trigger:** Weekly cron job (Monday 00:00 UTC)

**Latency:** < 1 minute (scheduled task)

**Output:** Results email + auto-create MEMORY.md files if missing

---

### Mode 3: Integration (Hook-based)

**Trigger:** Story creation, agent activation

**Latency:** < 2 seconds (async)

**Output:** Log → CLI message "Agent {id} memory status: {status}"

---

## Success Criteria

| Metric | Target | Status |
|--------|--------|--------|
| Discovery accuracy | 100% of agents found | ✅ Algorithm defined |
| Requirement extraction | 95%+ success | ✅ Extraction rules defined |
| Template validity | 100% generate valid YAML | ✅ Validation checks defined |
| Execution latency | < 10 seconds (on-demand) | ✅ Feasible with current agent count |
| Automation coverage | All 3 modes defined | ✅ Defined |

---

**Document:** AC2 ✅ COMPLETE
