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

export function changeTypeLabel(t: string) {
  if (t === 'per_user') return 'Price per user'
  if (t === 'setup_fee') return 'Setup fee'
  if (t === 'seats') return 'Seats'
  return t
}
