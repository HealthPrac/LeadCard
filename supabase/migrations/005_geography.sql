-- Migration 005 — geography on subscribers
-- Captures the primary business location of each subscriber at onboarding.
-- Used for internal HPS market research (aggregate, no PII exported).

ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS city    text;
