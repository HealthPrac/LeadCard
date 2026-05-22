-- Migration 004 — add industry column to cards
alter table cards add column if not exists industry text;
