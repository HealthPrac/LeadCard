-- Migration 013: Card footer note + service ratings

-- ──────────────────────────────────────────────────────────────
-- Card footer note
-- Free-text line that card owners can use for professional
-- registration notes, credentials, regulatory labels, etc.
-- e.g. "PPRA registered · Member #12345", "HPCSA registered"
-- ──────────────────────────────────────────────────────────────
ALTER TABLE cards ADD COLUMN IF NOT EXISTS footer_note text;

-- ──────────────────────────────────────────────────────────────
-- Service ratings
-- Anonymous star ratings left by card visitors.
-- No login required — service client does the insert.
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS service_ratings (
  id             uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id        uuid         NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  subscriber_id  uuid         NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  session_id     text,
  rating         smallint     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment        text,
  created_at     timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS service_ratings_card_id_idx       ON service_ratings(card_id);
CREATE INDEX IF NOT EXISTS service_ratings_subscriber_id_idx ON service_ratings(subscriber_id);
CREATE INDEX IF NOT EXISTS service_ratings_created_at_idx    ON service_ratings(created_at DESC);

ALTER TABLE service_ratings ENABLE ROW LEVEL SECURITY;

-- Service role (server actions) gets full access
CREATE POLICY "service_role_all_ratings" ON service_ratings
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated subscribers can read their own card ratings
CREATE POLICY "subscribers_select_own_ratings" ON service_ratings
  FOR SELECT TO authenticated
  USING (subscriber_id = (SELECT id FROM subscribers WHERE user_id = auth.uid()));
