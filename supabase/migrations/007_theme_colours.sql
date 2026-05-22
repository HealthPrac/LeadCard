-- Migration 007: granular theme colour columns
-- theme_banner_bg : logo strip background (null = auto derived from accent)
-- theme_heading   : display_name / big heading colour (null = uses theme_fg)
-- theme_subtext   : secondary text — role, email, phone (null = uses theme_fg)

ALTER TABLE cards
  ADD COLUMN IF NOT EXISTS theme_banner_bg text,
  ADD COLUMN IF NOT EXISTS theme_heading   text,
  ADD COLUMN IF NOT EXISTS theme_subtext   text;
