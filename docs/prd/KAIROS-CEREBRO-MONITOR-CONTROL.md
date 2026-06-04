# KAIROS_CEREBRO Monitor Control Plane — PRD

**Status:** Ready for Epic Breakdown  
**Version:** 1.0  
**Date:** 2026-06-04  
**Research Base:** AIOX-COMPLETE-MAPPING + CONTROL-PLANE-DESIGN + KAIROS-CEREBRO-AUDIT

---

## 1. Executive Summary

**Goal:** Build an integrated Monitor + Control Plane for KAIROS_CEREBRO — a localhost dashboard to observe and orchestrate 150+ Claude Code terminal sessions, 55+ AIOX agents, 213 tasks, and 19 active hooks.

**Why Now:** Framework health (7.6/10) is solid. Gap is visibility + orchestration. Monitor/Control consolidates .synapse metrics + .aiox state into one CLI-first system.

**Scope:** Localhost-only (single-machine). SQLite WAL. 30-day retention. Token counting (no cost tracking). WebSocket real-time.

---

## 2. Goals

- **G1:** Real-time visibility of 150+ sessions, agents, tasks, hooks
- **G2:** CLI-first control (no UI required; UI is observation layer)
- **G3:** Enforce Constitution (Art. I-VI) at API boundary
- **G4:** Support manual + automated agent orchestration workflows
- **G5:** Archive & analyze session patterns (30-day rolling window)

---

## 3. Requirements

### FR — Functional

| ID | Requirement | Source |
|---|---|---|
| FR1 | Monitor API: GET /sessions, /agents, /tasks, /hooks (read-only) | CONTROL-PLANE |
| FR2 | Monitor WebSocket: real-time metrics broadcast (delta model) | CONTROL-PLANE |
| FR3 | Control API: POST /workflow/start with agent + story validation | CONTROL-PLANE |
| FR4 | Constitutional gates: 403 on git push / gh pr / MCP ops | AIOX-COMPLETE |
| FR5 | Durability: ParallelMonitor → SQLite WAL + .aiox/WORKFLOW-STATE.json | CONTROL-PLANE |
| FR6 | Archival: 30-day rolling, compress to tar.gz on day 31 | KAIROS-AUDIT |
| FR7 | CLI: `kairos-monitor --listen 127.0.0.1:8080` + `.clauderc` config | CONTROL-PLANE |

### NFR — Non-Functional

| ID | Requirement | Target |
|---|---|---|
| NFR1 | API latency | <100ms p95 |
| NFR2 | Token overhead (monitoring) | <5% of session tokens |
| NFR3 | Retention cost | <1GB disk per 30d |
| NFR4 | Auth | Bearer token (localhost) |
| NFR5 | Security | Bind 127.0.0.1, immutable audit log |

---

## 4. Tech Stack (Architecture Decision)

```yaml
Backend:
  Framework: Node.js + Fastify (align w/ sniper-api pattern)
  Real-time: WebSocket (ws) — delta model
  Database: SQLite WAL (single-machine, file-based)
  Archival: tar.gz → filesystem
  
Integration:
  Kernel: ParallelMonitor (.aiox-core/core/execution)
  State: .aiox/WORKFLOW-STATE.json (source of truth)
  Metrics: .synapse/metrics/hook-metrics.json
  Sessions: .aiox/sessions/*.json

Frontend:
  Framework: React + Zustand (UI is optional, observe-only)
  Transport: same WebSocket
  Build: Vite + TS

Deployment:
  Dev: npm run dev → localhost:8080
  Prod: npm run build && npm start
  No external deploy (localhost only)
```

---

## 5. Data Model (Simplified)

```typescript
// Monitor State (canonical)
interface SessionSnapshot {
  uuid: string;
  agent: string; // @pm, @dev, @qa, etc.
  story?: string;
  prompt_count: number;
  token_input: number;
  token_output: number;
  status: 'active' | 'paused' | 'done';
  started_at: ISO8601;
  updated_at: ISO8601;
}

interface WorkflowState {
  sessions: SessionSnapshot[];
  agents: { id: string; status: 'idle' | 'active' }[];
  tasks: { id: string; workflow: string; status: string }[];
  hooks: { name: string; last_run: ISO8601; next_run?: ISO8601 }[];
  timestamp: ISO8601;
}
```

---

## 6. Epics (5 Total)

### EPIC-1: Monitor Core (Weeks 1-2)
- Real-time metrics collection from .aiox + .synapse
- WebSocket broadcaster
- Immutable audit log
- 30-day archival job

### EPIC-2: Control Core (Week 3)
- Constitutional gates (Art. I-VI enforcement)
- Workflow/story validators
- Agent activation orchestrator
- Rate limiters

### EPIC-3: Data Durability (Week 4)
- SQLite schema design
- Rollup strategy (hourly → daily → monthly)
- Corruption recovery
- Backup export

### EPIC-4: CLI + Config (Week 5)
- kairos-monitor CLI
- .clauderc integration
- Bearer token lifecycle
- Logging format

### EPIC-5: UI Layer (Optional, Week 6+)
- React dashboard (read-only observation)
- Session timeline
- Agent status board
- Hook execution history

---

## 7. Roadmap (Phased)

| Phase | Focus | Duration | Dependency |
|---|---|---|---|
| **Phase 0** | Story breakdown + squad formation | 3 days | PRD approval |
| **Phase 1** | Monitor Core (E1) | 2 weeks | None |
| **Phase 2** | Control Core (E2) | 1 week | Phase 1 |
| **Phase 3** | Data Layer (E3) | 1 week | Phase 1 |
| **Phase 4** | CLI + Config (E4) | 1 week | Phase 2+3 |
| **Phase 5** | UI (E5) | 2 weeks | Phase 4 (optional) |

**Total:** ~8 weeks MVP (Monitor + Control + CLI). UI is optional Phase 5.

---

## 8. Success Criteria

- [ ] Monitor API responds <100ms on all GET endpoints
- [ ] WebSocket broadcasts deltas every 500ms
- [ ] Constitutional gates enforce Art. I-II (git push, MCP, PR all 403)
- [ ] 150 sessions logged with accurate token counts
- [ ] CLI `kairos-monitor --listen` works on first try
- [ ] 30-day archival compresses to <500MB
- [ ] 0 CRITICAL CodeRabbit findings
- [ ] All stories Done (not Ready for Review)

---

## 9. Out of Scope (Phase 1)

- Distributed multi-machine monitor
- Cost tracking ($)
- Advanced ML pattern detection
- Mobile UI
- External deploy (Vercel, Railway)

---

*PRD consolidado por @pm (Morgan) — 2026-06-04*  
*Research: docs/research/{AIOX-COMPLETE-MAPPING, KAIROS-CEREBRO-AUDIT}, docs/architecture/CONTROL-PLANE-DESIGN*
