-- Migration 018 — Pricing management (maker-checker + audit trail)

-- ── Live prices (source of truth for the landing page) ────────────────────────
create table if not exists pricing_current (
  id          uuid primary key default gen_random_uuid(),
  plan_key    text not null,           -- 'solo' | 'small_business' | 'enterprise'
  currency    text not null,           -- 'ZAR' | 'USD'
  price       text not null,           -- display string e.g. 'R 69', '$ 4', 'Custom'
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users(id),
  constraint pricing_current_pk unique (plan_key, currency)
);

-- Seed initial prices
insert into pricing_current (plan_key, currency, price) values
  ('solo',           'ZAR', 'R 69'),
  ('solo',           'USD', '$ 4'),
  ('small_business', 'ZAR', 'R 199'),
  ('small_business', 'USD', '$ 12'),
  ('enterprise',     'ZAR', 'Custom'),
  ('enterprise',     'USD', 'Custom')
on conflict (plan_key, currency) do nothing;

-- ── Proposals (maker-checker) ─────────────────────────────────────────────────
create table if not exists pricing_proposals (
  id            uuid primary key default gen_random_uuid(),
  plan_key      text not null,
  currency      text not null,
  old_price     text not null,
  new_price     text not null,
  notes         text,
  proposed_by   uuid not null references auth.users(id),
  assigned_to   uuid not null references auth.users(id),
  status        text not null default 'pending',   -- 'pending' | 'approved' | 'rejected'
  actioned_by   uuid references auth.users(id),
  actioned_at   timestamptz,
  created_at    timestamptz not null default now(),
  constraint pricing_proposals_status_check check (status in ('pending','approved','rejected'))
);

-- ── Audit log (append-only) ───────────────────────────────────────────────────
create table if not exists pricing_audit_log (
  id            uuid primary key default gen_random_uuid(),
  proposal_id   uuid references pricing_proposals(id),
  plan_key      text not null,
  currency      text not null,
  action        text not null,   -- 'proposed' | 'approved' | 'rejected'
  old_price     text,
  new_price     text not null,
  actor_email   text not null,
  notes         text,
  created_at    timestamptz not null default now()
);

-- ── RLS ───────────────────────────────────────────────────────────────────────
alter table pricing_current   enable row level security;
alter table pricing_proposals enable row level security;
alter table pricing_audit_log enable row level security;

-- Public read on live prices (used by server-rendered landing page)
create policy "pricing_current_public_read"
  on pricing_current for select using (true);

-- Service role handles all writes
create policy "pricing_proposals_service_all"
  on pricing_proposals for all using (true) with check (true);

create policy "pricing_audit_service_all"
  on pricing_audit_log for all using (true) with check (true);

create policy "pricing_current_service_write"
  on pricing_current for all using (true) with check (true);

-- Helper: look up email by user_id (used by pricing actions to email admins)
create or replace function get_user_email_by_id(uid uuid)
returns text
language sql security definer as $$
  select email::text from auth.users where id = uid limit 1;
$$;
