-- Migration: Create ApiKey table for S2.1 (API Key Management)
-- Date: 2026-06-24
-- Purpose: Allow users to generate, view, and revoke API keys

CREATE TABLE "ApiKey" (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  userId          TEXT NOT NULL,
  name            TEXT NOT NULL DEFAULT 'My API Key',
  keyHash         TEXT NOT NULL UNIQUE,           -- bcrypt hash of key
  lastFourChars   TEXT NOT NULL,                  -- e.g., "sk_live_a1b2c3d4"
  lastUsedAt      TIMESTAMP,
  revokedAt       TIMESTAMP,                      -- NULL = active
  createdAt       TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt       TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_apikey_userid
    FOREIGN KEY (userId)
    REFERENCES "User"(id)
    ON DELETE CASCADE
);

-- Indexes for common queries
CREATE INDEX idx_apikey_userId ON "ApiKey"(userId, revokedAt);
CREATE INDEX idx_apikey_lastUsedAt ON "ApiKey"(lastUsedAt DESC);

-- Rollback script:
-- DROP TABLE IF EXISTS "ApiKey" CASCADE;
