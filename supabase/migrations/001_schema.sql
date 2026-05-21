-- LeadCard schema — migration 001

-- ============================================================
-- SUBSCRIBERS
-- ============================================================
create table if not exists subscribers (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid unique not null references auth.users(id) on delete cascade,
  email                    text not null,
  plan                     text not null default 'solo'
                             check (plan in ('solo', 'small', 'enterprise')),
  paystack_customer_id     text unique,
  paystack_subscription_id text unique,
  subscription_status      text not null default 'trialing'
                             check (subscription_status in (
                               'trialing', 'active', 'past_due', 'canceled', 'incomplete'
                             )),
  trial_ends_at            timestamptz default (now() + interval '7 days'),
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

-- ============================================================
-- CARDS
-- ============================================================
create table if not exists cards (
  id                     uuid primary key default gen_random_uuid(),
  subscriber_id          uuid not null references subscribers(id) on delete cascade,
  slug                   text not null unique,

  -- Identity
  display_name           text,
  title                  text,
  company                text,
  email                  text,
  mobile                 text,
  website                text,

  -- Welcome screen
  welcome_headline       text default 'Nice to meet you.',
  welcome_body           text default 'Take a moment to learn how we can work together.',

  -- After-video CTAs
  cta_primary_label      text default 'Visit the website',
  cta_primary_url        text,
  cta_secondary_label    text default 'Request a call',
  cta_secondary_url      text,

  -- Lead capture form
  form_fields            jsonb not null default '[
    {"id":"firstName","label":"First name","required":true,"type":"text"},
    {"id":"lastName","label":"Last name","required":true,"type":"text"},
    {"id":"email","label":"Email","required":true,"type":"email"},
    {"id":"org","label":"Company","required":false,"type":"text"},
    {"id":"role","label":"Role","required":false,"type":"text"},
    {"id":"mobile","label":"Mobile","required":false,"type":"tel"}
  ]'::jsonb,

  -- Lead routing
  lead_destination_email text,

  -- Social / contact links
  links                  jsonb not null default '[]'::jsonb,

  -- Theme
  theme_bg               text not null default '#17181C',
  theme_fg               text not null default '#F6F7F3',
  theme_accent           text not null default '#8FAF9D',

  -- Asset storage paths
  photo_path             text,
  logo_path              text,
  video_path             text,

  is_published           boolean not null default false,
  is_owner_card          boolean not null default true,

  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- ============================================================
-- LEADS
-- ============================================================
create table if not exists leads (
  id            uuid primary key default gen_random_uuid(),
  card_id       uuid not null references cards(id) on delete cascade,
  subscriber_id uuid not null references subscribers(id) on delete cascade,

  first_name    text,
  last_name     text,
  email         text not null,
  org           text,
  role          text,
  mobile        text,
  message       text,

  source        text,   -- 'qr' | 'nfc' | 'direct' | 'email-sig' | 'linkedin'

  -- POPIA / GDPR
  consented_at  timestamptz not null default now(),
  ip_address    text,
  user_agent    text,

  created_at    timestamptz not null default now()
);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('card-assets', 'card-assets', false, 5242880,  array['image/jpeg','image/png','image/webp','image/svg+xml']),
  ('card-videos', 'card-videos', false, 104857600, array['video/mp4','video/quicktime','video/webm'])
on conflict (id) do nothing;

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger subscribers_updated_at before update on subscribers
  for each row execute function set_updated_at();

create trigger cards_updated_at before update on cards
  for each row execute function set_updated_at();
