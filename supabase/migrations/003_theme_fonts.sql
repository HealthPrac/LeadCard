-- Migration 003 — Add font configuration to cards table
ALTER TABLE cards
  ADD COLUMN IF NOT EXISTS theme_font      text NOT NULL DEFAULT 'serif',
  ADD COLUMN IF NOT EXISTS theme_font_size text NOT NULL DEFAULT 'default';
