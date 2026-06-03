-- Migration: Fix TokenBalance cascade delete (S1.1 — DB-001 CRITICAL)
-- Date: 2026-06-03
-- Issue: User deletion cascades and deletes transaction history (financial data loss)
-- Fix: Change CASCADE to SET NULL to preserve audit trail

-- Step 1: Drop existing foreign key constraint
ALTER TABLE "TokenBalance"
DROP CONSTRAINT IF EXISTS "TokenBalance_userId_fkey";

-- Step 2: Recreate with SET NULL
ALTER TABLE "TokenBalance"
ADD CONSTRAINT "TokenBalance_userId_fkey"
FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE SET NULL;

-- Step 3: Verify constraint
SELECT constraint_name, delete_rule
FROM information_schema.referential_constraints
WHERE table_name = 'TokenBalance';
-- Expected output: delete_rule = SET NULL

-- Rollback script (if needed):
-- ALTER TABLE "TokenBalance" DROP CONSTRAINT "TokenBalance_userId_fkey";
-- ALTER TABLE "TokenBalance" ADD CONSTRAINT "TokenBalance_userId_fkey" FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE;
