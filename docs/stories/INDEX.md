# Story Index — KAIROS_CEREBRO Monitor Control Plane

**PRD Reference:** `docs/prd/KAIROS-CEREBRO-MONITOR-CONTROL.md`  
**Created:** 2026-06-04 by @sm (River)

---

## Summary by Epic

### EPIC-1: Monitor Core (Weeks 1-2)
| Story | Title | Complexity | Status |
|-------|-------|------------|--------|
| 1.1 | ParallelMonitor Kernel Integration | 8sp | Draft |
| 1.2 | WebSocket Real-Time Broadcaster | 8sp | Draft |
| 1.3 | Immutable Audit Log | 13sp | Draft |
| 1.4 | 30-Day Archival Job | 8sp | Draft |
| 1.5 | Monitor API (GET endpoints) | 10sp | Draft |
| **TOTAL** | — | **47sp** | — |

### EPIC-2: Control Core (Week 3)
| Story | Title | Complexity | Status |
|-------|-------|------------|--------|
| 2.1 | Constitutional Gates Enforcement | 13sp | Draft |
| 2.2 | Workflow & Story Validators | 10sp | Draft |
| 2.3 | Agent Activation Orchestrator | 13sp | Draft |
| 2.4 | Rate Limiters | 8sp | Draft |
| **TOTAL** | — | **44sp** | — |

### EPIC-3: Data Durability (Week 4)
| Story | Title | Complexity | Status |
|-------|-------|------------|--------|
| 3.1 | SQLite Schema & Migrations | 13sp | Draft |
| 3.2 | Rollup Strategy (hourly → daily → monthly) | 10sp | Draft |
| 3.3 | Corruption Recovery & Backup Export | 10sp | Draft |
| **TOTAL** | — | **33sp** | — |

### EPIC-4: CLI + Config (Week 5)
| Story | Title | Complexity | Status |
|-------|-------|------------|--------|
| 4.1 | kairos-monitor CLI & .clauderc Integration | 10sp | Draft |
| 4.2 | Bearer Token Lifecycle Management | 8sp | Draft |
| 4.3 | Logging Format Standardization | 8sp | Draft |
| **TOTAL** | — | **26sp** | — |

### EPIC-5: UI Layer (Optional, Weeks 6+)
| Story | Title | Complexity | Status |
|-------|-------|------------|--------|
| 5.1 | React Dashboard Skeleton | 8sp | Draft |
| 5.2 | Session Timeline View | 10sp | Draft |
| 5.3 | Agent Status Board | 8sp | Draft |
| 5.4 | Hook Execution History | 8sp | Draft |
| **TOTAL** | — | **34sp** | — |

---

## Grand Total

- **Total Stories:** 21
- **Total Story Points:** 184sp
- **Duration:** 8 weeks (Monitor + Control + CLI) + 2 weeks optional (UI)
- **Velocity Assumption:** 22-24sp/week (2 weeks per epic)

---

## Dependency Graph (Simplified)

```
EPIC-1: Monitor Core
├── 1.1 ParallelMonitor (independent)
├── 1.3 Audit Log (independent)
├── 1.2 WebSocket → requires 1.1
├── 1.4 Archival → requires 1.3
├── 1.5 Monitor API → requires 1.1, 1.3
└── Ready for EPIC-2

EPIC-2: Control Core (after EPIC-1)
├── 2.1 Constitutional Gates → requires 1.3
├── 2.2 Validators (independent)
├── 2.3 Orchestrator → requires 2.2, 1.3
└── 2.4 Rate Limiters (independent)

EPIC-3: Data Durability (parallel with EPIC-2)
├── 3.1 SQLite Schema (independent)
├── 3.2 Rollup → requires 3.1
└── 3.3 Recovery & Backup → requires 3.1

EPIC-4: CLI + Config (after EPIC-1, 2, 3)
├── 4.1 CLI & .clauderc (requires 1.1, 1.3, 1.5, 2.3)
├── 4.2 Token Lifecycle → requires 4.1
└── 4.3 Logging (independent)

EPIC-5: UI Layer (optional, after EPIC-1)
├── 5.1 Dashboard Skeleton → requires 1.2
├── 5.2 Session Timeline → requires 5.1, 1.2
├── 5.3 Agent Status → requires 5.1, 1.2
└── 5.4 Hook History → requires 5.1, 1.2
```

---

## Next Steps

1. **@po validate** — Run 10-point validation checklist on all 21 stories
2. **@dev schedule** — Pick Story 1.1 + 1.3 (independent, parallel start)
3. **Begin Phase 0** — Stories 1.1 + 1.3 this week, other EPIC-1 stories next week

---

*Breakdown completed by @sm (River) — 2026-06-04*
