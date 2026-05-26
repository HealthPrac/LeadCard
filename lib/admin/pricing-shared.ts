// Shared types and pure helpers — no server imports, safe to use in client components

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
