import { createServiceClient } from '@/lib/supabase/server'

export interface EnterpriseLead {
  id: string
  created_at: string
  contact_name: string
  contact_email: string
  contact_phone: string | null
  company_name: string
  estimated_seats: number | null
  message: string | null
  status: 'new' | 'contacted' | 'enrolled' | 'lost'
  admin_notes: string | null
  enrolled_enrollment_id: string | null
}

export interface EnterpriseEnrollment {
  id: string
  created_at: string
  lead_id: string | null
  subscriber_id: string | null
  company_name: string
  seats: number
  price_per_user_display: string
  currency: string
  setup_fee_display: string | null
  discount_code: string | null
  api_access: boolean
  sla_path: string | null
  enrolled_by: string
  enrolled_at: string
}

export interface EnterprisePricingProposal {
  id: string
  created_at: string
  enrollment_id: string
  change_type: 'per_user' | 'setup_fee' | 'seats'
  old_value: string
  new_value: string
  notes: string | null
  proposed_by: string
  assigned_to: string
  status: 'pending' | 'approved' | 'rejected'
  actioned_by: string | null
  actioned_at: string | null
}

export interface EnterprisePricingAuditRow {
  id: string
  created_at: string
  proposal_id: string
  enrollment_id: string
  change_type: string
  action: string
  old_value: string
  new_value: string
  actor_email: string | null
  notes: string | null
}

export async function getEnterpriseLeads(): Promise<EnterpriseLead[]> {
  const svc = createServiceClient()
  const { data } = await svc
    .from('enterprise_leads')
    .select('*')
    .order('created_at', { ascending: false })
  return (data ?? []) as EnterpriseLead[]
}

export async function getEnterpriseLead(id: string): Promise<EnterpriseLead | null> {
  const svc = createServiceClient()
  const { data } = await svc
    .from('enterprise_leads')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  return data as EnterpriseLead | null
}

export async function getEnrollmentForLead(leadId: string): Promise<EnterpriseEnrollment | null> {
  const svc = createServiceClient()
  const { data } = await svc
    .from('enterprise_enrollments')
    .select('*')
    .eq('lead_id', leadId)
    .maybeSingle()
  return data as EnterpriseEnrollment | null
}

export async function getEnrollment(enrollmentId: string): Promise<EnterpriseEnrollment | null> {
  const svc = createServiceClient()
  const { data } = await svc
    .from('enterprise_enrollments')
    .select('*')
    .eq('id', enrollmentId)
    .maybeSingle()
  return data as EnterpriseEnrollment | null
}

export async function getEnterpriseEnrollments(): Promise<EnterpriseEnrollment[]> {
  const svc = createServiceClient()
  const { data } = await svc
    .from('enterprise_enrollments')
    .select('*')
    .order('enrolled_at', { ascending: false })
  return (data ?? []) as EnterpriseEnrollment[]
}

export async function getEnrollmentPricingProposals(enrollmentId: string): Promise<EnterprisePricingProposal[]> {
  const svc = createServiceClient()
  const { data } = await svc
    .from('enterprise_pricing_proposals')
    .select('*')
    .eq('enrollment_id', enrollmentId)
    .order('created_at', { ascending: false })
  return (data ?? []) as EnterprisePricingProposal[]
}

export async function getPendingEnterpriseProposalsForAdmin(adminId: string): Promise<EnterprisePricingProposal[]> {
  const svc = createServiceClient()
  const { data } = await svc
    .from('enterprise_pricing_proposals')
    .select('*')
    .eq('assigned_to', adminId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  return (data ?? []) as EnterprisePricingProposal[]
}

export async function getEnrollmentAuditLog(enrollmentId: string): Promise<EnterprisePricingAuditRow[]> {
  const svc = createServiceClient()
  const { data } = await svc
    .from('enterprise_pricing_audit_log')
    .select('*')
    .eq('enrollment_id', enrollmentId)
    .order('created_at', { ascending: false })
  return (data ?? []) as EnterprisePricingAuditRow[]
}

export function changeTypeLabel(t: string) {
  if (t === 'per_user') return 'Price per user'
  if (t === 'setup_fee') return 'Setup fee'
  if (t === 'seats') return 'Seats'
  return t
}
