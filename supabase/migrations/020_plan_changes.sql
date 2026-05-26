-- ─────────────────────────────────────────────────────────────────────────────
-- 020 Plan change history (self-service upgrade / downgrade audit trail)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS plan_change_history (
  id                  uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at          timestamptz DEFAULT now() NOT NULL,
  subscriber_id       uuid        NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  subscriber_email    text        NOT NULL,
  from_plan           text        NOT NULL CHECK (from_plan IN ('solo','small','enterprise')),
  to_plan             text        NOT NULL CHECK (to_plan IN ('solo','small','enterprise')),
  cards_unpublished   integer     NOT NULL DEFAULT 0,
  status              text        NOT NULL DEFAULT 'pending_billing'
                        CHECK (status IN ('pending_billing','billing_updated','cancelled')),
  admin_notes         text
);

ALTER TABLE plan_change_history ENABLE ROW LEVEL SECURITY;

-- Subscribers can read their own history
CREATE POLICY "subscriber_read_own_plan_history"
  ON plan_change_history FOR SELECT TO authenticated
  USING (
    subscriber_id IN (
      SELECT id FROM subscribers WHERE user_id = auth.uid()
    )
  );

-- Service role has full access
CREATE POLICY "service_all_plan_history"
  ON plan_change_history FOR ALL TO service_role USING (true) WITH CHECK (true);
