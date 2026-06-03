# Staging Validation Plan — 24h Monitoring (2026-06-04)

## Deployment Summary

**Deployed Commits:**
- fc167c7: chore: Sprint 2 Final — verification complete
- 3e17b0b: chore: Sprint 2 100% COMPLETE
- 9de21c8: feat: S2.3 Complete
- 06b4c84: chore: S2.1+S2.2 QA PASS
- 9cc1d49: fix: S2.2 error-handler integration

**Branch:** staging (updated from main)
**Timestamp:** 2026-06-04 00:26 UTC

---

## Features to Monitor (24h)

### S2.1: API Key Management
**Critical Path:**
- [ ] Verify `POST /api/user/keys` generates keys (sk_live_XXXX format)
- [ ] Check bcrypt hash in PostgreSQL (TokenBalance.key_hash)
- [ ] Test key display once-only (copy-to-clipboard)
- [ ] Verify `GET /api/user/keys` lists user's active + revoked keys
- [ ] Test `DELETE /api/user/keys/:id` marks key as revoked
- [ ] Check `lastUsedAt` timestamp updates on API calls
- [ ] Verify revoked keys reject with 401 Unauthorized

**UI Smoke Tests:**
- [ ] Dashboard API Keys page loads
- [ ] Generate key button works
- [ ] Copy to clipboard functions
- [ ] Revoke action hides key

---

### S2.2: Error Standardization (RFC 7807)
**Critical Path:**
- [ ] Test error response format: `{ code, message, detail, timestamp, requestId, type }`
- [ ] Verify 400 validation errors include `fieldErrors` array
- [ ] Check 401 auth errors include `reason` (invalid_token, expired_key, rate_limited)
- [ ] Verify 500 errors omit implementation details
- [ ] Test error logging captures full context
- [ ] Verify all endpoints return standardized format

**Sample Test Calls:**
```bash
# Validation error
curl -X POST http://staging/api/check -H "Content-Type: application/json" \
  -d '{"invalid": "payload"}'
# Expected: 400 with fieldErrors

# Auth error
curl -X GET http://staging/api/user/keys \
  -H "Authorization: Bearer invalid_token"
# Expected: 401 with reason

# Rate limit error
# Make 100+ rapid requests
# Expected: 429 with Retry-After header
```

---

### S2.3: DailyUsage Archival
**Critical Path:**
- [ ] Verify archive job scheduled (cron 2 AM UTC)
- [ ] Check S3 bucket (`s3://kairos-check-backups/dailyusage/{date}.jsonl.gz`)
- [ ] Verify archival creates gzipped JSONL files
- [ ] Test restore functionality (if implemented)
- [ ] Check monitoring alerts configured

**Log Monitoring:**
- [ ] Search logs for "DailyUsage archival started"
- [ ] Verify "archival completed" message
- [ ] Check for any "archival failed" errors
- [ ] Monitor S3 upload latency (target: < 30s)

---

## Staging Validation Checklist

### Performance (Hour 1-2)
- [ ] API response times < 200ms (p95)
- [ ] Database queries < 100ms
- [ ] UI page load < 2s (LCP)
- [ ] No memory leaks observed

### Security (Hour 3-6)
- [ ] No API key leaks in logs
- [ ] Bcrypt hashing verified
- [ ] HTTPS/TLS connections working
- [ ] CORS headers correct
- [ ] Input validation active

### Integration (Hour 7-12)
- [ ] All endpoints respond with correct status codes
- [ ] Error handlers working for all 5 integration points
- [ ] Rate limiting headers present (X-RateLimit-*)
- [ ] Logging in JSON format (structured)
- [ ] Database migrations applied successfully

### User Flows (Hour 13-24)
- [ ] End-to-end API key generation → use → revocation
- [ ] Error scenarios: invalid input, auth failures, rate limits
- [ ] Edge cases: concurrent requests, large payloads
- [ ] Mobile UI responsive on tablet/phone
- [ ] Accessibility: keyboard navigation, screen readers

---

## Alert Triggers (Escalate Immediately)

| Condition | Action |
|-----------|--------|
| Any 5XX error rate > 0.1% | Page on-call, check logs |
| API key generation fails | Rollback S2.1, investigate Prisma |
| Error responses not RFC 7807 format | Rollback S2.2, check error-handler.js |
| S3 archival fails 3x | Disable job, investigate S3 credentials |
| Database migration not applied | Rollback, re-run `npx prisma migrate deploy` |

---

## Log Locations

**Application Logs:**
- `logs/sniper-api.log` (JSON structured format)
- Check for: errors, warnings, key generation events, archival status

**Database Logs:**
- PostgreSQL: `logs/postgresql.log`
- Check for: migration status, query performance

**Deployment Logs:**
- Git: `git log --oneline` (verify commits deployed)
- Status: `npm test` should PASS

---

## Success Criteria (24h End)

✅ **Pass if:**
- All 3 features functional (S2.1, S2.2, S2.3)
- No CRITICAL errors in logs
- Performance targets met (< 200ms API, < 2s UI)
- All error types return RFC 7807 format
- Zero security issues identified

❌ **Fail if:**
- Any feature broken or unavailable
- Error responses not standardized
- Performance degradation > 20%
- Database issues (migrations not applied)
- Security vulnerabilities found

---

## Next Steps

**If PASS (24h):**
1. Promote staging → production
2. Monitor production for 7 days
3. Plan Sprint 3 or Kairos Check epics

**If FAIL:**
1. Identify root cause
2. Rollback to previous commit
3. Fix in new sprint
4. Re-deploy to staging

---

## Reference Docs

- **Epic:** `docs/stories/epics/EPIC-SPRINT-2-SECURITY.md`
- **Stories:** S2.1, S2.2, S2.3 (marked Done)
- **Error Reference:** `docs/api/ERROR-CODES.md`
- **CodeRabbit Results:** 34 findings (0 CRITICAL/HIGH in product)

---

**Validation Owner:** On-call engineer  
**Duration:** 2026-06-04 00:26 UTC → 2026-06-05 00:26 UTC  
**Status:** ✅ READY FOR STAGING  

*Update this document with findings as you monitor.*
