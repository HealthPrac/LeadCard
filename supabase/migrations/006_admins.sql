-- Migration 006 — Admin access control
-- Separate from subscribers. An admin does NOT need a subscriber/card account.
-- Liezl adds admins by inserting a row here (or via /admin/team UI once live).

create table if not exists admins (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null unique references auth.users(id) on delete cascade,
  added_by   uuid references auth.users(id),
  note       text,
  created_at timestamptz not null default now()
);

-- RLS: service_role has full access.
-- Authenticated users can only see their own row (used by gate check).
alter table admins enable row level security;

create policy "admins_service_all"
  on admins for all
  using (true) with check (true);

create policy "admins_auth_own_row"
  on admins for select
  using (auth.uid() = user_id);

-- ── Helper functions (security definer = runs as superuser, can read auth.users) ──

-- Look up a user_id by email — used when adding a new admin
create or replace function get_user_id_by_email(input_email text)
returns uuid
language sql security definer as $$
  select id from auth.users
  where lower(email) = lower(input_email)
  limit 1;
$$;

-- List all admins with their email addresses — used on /admin/team page
create or replace function list_admins()
returns table (
  id         uuid,
  user_id    uuid,
  email      text,
  added_by   uuid,
  note       text,
  created_at timestamptz
)
language sql security definer as $$
  select a.id, a.user_id, u.email::text, a.added_by, a.note, a.created_at
  from admins a
  join auth.users u on u.id = a.user_id
  order by a.created_at asc;
$$;
