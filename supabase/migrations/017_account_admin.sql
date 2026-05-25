-- Track which card holders have account-admin rights within their subscriber account
ALTER TABLE cards ADD COLUMN IF NOT EXISTS is_account_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- Index for fast lookup when checking admin access by email
CREATE INDEX IF NOT EXISTS idx_cards_account_admin ON cards (subscriber_id, is_account_admin) WHERE is_account_admin = TRUE;
