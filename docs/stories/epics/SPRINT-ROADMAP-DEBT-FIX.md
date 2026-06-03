# Phase 10: Sprint Roadmap from Brownfield Discovery

**Date:** 2026-06-03  
**Agent:** @pm (Morgan)  
**Status:** ROADMAP CREATED  

---

## Overview

This document converts the Technical Debt Assessment into **executable epics + stories** for Sprints 1-3.

**Total Effort:** 67 hours (~3 sprints)  
**Start Date:** 2026-06-10 (Week 1)  
**Target Completion:** 2026-07-22 (Week 6)

---

## Sprint 1: Production Hardening (Weeks 1-2)

**Goal:** Fix CRITICAL issues, make production-ready  
**Effort:** 19 hours  
**Deadline:** 2026-06-24

### Epic 1.1: CRITICAL Data Integrity Fix

#### Story 1.1.1: Fix TokenBalance Cascade Delete (DB-001)
```yaml
Status: Draft
Title: "Fix TokenBalance cascade delete on user deletion"
Description: |
  User deletion cascades and deletes transaction history (financial data loss).
  Change CASCADE to SET NULL to preserve audit trail.
  
Acceptance Criteria:
  - TokenBalance.userId foreign key uses ON DELETE SET NULL
  - User deletion preserves all Transaction records
  - Existing data migrated (old cascade references cleared)
  - Migration tested on staging PostgreSQL
  - No user data loss in production
  
Effort: 1 story point (1 hour)
Blocked By: None
Blocks: Nothing
Priority: CRITICAL
Assigned To: @data-engineer
```

---

### Epic 1.2: CRITICAL UX Improvement

#### Story 1.2.1: Implement Rate Limiting UI Feedback (API-001)
```yaml
Status: Draft
Title: "Add rate limiting feedback to API responses + frontend UI"
Description: |
  Rate-limited API calls fail silently. Users don't know why requests fail.
  Add HTTP headers + countdown UI to improve UX.
  
Acceptance Criteria:
  - API responses include X-RateLimit-Remaining header
  - API responses include X-RateLimit-Reset header
  - Frontend displays countdown when near limit
  - 429 response shows "Try again in X seconds"
  - Error message is clear + actionable
  - Works on desktop + mobile
  
Effort: 2 story points (4 hours)
Blocked By: None
Blocks: Nothing
Priority: CRITICAL
Assigned To: @dev (frontend) + @dev (backend)
```

---

### Epic 1.3: Observability Foundation

#### Story 1.3.1: Implement Structured Logging (OBS-001)
```yaml
Status: Draft
Title: "Add structured logging to all API endpoints"
Description: |
  Console.log scattered throughout code. Hard to debug production.
  Implement Winston/Pino for structured JSON logs.
  
Acceptance Criteria:
  - Winston configured for production
  - Every API endpoint logs request (method, path, userId)
  - Every API endpoint logs response (status, duration)
  - Errors logged with full stack trace
  - Logs include request ID for tracing
  - Logs aggregated (ELK or Datadog)
  - Dashboard shows error rate + latency
  
Effort: 3 story points (8 hours)
Blocked By: None
Blocks: Nothing
Priority: HIGH
Assigned To: @dev (backend)
```

---

### Epic 1.4: Performance

#### Story 1.4.1: Fix N+1 Query Patterns (PERF-001)
```yaml
Status: Draft
Title: "Optimize database queries on dashboard page load"
Description: |
  Dashboard loads user's subscription in a loop (N+1 pattern).
  Use Prisma include() to batch queries.
  
Acceptance Criteria:
  - Dashboard query uses single Prisma include()
  - Page load time < 500ms (was 1-2s)
  - Load test passes (100 concurrent users)
  
Effort: 1 story point (2 hours)
Blocked By: None
Blocks: Nothing
Priority: HIGH
Assigned To: @dev
```

---

### Epic 1.5: Validation

#### Story 1.5.1: Sprint 1 QA + Deployment (Testing)
```yaml
Status: Draft
Title: "QA testing + staging deployment for Sprint 1"
Description: |
  Comprehensive testing of all Sprint 1 fixes before production.
  
Acceptance Criteria:
  - All Sprint 1 stories pass code review
  - CodeRabbit reports 0 CRITICAL issues
  - Staging deployment successful
  - Smoke tests pass (critical paths)
  - Monitored on staging for 24 hours
  - Rollback plan documented
  
Effort: 2 story points (4 hours)
Blocked By: All Sprint 1 stories
Blocks: Production deployment
Priority: CRITICAL
Assigned To: @qa
```

---

## Sprint 2: Security & Stability (Weeks 3-4)

**Goal:** Secure API management, standardize error handling  
**Effort:** 16 hours  
**Deadline:** 2026-07-08

### Epic 2.1: Security

#### Story 2.1.1: Implement API Key Management UI (SEC-001)
```yaml
Status: Draft
Title: "Build API key management dashboard page"
Description: |
  Users cannot rotate/revoke API keys. Add dashboard page.
  
Acceptance Criteria:
  - Dashboard page `/dashboard/api-keys`
  - List all active API keys (last 4 digits visible)
  - Generate new API key button
  - Copy to clipboard functionality
  - Revoke key button (with confirmation)
  - Created date + last used timestamp
  - Keys stored securely (hashed in DB)
  
Effort: 3 story points (6 hours)
Blocked By: DB-001 (use new migrations)
Blocks: Nothing
Priority: HIGH
Assigned To: @dev (frontend) + @dev (backend)
```

---

### Epic 2.2: Error Handling

#### Story 2.2.1: Standardize API Error Responses (ERR-001)
```yaml
Status: Draft
Title: "Standardize API error response format"
Description: |
  Some endpoints return text, others return JSON. Inconsistent.
  
Acceptance Criteria:
  - All errors return JSON with error code + message
  - Standard format:
    {
      "error": {
        "code": "RATE_LIMIT_EXCEEDED",
        "message": "...",
        "retryAfter": 60
      }
    }
  - 400 for bad input
  - 401 for auth errors
  - 429 for rate limits
  - 500 for server errors (with request ID)
  - Update API docs
  
Effort: 3 story points (8 hours)
Blocked By: OBS-001 (need logging)
Blocks: Nothing
Priority: HIGH
Assigned To: @dev (backend)
```

---

### Epic 2.3: Database Optimization (Defer to Sprint 3, but track here)

#### Story 2.3.1: Plan DailyUsage Archival Strategy (DB-002)
```yaml
Status: Draft
Title: "Design + implement DailyUsage archival policy"
Description: |
  DailyUsage table grows unbounded (36.5M rows/year).
  Move records > 90 days to archive.
  
Acceptance Criteria:
  - Archive table created (DailyUsage_Archive)
  - Migration script moves old records
  - Cleanup cron job (daily, 00:00 UTC)
  - Query performance verified (< 10ms lookups)
  - Monitoring alerts on table size
  
Effort: 3 story points (6 hours)
Blocked By: DB-001
Blocks: Nothing
Priority: HIGH
Assigned To: @data-engineer
Note: Can start in Sprint 2, deploy in Sprint 3
```

---

## Sprint 3: Quality & Scale (Weeks 5-6)

**Goal:** Robust testing, optimize for growth  
**Effort:** 16+ hours  
**Deadline:** 2026-07-22

### Epic 3.1: Testing

#### Story 3.1.1: Build Integration Test Suite (TEST-001)
```yaml
Status: Draft
Title: "Create integration test suite for API + database"
Description: |
  No integration tests. Database migrations untested.
  
Acceptance Criteria:
  - Test all API endpoints (POST /check, etc.)
  - Test Stripe webhook handling
  - Test auth flows (login, logout, session)
  - Test database migrations (fresh + upgrade paths)
  - Test edge cases (rate limits, invalid input)
  - Coverage > 80%
  - Tests run in CI/CD
  
Effort: 5 story points (16 hours)
Blocked By: ERR-001 (standardized errors)
Blocks: Production scale-out
Priority: HIGH
Assigned To: @qa
```

---

### Epic 3.2: Performance Optimization

#### Story 3.2.1: Add Redis Caching for Reputation Scores (PERF-002)
```yaml
Status: Draft
Title: "Implement Redis caching for fraud scores"
Description: |
  Reputation lookups hit database every time. Add caching.
  
Acceptance Criteria:
  - Redis cache layer added
  - Fraud scores cached (TTL: 1 hour)
  - Cache invalidation on score change
  - Performance: cache hits 95%+ (after warmup)
  - Monitoring shows cache metrics
  
Effort: 2 story points (4 hours)
Blocked By: OBS-001 (logging for monitoring)
Blocks: Nothing
Priority: MEDIUM
Assigned To: @dev (backend)
```

---

## Epic Summary Table

| Epic | Stories | Effort | Sprint | Status |
|------|---------|--------|--------|--------|
| CRITICAL Data Integrity | 1.1.1 | 1h | 1 | 🔴 TODO |
| CRITICAL UX | 1.2.1 | 4h | 1 | 🔴 TODO |
| Observability | 1.3.1 | 8h | 1 | 🔴 TODO |
| Performance | 1.4.1 | 2h | 1 | 🔴 TODO |
| Validation | 1.5.1 | 4h | 1 | 🔴 TODO |
| Security | 2.1.1 | 6h | 2 | 🟡 BACKLOG |
| Error Handling | 2.2.1 | 8h | 2 | 🟡 BACKLOG |
| DB Optimization | 2.3.1 | 6h | 2-3 | 🟡 BACKLOG |
| Testing | 3.1.1 | 16h | 3 | 🟡 BACKLOG |
| Performance | 3.2.1 | 4h | 3 | 🟡 BACKLOG |

---

## Timeline Gantt Chart

```
Sprint 1 (Jun 10-24):
  │ DB-001 (1h)
  │ API-001 (4h)
  │ OBS-001 (8h) ─────────────
  │ PERF-001 (2h)
  │ Testing (4h)
  └─ Production deployment (Jun 24)

Sprint 2 (Jun 24 - Jul 8):
  │ SEC-001 (6h)
  │ ERR-001 (8h)
  │ DB-002 planning (2h)
  └─ Sprint review (Jul 8)

Sprint 3 (Jul 8-22):
  │ TEST-001 (16h) ───────────
  │ PERF-002 (4h)
  │ DB-002 implementation (4h)
  └─ Production scale-out (Jul 22)
```

---

## Resource Allocation

### Sprint 1
- **@dev:** 14 hours (API-001, OBS-001, PERF-001)
- **@data-engineer:** 1 hour (DB-001)
- **@qa:** 4 hours (testing + validation)
- **Total:** 19 hours / 1 dev + supporting roles

### Sprint 2
- **@dev:** 14 hours (SEC-001, ERR-001)
- **@data-engineer:** 2 hours (DB-002 planning)
- **Total:** 16 hours / 1 dev

### Sprint 3
- **@qa:** 16 hours (TEST-001)
- **@dev:** 4 hours (PERF-002)
- **@data-engineer:** 4 hours (DB-002 implementation)
- **Total:** 24 hours / distributed team

---

## Rollback Plan

### Sprint 1 (If critical issue found)
1. Revert DB-001 changes (restore CASCADE)
2. Revert API-001 (remove headers)
3. Revert OBS-001 (disable logging)
4. **Rollback time:** < 30 minutes

### Sprint 2-3
1. Revert code changes (git revert)
2. Run migration rollback
3. **Rollback time:** < 1 hour

---

## Success Metrics

### Sprint 1 Completion
- [ ] 0 CRITICAL issues remaining
- [ ] Error rates < 0.1% in production
- [ ] Dashboard page load < 500ms
- [ ] User satisfaction survey >= 8/10

### Sprint 2 Completion
- [ ] API key management functional
- [ ] All errors consistent format
- [ ] Support ticket volume ↓ 20%

### Sprint 3 Completion
- [ ] Test coverage > 80%
- [ ] Confidence level > 9/10 for scale-out
- [ ] Ready for 100K+ users

---

## Next Actions

1. **@pm:** Review + approve this roadmap
2. **@sm:** Create Jira tickets for each story
3. **@po:** Validate acceptance criteria
4. **@dev:** Estimate actual effort (may differ)
5. **Sprint planning:** Monday 2026-06-10

---

**Brownfield Discovery Complete: ✅ 10/10 Phases**

**Next:** Sprint 1 execution begins 2026-06-10
