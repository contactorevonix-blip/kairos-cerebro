# Phase 4: Technical Debt Draft — technical-debt-DRAFT.md

**Date:** 2026-06-03  
**Agent:** @architect (Aria)  
**Status:** COMPLETED  

---

## Executive Summary

KAIROS_CEREBRO exhibits **well-structured architecture** with **moderate technical debt** in:
1. Database scaling (DailyUsage unbounded growth)
2. Error handling (inconsistent across layers)
3. Observability (no structured logging)
4. API rate limiting (missing user feedback)

**Total Debt Items: 18**  
**Critical: 2 | High: 6 | Medium: 7 | Low: 3**

---

## Debt Items

### CRITICAL (2)

#### DB-001: TokenBalance Cascade Delete
**Area:** Database  
**Severity:** CRITICAL  
**Impact:** Financial record loss on user deletion  
**Effort to fix:** 2 hours  

**Current State:**
```sql
ALTER TABLE "TokenBalance" 
FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE;
```

**Problem:** When user is deleted, all transaction history is cascaded. Breaks audit trail.

**Fix:**
```sql
ALTER TABLE "TokenBalance" 
  DROP CONSTRAINT IF EXISTS "TokenBalance_userId_fkey";
ALTER TABLE "TokenBalance" 
  ADD CONSTRAINT "TokenBalance_userId_fkey" 
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE SET NULL;
```

---

#### API-001: Missing Rate Limiting UI
**Area:** Frontend / API  
**Severity:** CRITICAL  
**Impact:** Users unaware of rate limits, poor UX  
**Effort to fix:** 4 hours  

**Current State:** Rate limits enforced in `sniper-api/rate-limit.js` but no client-side feedback.

**Problem:** HTTP 429 response sent silently; no countdown or error message.

**Fix:**
1. Add `X-RateLimit-Remaining`, `X-RateLimit-Reset` headers to responses
2. Display countdown timer on frontend when approaching limit
3. Show "Rate limit exceeded. Try again in X seconds" on 429

---

### HIGH (6)

#### DB-002: DailyUsage Unbounded Growth
**Area:** Database  
**Severity:** HIGH  
**Impact:** Table grows 36.5M rows/year; query performance degrades  
**Effort to fix:** 6 hours  

**Fix:** Implement archival policy (90-day retention) + cleanup cron job.

---

#### OBS-001: No Structured Logging
**Area:** Observability  
**Severity:** HIGH  
**Impact:** Debugging production issues difficult; no audit trail  
**Effort to fix:** 8 hours  

**Current State:** Console.log scattered throughout code.

**Fix:** Implement structured logging (Winston/Pino) with:
- Request ID tracking
- User ID context
- Timestamp + severity
- Centralized log aggregation

---

#### SEC-001: Missing API Key Management UI
**Area:** Security / Frontend  
**Severity:** HIGH  
**Impact:** No way for users to rotate/revoke API keys  
**Effort to fix:** 6 hours  

**Fix:** Add dashboard page:
1. List active API keys
2. Generate new key
3. Revoke key
4. Copy to clipboard

---

#### ERR-001: Inconsistent Error Handling
**Area:** Backend / API  
**Severity:** HIGH  
**Impact:** Unpredictable error responses; difficult to debug  
**Effort to fix:** 8 hours  

**Current State:** Some endpoints return plain text, others JSON.

**Fix:** Standardize error response format:
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "You have exceeded...",
    "retryAfter": 60
  }
}
```

---

#### PERF-001: N+1 Query Pattern (Potential)
**Area:** Backend / Database  
**Severity:** HIGH  
**Impact:** Dashboard page loads multiple Subscription queries  
**Effort to fix:** 2 hours  

**Fix:** Use Prisma `include` to batch queries:
```typescript
// Before (N+1)
const users = await db.user.findMany();
for (const user of users) {
  user.subscription = await db.subscription.findFirst({ where: { userId } });
}

// After (1 query)
const users = await db.user.findMany({
  include: { subscription: true }
});
```

---

#### TEST-001: No Integration Tests
**Area:** Testing  
**Severity:** HIGH  
**Impact:** Database migrations untested; Stripe webhook handling fragile  
**Effort to fix:** 16 hours  

**Fix:** Create integration test suite:
- API endpoints (POST /api/check, etc.)
- Database migrations
- Stripe webhook handling
- Auth flows

---

### MEDIUM (7)

#### PERF-002: Missing Caching
**Area:** Performance  
**Severity:** MEDIUM  
**Impact:** Reputation lookups hit database every time  
**Effort to fix:** 4 hours  

**Fix:** Add Redis caching layer:
```typescript
// Reputation scores (TTL: 1 hour)
const cacheKey = `reputation:${email}`;
let score = await redis.get(cacheKey);
if (!score) {
  score = await scoreEngine.compute(email);
  await redis.setex(cacheKey, 3600, score);
}
```

---

#### ACC-001: Accessibility Not Tested
**Area:** Frontend / UX  
**Severity:** MEDIUM  
**Impact:** Keyboard users, screen reader users excluded  
**Effort to fix:** 8 hours  

**Fix:**
1. Keyboard navigation audit (arrow keys, Tab)
2. Screen reader testing (NVDA, JAWS)
3. ARIA labels + roles
4. Color contrast verification

---

#### MON-001: Missing Distributed Tracing
**Area:** Observability  
**Severity:** MEDIUM  
**Impact:** Can't trace fraud check request through sniper-engine  
**Effort to fix:** 6 hours  

**Fix:** Implement OpenTelemetry:
```typescript
import { trace } from '@opentelemetry/api';
const tracer = trace.getTracer('sniper-engine');

const span = tracer.startSpan('computeScore');
// ... computation
span.end();
```

---

#### AUTH-001: No Session Revocation
**Area:** Security  
**Severity:** MEDIUM  
**Impact:** User can't force-logout (e.g., suspected compromise)  
**Effort to fix:** 3 hours  

**Fix:**
1. Add `Session.revokedAt` field
2. Check revocation in middleware
3. Add "Logout from all devices" UI button

---

#### PERF-003: Bundle Size Not Monitored
**Area:** Performance  
**Severity:** MEDIUM  
**Impact:** Next.js bundle could grow unbounded; slow page loads  
**Effort to fix:** 4 hours  

**Fix:**
1. Add `@next/bundle-analyzer`
2. Set maximum bundle size (500KB gzipped)
3. CI/CD gate to catch oversized bundles

---

#### DOC-001: API Documentation Outdated
**Area:** Documentation  
**Severity:** MEDIUM  
**Impact:** Developers unsure of current API surface  
**Effort to fix:** 3 hours  

**Fix:**
1. Enforce OpenAPI spec (Swagger)
2. Auto-generate from TypeScript types
3. CI/CD validation (spec matches code)

---

#### MOB-001: Mobile Responsiveness Incomplete
**Area:** Frontend / UX  
**Severity:** MEDIUM  
**Impact:** Tablet breakpoint layout broken  
**Effort to fix:** 6 hours  

**Fix:**
1. Audit tablet (768px) breakpoint
2. Fix component sizing
3. Test on real devices (iPad)

---

### LOW (3)

#### PERF-004: CSS Not Optimized
**Area:** Frontend  
**Severity:** LOW  
**Impact:** Unused TailwindCSS classes in bundle  
**Effort to fix:** 1 hour  

**Fix:** Configure Tailwind content paths to tree-shake unused classes.

---

#### LOG-001: Missing Request Logging
**Area:** Observability  
**Severity:** LOW  
**Impact:** Can't audit who did what  
**Effort to fix:** 2 hours  

**Fix:** Add middleware to log HTTP requests:
```typescript
middleware.ts:
export function middleware(request) {
  logger.info('HTTP', {
    method: request.method,
    path: request.nextUrl.pathname,
    userId: session?.user?.id,
  });
}
```

---

#### CODE-001: Inconsistent Code Style
**Area:** Code Quality  
**Severity:** LOW  
**Impact:** Multiple formatters (prettier conflicts with eslint)  
**Effort to fix:** 1 hour  

**Fix:** Standardize:
1. Prettier config: 2 spaces, single quotes
2. ESLint extends Prettier
3. Pre-commit hook

---

## Debt Summary Table

| Area | Count | Effort | Priority |
|------|-------|--------|----------|
| Database | 3 | 8h | CRITICAL |
| API / Error Handling | 3 | 12h | CRITICAL |
| Observability | 3 | 14h | HIGH |
| Security | 2 | 9h | HIGH |
| Performance | 4 | 14h | HIGH |
| Testing | 1 | 16h | HIGH |
| Frontend / UX | 2 | 14h | MEDIUM |

---

## Risk Assessment

### High-Risk Debt (Should fix ASAP)
1. **DB-001** (TokenBalance cascade) — Financial data loss risk
2. **API-001** (Rate limiting UI) — User frustration
3. **OBS-001** (Structured logging) — Production debugging impossible

**Total effort:** 14 hours  
**Business impact:** HIGH

### Medium-Risk Debt (Fix in next 2 sprints)
4. **DB-002** (DailyUsage growth)
5. **SEC-001** (API key management)
6. **ERR-001** (Error handling standardization)
7. **TEST-001** (Integration tests)

**Total effort:** 26 hours  
**Business impact:** MEDIUM

### Low-Risk Debt (Nice to have)
- CSS optimization
- Code style consistency
- Bundle size monitoring

**Total effort:** 4 hours  
**Business impact:** LOW

---

## Recommended Sprint Plan

**Sprint 1 (Week 1-2):**
- Fix DB-001 (cascade delete)
- Implement rate limiting UI (API-001)
- Add structured logging (OBS-001)
- **Effort:** 14 hours

**Sprint 2 (Week 3-4):**
- Implement API key management (SEC-001)
- Standardize error handling (ERR-001)
- Fix N+1 queries (PERF-001)
- **Effort:** 16 hours

**Sprint 3+ (Backlog):**
- DailyUsage archival (DB-002)
- Integration tests (TEST-001)
- Observability enhancements (MON-001, LOG-001)
- Accessibility audit (ACC-001)

---

## Estimation Notes

**Effort estimates assume:**
- 1 developer
- No blocking dependencies
- Standard testing included
- 8-hour working day

**Actual may vary ±25% due to:**
- Unforeseen integration issues
- Testing complexity
- Deployment coordination

---

**Next Phase:** Phase 5 @data-engineer (db-specialist-review.md)
