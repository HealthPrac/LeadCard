-- Migration 008: allow text/html uploads to card-videos bucket
UPDATE storage.buckets
SET allowed_mime_types = array_append(allowed_mime_types, 'text/html')
WHERE id = 'card-videos'
  AND NOT ('text/html' = ANY(COALESCE(allowed_mime_types, ARRAY[]::text[])));
