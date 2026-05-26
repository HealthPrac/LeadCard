import { createServiceClient } from '@/lib/supabase/server'
export type { EnterpriseLead, EnterpriseEnrollment, EnterprisePricingProposal, EnterprisePricingAuditRow } from './enterprise-types'
export { changeTypeLabel } from './enterprise-types'
import type { EnterpriseLead, EnterpriseEnrollment, EnterprisePricingProposal, EnterprisePricingAuditRow } from './enterprise-types'

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

