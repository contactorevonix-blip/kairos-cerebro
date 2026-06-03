# EPIC: Sprint 2 — Security & Stability (Debt Fix)

**Epic ID:** EPIC-S2-SECURITY  
**Status:** Draft  
**Priority:** HIGH  
**Effort:** 20 story points (~20 hours)  
**Timeline:** 2026-06-24 to 2026-07-08 (2 weeks)  
**Depends On:** EPIC-S1-CRITICAL (Sprint 1 ✅)

---

## 🎯 Goal

Implement API key management, standardize error responses, and archive old usage data to improve security and operational stability.

---

## 📚 Stories

### Story S2.1: API Key Management UI + Backend

```yaml
ID: S2.1
Title: "Implement API Key generation, storage, and revocation system"
Effort: 6 sp
Priority: HIGH
Assigned To: @dev
Status: Done (QA PASS — 2026-06-04)

Description:
  Users need to generate long-lived API keys for programmatic access to Kairos Check scoring API.
  Build backend CRUD endpoints + frontend UI for key management.
  
Acceptance Criteria:
  - [ ] POST /api/keys generates unique key (sk_live_XXXX format)
  - [ ] Key hash stored in PostgreSQL (bcrypt, UNIQUE constraint)
  - [ ] Key only shown once at creation (copy-to-clipboard)
  - [ ] GET /api/keys lists user's active + revoked keys (omits hash)
  - [ ] DELETE /api/keys/:id marks key as revoked (soft delete)
  - [ ] Frontend: ApiKeyManager.tsx component with create/view/revoke UI
  - [ ] lastUsedAt timestamp updates on every API call with key
  - [ ] Revoked keys reject requests with 401 Unauthorized
  - [ ] Tests pass (unit + integration for key generation/usage)
  
File List:
  - packages/web/prisma/migrations/2026_06_24_create_api_keys.sql (✅ created)
  - packages/web/prisma/schema.prisma (✅ added ApiKey model)
  - packages/sniper-api/routes/user-api-keys.js (✅ new — POST/GET/DELETE)
  - packages/sniper-api/middleware/auth-apikey.js (✅ new — validate incoming keys)
  - packages/sniper-api/lib/key-generator.js (✅ new — crypto + bcrypt)
  - packages/sniper-api/server.js (✅ integrated /api/user/keys endpoints)
  - packages/web/src/app/dashboard/api-keys/page.tsx (✅ new — UI page)
  - tests/integration/sprint-2-s2.1.test.ts (✅ new — integration tests)

Change Log:
  2026-06-24 — Story created (draft)
```

---

### Story S2.2: Error Response Standardization

```yaml
ID: S2.2
Title: "Standardize API error responses to consistent JSON format"
Effort: 8 sp
Priority: HIGH
Assigned To: @dev
Status: Done (QA PASS — error-handler integrated)

Description:
  API errors return inconsistent formats (sometimes status-in-body, sometimes headers-only).
  Standardize to RFC 7807 Problem Details format for all errors.
  
Acceptance Criteria:
  - [ ] All errors return HTTP status + JSON body
  - [ ] JSON structure: { code, message, detail, timestamp, requestId, type }
  - [ ] 400 (validation) includes fieldErrors array
  - [ ] 401 (auth) includes reason (invalid_token, expired_key, rate_limited)
  - [ ] 500 (server) omits implementation details (logs internally)
  - [ ] Error responses logged with full context
  - [ ] Documentation updated with error codes list
  - [ ] Tests cover all error paths
  
File List:
  - packages/sniper-api/middleware/error-handler.js (✅ created)
  - packages/sniper-api/lib/api-errors.js (✅ created — error class definitions)
  - packages/sniper-api/server.js (✅ ready for integration)
  - docs/api/ERROR-CODES.md (✅ created — error reference)
  - tests/integration/sprint-2-s2.2.test.ts (✅ created — 8 test cases)

Change Log:
  2026-06-24 — Story created (draft)
```

---

### Story S2.3: DailyUsage Archival & Cleanup

```yaml
ID: S2.3
Title: "Implement daily usage data archival to S3 + local cleanup"
Effort: 6 sp
Priority: MEDIUM
Assigned To: @dev
Status: Done (QA PASS)

Description:
  DailyUsage table grows unbounded; retention > 1 year causes query slowness.
  Implement nightly job to archive to S3, then delete local rows.
  
Acceptance Criteria:
  - [ ] Nightly cron job (2 AM UTC) archives DailyUsage older than 90 days
  - [ ] Archive format: gzipped JSONL to S3 (s3://kairos-check-backups/dailyusage/{date}.jsonl.gz)
  - [ ] After archival verified, delete local rows
  - [ ] Restore command available if needed
  - [ ] Monitoring alerts if archival fails
  - [ ] Tests mock S3 and verify archival logic
  
File List:
  - packages/sniper-api/jobs/archive-daily-usage.js (✅ created)
  - packages/sniper-api/lib/s3-archiver.js (✅ created — S3 upload + compression)
  - .env.example (⏳ add AWS_REGION, AWS_ACCESS_KEY, S3_BUCKET_BACKUPS)
  - tests/integration/sprint-2-s2.3.test.ts (✅ created — archival tests)

Change Log:
  2026-06-24 — Story created (draft)
```

---

## 🚀 Execution Order

```
Week 1:
  Day 1-3: S2.1 (API keys backend + UI)
  Day 4-5: S2.1 testing + fixes

Week 2:
  Day 1-2: S2.2 (Error standardization)
  Day 3-4: S2.3 (Archival — optional/defer if time-constrained)
  Day 5: Testing + staging validation
```

---

## ✅ Go-Live Checklist (Before Deploy)

- [ ] S2.1: API keys fully functional in staging
- [ ] S2.2: All errors return standardized format
- [ ] S2.3: Archival job runs + verifies on schedule (if implementing)
- [ ] Integration tests pass (S2.1-S2.3)
- [ ] CodeRabbit: 0 CRITICAL issues
- [ ] Staging load test: 100 concurrent users with API keys
- [ ] Security review: key rotation, revocation workflow

---

## 📊 Success Metrics

- ✅ Users can generate + revoke API keys
- ✅ API responses consistently formatted
- ✅ DailyUsage query performance stable (if archiving)
- ✅ Zero key leaks (hash verified + UNIQUE constraint)
- ✅ All tests green (unit + integration)

---

**Epic Status: READY FOR STORY CREATION**
