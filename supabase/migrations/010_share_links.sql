-- LeadCard — migration 010 — share_links + card_events FK
-- Apply AFTER migration 009 (card_events must exist first).
-- Enables per-channel attribution: QR, copy_link, email_sig, NFC.

-- ============================================================
-- SHARE LINKS
-- ============================================================
create table if not exists share_links (
  id              uuid primary key default gen_random_uuid(),
  share_token     text not null unique,
  card_id         uuid not null references cards(id) on delete cascade,
  subscriber_id   uuid not null references subscribers(id) on delete cascade,
  parent_link_id  uuid references share_links(id) on delete set null,
  root_link_id    uuid references share_links(id) on delete set null,
  channel_type    text not null default 'unknown',
    -- 'qr' | 'nfc' | 'copy_link' | 'email_sig' | 'direct' | 'unknown'
  source_context  text not null default 'direct_send',
    -- 'direct_send' | 'recipient_forward'
  forward_depth   int  not null default 0,
  view_count      int  not null default 0,
  lead_count      int  not null default 0,
  created_at      timestamptz not null default now(),
  expires_at      timestamptz
);

alter table share_links enable row level security;

create policy "share_links: subscriber manage"
  on share_links for all
  using (
    subscriber_id in (
      select id from subscribers where user_id = auth.uid()
    )
  );

create index share_links_card_id_idx    on share_links(card_id);
create index share_links_sub_idx        on share_links(subscriber_id);
create index share_links_token_idx      on share_links(share_token);
create index share_links_channel_idx    on share_links(channel_type);

-- ============================================================
-- WIRE share_link_id INTO card_events
-- ============================================================
alter table card_events
  add column if not exists share_link_id uuid references share_links(id) on delete set null;

create index card_events_share_link_idx on card_events(share_link_id);

-- ============================================================
-- ATOMIC INCREMENT FUNCTIONS (called from /api/events route)
-- ============================================================
create or replace function increment_share_link_view(p_token text)
returns void language plpgsql security definer as $$
begin
  update share_links set view_count = view_count + 1 where share_token = p_token;
end;
$$;

create or replace function increment_share_link_lead(p_token text)
returns void language plpgsql security definer as $$
begin
  update share_links set lead_count = lead_count + 1 where share_token = p_token;
end;
$$;
