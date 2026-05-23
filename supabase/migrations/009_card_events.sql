-- LeadCard — migration 009 — card_events tracking
-- Append-only event log for public card interactions.
-- All inserts go through service role (/api/events route).
-- Subscribers can read their own events via RLS.

create table if not exists card_events (
  id              uuid primary key default gen_random_uuid(),
  event_name      text not null,
  card_id         uuid references cards(id) on delete cascade,
  subscriber_id   uuid references subscribers(id) on delete cascade,
  session_id      text,
  share_source    text,      -- 'qr' | 'nfc' | 'direct' | 'email' | 'linkedin' | unknown
  cta_label       text,      -- for cta_clicked events
  cta_type        text,      -- 'primary' | 'secondary'
  device_type     text,      -- 'mobile' | 'tablet' | 'desktop'
  referrer_domain text,
  payload_json    jsonb,
  occurred_at     timestamptz not null default now()
);

alter table card_events enable row level security;

-- Subscribers can read their own events
create policy "card_events: subscriber read"
  on card_events for select
  using (
    subscriber_id in (
      select id from subscribers where user_id = auth.uid()
    )
  );

-- Indexes for analytics query patterns
create index card_events_card_id_occurred  on card_events(card_id, occurred_at desc);
create index card_events_sub_occurred      on card_events(subscriber_id, occurred_at desc);
create index card_events_name_occurred     on card_events(event_name, occurred_at desc);
