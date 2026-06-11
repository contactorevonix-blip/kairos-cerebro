# EPIC-8 Phase 2: IDS Enhancement — Detailed PRD

**Phase:** 2 of 4  
**Duration:** Jul 6 → Jul 19, 2026 (2 weeks)  
**Effort:** 17 story points  
**Stories:** 8.2.1 through 8.2.9  
**Success Metric:** Complete Incremental Development System (G1-G6) + auto-heal registry + health dashboard

---

## Phase 2 Vision

IDS is 70% complete with Gates G1-G5 active. Phase 2 closes the gap:
- **G6 (CI/CD)** — Registry integrity enforcement in CI pipelines
- **Auto-Heal** — Detect and repair entity registry drifts
- **Health Dashboard** — Visualize IDS health (REUSE%, entity count, gate compliance)
- **Impact Graph** — Show REUSE→ADAPT→CREATE dependency chains

**Outcomes:**
- G6 gate blocking PRs with unregistered entities
- Registry health >95% (low drift, high pattern reuse)
- IDS auto-heal resolves 80% of common drifts automatically
- Dashboard shows framework code quality via pattern reuse metrics

---

## Research Foundation

**Source:** `docs/research/ids-enhancement-gaps.md`

**Current IDS State (Observed):**
- G1-G5: Advisory/soft-block gates active
- Registry: 474 entities tracked
- Missing: G6 CI/CD enforcement
- Gap: No auto-healing, no health dashboard

**Decision:** Auto-heal first (registry repairs itself), then CI/CD gate (G6)

---

## User Stories

### 8.2.1: G6 CI/CD Gate Implementation (2sp)

**Objective:** Automated registry integrity validation in CI

**Acceptance Criteria:**
- [ ] Git hook: `.husky/pre-push` runs G6 gate (block push if registry invalid)
- [ ] CI task: `.aiox-core/development/tasks/ids-g6-gate.md` (formal definition)
- [ ] Validation checks:
  - All new files registered in entity-registry.yaml
  - No circular dependencies in entity graph
  - All referenced patterns exist (no broken links)
- [ ] Override mechanism: `--skip-ids-g6 --reason "..."` (logged for audit)
- [ ] Performance: Gate runs <10s on full registry

**Dependencies:** 8.2.2 (auto-heal must work first)

**Blocks:** PRs with unregistered new entities until fixed

---

### 8.2.2: Registry Auto-Heal (2sp)

**Objective:** Detect + repair entity registry drifts automatically

**Acceptance Criteria:**
- [ ] Task: `.aiox-core/core/ids/registry-auto-heal.js` (healing logic)
- [ ] Detection patterns (auto-triggered when:
  - Entity file exists in filesystem but missing from registry
  - Entity listed in registry but file deleted
  - Entity has stale timestamps (older than file mtime)
  - Circular dependency detected in entity graph
- [ ] Repair actions:
  - Auto-add missing entities (populate metadata from file headers)
  - Auto-remove deleted entities (log as audit trail)
  - Fix stale metadata (update timestamps)
  - Suggest cycle resolution (not auto-fix, user decision)
- [ ] Dry-run mode: `aiox ids heal --dry-run` (show changes without applying)
- [ ] Logging: All heals logged to `.aiox/ids-heal-log.jsonl`

**Dependencies:** None (can run independently)

**Safety:** All heals must be reversible (git-tracked)

---

### 8.2.3: Impact Analysis Graph (2sp)

**Objective:** Visualize REUSE→ADAPT→CREATE dependency chains

**Acceptance Criteria:**
- [ ] Data model: `.aiox-core/data/ids-impact-graph.json` (graph schema)
  - Nodes: Entity (task, template, script)
  - Edges: Depends-on, Reused-by, Adapted-from
- [ ] Graph building: `aiox ids graph --format [json|dot|mermaid]`
- [ ] Queries:
  - Show all entities reusing pattern X
  - Show adaptation chain (original → adapt1 → adapt2)
  - Detect circular adaptation chains
- [ ] Visualization: ASCII + Mermaid diagram support
- [ ] Performance: Build graph for 500 entities <5s

**Dependencies:** 8.2.2 (clean registry)

**Example Use Case:** "Show all tasks adapted from `dev-develop-story`"

---

### 8.2.4: Adaptability Scoring (2sp)

**Objective:** Score entities 0-1 on reusability + adaptation potential

**Acceptance Criteria:**
- [ ] Scoring model: `docs/architecture/ids-adaptability-score.md`
  - Reusability (0-1): How often reused? How generic?
  - Clarity (0-1): Documentation quality? Type hints?
  - Flexibility (0-1): How easy to adapt? Configurable parameters?
  - Overall Score = 0.4*reuse + 0.3*clarity + 0.3*flexibility
- [ ] API: `GET /api/ids/entity/{id}/score` (REST endpoint)
- [ ] Dashboard widget: Show top-5 highest-score entities per category
- [ ] Alerts: Entities with score <0.3 flagged for refactor (Art. IV)

**Dependencies:** 8.2.3

**Use Case:** PM uses scores to decide "REUSE vs CREATE" during story planning

---

### 8.2.5: Creation Justification Validator (1.5sp)

**Objective:** Enforce Article IV-A — new entities require REUSE>ADAPT>CREATE decision

**Acceptance Criteria:**
- [ ] Gate integration: `*validate-story-draft` checks for created entities
- [ ] Validation rule: New entity in story must include:
  - `created_reason: "..."` (why not REUSE/ADAPT existing?)
  - `evaluated_patterns: [list of existing entities considered]`
  - `rejection_reasons: {pattern: reason}`
  - `new_capability: "..."` (unique capability this provides)
- [ ] Registry update: Auto-register new entities with justification metadata
- [ ] Audit trail: Justifications stored in entity-registry.yaml under `metadata.created_justification`

**Dependencies:** 8.2.4

**Enforcement:** @qa gate FAIL if justification missing/weak

---

### 8.2.6: Change Log Automation (1.5sp)

**Objective:** Automatically log all entity modifications (auditable history)

**Acceptance Criteria:**
- [ ] File: `.aiox-core/data/entity-changelog.jsonl` (append-only log)
- [ ] Entry format:
  ```json
  {
    "timestamp": "2026-06-11T...",
    "entity_id": "story-8.2.6",
    "action": "created|modified|deleted|adapted",
    "agent": "@dev",
    "commit": "abc123...",
    "before": {...old metadata},
    "after": {...new metadata}
  }
  ```
- [ ] Auto-capture: On every registry update
- [ ] Query API: `aiox ids changelog {entity-id}` (show entity history)
- [ ] Retention: Keep full history (no purge)

**Dependencies:** 8.2.2

---

### 8.2.7: IDS Health Dashboard (2sp)

**Objective:** Web dashboard showing IDS metrics + registry health

**Acceptance Criteria:**
- [ ] Dashboard URL: `http://localhost:3000/ids`
- [ ] Metrics displayed:
  - Registry health score (0-100)
  - REUSE % (entities reused / total entities)
  - Adaptation distribution (pie chart: REUSE vs ADAPT vs CREATE)
  - Gate compliance: G1-G6 pass rate by week
  - Circular dependencies detected
  - High-risk entities (score <0.3)
- [ ] Drill-down: Click entity → show adaptability score + history
- [ ] Export: Dashboard data exportable as JSON/CSV
- [ ] Update frequency: Real-time (Webhook from gate events)

**Dependencies:** 8.2.1-8.2.6

---

### 8.2.8: Documentation + Training (1.5sp)

**Objective:** Complete IDS system guide for developers

**Acceptance Criteria:**
- [ ] File: `docs/guides/ids-guide.md`
  - Article IV-A explained (REUSE>ADAPT>CREATE)
  - When to create vs adapt (decision tree)
  - How to register entities (CLI command)
  - G1-G6 gates explained (what triggers them)
- [ ] File: `docs/architecture/ids-api.md`
  - REST API endpoints (GET /ids/entity, GET /ids/score, etc.)
  - Entity registry format (YAML schema)
  - Change log format (JSONL schema)
- [ ] Slides: 10-minute IDS overview (Markdown + speaker notes)

**Dependencies:** 8.2.1-8.2.7

---

### 8.2.9: CI/CD Integration (2sp)

**Objective:** G6 gate + IDS workflows in GitHub Actions / pre-commit hooks

**Acceptance Criteria:**
- [ ] GitHub Action: `.github/workflows/ids-g6-gate.yml`
  - Runs on PR: Check registry integrity
  - Blocks merge if unregistered entities added
  - Comments on PR with required fixes
- [ ] Pre-push hook: `.husky/pre-push` calls G6 gate
- [ ] Fast-fail: G6 <10s (doesn't slow down dev loop)
- [ ] Logs: All G6 decisions logged to `.aiox/gate-logs/art-ids-g6-*.jsonl`

**Dependencies:** 8.2.1

---

## Handoff to Phase 3

**Trigger:** All Phase 2 stories DONE, @qa gates PASS

**Deliverables:**
- ✅ G6 gate blocking unregistered entities
- ✅ Registry health >95%
- ✅ Auto-heal tested and operational
- ✅ IDS dashboard functional

**Carry-forward to Phase 3:**
- IDS health metrics for squad creation validation
- Entity registry used in Phase 3 (Squad Creator needs to register new agents)

---

## Success Metrics

| Metric | Target | Acceptance |
|--------|--------|-----------|
| G6 gate active | Blocking PRs | ✅ MUST |
| Registry health | >95% | ✅ MUST |
| Auto-heal coverage | 80% of common drifts | ✅ MUST |
| Dashboard operational | Real-time updates | ✅ SHOULD |
| Documentation complete | Full API + user guide | ✅ MUST |

---

## References

**Related Documents:**
- `docs/research/ids-enhancement-gaps.md` — Research phase findings
- `.aiox-core/rules/ids-principles.md` — Article IV-A
- `docs/architecture/ids-api.md` — API reference (created in 8.2.8)

---

*Phase 2 PRD — Ready for Story Creation*
