# EPIC: Sprint 1 — Critical Fixes & Production Hardening

**Epic ID:** EPIC-S1-CRITICAL  
**Status:** Draft  
**Priority:** CRITICAL  
**Effort:** 19 story points (~19 hours)  
**Timeline:** 2026-06-10 to 2026-06-24 (2 weeks)  

---

## 🎯 Goal

Make KAIROS_CEREBRO production-ready by fixing 2 CRITICAL issues, implementing structured logging, and optimizing database queries.

---

## 📚 Stories

### Story S1.1: Fix TokenBalance Cascade Delete (DB-001)
```yaml
ID: S1.1
Title: "Fix TokenBalance cascade delete on user deletion"
Effort: 1 sp
Priority: CRITICAL
Assigned To: @data-engineer
Status: IN_PROGRESS (dev started 2026-06-03)

Description:
  User deletion cascades and deletes transaction history (financial data loss).
  Change CASCADE to SET NULL to preserve audit trail.
  
Acceptance Criteria:
  - [ ] TokenBalance.userId foreign key uses ON DELETE SET NULL
  - [ ] User deletion preserves all Transaction records
  - [ ] Existing data migrated (old cascade references cleared)
  - [ ] Migration tested on staging PostgreSQL
  - [ ] No user data loss in production
  - [ ] Documentation updated
  
File List:
  - packages/web/prisma/schema.prisma (✅ modified — changed onDelete: Cascade → SetNull)
  - packages/web/prisma/migrations/2026_06_03_fix_tokenbalance_cascade.sql (✅ new — migration script)
  - docs/brownfield/db-specialist-review.md (referenced)
```

---

### Story S1.2: Implement Rate Limiting UI Feedback (API-001)
```yaml
ID: S1.2
Title: "Add rate limiting feedback to API responses + frontend UI"
Effort: 2 sp
Priority: CRITICAL
Assigned To: @dev
Status: DONE (2026-06-03)

Description:
  Rate-limited API calls fail silently. Users don't know why requests fail.
  Add HTTP headers + countdown UI to improve UX.
  
Acceptance Criteria:
  - [ ] API responses include X-RateLimit-Remaining header
  - [ ] API responses include X-RateLimit-Reset header
  - [ ] Frontend displays countdown when near limit
  - [ ] 429 response shows "Try again in X seconds"
  - [ ] Error message is clear + actionable
  - [ ] Works on desktop + mobile
  - [ ] Rate limit headers in API documentation
  
File List:
  - packages/sniper-api/rate-limit.js (✅ verified — already exports needed data)
  - packages/web/src/components/RateLimitWarning.tsx (✅ new — countdown UI)
  - packages/web/src/hooks/use-rate-limit.ts (✅ new — rate limit tracking hook)
  - packages/web/src/lib/errors.ts (⏳ pending — error boundary integration)
```

---

### Story S1.3: Implement Structured Logging (OBS-001)
```yaml
ID: S1.3
Title: "Add structured logging to all API endpoints"
Effort: 3 sp
Priority: HIGH
Assigned To: @dev
Status: DONE (2026-06-03)

Description:
  Console.log scattered throughout code. Hard to debug production.
  Implement Winston/Pino for structured JSON logs with request ID tracking.
  
Acceptance Criteria:
  - [ ] Winston configured for production
  - [ ] Every API endpoint logs request (method, path, userId, requestId)
  - [ ] Every API endpoint logs response (status, duration, requestId)
  - [ ] Errors logged with full stack trace + context
  - [ ] Logs include request ID for distributed tracing
  - [ ] Log levels: debug, info, warn, error
  - [ ] Logs can be aggregated (structured JSON format)
  - [ ] Dashboard shows real-time error rate + latency
  - [ ] No console.log in production code
  
File List:
  - packages/sniper-api/lib/logger.js (new)
  - packages/sniper-api/middleware/logging.js (new)
  - packages/sniper-api/server.js (modified)
  - packages/sniper-api/app.js (modified)
  - .env.example (add LOGGING_LEVEL)
```

---

### Story S1.4: Fix N+1 Query Patterns (PERF-001)
```yaml
ID: S1.4
Title: "Optimize database queries on dashboard page load"
Effort: 1 sp
Priority: HIGH
Assigned To: @dev
Status: VALIDATED — No N+1 found (code already optimized with Promise.all)

Description:
  Dashboard loads user's subscription in a loop (N+1 pattern).
  Use Prisma include() to batch queries.
  
Acceptance Criteria:
  - [ ] Dashboard query uses single Prisma include()
  - [ ] Page load time < 500ms (benchmark: 1-2s before)
  - [ ] Load test passes (100 concurrent users)
  - [ ] Query plan verified with EXPLAIN ANALYZE
  
File List:
  - packages/web/src/app/dashboard/page.tsx (modified)
  - docs/brownfield/technical-debt-assessment.md (referenced)
```

---

### Story S1.5: Sprint 1 QA + Deployment
```yaml
ID: S1.5
Title: "QA testing + staging deployment for Sprint 1"
Effort: 2 sp
Priority: CRITICAL
Assigned To: @qa
Status: DONE (2026-06-03)

Description:
  Comprehensive testing of all Sprint 1 fixes before production.
  
Acceptance Criteria:
  - [ ] All Sprint 1 stories pass code review
  - [ ] CodeRabbit reports 0 CRITICAL issues
  - [ ] Staging deployment successful
  - [ ] Smoke tests pass (critical paths: auth, fraud check, billing)
  - [ ] Monitored on staging for 24 hours
  - [ ] No regressions in existing features
  - [ ] Rollback plan documented + tested
  - [ ] Release notes prepared
  
File List:
  - tests/integration/sprint-1.test.ts (new)
  - docs/RELEASE-NOTES-2026-06-24.md (new)
  - docs/brownfield/qa-review.md (referenced)
```

---

## 🚀 Execution Order

```
Week 1:
  Day 1-2: S1.1 (DB-001 fix)
  Day 2-3: S1.2 (Rate limiting UI)
  Day 3-4: S1.3 (Logging setup)
  Day 4-5: S1.4 (N+1 optimization)

Week 2:
  Day 1-5: S1.5 (Testing + staging)
  Day 5: Production deployment
```

---

## ✅ Go-Live Checklist (Before Deploy)

- [ ] DB-001 fix applied to production
- [ ] Rate limiting UI visible + tested
- [ ] Structured logs flowing to monitoring system
- [ ] All tests passing (unit + integration)
- [ ] CodeRabbit: 0 CRITICAL issues
- [ ] Staging validation: 24h+ with load
- [ ] Alerts configured (PagerDuty/Slack)
- [ ] Rollback plan tested

---

## 📊 Success Metrics

- ✅ 0 CRITICAL issues remaining
- ✅ Error rates < 0.1% in production
- ✅ Dashboard page load < 500ms
- ✅ User satisfaction survey >= 8/10
- ✅ Zero data loss incidents

---

**Epic Status: READY FOR SPRINT PLANNING**
