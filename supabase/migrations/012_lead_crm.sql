-- Migration 012: Lead CRM + Card Holder Magic-Link Tokens

-- ============================================================
-- CARD HOLDER TOKENS
-- One revocable magic-link token per card.
-- Lets a card holder access their personal CRM without a login.
-- ============================================================
create table if not exists card_holder_tokens (
  id               uuid primary key default gen_random_uuid(),
  card_id          uuid not null references cards(id) on delete cascade,
  subscriber_id    uuid not null references subscribers(id) on delete cascade,
  token            text not null unique default encode(gen_random_bytes(32), 'hex'),
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  last_accessed_at timestamptz
);

create index if not exists card_holder_tokens_card_id_idx
  on card_holder_tokens(card_id);

-- Only one ACTIVE token per card at a time
create unique index if not exists card_holder_tokens_one_active_per_card
  on card_holder_tokens(card_id) where is_active = true;

-- ============================================================
-- LEAD CRM
-- Extends each lead with pipeline + value + private tracking.
-- Created on first CRM action (upsert pattern).
-- ============================================================
create table if not exists lead_crm (
  id                        uuid primary key default gen_random_uuid(),
  lead_id                   uuid not null unique references leads(id) on delete cascade,
  card_id                   uuid not null references cards(id) on delete cascade,
  subscriber_id             uuid not null references subscribers(id) on delete cascade,

  -- Pipeline
  status                    text not null default 'new'
                              check (status in ('new', 'engaged', 'prospect', 'client', 'lost')),

  -- Engagement timing (filled by card holder)
  first_engaged_at          timestamptz,           -- when card holder first responded
  converted_to_prospect_at  timestamptz,           -- auto-stamped on prospect transition
  converted_to_client_at    timestamptz,           -- auto-stamped on client transition

  -- Value (ZAR cents — avoids float rounding)
  estimated_income_cents    bigint,
  actual_income_cents       bigint,

  -- Quality signals (rolled up to admin in aggregate — NOT per lead for admin)
  satisfaction_score        smallint check (satisfaction_score between 1 and 5),
  industry                  text,                  -- override from card.industry if different

  -- Private — card holder only; excluded from all admin per-lead views
  private_notes             text,
  experience_notes          text,

  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create index if not exists lead_crm_lead_id_idx       on lead_crm(lead_id);
create index if not exists lead_crm_card_id_idx       on lead_crm(card_id);
create index if not exists lead_crm_subscriber_id_idx on lead_crm(subscriber_id);
create index if not exists lead_crm_status_idx        on lead_crm(status);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table card_holder_tokens enable row level security;
alter table lead_crm enable row level security;

-- Subscribers manage their own tokens
create policy "subscribers_manage_own_tokens" on card_holder_tokens
  for all to authenticated
  using  (subscriber_id = (select id from subscribers where user_id = auth.uid()))
  with check (subscriber_id = (select id from subscribers where user_id = auth.uid()));

-- Subscribers manage their own CRM records
create policy "subscribers_manage_own_lead_crm" on lead_crm
  for all to authenticated
  using  (subscriber_id = (select id from subscribers where user_id = auth.uid()))
  with check (subscriber_id = (select id from subscribers where user_id = auth.uid()));

-- updated_at trigger
create trigger lead_crm_updated_at
  before update on lead_crm
  for each row execute function set_updated_at();
