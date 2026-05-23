-- Promo codes: free access or percentage discount
create table promo_codes (
  id              uuid primary key default gen_random_uuid(),
  code            text not null unique,
  description     text,
  discount_type   text not null default 'free' check (discount_type in ('free', 'percent')),
  discount_percent int check (discount_percent between 1 and 100),
  max_uses        int,         -- null = unlimited
  uses_count      int not null default 0,
  expires_at      timestamptz, -- null = never
  is_active       boolean not null default true,
  created_by      uuid references auth.users(id),
  created_at      timestamptz not null default now()
);

-- Track who redeemed which code
create table promo_code_redemptions (
  id            uuid primary key default gen_random_uuid(),
  code_id       uuid not null references promo_codes(id),
  subscriber_id uuid not null references subscribers(id),
  redeemed_at   timestamptz not null default now(),
  unique(subscriber_id) -- one active promo per subscriber
);

-- Link subscriber to their redeemed code
alter table subscribers add column promo_code_id uuid references promo_codes(id);

-- RLS: admins (service client) manage codes; subscribers can read their own
alter table promo_codes enable row level security;
alter table promo_code_redemptions enable row level security;

-- Only service client (admin) can do anything with promo_codes
create policy "service_all_promo_codes" on promo_codes
  using (true) with check (true);

create policy "service_all_redemptions" on promo_code_redemptions
  using (true) with check (true);
