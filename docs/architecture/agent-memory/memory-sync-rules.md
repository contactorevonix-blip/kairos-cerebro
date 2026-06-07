# Agent Memory Synchronization Rules

**Version:** 1.0 | **Status:** Complete | **Date:** 2026-06-08

---

## Overview

Defines the rules for keeping agent MEMORY.md files synchronized with agent definitions, decisions, and project context.

---

## Sync Rules (S1-S6)

### S1: Source-of-Truth Priority

**Rule:** Agent definitions override memory.

**Logic:**
```
If (agent definition) != (memory):
  IF agent definition is newer:
    → Update memory to match definition
    → Log as "sync-from-source"
  ELSE:
    → Flag for manual review
    → Request @aiox-master decision
```

**When:** Weekly full sync

---

### S2: Append-Only Feedback

**Rule:** Feedback memories MUST be append-only (never rewrite).

**Constraint:**
- New feedback appended to Change Log
- Historical feedback entries frozen (immutable)
- Corrections → new entry with reference to old

**Why:** Maintain full audit trail of agent learning

**Example:**
```markdown
## Feedback Evolution

- [Initial Decision](v1.md) — Pattern X approved on 2026-06-01
- [Correction](v2.md) — Pattern X deprecated on 2026-06-08 (reason: performance issues)
  - Replaces: Initial Decision
  - Reason: Benchmark results from Story 2.1
```

---

### S3: Conflict Resolution

**Rule:** Conflicts detected → flag for manual resolution

**Conflict Scenarios:**
1. Memory says "use pattern X", code uses pattern Y
2. Two sources provide different context (agent vs. skill file)
3. Feedback contradicts project context

**Resolution Protocol:**
1. Detect conflict via automated sync
2. Log conflict in `CONFLICTS.log`
3. Notify agent (if active) + @aiox-master
4. Lock memory (prevent further changes) until resolved
5. Manual review determines: memory wins, source wins, or merge

**Lock Mechanism:**
```yaml
# In MEMORY.md frontmatter:
metadata:
  locked: true
  locked_reason: "Conflict: feedback vs. project context"
  locked_until: 2026-06-09T18:00:00Z
```

---

### S4: Rastreabilidade Requirement

**Rule:** Every memory change MUST have audit trail.

**Audit Requirements:**
- WHO: Agent or process that made change
- WHEN: ISO8601 timestamp
- WHAT: Specific field(s) changed
- WHY: Reason code or story reference

**Audit Format:**
```markdown
| Date | Agent | Field | Change | Reason |
|------|-------|-------|--------|--------|
| 2026-06-08 | @sm | project-context | Added PHASE-4 | Story 1.14 discovery |
| 2026-06-08 | @dev | feedback | Approved pattern:X | Perf validation passed |
```

**Invalid Changes:** Any memory change WITHOUT audit log entry = sync error

---

### S5: Synchronization Windows

**Rule:** Sync operations respect agent availability.

**Sync Schedule:**
- **Lightweight** (Change Log check): Every 6 hours
- **Full sync** (all sources): Daily at 00:00 UTC
- **Manual sync**: On-demand via `*memory-sync` command

**Avoid:**
- Don't sync during active @dev implementation
- Don't sync during @qa gate execution
- Queue changes → apply on next window

---

### S6: Token Budget Lock

**Rule:** Memory must not exceed token budget.

**Budget:**
- Per-agent: max 5,000 tokens
- Warning: > 4,000 tokens
- Block: > 5,000 tokens

**When Over Budget:**
- Archive old memories to `_archive/{agentId}/`
- Link archived memories via references
- Update MEMORY.md index to point to archive

---

## Validation Gate (V1-V3)

### V1: Pre-Sync Validation

**Checks:**
- ✅ Frontmatter valid (required fields)
- ✅ No duplicate entries
- ✅ All references valid (no broken links)
- ✅ Token count < 5,000

**Fail:** Abort sync, report errors

---

### V2: Conflict Detection

**Checks:**
- ✅ Source vs. Memory consistency
- ✅ Feedback coherence (no contradictions)
- ✅ Project context alignment

**Fail:** Flag for manual review (don't abort)

---

### V3: Post-Sync Validation

**Checks:**
- ✅ All changes logged
- ✅ Timestamp accuracy
- ✅ Archive references valid

**Fail:** Rollback, investigate

---

## Locking Mechanism

**Purpose:** Prevent concurrent updates during sync

**Implementation:**
```yaml
# Lock file: .aiox/memory-locks/{agentId}.lock

{
  "agentId": "sm",
  "locked_at": "2026-06-08T10:15:00Z",
  "locked_by": "sync-engine",
  "expires_at": "2026-06-08T10:35:00Z",
  "reason": "Full sync in progress"
}
```

**Rules:**
- Lock duration: max 20 minutes
- Expire stale locks automatically
- Manual unlock only by @aiox-master

**Blocked During Lock:**
- Memory updates
- Sync operations
- Validation checks

**Queued During Lock:**
- Feedback entries (append to queue)
- Sync requests (retry after lock released)

---

## Merge Strategy

**When:** Two sources provide memory updates simultaneously

**Strategy:**
1. **Append-only fields** (feedback, change log) → Merge by timestamp
2. **State fields** (project context) → Newer wins
3. **Contradicting feedback** → Flag conflict

**Example:**
```
Source A: "Pattern X approved"
Source B: "Pattern X rejected"
Result: Conflict detected → manual review required
```

---

## Rastreabilidade Archive

**Location:** `.claude/agents/{agentId}/memory-archive/`

**Archived When:**
- Memory > 5,000 tokens
- Agent requested archive
- Memory > 6 months old

**Archive Format:**
```
memory-archive/
├── 2026-06-feedback-original.md
├── 2026-06-project-context-old.md
└── index.md (points to active + archived)
```

---

## Automation (Story 1.17 Implementation)

These rules will be automated via:
- `.claude/hooks/agent-memory-sync.cjs` (on schedule)
- `.aiox-core/scripts/memory-sync-engine.js` (on-demand)
- CircleCI/GitHub Actions (daily full sync)

---

**Document:** AC4 ✅ COMPLETE | AC1-AC3 ✅ REINFORCED
