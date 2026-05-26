-- ─────────────────────────────────────────────────────────────────────────────
-- 019 Enterprise leads, enrollments, and pricing governance
-- ─────────────────────────────────────────────────────────────────────────────

-- Enterprise inquiry leads (from website "Contact us" form)
CREATE TABLE IF NOT EXISTS enterprise_leads (
  id                    uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at            timestamptz DEFAULT now() NOT NULL,
  contact_name          text        NOT NULL,
  contact_email         text        NOT NULL,
  contact_phone         text,
  company_name          text        NOT NULL,
  estimated_seats       integer,
  message               text,
  status                text        NOT NULL DEFAULT 'new'
                          CHECK (status IN ('new','contacted','enrolled','lost')),
  admin_notes           text,
  enrolled_enrollment_id uuid       -- populated when lead converts to enrollment
);

-- Enterprise enrollments (actual tenant provisioning)
CREATE TABLE IF NOT EXISTS enterprise_enrollments (
  id                    uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at            timestamptz DEFAULT now() NOT NULL,
  lead_id               uuid        REFERENCES enterprise_leads(id) ON DELETE SET NULL,
  subscriber_id         uuid        REFERENCES subscribers(id) ON DELETE SET NULL,
  company_name          text        NOT NULL,
  seats                 integer     NOT NULL,
  price_per_user_display text       NOT NULL,   -- e.g. 'R 150' or '$ 9'
  currency              text        NOT NULL DEFAULT 'ZAR'
                          CHECK (currency IN ('ZAR','USD')),
  setup_fee_display     text,                   -- e.g. 'R 5 000' or NULL = included
  discount_code         text,
  api_access            boolean     NOT NULL DEFAULT false,
  sla_path              text,                   -- storage path in enterprise-sla bucket
  enrolled_by           text        NOT NULL,   -- admin email
  enrolled_at           timestamptz DEFAULT now() NOT NULL
);

-- Enterprise pricing proposals (maker-checker for rate changes on enrolled tenants)
CREATE TABLE IF NOT EXISTS enterprise_pricing_proposals (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at      timestamptz DEFAULT now() NOT NULL,
  enrollment_id   uuid        NOT NULL REFERENCES enterprise_enrollments(id) ON DELETE CASCADE,
  change_type     text        NOT NULL CHECK (change_type IN ('per_user','setup_fee','seats')),
  old_value       text        NOT NULL,
  new_value       text        NOT NULL,
  notes           text,
  proposed_by     uuid        NOT NULL,  -- auth.users.id
  assigned_to     uuid        NOT NULL,  -- auth.users.id (approver, must differ)
  status          text        NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','rejected')),
  actioned_by     uuid,
  actioned_at     timestamptz
);

-- Enterprise pricing audit log (append-only)
CREATE TABLE IF NOT EXISTS enterprise_pricing_audit_log (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at      timestamptz DEFAULT now() NOT NULL,
  proposal_id     uuid        NOT NULL REFERENCES enterprise_pricing_proposals(id),
  enrollment_id   uuid        NOT NULL,
  change_type     text        NOT NULL,
  action          text        NOT NULL CHECK (action IN ('proposed','approved','rejected')),
  old_value       text        NOT NULL,
  new_value       text        NOT NULL,
  actor_email     text,
  notes           text
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Storage bucket for SLA documents
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'enterprise-sla',
  'enterprise-sla',
  false,
  10485760,  -- 10 MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE enterprise_leads                ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_enrollments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_pricing_proposals    ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_pricing_audit_log    ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS; anon/authenticated cannot read.
-- Admins use the service-role client in server actions (same pattern as pricing).

CREATE POLICY "service_all_enterprise_leads"
  ON enterprise_leads FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_all_enterprise_enrollments"
  ON enterprise_enrollments FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_all_enterprise_pricing_proposals"
  ON enterprise_pricing_proposals FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_all_enterprise_pricing_audit_log"
  ON enterprise_pricing_audit_log FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- Storage RLS for enterprise-sla bucket
-- ─────────────────────────────────────────────────────────────────────────────
CREATE POLICY "service_upload_enterprise_sla"
  ON storage.objects FOR INSERT TO service_role
  WITH CHECK (bucket_id = 'enterprise-sla');

CREATE POLICY "service_read_enterprise_sla"
  ON storage.objects FOR SELECT TO service_role
  USING (bucket_id = 'enterprise-sla');
