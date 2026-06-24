# Agent Immortality — Lifecycle Rules

**Document:** Agent Memory Persistence Lifecycle  
**Effective:** 2026-06-24 | **Story:** 1.20 (Agent Immortality Phase 1)  
**Severity:** INFORMATIONAL (Phase 1: logging only; persistence in Phase 2)

---

## Lifecycle Phases

### Phase 1: Logging Foundation (Cont 72-73, Story 1.20) ✅
- **Scope:** Memory capture and logging to `.aiox/agent-memory/logs/`
- **Triggers:**
  - `SubagentStart`: Capture agent activation context (hook: `activate-immortality-logger.cjs`)
  - Agent state change: Log decisions/memory updates (hook: `state-change-immortality-logger.cjs`)
  - `SubagentStop`: Final snapshot on deactivation (hook: `deactivate-immortality-logger.cjs`)
- **Output:** JSON lines format (one snapshot per line)
- **Non-blocking:** Agent continues even if logger fails
- **Config:** `core-config.yaml` → `immortality.logging: true`

### Phase 2: Memory Persistence Store (Cont 73+, Story 1.20A)
- **Scope:** Persist logged memories to queryable store (database/S3)
- **Actions:**
  - Transform daily `.jsonl` logs into persistent records
  - Index by agent ID, session ID, timestamp
  - Enable memory search/retrieval for Phase 3
- **Expected:** Cont 73-74

### Phase 3: Agent Resurrection (Cont 74+, Story 1.20B)
- **Scope:** Restore agent context from stored memories
- **Actions:**
  - On agent activation: Query memory store for prior sessions
  - Load context and decisions into current session
  - Enable multi-session continuity
- **Expected:** Cont 74+

---

## Integration Points (When Logging Happens)

### SubagentStart Hook
**File:** `.claude/hooks/activate-immortality-logger.cjs`  
**Trigger:** Agent activation (new subprocess or interactive mode)  
**Captures:**
- Agent ID, timestamp, activation context
- Initial instructions/prompt
- Session ID (random or parent-provided)

**Output:** Entry in `.aiox/agent-memory/logs/{date}.jsonl`

### State-Change Hook
**File:** `.claude/hooks/state-change-immortality-logger.cjs`  
**Trigger:** Major agent state changes (decisions, tool calls, conclusions)  
**Captures:**
- Decision made (what, why)
- Memory state at decision point
- Outcome/result

**Output:** Appended to active `.jsonl` file

### SubagentStop Hook
**File:** `.claude/hooks/deactivate-immortality-logger.cjs`  
**Trigger:** Agent exit (completion, handoff, error)  
**Captures:**
- Final state snapshot
- Completion status (success/error/handoff)
- Summary of decisions/outcomes

**Output:** Final entry in `.jsonl` file, close session

---

## Metrics Tracking

Tracked in `.synapse/metrics/hook-metrics.json` under `immortality` section:

| Metric | Meaning | Updated By |
|--------|---------|-----------|
| `sessions_captured` | Count of agent sessions logged | `activate-` hook |
| `snapshots_logged` | Total snapshots written to disk | state-change / deactivate hooks |
| `serialization_errors` | Failed serialization attempts | logger error handler |
| `last_capture_timestamp` | Most recent snapshot time | any hook |
| `status` | enabled / disabled | config-driven |
| `ttl_hours` | Log retention period | core-config.yaml |

Daily rollover: `logs-2026-06-24.jsonl` (one file per day)

---

## Non-Blocking Guarantee

**Critical:** Immortality logging MUST NEVER block agent execution.

**Implementation:**
- Hooks use `setImmediate()` for async writes
- 1-second safety timeout (process.exit safety)
- Graceful degradation: agent continues on logger failure
- Exit code 0 on logger errors (non-fatal)

**Testing:** `tests/hooks/immortality-hooks.test.js` (14 tests, all pass)

---

## Configuration

**Location:** `core-config.yaml`

```yaml
immortality:
  enabled: false          # Phase 2: set to true when persistence ready
  logging: true           # Phase 1: active now
  logDir: .aiox/agent-memory/logs
  sessionTTLHours: 168    # 7 days default
```

**Schema:** Documented in `.aiox-core/data/config-schema.yaml`

---

## Roadmap

| Phase | Scope | Stories | Timeline |
|-------|-------|---------|----------|
| **1** | Logging | 1.20 | Cont 72-73 ✅ |
| **2** | Persistence | 1.20A | Cont 73-74 |
| **3** | Resurrection | 1.20B | Cont 74+ |

---

## Related

- **Story 1.20:** Agent Immortality Phase 1 (logging foundation)
- **Hooks:** `.claude/hooks/activate-`, `state-change-`, `deactivate-immortality-logger.cjs`
- **Logger:** `packages/immortality-logger/logger.cjs`
- **Config:** `.aiox-core/core-config.yaml` (immortality section)
- **Metrics:** `.synapse/metrics/hook-metrics.json` (immortality section)

---

**Created by:** Story 1.20 AC5 | **Date:** 2026-06-24
