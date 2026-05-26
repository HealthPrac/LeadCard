'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from './gate'
import { revalidatePath } from 'next/cache'
import {
  sendEnterpriseInquiryNotification,
  sendEnterpriseInquiryConfirmation,
  sendEnterprisePricingApprovalRequest,
  sendEnterprisePricingDecisionNotification,
} from '@/lib/email/resend'
import { getEnrollment, changeTypeLabel } from './enterprise-queries'

// ── Public: submit enterprise inquiry from website ────────────────────────────
export async function submitEnterpriseInquiry(fd: FormData) {
  const svc = createServiceClient()

  const contact_name     = (fd.get('contact_name')     as string | null)?.trim() ?? ''
  const contact_email    = (fd.get('contact_email')    as string | null)?.trim() ?? ''
  const contact_phone    = (fd.get('contact_phone')    as string | null)?.trim() || null
  const company_name     = (fd.get('company_name')     as string | null)?.trim() ?? ''
  const estimated_seats  = fd.get('estimated_seats')   ? parseInt(fd.get('estimated_seats') as string, 10) : null
  const message          = (fd.get('message')          as string | null)?.trim() || null

  if (!contact_name || !contact_email || !company_name) {
    return { error: 'Name, email, and company are required.' }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact_email)) {
    return { error: 'Invalid email address.' }
  }

  const { error: insertErr } = await svc.from('enterprise_leads').insert({
    contact_name,
    contact_email,
    contact_phone,
    company_name,
    estimated_seats,
    message,
    status: 'new',
  })

  if (insertErr) return { error: insertErr.message }

  await Promise.allSettled([
    sendEnterpriseInquiryNotification({ contact_name, contact_email, contact_phone, company_name, estimated_seats, message }),
    sendEnterpriseInquiryConfirmation({ toName: contact_name, toEmail: contact_email, companyName: company_name }),
  ])

  return { success: true }
}

// ── Admin: update lead status / notes ────────────────────────────────────────
export async function updateLeadStatus(leadId: string, status: string, notes?: string) {
  await requireAdmin()
  const svc = createServiceClient()
  const { error } = await svc
    .from('enterprise_leads')
    .update({ status, ...(notes !== undefined ? { admin_notes: notes } : {}) })
    .eq('id', leadId)
  if (error) return { error: error.message }
  revalidatePath('/admin/enterprise')
  revalidatePath(`/admin/enterprise/${leadId}`)
  return { success: true }
}

// ── Admin: enroll enterprise tenant ──────────────────────────────────────────
export async function enrollEnterprise(fd: FormData) {
  const actor = await requireAdmin()
  const svc   = createServiceClient()

  const lead_id              = (fd.get('lead_id')              as string | null) || null
  const company_name         = (fd.get('company_name')         as string | null)?.trim() ?? ''
  const seats_raw            = fd.get('seats')                 as string | null
  const price_per_user_display = (fd.get('price_per_user_display') as string | null)?.trim() ?? ''
  const currency             = (fd.get('currency')             as string | null) ?? 'ZAR'
  const setup_fee_display    = (fd.get('setup_fee_display')    as string | null)?.trim() || null
  const discount_code        = (fd.get('discount_code')        as string | null)?.trim() || null
  const api_access           = fd.get('api_access') === 'true'
  const sla_path             = (fd.get('sla_path')             as string | null)?.trim() || null

  if (!company_name || !seats_raw || !price_per_user_display) {
    return { error: 'Company name, seats, and price per user are required.' }
  }

  const seats = parseInt(seats_raw, 10)
  if (isNaN(seats) || seats < 1) return { error: 'Seats must be a positive number.' }

  const { data: enrollment, error: enrollErr } = await svc
    .from('enterprise_enrollments')
    .insert({
      lead_id,
      company_name,
      seats,
      price_per_user_display,
      currency,
      setup_fee_display,
      discount_code,
      api_access,
      sla_path,
      enrolled_by: actor.email ?? actor.id,
    })
    .select()
    .single()

  if (enrollErr || !enrollment) return { error: enrollErr?.message ?? 'Failed to create enrollment.' }

  // Update lead status to enrolled
  if (lead_id) {
    await svc.from('enterprise_leads').update({
      status: 'enrolled',
      enrolled_enrollment_id: enrollment.id,
    }).eq('id', lead_id)
  }

  revalidatePath('/admin/enterprise')
  if (lead_id) revalidatePath(`/admin/enterprise/${lead_id}`)
  return { success: true, enrollmentId: enrollment.id }
}

// ── Admin: issue signed upload URL for SLA document ──────────────────────────
export async function getSlaSasUrl(filename: string) {
  const actor = await requireAdmin()
  const svc   = createServiceClient()

  const ext  = filename.split('.').pop()?.toLowerCase() ?? 'pdf'
  const allowed = ['pdf', 'doc', 'docx']
  if (!allowed.includes(ext)) return { error: 'Only PDF and Word documents are allowed.' }

  const path = `${actor.id}/${Date.now()}.${ext}`
  const { data, error } = await svc.storage
    .from('enterprise-sla')
    .createSignedUploadUrl(path, { upsert: false })

  if (error || !data) return { error: error?.message ?? 'Could not create upload URL.' }
  return { uploadUrl: data.signedUrl, path }
}

// ── Admin: propose enterprise pricing change ──────────────────────────────────
export async function proposeEnterprisePricingChange(fd: FormData) {
  const actor = await requireAdmin()
  const svc   = createServiceClient()

  const enrollment_id = fd.get('enrollment_id') as string | null
  const change_type   = fd.get('change_type')   as string | null
  const new_value     = (fd.get('new_value') as string | null)?.trim() ?? ''
  const assigned_to   = fd.get('assigned_to')   as string | null
  const notes         = (fd.get('notes') as string | null)?.trim() || null

  if (!enrollment_id || !change_type || !new_value || !assigned_to) {
    return { error: 'All fields are required.' }
  }
  if (assigned_to === actor.id) {
    return { error: 'You cannot assign the approval to yourself.' }
  }

  const enrollment = await getEnrollment(enrollment_id)
  if (!enrollment) return { error: 'Enrollment not found.' }

  const old_value =
    change_type === 'per_user'  ? enrollment.price_per_user_display :
    change_type === 'setup_fee' ? (enrollment.setup_fee_display ?? 'Not set') :
    change_type === 'seats'     ? String(enrollment.seats) : ''

  if (old_value === new_value) return { error: 'New value is the same as the current value.' }

  // Check no pending proposal of the same type for this enrollment
  const { data: existing } = await svc
    .from('enterprise_pricing_proposals')
    .select('id')
    .eq('enrollment_id', enrollment_id)
    .eq('change_type', change_type)
    .eq('status', 'pending')
    .maybeSingle()

  if (existing) return { error: 'A pending proposal for this change type already exists. Resolve it first.' }

  const { data: proposal, error: insertErr } = await svc
    .from('enterprise_pricing_proposals')
    .insert({
      enrollment_id,
      change_type,
      old_value,
      new_value,
      notes,
      proposed_by: actor.id,
      assigned_to,
    })
    .select()
    .single()

  if (insertErr || !proposal) return { error: insertErr?.message ?? 'Failed to create proposal.' }

  await svc.from('enterprise_pricing_audit_log').insert({
    proposal_id:   proposal.id,
    enrollment_id,
    change_type,
    action:        'proposed',
    old_value,
    new_value,
    actor_email:   actor.email ?? actor.id,
    notes,
  })

  const { data: approverEmail } = await svc.rpc('get_user_email_by_id', { uid: assigned_to }).maybeSingle()
  if (approverEmail) {
    await sendEnterprisePricingApprovalRequest({
      toEmail:       approverEmail as string,
      proposedBy:    actor.email ?? 'an admin',
      companyName:   enrollment.company_name,
      changeLabel:   changeTypeLabel(change_type),
      oldValue:      old_value,
      newValue:      new_value,
      notes:         notes ?? undefined,
    })
  }

  revalidatePath('/admin/enterprise')
  return { success: true }
}

// ── Admin: approve enterprise pricing proposal ────────────────────────────────
export async function approveEnterprisePricingProposal(proposalId: string) {
  const actor = await requireAdmin()
  const svc   = createServiceClient()

  const { data: proposal } = await svc
    .from('enterprise_pricing_proposals')
    .select('*')
    .eq('id', proposalId)
    .eq('status', 'pending')
    .maybeSingle()

  if (!proposal) return { error: 'Proposal not found or already actioned.' }
  if (proposal.assigned_to !== actor.id) return { error: 'You are not the assigned approver.' }
  if (proposal.proposed_by === actor.id) return { error: 'You cannot approve your own proposal.' }

  // Apply change to enrollment
  const updateField =
    proposal.change_type === 'per_user'  ? { price_per_user_display: proposal.new_value } :
    proposal.change_type === 'setup_fee' ? { setup_fee_display: proposal.new_value } :
    proposal.change_type === 'seats'     ? { seats: parseInt(proposal.new_value, 10) } :
    null

  if (updateField) {
    await svc.from('enterprise_enrollments').update(updateField).eq('id', proposal.enrollment_id)
  }

  await svc.from('enterprise_pricing_proposals')
    .update({ status: 'approved', actioned_by: actor.id, actioned_at: new Date().toISOString() })
    .eq('id', proposalId)

  await svc.from('enterprise_pricing_audit_log').insert({
    proposal_id:   proposalId,
    enrollment_id: proposal.enrollment_id,
    change_type:   proposal.change_type,
    action:        'approved',
    old_value:     proposal.old_value,
    new_value:     proposal.new_value,
    actor_email:   actor.email ?? actor.id,
    notes:         proposal.notes,
  })

  const { data: proposerEmail } = await svc.rpc('get_user_email_by_id', { uid: proposal.proposed_by }).maybeSingle()
  if (proposerEmail) {
    const enrollment = await getEnrollment(proposal.enrollment_id)
    await sendEnterprisePricingDecisionNotification({
      toEmail:     proposerEmail as string,
      decision:    'approved',
      companyName: enrollment?.company_name ?? 'Enterprise tenant',
      changeLabel: changeTypeLabel(proposal.change_type),
      newValue:    proposal.new_value,
    })
  }

  revalidatePath('/admin/enterprise')
  return { success: true }
}

// ── Admin: reject enterprise pricing proposal ─────────────────────────────────
export async function rejectEnterprisePricingProposal(proposalId: string, reason?: string) {
  const actor = await requireAdmin()
  const svc   = createServiceClient()

  const { data: proposal } = await svc
    .from('enterprise_pricing_proposals')
    .select('*')
    .eq('id', proposalId)
    .eq('status', 'pending')
    .maybeSingle()

  if (!proposal) return { error: 'Proposal not found or already actioned.' }
  if (proposal.assigned_to !== actor.id) return { error: 'You are not the assigned approver.' }

  await svc.from('enterprise_pricing_proposals')
    .update({ status: 'rejected', actioned_by: actor.id, actioned_at: new Date().toISOString() })
    .eq('id', proposalId)

  await svc.from('enterprise_pricing_audit_log').insert({
    proposal_id:   proposalId,
    enrollment_id: proposal.enrollment_id,
    change_type:   proposal.change_type,
    action:        'rejected',
    old_value:     proposal.old_value,
    new_value:     proposal.new_value,
    actor_email:   actor.email ?? actor.id,
    notes:         reason ?? proposal.notes,
  })

  const { data: proposerEmail } = await svc.rpc('get_user_email_by_id', { uid: proposal.proposed_by }).maybeSingle()
  if (proposerEmail) {
    const enrollment = await getEnrollment(proposal.enrollment_id)
    await sendEnterprisePricingDecisionNotification({
      toEmail:     proposerEmail as string,
      decision:    'rejected',
      companyName: enrollment?.company_name ?? 'Enterprise tenant',
      changeLabel: changeTypeLabel(proposal.change_type),
      newValue:    proposal.new_value,
    })
  }

  revalidatePath('/admin/enterprise')
  return { success: true }
}
