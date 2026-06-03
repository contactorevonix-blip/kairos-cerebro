# Release Notes — Sprint 1 (2026-06-24)

**Version:** 1.1.0  
**Date:** June 24, 2026  
**Status:** Ready for Production

---

## 🎯 Summary

Sprint 1 focused on **production hardening**: fixing critical data loss risk, improving user experience, and implementing observability infrastructure.

## ✅ What's New

### 1. Fixed TokenBalance Cascade Delete (CRITICAL)
**Problem:** User deletion cascaded and deleted all transaction history (financial data loss).  
**Solution:** Changed foreign key from `CASCADE` to `SET NULL`.  
**Impact:** Audit trail preserved; user data safe on account closure.  

**Migration:** `2026_06_03_fix_tokenbalance_cascade.sql`  
**Breaking:** None (backwards compatible with `SET NULL`)

### 2. Rate Limiting UI Feedback (UX Improvement)
**Problem:** Rate-limited API calls failed silently; users unaware of limits.  
**Solution:** Added `X-RateLimit-*` headers + countdown UI warning.  
**Impact:** Users see "Try again in 45 seconds" instead of mysterious 429 errors.  

**New Components:**
- `RateLimitWarning.tsx` — Floating countdown badge
- `use-rate-limit.ts` — Hook to track remaining quota

### 3. Structured Logging (Operations)
**Problem:** `console.log()` scattered throughout code; hard to debug production.  
**Solution:** JSON structured logging with request tracking.  
**Impact:** Searchable, parseable logs; faster incident response.  

**New Files:**
- `lib/logger.js` — Winston-like logger (simple file-based)
- `middleware/logging.js` — Automatic HTTP request/response logging

---

## 🔧 Technical Details

### Database
- TokenBalance foreign key: `onDelete: Cascade` → `onDelete: SetNull`
- Schema: `userId` field is now nullable (`String?`)
- Migration: Safe online (no schema lock)

### API
- All responses include headers:
  ```
  X-RateLimit-Limit: 1000
  X-RateLimit-Remaining: 945
  X-RateLimit-Reset: 1719239999000
  ```
- Rate limit exceeded returns: HTTP 429 + JSON error with `retryAfter`

### Frontend
- Rate limit status persists in localStorage
- Warning auto-dismisses after reset window expires
- Mobile-responsive (fixed bottom-right)

### Logging
- All HTTP requests/responses logged automatically
- Format: JSON (timestamp, method, path, duration, userId, statusCode)
- Files: `logs/debug.log`, `logs/info.log`, `logs/warn.log`, `logs/error.log`
- Env var: `LOGGING_LEVEL` (default: `info`)

---

## 📦 Deployment

**Prerequisites:**
- PostgreSQL up-to-date with migration applied
- Environment variable: `LOGGING_LEVEL=info` (or higher)
- No downtime required

**Steps:**
1. Deploy code to staging
2. Run migration: `npx prisma migrate deploy`
3. Test rate limiting (hit API > 100 times from public IP)
4. Validate logs in `logs/` directory
5. Deploy to production

---

## ✨ Known Limitations

- Logging writes to local disk (not aggregated to ELK/Datadog yet)
- Rate limit headers are in-memory (no distributed rate limiting for multi-instance)
- `RateLimitWarning` component requires fetch interception (uses hook)

---

## 🚀 Next Steps (Sprint 2)

- [ ] Implement distributed rate limiting (Redis)
- [ ] Centralized log aggregation (ELK Stack)
- [ ] API key management UI
- [ ] Error response standardization

---

**QA Sign-off:** @qa  
**PM Sign-off:** Pending  
**Devops Sign-off:** Pending
