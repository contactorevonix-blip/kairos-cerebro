# EPIC-8 Phase 1: Observability & Metrics — Detailed PRD

**Phase:** 1 of 4  
**Duration:** Jun 22 → Jul 5, 2026 (2 weeks)  
**Effort:** 13.5 story points  
**Stories:** 8.1.1 through 8.1.8  
**Success Metric:** Framework-level metrics infrastructure (CLI-first, PostgreSQL, dashboards)

---

## Phase 1 Vision

AIOX currently lacks integrated observability. Framework health, gate decisions, and story progress are scattered across:
- `.aiox/gate-logs/` (enforcement logs)
- `.synapse/metrics/hook-metrics.json` (session state)
- `.aiox/task-logs/` (manual epic tracking)

**Goal:** Unified, queryable metrics system with three layers:
1. **Gate Layer** — Constitutional enforcement metrics
2. **Session Layer** — Per-session quality tracking
3. **Framework Layer** — Long-term health trends

**Outcomes:**
- CLI tool: `aiox metrics` (query/export/aggregate)
- Dashboard backend: PostgreSQL + REST API
- Real-time monitoring: Webhook integration
- Documentation: Complete usage guide

---

## Research Foundation

**Source:** `docs/research/observability-platform-audit.md`

**Key Findings:**
- 3 separate data sources exist but lack unified interface
- Gate logs: ~50 enforcement decisions/day logged in JSONL
- Hook metrics: Session state captured but not aggregated
- Task logs: Manual JSON updates, not reliable for trending

**Decision:** CLI-first approach (not external SaaS tool)
- All metric collection via AIOX CLI
- PostgreSQL for historical aggregation
- Dashboards optional (not required for functionality)

---

## User Stories

### 8.1.1: Metrics Schema Design (1.5sp)

**Objective:** Define metrics data model (3-layer architecture)

**Acceptance Criteria:**
- [ ] Schema document: `docs/architecture/metrics-schema.md` includes:
  - Gate-layer metrics (enforcement decisions + reasons)
  - Session-layer metrics (story progress, quality gate results)
  - Framework-layer metrics (trend aggregations)
- [ ] JSON schema file: `.aiox-core/data/metrics-schema.json` (validated)
- [ ] Database schema: `migrations/001-metrics-init.sql` (ready for Phase 1.7)
- [ ] No invented metrics; all sourced from existing data

**Dependencies:** EPIC-7 complete (enforcement gates active)

**Risks:**
- Schema too narrow (can't capture future metrics)
- Mitigation: Design as extensible (add new metric types without schema migration)

---

### 8.1.2: CLI Metrics Collector (2sp)

**Objective:** `aiox metrics` command reads/aggregates/exports metrics

**Acceptance Criteria:**
- [ ] CLI command: `aiox metrics list` (show all available metrics)
- [ ] CLI command: `aiox metrics get {metric-id}` (single metric + history)
- [ ] CLI command: `aiox metrics export --format [json|csv|table]` (export for analysis)
- [ ] Default data sources: gate-logs, hook-metrics, task-logs (no manual input)
- [ ] Performance: <500ms for 30-day history query
- [ ] Help text: `aiox metrics --help` complete + examples

**Dependencies:** 8.1.1 (schema defined)

**Testing:**
- Unit: Metric parsing (gate-logs JSONL → metrics)
- Integration: Query 1y of logs, verify no data loss

---

### 8.1.3: Gate Metrics Integration (2sp)

**Objective:** Populate metrics from constitutional enforcement logs

**Acceptance Criteria:**
- [ ] Task: `parse-gate-logs.js` reads `.aiox/gate-logs/` daily files
- [ ] Metrics extracted: article + decision + reason + agent + timestamp
- [ ] Aggregations: violations/day, blocks/week, override frequency
- [ ] Performance: Parse 30 days of logs <2s
- [ ] Audit trail: All metrics include original gate-log entry reference

**Dependencies:** 8.1.1, 8.1.2

**Example Metric:**
```json
{
  "metric_id": "gate-block-count",
  "timestamp": "2026-06-11T23:59:59Z",
  "article": "art-ii-agent-authority",
  "decision": "block",
  "count": 3,
  "period": "day"
}
```

---

### 8.1.4: Dashboard Backend (2sp)

**Objective:** REST API + web dashboard for metrics visualization

**Acceptance Criteria:**
- [ ] REST endpoints (CRUD metrics): `GET /api/metrics`, `POST /api/metrics/query`
- [ ] Database connection: PostgreSQL with connection pooling
- [ ] Web dashboard: `http://localhost:3000/metrics` (next.js static pages)
- [ ] Authentication: API key (env var `METRICS_API_KEY`)
- [ ] Performance: Dashboard loads <1s, queries <500ms
- [ ] Charts: Gate violations timeline, story velocity, metric trends (min 5 charts)

**Dependencies:** 8.1.1, 8.1.3, 8.1.7 (persistence)

**Non-Requirement:** Mobile-responsive design (desktop OK)

---

### 8.1.5: Real-time Monitoring (2sp)

**Objective:** Live webhook push for gate decisions + story updates

**Acceptance Criteria:**
- [ ] Webhook endpoint: `POST /api/webhooks/gate-event`
- [ ] Payload: Gate decision (article, verdict, timestamp, agent)
- [ ] Subscription API: Store webhook URLs in PostgreSQL
- [ ] Testing: Trigger gate → webhook fires within 5s
- [ ] Graceful degradation: Missing webhook doesn't block gate

**Dependencies:** 8.1.4

**Use Case:** External monitoring tools (Datadog, New Relic) can subscribe

---

### 8.1.6: Alerts & Thresholds (1.5sp)

**Objective:** Define framework health thresholds + alert rules

**Acceptance Criteria:**
- [ ] Configuration file: `.aiox-core/data/metrics-alerts.yaml`
  - Gate compliance threshold: >95% (ALLOW blocks)
  - Story velocity threshold: >1 story/day (WARN if below)
  - Framework health threshold: >90% (CRITICAL if below)
- [ ] Alert channels: Console (CLI) + email (optional)
- [ ] Trigger: On-demand `aiox metrics alert-check`
- [ ] Documentation: Alert configuration guide

**Dependencies:** 8.1.2, 8.1.3

---

### 8.1.7: Metrics Persistence (1.5sp)

**Objective:** PostgreSQL schema + migration for metrics storage

**Acceptance Criteria:**
- [ ] Database schema: `migrations/001-metrics-init.sql`
  - Tables: `metrics` (id, key, value, timestamp, source), `metric_history` (aggregated)
  - Indexes: timestamp, article, agent (fast range queries)
  - Retention: Keep 1y data (auto-purge older than 365 days)
- [ ] Migration system: Flyway or node-migrate compatible
- [ ] Seed data: Load 30 days of existing logs into DB
- [ ] Backup strategy: DB exports weekly to `backups/metrics-YYYY-MM-DD.sql`

**Dependencies:** 8.1.1

**Testing:**
- Persist 1000 metrics, verify query <500ms
- Auto-purge oldest records, verify count stays <500k

---

### 8.1.8: Documentation (1sp)

**Objective:** Complete metrics system usage + architecture guide

**Acceptance Criteria:**
- [ ] File: `docs/guides/metrics-cli-guide.md`
  - Installation: `npm install` or `aiox install`
  - Command reference: `aiox metrics` all subcommands + examples
  - Query syntax: Filtering by article, date range, agent
  - Export examples: JSON, CSV for further analysis
- [ ] File: `docs/architecture/metrics-system.md`
  - Architecture diagram: Data flow (logs → collector → DB → API → dashboard)
  - Schema reference: All metric types + units
  - Performance notes: Query timeouts, index strategy
  - Future extensibility: How to add new metric types

**Dependencies:** 8.1.1-8.1.7

---

## Handoff to Phase 2

**Trigger:** All Phase 1 stories DONE (status = Done), @qa gates PASS

**Deliverables:**
- ✅ `.aiox-core/data/metrics-schema.json` (frozen)
- ✅ `aiox metrics` CLI command (stable interface)
- ✅ Metrics database initialized + populated
- ✅ Dashboard accessible

**Carry-forward to Phase 2:**
- Metrics infrastructure as foundation for IDS health dashboard
- Gate metrics data used for Art. VIII observability gates
- Real-time webhook integration for monitoring Phase 2 registry changes

---

## Success Metrics

| Metric | Target | Acceptance |
|--------|--------|-----------|
| Metrics CLI operational | Day 5 of Phase 1 | ✅ MUST |
| Metrics types captured | 30+ types | ✅ MUST |
| Dashboard load time | <1s | ✅ SHOULD |
| Query performance | <500ms (30-day) | ✅ MUST |
| Data completeness | 100% (no loss from logs) | ✅ MUST |
| Documentation | Complete + examples | ✅ MUST |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Schema too rigid | Metrics can't grow | Design extensible (metric type = string key) |
| DB performance | Slow queries on 1y data | Indexes on timestamp + article, auto-purge |
| Real-time lag | Webhooks delayed | Async job queue (BullMQ) if needed |
| Integration errors | Logs not parsed correctly | Audit trail (link metrics to original log entries) |

---

## Estimated Timeline

| Week | Task | Owner |
|------|------|-------|
| 1 (Jun 22-28) | 8.1.1-8.1.3 (schema, CLI, gates) | @dev |
| 2 (Jun 29-Jul 5) | 8.1.4-8.1.8 (dashboard, persistence, docs) | @dev |

**Checkpoint:** Mid-week review (Jun 25) — CLI working, metrics flowing

---

## References

**Related Documents:**
- `docs/research/observability-platform-audit.md` — Research phase findings
- `.aiox-core/constitution.md` — Article VIII (NEW)
- `docs/guides/metrics-cli-guide.md` — Usage guide (created in 8.1.8)

---

*Phase 1 PRD — Ready for Story Creation*
