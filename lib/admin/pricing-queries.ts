// Pricing queries — service client (bypasses RLS)
import { createServiceClient } from '@/lib/supabase/server'

export type PricingCurrentRow = {
  id: string
  plan_key: string
  currency: string
  price: string
  updated_at: string
  updated_by: string | null
}

export type PricingProposalRow = {
  id: string
  plan_key: string
  currency: string
  old_price: string
  new_price: string
  notes: string | null
  status: string
  proposed_by: string
  proposed_by_email: string
  assigned_to: string
  assigned_to_email: string
  actioned_by: string | null
  actioned_by_email: string | null
  actioned_at: string | null
  created_at: string
}

export type PricingAuditRow = {
  id: string
  proposal_id: string | null
  plan_key: string
  currency: string
  action: string
  old_price: string | null
  new_price: string
  actor_email: string
  notes: string | null
  created_at: string
}

export type AdminOption = {
  user_id: string
  email: string
}

const PLAN_LABELS: Record<string, string> = {
  solo:           'Solo',
  small_business: 'Small Business',
  enterprise:     'Enterprise',
}

export function planLabel(key: string) {
  return PLAN_LABELS[key] ?? key
}

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
