# Observability Platform Audit — EPIC-8 Phase 1 Research

**Status:** DRAFT v0.1  
**Date:** 2026-06-11  
**Agent:** @analyst (Atlas)  
**Validation:** @architect (pending)

---

## Executive Summary

AIOX lacks integrated observability for framework-level metrics. Current implementation relies on:
- **Gate Enforcement Logs:** `.aiox/gate-logs/` (JSONL format, per-article daily files)
- **Hook Metrics:** `.synapse/metrics/hook-metrics.json` (single-file session state)
- **Task Logs:** `.aiox/task-logs/` (JSON per epic, manual updates)

**Gap:** No unified CLI metrics collector, no dashboard backend, no real-time monitoring. No observable relationships between gate decisions, story progress, and framework health.

**Proposed Direction:** CLI-first metrics system (AIOX as source of truth) with PostgreSQL persistence + optional dashboards.

---

## Current State Analysis

### Data Sources (Existing)

| Source | Format | Scope | Mutability |
|--------|--------|-------|-----------|
| `.aiox/gate-logs/{article}-YYYY-MM-DD.jsonl` | JSON Lines | Constitutional gate decisions | Write-only append |
| `.synapse/metrics/hook-metrics.json` | JSON | Session state (agent, quality, context) | Merge-on-write |
| `.aiox/task-logs/{epic}.json` | JSON | Story/task progress per epic | Manual JSON updates |

### Collected Metrics (Ad-hoc)

**Gate Enforcement (from gate-logs):**
```json
{
  "timestamp": "2026-06-11T10:00:00Z",
  "article": "art-ii-agent-authority",
  "decision": "block",
  "reason": "git push is exclusive to @devops",
  "agent": "@dev",
  "operation": "git push"
}
```

**Hook Metrics (from hook-metrics.json):**
```json
{
  "session": {
    "active_agent": { "id": "dev" },
    "timestamp": "2026-06-11T09:30:00Z"
  },
  "enforcement": {
    "gatesEnforced": 45,
    "violationsDetected": 3,
    "violationsBlocked": 2,
    "overridesUsed": 1
  }
}
```

**Problem:** These are isolated data islands. No single source for "framework health status" or "day's enforcement summary."

### CLI Integration Points (Potential Reuse)

1. **Hook System** — Observability pre/post hooks (`PreMetricsCollection`, `PostMetricsCollection`) not yet implemented
2. **Agent Activation Tracking** — `agent-activation-tracker.cjs` already populates active agent in hook-metrics
3. **Gate Enforcement Chain** — `enforce-*.cjs` hooks already log decisions to gate-logs

**Reuse Opportunity:** Extend existing hooks to emit structured metrics instead of just logging.

---

## Industry Patterns: CLI-First Observability

### Reference: Successful CLI Metrics Systems

| Tool | Pattern | CLI Output | Storage |
|------|---------|-----------|---------|
| **Rust (cargo)** | Build metrics as JSON output | `cargo metadata --json` | Cached JSON |
| **Node (npm)** | Hook-based (pre/post scripts) emit metrics | `npm run metrics` → JSON | `.npm-metrics/` |
| **Terraform** | State snapshots (JSON) + CLI output | `terraform show -json` | `.terraform/` |

**Common Pattern:**
- Metrics collected at operation boundaries (pre/post)
- Exported as JSON (human-readable + parseable)
- Optional: persisted to local DB/file for trends
- CLI as authoritative source, not a dashboard

### Anti-Pattern: Dashboard-First

❌ **Problem:** Observability tools (Grafana, DataDog, Prometheus) often impose complex data pipeline requirements:
- External API calls during builds (breaks offline-first principle)
- Proprietary agent installation (violates Constitution I: CLI First)
- Distributed tracing overhead (not applicable to async framework operations)

✅ **AIOX Approach:** Metrics are CLI outputs, optionally persisted locally.

---

## Proposed Metrics Schema (DRAFT)

### Collection Levels

#### Level 1: Gate Metrics (Per-Decision)
```json
{
  "timestamp": "ISO-8601",
  "level": "gate",
  "article": "art-ii|art-iii|...",
  "gate_name": "enforce-agent-authority",
  "decision": "allow|block|override|warn",
  "agent": "@dev|@sm|...",
  "operation": "git push|git commit|Write|Edit|...",
  "reason": "string"
}
```

**Collection Point:** All `enforce-*.cjs` hooks (already writing, just need CLI export)

#### Level 2: Session Metrics (Per-Agent Activation)
```json
{
  "timestamp": "ISO-8601",
  "level": "session",
  "agent": "@dev",
  "session_id": "uuid",
  "story_active": "7.13",
  "context_state": {
    "phase": 1-4,
    "phase_name": "research|spec|dev|deployment"
  }
}
```

**Collection Point:** `agent-activation-tracker.cjs` (extend existing)

#### Level 3: Framework Health (Aggregated, Per-Interval)
```json
{
  "timestamp": "ISO-8601",
  "interval": "1h|1d|1w",
  "level": "framework",
  "gates": {
    "enforced_count": 142,
    "violations_detected": 5,
    "violations_blocked": 4,
    "violations_override": 1,
    "by_article": {
      "art-ii": { "enforced": 30, "blocked": 2 },
      "art-iii": { "enforced": 40, "blocked": 1 }
    }
  },
  "stories": {
    "in_progress": 3,
    "done": 45,
    "avg_effort_sp": 2.1
  },
  "ids_registry": {
    "entities_total": 474,
    "entities_created": 3,
    "registry_health": 0.98
  }
}
```

**Collection Point:** New CLI task `*metrics-collect` (aggregates from gate-logs + hook-metrics + task-logs)

---

## Implementation Approach (Phase 1: 8.1.x Stories)

### 8.1.1: Metrics Schema Design
- Finalize 3-level schema (Gate | Session | Framework)
- Define JSON schema files (.json-schema)
- Document versioning strategy

### 8.1.2: CLI Metrics Collector
- New task: `metrics-collect.md` (executable workflow)
- Reads gate-logs, hook-metrics, task-logs
- Outputs JSON to stdout (or file)
- Command: `aiox metrics --collect --interval 1h --output json`

### 8.1.3: Gate Metrics Integration
- Extend enforce-*.cjs hooks to emit structured events
- Refactor gate-logger to support metrics output
- No gate logic changes, just richer observability

### 8.1.4: Dashboard Backend (Optional)
- Express.js endpoint: `GET /api/metrics` (JSON response)
- PostgreSQL table: `metrics_events` (time-series)
- Retention policy: 30 days (configurable)

### 8.1.5: Real-Time Monitoring
- WebSocket endpoint for live metrics (out of scope Phase 1)
- Historical query capability (Phase 2)

---

## Dependencies & Constraints

### Must Reuse
- Gate enforcement patterns (enforce-*.cjs exist, extend not rewrite)
- Hook system (already integrating agent-activation-tracker)
- Existing entity registry (use for story/task reference)

### Must Not Violate
- **Art. I (CLI First):** Metrics must work 100% via CLI; dashboard optional
- **Art. IV (No Invention):** All metrics definitions must trace to observed gate decisions or story progress (no synthetic metrics)

### External Dependencies
- **PostgreSQL:** Optional, for persistence. Phase 1 can work with JSON files only.
- **No external observability vendors** (violates Constitution)

---

## Risk Assessment

| Risk | Probability | Mitigation |
|------|-----------|-----------|
| Schema versioning conflicts | Medium | Define v1.0, plan for v2 sharding in ADR |
| Collection performance overhead | Low | Metrics collection is async, non-blocking |
| Data volume explosion | Low | Retention policy + compression (JSONL) |
| Hook integration bugs | Medium | Test with existing Art. II-V gates first |

---

## Success Metrics for Phase 1

- [ ] Schema finalized and validated
- [ ] CLI collector works for 1 week of historical data
- [ ] Gate integration adds <100ms overhead per decision
- [ ] PostgreSQL schema stable (no breaking changes post-Phase 1)
- [ ] Dashboard backend responds in <200ms for 7-day metrics query

---

## Timeline

**Week 1 (Jun 11-15):** Research complete, schema finalized (THIS document + validation)  
**Week 4 (Jun 29-Jul 5):** Stories 8.1.1-8.1.8 implemented  
**Week 5 (Jul 5):** Phase 1 completion gate + baseline metrics collected

---

## Next Steps (Handoff to @pm)

1. **@architect Validation** — Review schema, confirm no invented requirements
2. **Create Workflow** — `framework-evolution-cycle` (EPIC-8 PRD generation)
3. **Spec Pipeline** — Convert this research + feedback into Phase 1 PRD

---

*Research by @analyst (Atlas), Validation pending by @architect (Aria)*
