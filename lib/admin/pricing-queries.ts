// Pricing queries — service client (bypasses RLS)
import { createServiceClient } from '@/lib/supabase/server'
import type { PricingCurrentRow, PricingProposalRow, PricingAuditRow, AdminOption } from './pricing-shared'
export type { PricingCurrentRow, PricingProposalRow, PricingAuditRow, AdminOption } from './pricing-shared'
export { planLabel } from './pricing-shared'

export async function getCurrentPricing(): Promise<PricingCurrentRow[]> {
  const svc = createServiceClient()
  const { data } = await svc
    .from('pricing_current')
    .select('*')
    .order('plan_key')
    .order('currency')
  return (data ?? []) as PricingCurrentRow[]
}

export async function getPricingProposals(): Promise<PricingProposalRow[]> {
  const svc = createServiceClient()

  const { data: proposals } = await svc
    .from('pricing_proposals')
    .select('*')
    .order('created_at', { ascending: false })

  if (!proposals?.length) return []

  // Resolve emails via list_admins RPC (security definer)
  const { data: admins } = await svc.rpc('list_admins')
  const emailMap = new Map<string, string>()
  for (const a of (admins ?? []) as { user_id: string; email: string }[]) {
    emailMap.set(a.user_id, a.email)
  }

  return proposals.map(p => ({
    ...p,
    proposed_by_email:  emailMap.get(p.proposed_by)  ?? p.proposed_by,
    assigned_to_email:  emailMap.get(p.assigned_to)  ?? p.assigned_to,
    actioned_by_email:  p.actioned_by ? (emailMap.get(p.actioned_by) ?? p.actioned_by) : null,
  })) as PricingProposalRow[]
}

export async function getAuditLog(): Promise<PricingAuditRow[]> {
  const svc = createServiceClient()
  const { data } = await svc
    .from('pricing_audit_log')
    .select('*')
    .order('created_at', { ascending: false })
  return (data ?? []) as PricingAuditRow[]
}

export async function getAdminOptions(): Promise<AdminOption[]> {
  const svc = createServiceClient()
  const { data } = await svc.rpc('list_admins')
  return ((data ?? []) as { user_id: string; email: string }[]).map(a => ({
    user_id: a.user_id,
    email:   a.email,
  }))
}
