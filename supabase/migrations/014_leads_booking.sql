-- Migration 014: Support booking-mode leads (no email required)
-- When a visitor clicks a booking CTA, a lead record is created immediately.
-- Email is not captured until the visitor optionally fills in the post-booking form.

ALTER TABLE leads ALTER COLUMN email DROP NOT NULL;
