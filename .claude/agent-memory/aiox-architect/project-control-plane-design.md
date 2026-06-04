---
name: control-plane-design
description: Architecture for Claude Code Monitor + local Control Plane (CLI + Dashboard) — design decisions and existing-artifact anchors
metadata:
  type: project
---

Control Plane design delivered 2026-06-04 at `docs/architecture/CONTROL-PLANE-DESIGN.md` (Aria/architect).

**Why:** Pedro wants an integrated control system to observe + control 150+ Claude Code windows
(Monitor READ-ONLY + Control WRITE), constitution-first (CLI is source of truth, dashboard observes).

**How to apply:** When asked to build/extend the Control Plane, reuse these locked decisions instead of re-deciding.

Key decisions (ADRs):
- Backend: Node.js + Fastify (single stack, reuse existing event model)
- DB: SQLite WAL via better-sqlite3 (write-funnel/read-fanout fit); Postgres behind DatabaseAdapter escape hatch
- Real-time: WebSocket via `ws`, extending existing ParallelMonitor.broadcast()
- Frontend: React + Vite + TS + Zustand (on-preset, SPA NOT Next-server) — UX/component design delegated to Uma
- DB is a DERIVED index; filesystem is source of truth (crash recovery = full re-scan vs file mtime)
- Control API = thin CLI delegator + immutable audit_log; dashboard NEVER executes logic (Article I)
- Auth: 127.0.0.1-only bind + per-boot bearer token in `.aiox/control-plane.token`

Non-obvious anchors discovered (reused, not invented):
- `ParallelMonitor` already exists at `.aiox-core/core/execution/parallel-monitor.js` — EventEmitter with
  `wsConnections` Set + `broadcast()` + wave/task lifecycle events. This IS the kernel of the real-time layer.
- Real session schema lives at `.synapse/sessions/*.json`, schema_version "2.0": fields uuid, started,
  last_activity, prompt_count, active_agent{id,activated_at}, active_workflow, active_squad, context{last_bracket,last_tokens_used,last_context_percent}.
- Metrics source: `.synapse/metrics/hook-metrics.json` + timing JSONL at `~/.claude/logs/timing-*.jsonl`.
- DailyUsage Archival pattern (Sprint 2) reused for metrics rollup/archival.

Open questions still pending PO/User: model-rate source, retention policy, single-machine vs fleet (flips DB choice), auth beyond localhost.

Related: [[control-plane-existing-artifacts]]
