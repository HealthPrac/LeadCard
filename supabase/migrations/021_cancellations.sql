-- ─────────────────────────────────────────────────────────────────────────────
-- 021 Subscription cancellation and account deletion
-- ─────────────────────────────────────────────────────────────────────────────

-- Extend subscribers with cancellation tracking columns
ALTER TABLE subscribers
  ADD COLUMN IF NOT EXISTS cancellation_requested_at timestamptz,
  ADD COLUMN IF NOT EXISTS effective_end_date         date;

-- Extend subscription_status check constraint to include new lifecycle values
ALTER TABLE subscribers DROP CONSTRAINT IF EXISTS subscribers_subscription_status_check;
ALTER TABLE subscribers ADD CONSTRAINT subscribers_subscription_status_check
  CHECK (subscription_status IN (
    'trialing', 'active', 'past_due', 'canceled', 'incomplete',
    'canceling',          -- cancellation requested, card still live until effective_end_date
    'pending_deletion'    -- deletion requested,     card still live until effective_end_date
  ));

-- ─────────────────────────────────────────────────────────────────────────────
-- Account cancellations audit table
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS account_cancellations (
  id                  uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at          timestamptz DEFAULT now() NOT NULL,
  subscriber_id       uuid        NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  subscriber_email    text        NOT NULL,
  request_type        text        NOT NULL CHECK (request_type IN ('cancel', 'delete')),
  effective_date      date        NOT NULL,
  status              text        NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'processed', 'revoked')),
  processed_at        timestamptz,
  notes               text
);

ALTER TABLE account_cancellations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriber_read_own_cancellations"
  ON account_cancellations FOR SELECT TO authenticated
  USING (
    subscriber_id IN (
      SELECT id FROM subscribers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "service_all_account_cancellations"
  ON account_cancellations FOR ALL TO service_role USING (true) WITH CHECK (true);
