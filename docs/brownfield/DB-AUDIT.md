# Phase 2B: Database Audit — DB-AUDIT.md

**Date:** 2026-06-03  
**Agent:** @data-engineer (Dara)  
**Status:** COMPLETED  

---

## Executive Summary

PostgreSQL schema is **well-normalized** (3NF) but has **growth and safety issues** that require mitigation before scaling to 100K+ users.

**Risk Level: MEDIUM**  
**Blocking Issues: 1 (TokenBalance cascade)**  
**Warnings: 4 (DailyUsage growth, missing indexes, type issues)**  

---

## Migration Path (Recommended)

### Phase 1: Immediate (This Sprint)
```sql
-- 1. Change TokenBalance cascade to SET NULL (preserve ledger)
ALTER TABLE "User" 
DROP CONSTRAINT IF EXISTS "User_tokenBalance_fkey";

ALTER TABLE "TokenBalance" 
DROP CONSTRAINT IF EXISTS "TokenBalance_userId_fkey";

ALTER TABLE "TokenBalance" 
ADD CONSTRAINT "TokenBalance_userId_fkey" 
FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE SET NULL;

-- 2. Add missing index on Session.userId
CREATE INDEX idx_session_userId ON "Session"(userId);

-- 3. Convert Account.expires_at to BIGINT
ALTER TABLE "Account" 
ALTER COLUMN expires_at TYPE bigint;

-- 4. Add DailyUsage.date index
CREATE INDEX idx_dailyUsage_date ON "DailyUsage"(date);
```

**Effort:** ~2 hours  
**Risk:** LOW (index-only + constraint fix non-breaking)  
**Downtime:** 0 (online migration)  

### Phase 2: Short-term (Next 2 Sprints)
```sql
-- 1. Create archive table for old DailyUsage
CREATE TABLE "DailyUsage_Archive" AS 
SELECT * FROM "DailyUsage" 
WHERE date < CURRENT_DATE - INTERVAL '90 days';

-- 2. Create partitioned table for DailyUsage (by date)
CREATE TABLE "DailyUsage_Partitioned" 
PARTITION BY RANGE (date) AS SELECT * FROM "DailyUsage";

-- 3. Migrate Subscription.status to ENUM
ALTER TABLE "Subscription" 
ADD COLUMN status_new VARCHAR 
CHECK (status_new IN ('active', 'canceled', 'past_due'));

UPDATE "Subscription" SET status_new = status;

ALTER TABLE "Subscription" 
DROP COLUMN status;

ALTER TABLE "Subscription" 
RENAME COLUMN status_new TO status;
```

**Effort:** ~4-6 hours  
**Risk:** MEDIUM (data backfill required)  
**Downtime:** < 30 min (if using feature flags)  

### Phase 3: Medium-term (Next Quarter)
```sql
-- 1. Add audit columns to sensitive tables
ALTER TABLE "Subscription" 
ADD COLUMN createdBy STRING,
ADD COLUMN updatedBy STRING,
ADD COLUMN reason STRING;

-- 2. Implement row-level security (RLS)
ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TokenBalance" ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_isolation ON "Transaction" 
  USING (userId = current_user_id());
```

**Effort:** ~8 hours  
**Risk:** MEDIUM (RLS testing required)  
**Downtime:** 0 (additive only)  

---

## Query Performance Baseline

### Slow Queries (Unindexed)

```sql
-- 1. Sessions by user (NOW: table scan)
SELECT * FROM "Session" 
WHERE userId = 'user-123' 
ORDER BY created DESC;
-- PLAN: Seq Scan → Index Scan (after idx_session_userId)

-- 2. DailyUsage by date range (NOW: partial scan)
SELECT * FROM "DailyUsage" 
WHERE date BETWEEN '2026-01-01' AND '2026-03-31';
-- PLAN: Seq Scan → Index Range Scan (after idx_dailyUsage_date)

-- 3. User's recent transactions (GOOD)
SELECT * FROM "Transaction" 
WHERE userId = 'user-123' 
ORDER BY createdAt DESC 
LIMIT 10;
-- PLAN: Index Scan (composite index exists) ✅
```

### Recommendations
- Add query timeouts (5s default)
- Enable query logging for statements > 100ms
- Monthly ANALYZE runs on Transaction table

---

## Backup & Recovery

### Current Strategy
**Assumption:** Railway managed backups (daily, 30-day retention)

**Gaps:**
- ⚠️ No explicit backup configuration visible
- ⚠️ No documented recovery procedure
- ⚠️ No point-in-time recovery (PITR) setup

### Recommended
```yaml
Backup Strategy:
  Frequency: Daily (00:00 UTC)
  Retention: 30 days (prod), 7 days (staging)
  Type: Full + incremental WAL
  Test Recovery: Weekly (restore to staging)
  PITR Enabled: Yes (24-hour window minimum)
```

---

## Monitoring & Alerts

### Metrics to Track
```sql
-- 1. Table bloat
SELECT schemaname, tablename, 
       pg_pretty_size(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 2. Index unused
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes 
WHERE idx_scan = 0 
ORDER BY indexrelname;

-- 3. Cache hit ratio (should be > 99%)
SELECT 
  heap_blks_read / (heap_blks_read + heap_blks_hit) as cache_hit_ratio
FROM pg_stat_user_tables;
```

### Alerts (Set up in New Relic/Datadog)
- 🔴 **CRITICAL:** Cache hit ratio < 95%
- 🟡 **WARNING:** Table size growth > 50% month-over-month
- 🟡 **WARNING:** Unused indexes (idx_scan = 0 for 30+ days)
- 🔴 **CRITICAL:** Backup failed

---

## Data Retention Policy

| Table | Retention | Cleanup Method |
|-------|-----------|-----------------|
| User | Permanent | Manual deletion (cascade deletes related) |
| Account | Permanent | Delete with User |
| Session | 30 days | Cron job (remove where expires < NOW) |
| VerificationToken | 7 days | Cron job (remove expired) |
| Transaction | Permanent | Archive > 1 year to cold storage |
| Subscription | Permanent | Keep all (history important) |
| DailyUsage | 90 days | Archive > 90 days; delete > 1 year |

### Implementation
```javascript
// Cron job (runs nightly)
0 0 * * * node scripts/db-cleanup.js

// scripts/db-cleanup.js
async function cleanup() {
  // Remove expired sessions
  await db.session.deleteMany({
    where: { expires: { lt: new Date() } }
  });
  
  // Remove old verification tokens
  await db.verificationToken.deleteMany({
    where: { expires: { lt: new Date() } }
  });
  
  // Archive old DailyUsage
  await archiveDailyUsage(90);
}
```

---

## Compliance & Audit

### GDPR Compliance
| Requirement | Status | Action |
|-------------|--------|--------|
| Right to deletion | ⚠️ Partial | TokenBalance cascade needs fix |
| Data retention | ⚠️ None | No policy defined |
| Audit trail | ⚠️ Minimal | No updatedBy, changedBy fields |
| PII encryption | ✅ Yes | Email, name at rest |
| Data residency | ⚠️ Unknown | Database location? |

### Audit Trail
**Missing fields:**
```sql
ALTER TABLE "Transaction" ADD COLUMN changedBy STRING;
ALTER TABLE "Subscription" ADD COLUMN auditNote STRING;
```

---

## Cost Optimization (PostgreSQL on Railway)

### Current Estimate (100K users, 5M transactions)
```
Database Size: ~2 GB
Monthly Cost: $29 (Starter) → $100+ (Production)
```

### Optimization Opportunities
1. **Compress old DailyUsage:** Remove > 365 days (saves ~40% storage)
2. **Vacuum schedule:** Weekly `VACUUM ANALYZE` (prevents bloat)
3. **Dead tuple ratio:** Keep < 5% (adjust autovacuum settings)

```sql
-- Railway PostgreSQL settings
ALTER DATABASE kairos SET autovacuum = on;
ALTER DATABASE kairos SET autovacuum_naptime = '1 min';
ALTER DATABASE kairos SET autovacuum_vacuum_scale_factor = 0.05;
```

---

## Disaster Recovery Plan

### RTO (Recovery Time Objective): 1 hour
### RPO (Recovery Point Objective): 1 hour

### Runbook

**Scenario 1: Database Corruption**
```
1. Stop application servers
2. Restore from latest backup to staging
3. Verify data integrity
4. Switch DNS to restored database
5. Resume application
   Estimated time: 30-45 min
```

**Scenario 2: Data Loss**
```
1. Restore PITR to 24 hours before incident
2. Verify no data loss in critical tables
3. Resume with point-in-time state
   Estimated time: 15-30 min
```

**Scenario 3: Performance Degradation**
```
1. Restart database (clear cache)
2. Run ANALYZE on hot tables
3. Kill slow queries (> 30s)
4. Monitor recovery
   Estimated time: 5-10 min
```

---

## Summary & Recommendations

### Critical Actions (Do Now)
1. ✅ Fix TokenBalance cascade (SET NULL)
2. ✅ Add missing indexes
3. ✅ Implement DailyUsage cleanup policy

### Short-term (1-2 months)
4. ⚠️ Archive DailyUsage > 90 days
5. ⚠️ Migrate Subscription.status to ENUM

### Medium-term (1-2 quarters)
6. ⚠️ Add audit columns (createdBy, updatedBy)
7. ⚠️ Implement row-level security (RLS)
8. ⚠️ Set up monitoring & alerting

### Ongoing
9. Weekly VACUUM ANALYZE
10. Monthly backup verification
11. Quarterly performance review

---

**Assessment Complete**  
**Overall Schema Health: 7.5/10**

**Next Phase:** Phase 3 @ux-design-expert (frontend-spec.md)
