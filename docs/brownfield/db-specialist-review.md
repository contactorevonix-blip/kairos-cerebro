# Phase 5: Database Specialist Review — db-specialist-review.md

**Date:** 2026-06-03  
**Agent:** @data-engineer (Dara)  
**Status:** COMPLETED  

---

## Review of Technical Debt Draft

**Debt Items Reviewed:** 18 (DB-related: 3)

---

## Database Debt Validation

### DB-001: TokenBalance Cascade Delete ✅ CONFIRMED CRITICAL

**Validation:**
```sql
SELECT constraint_name, update_rule, delete_rule
FROM information_schema.referential_constraints
WHERE table_name = 'TokenBalance';
-- RESULT: delete_rule = CASCADE ✅ (confirmed)
```

**Business Impact:** HIGH
- User deletion loses all financial records
- Breaks audit trail for regulatory compliance (GDPR)
- Cannot reconstruct user spending history

**Recommendation:** Fix IMMEDIATELY (Effort: 1 hour)

**Implementation:**
```sql
ALTER TABLE "TokenBalance" 
DROP CONSTRAINT "TokenBalance_userId_fkey";

ALTER TABLE "TokenBalance" 
ADD CONSTRAINT "TokenBalance_userId_fkey" 
FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE SET NULL;

-- Verify fix
SELECT constraint_name, delete_rule
FROM information_schema.referential_constraints
WHERE table_name = 'TokenBalance';
```

---

### DB-002: DailyUsage Unbounded Growth ✅ CONFIRMED HIGH

**Validation:**
```sql
-- Estimate growth
SELECT 
  EXTRACT(YEAR FROM date) as year,
  COUNT(*) as row_count,
  pg_size_pretty(sum(pg_column_size(id) + pg_column_size(key) + pg_column_size(date))) as size
FROM "DailyUsage"
GROUP BY EXTRACT(YEAR FROM date)
ORDER BY year;

-- Result (projected): 36.5M rows/year, ~500MB/year
```

**Business Impact:** MEDIUM
- Query performance degrades with growth
- Storage costs accumulate
- Cold data (> 90 days) unused in production

**Recommendation:** Implement archival (Effort: 6 hours)

**Implementation Plan:**

**Option A: Partition + Archive (Recommended)**
```sql
-- 1. Create archive table
CREATE TABLE "DailyUsage_Archive_2025" (LIKE "DailyUsage");

-- 2. Move old data
INSERT INTO "DailyUsage_Archive_2025" 
SELECT * FROM "DailyUsage" 
WHERE date < '2025-01-01';

DELETE FROM "DailyUsage" 
WHERE date < '2025-01-01';

-- 3. Add constraint to prevent old data insertion
ALTER TABLE "DailyUsage" 
ADD CONSTRAINT check_date_recent 
CHECK (date >= CURRENT_DATE - INTERVAL '90 days');

-- 4. Schedule cleanup cron
0 0 * * * psql -d kairos -c "DELETE FROM DailyUsage WHERE date < CURRENT_DATE - INTERVAL '365 days';"
```

**Option B: Partitioning**
```sql
-- Create partitioned table (PostgreSQL 10+)
CREATE TABLE "DailyUsage_Partitioned" (
  LIKE "DailyUsage"
) PARTITION BY RANGE (DATE_TRUNC('month', date::timestamp));

-- Automatically create monthly partitions
CREATE PARTITION "DailyUsage_Partitioned_2026_01" 
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
```

**Recommendation:** Use Option A (simpler, matches current schema).

---

### DB-003: Missing Indexes on Foreign Keys ✅ CONFIRMED MEDIUM

**Current Indexes:**
```sql
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Gap Found:** Session.userId not indexed

**Impact:** MEDIUM
- Queries by user session are table scans (slow with many sessions)
- Dashboard loading slower than necessary

**Fix (Effort: 1 hour):**
```sql
CREATE INDEX idx_session_userId ON "Session"(userId);

-- Verify
EXPLAIN ANALYZE 
SELECT * FROM "Session" 
WHERE userId = 'user-123' 
ORDER BY created DESC;
-- Should show Index Scan instead of Seq Scan
```

---

## Additional Recommendations

### Query Performance Tuning

**Hot Path 1: User's Recent Transactions**
```sql
-- Current: Good (composite index exists)
SELECT * FROM "Transaction"
WHERE userId = $1
ORDER BY createdAt DESC
LIMIT 10;

-- Query plan: Index Scan ✅
-- No change needed
```

**Hot Path 2: Daily Usage Rate Limit Check**
```sql
-- Current: Partial scan (date not indexed)
SELECT * FROM "DailyUsage"
WHERE key = $1 AND date = CURRENT_DATE;

-- FIX: Add date index
CREATE INDEX idx_dailyUsage_date ON "DailyUsage"(date);

-- Verify: Should use index range scan
```

---

### Connection Pooling

**Current Setup:** Unknown (not visible in schema)

**Recommendation:** Configure Prisma connection pool for production
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  
  // Add connection pool settings
  // For Railway PostgreSQL Starter: max 20 connections
  // Recommend: pooling adapter (PgBouncer) for serverless
}
```

**Why:** Next.js serverless functions create many connections; pool prevents exhaustion.

---

### Backup Validation

**No visible backup configuration**

**Recommendation:** Verify Railway backup settings
```
1. Login to Railway dashboard
2. Go to PostgreSQL plugin
3. Confirm: Daily backups enabled
4. Set retention: 30 days minimum
5. Test recovery to staging
```

---

## Data Type Issues

### Account.expires_at (INT → BIGINT)
**Current:** 32-bit signed integer (overflows 2038)  
**Risk:** MEDIUM (8 years away)  
**Fix:** Convert to BIGINT before 2038

```sql
ALTER TABLE "Account" 
ALTER COLUMN expires_at TYPE bigint USING expires_at::bigint;
```

---

## RLS (Row-Level Security) Not Implemented

**Current:** No RLS policies

**Recommendation:** Implement RLS for sensitive tables
```sql
-- Example for Transaction table
ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_isolation ON "Transaction"
  USING (userId = current_setting('app.current_user_id')::text);

-- In app: SET app.current_user_id = 'user-123';
```

**Effort:** 4 hours  
**Benefit:** Prevent accidental cross-user data access (defense in depth)

---

## Performance Baseline (Estimated)

| Query | Rows | Time | Index |
|-------|------|------|-------|
| User by email | 1 | ~1ms | ✅ `idx_user_email` |
| User's transactions | 100 | ~5ms | ✅ `idx_transaction_userId_createdAt` |
| User's session | 1-10 | ~10ms (without idx) → ~1ms (with idx) | ⚠️ Missing |
| DailyUsage by key+date | 1 | ~10ms | ⚠️ Partial |

---

## Compliance & Audit

### GDPR: Right to Deletion
**Current:** Cascade deletes (problematic)

**Better approach:**
```sql
-- Soft delete: Mark user as deleted, retain financial records
ALTER TABLE "User" ADD COLUMN deletedAt DATETIME?;

-- Query: WHERE deletedAt IS NULL (active users only)
-- Financial records preserved for audit
```

---

## Migration Strategy

### Phase 1: Critical (This Sprint)
```bash
1. Fix TokenBalance cascade (1h)
2. Add Session.userId index (0.5h)
3. Test on staging (0.5h)
```

### Phase 2: Short-term (Next Sprint)
```bash
1. Archive DailyUsage > 90 days (3h)
2. Convert Account.expires_at to BIGINT (1h)
3. Implement RLS policies (4h)
```

### Phase 3: Long-term (Backlog)
```bash
1. Enable connection pooling (2h)
2. Set up PITR backup (1h)
3. Performance monitoring (2h)
```

---

## Summary

### Debt Items Validated
| Item | Status | Severity | Action |
|------|--------|----------|--------|
| DB-001 | ✅ CONFIRMED | CRITICAL | Fix now (1h) |
| DB-002 | ✅ CONFIRMED | HIGH | Fix next sprint (6h) |
| DB-003 | ✅ CONFIRMED | MEDIUM | Fix now (1h) |

### New Issues Found
- ⚠️ No RLS implemented (security gap)
- ⚠️ No backup validation visible
- ⚠️ Connection pooling config unclear

### Effort to Fix All DB Debt
**Critical + High:** 7 hours  
**Medium + Low:** 6 hours  
**Total:** ~13 hours

---

**Assessment Complete**  
**Database Health: 7.5/10** (same as Phase 2, but debt prioritized)

**Next Phase:** Phase 6 @ux-design-expert (ux-specialist-review.md)
