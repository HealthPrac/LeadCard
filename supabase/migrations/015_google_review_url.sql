-- Migration 015: Google Review URL on cards
-- Lets tenants link their Google Business Profile review page.
-- Surfaced in the "Rate my service" screen after a 4–5 star submission.
ALTER TABLE cards ADD COLUMN IF NOT EXISTS google_review_url text;
