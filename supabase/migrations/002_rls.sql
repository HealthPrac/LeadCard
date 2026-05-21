-- LeadCard RLS — migration 002
-- Run after 001_schema.sql

-- ============================================================
-- SUBSCRIBERS
-- ============================================================
alter table subscribers enable row level security;

-- Users can read and update their own subscriber record
create policy "subscribers: own row"
  on subscribers for all
  using (user_id = auth.uid());

-- ============================================================
-- CARDS
-- ============================================================
alter table cards enable row level security;

-- Authenticated: can manage cards that belong to their subscriber account
create policy "cards: subscriber manage"
  on cards for all
  using (
    subscriber_id in (
      select id from subscribers where user_id = auth.uid()
    )
  );

-- Public card reads: anonymous users can read published cards via service role only.
-- The /c/[slug] page uses the service role client server-side — no anon policy needed.

-- ============================================================
-- LEADS
-- ============================================================
alter table leads enable row level security;

-- Authenticated: subscriber can read their own leads
create policy "leads: subscriber read"
  on leads for select
  using (
    subscriber_id in (
      select id from subscribers where user_id = auth.uid()
    )
  );

-- Leads are inserted by the /api/leads server route using service role key.
-- No anon INSERT policy — prevents direct DB writes from the browser.

-- ============================================================
-- STORAGE RLS
-- ============================================================

-- card-assets: subscriber can upload/read/delete their own files
create policy "card-assets: subscriber upload"
  on storage.objects for insert
  with check (
    bucket_id = 'card-assets'
    and (storage.foldername(name))[1] in (
      select id::text from subscribers where user_id = auth.uid()
    )
  );

create policy "card-assets: subscriber read"
  on storage.objects for select
  using (
    bucket_id = 'card-assets'
    and (storage.foldername(name))[1] in (
      select id::text from subscribers where user_id = auth.uid()
    )
  );

create policy "card-assets: subscriber delete"
  on storage.objects for delete
  using (
    bucket_id = 'card-assets'
    and (storage.foldername(name))[1] in (
      select id::text from subscribers where user_id = auth.uid()
    )
  );

-- card-videos: same pattern
create policy "card-videos: subscriber upload"
  on storage.objects for insert
  with check (
    bucket_id = 'card-videos'
    and (storage.foldername(name))[1] in (
      select id::text from subscribers where user_id = auth.uid()
    )
  );

create policy "card-videos: subscriber read"
  on storage.objects for select
  using (
    bucket_id = 'card-videos'
    and (storage.foldername(name))[1] in (
      select id::text from subscribers where user_id = auth.uid()
    )
  );

create policy "card-videos: subscriber delete"
  on storage.objects for delete
  using (
    bucket_id = 'card-videos'
    and (storage.foldername(name))[1] in (
      select id::text from subscribers where user_id = auth.uid()
    )
  );
