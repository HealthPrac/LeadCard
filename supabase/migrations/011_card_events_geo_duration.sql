-- LeadCard — migration 011 — geographic + duration enrichment on card_events
-- Apply AFTER migration 010.
-- Adds country/city from IP geo lookup and time-on-card duration.

alter table card_events
  add column if not exists country      text,
  add column if not exists country_code text,
  add column if not exists city         text,
  add column if not exists duration_s   int;
    -- seconds visitor spent on card (from card_view_ended event, capped at 7200)

create index if not exists card_events_country_code_idx
  on card_events(country_code)
  where country_code is not null;

create index if not exists card_events_duration_idx
  on card_events(duration_s)
  where duration_s is not null;
