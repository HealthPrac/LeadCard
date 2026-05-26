'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from './gate'
import { sendPricingApprovalRequest, sendPricingDecisionNotification } from '@/lib/email/resend'
import { planLabel } from './pricing-queries'

// ── Propose a price change ────────────────────────────────────────────────────
export async function proposePriceChange(fd: FormData) {
  const actor = await requireAdmin()
  const svc   = createServiceClient()

  const plan_key    = fd.get('plan_key')    as string
  const currency    = fd.get('currency')    as string
  const new_price   = fd.get('new_price')   as string
  const assigned_to = fd.get('assigned_to') as string
  const notes       = (fd.get('notes') as string | null) ?? null

  if (!plan_key || !currency || !new_price || !assigned_to) {
    return { error: 'All fields are required.' }
  }
  if (assigned_to === actor.id) {
    return { error: 'You cannot assign the approval to yourself.' }
  }

  // Get current price
  const { data: current } = await svc
    .from('pricing_current')
    .select('price')
    .eq('plan_key', plan_key)
    .eq('currency', currency)
    .maybeSingle()

  if (!current) return { error: 'Invalid plan or currency.' }

  const old_price = current.price

  if (old_price === new_price) {
    return { error: 'New price is the same as the current price.' }
  }

  // Check no other pending proposal for same plan+currency
  const { data: existing } = await svc
    .from('pricing_proposals')
    .select('id')
    .eq('plan_key', plan_key)
    .eq('currency', currency)
    .eq('status', 'pending')
    .maybeSingle()

  if (existing) {
    return { error: 'There is already a pending proposal for this plan and currency. Resolve it first.' }
  }

  // Insert proposal
  const { data: proposal, error: insertErr } = await svc
    .from('pricing_proposals')
    .insert({ plan_key, currency, old_price, new_price, notes, proposed_by: actor.id, assigned_to })
    .select()
    .single()

  if (insertErr || !proposal) return { error: insertErr?.message ?? 'Failed to create proposal.' }

  // Audit log
  await svc.from('pricing_audit_log').insert({
    proposal_id: proposal.id,
    plan_key,
    currency,
    action:      'proposed',
    old_price,
    new_price,
    actor_email: actor.email ?? actor.id,
    notes,
  })

  // Email the approver
  const { data: approverData } = await svc.rpc('get_user_email_by_id', { uid: assigned_to }).maybeSingle()
  const approverEmail = (approverData as string | null) ?? ''

  if (approverEmail) {
    await sendPricingApprovalRequest({
      toEmail:     approverEmail,
      proposedBy:  actor.email ?? 'an admin',
      planLabel:   planLabel(plan_key),
      currency,
      oldPrice:    old_price,
      newPrice:    new_price,
      notes:       notes ?? undefined,
      proposalId:  proposal.id,
    })
  }

  revalidatePath('/admin/pricing')
  return { success: true }
}

// ── Approve ───────────────────────────────────────────────────────────────────
export async function approveProposal(proposalId: string) {
  const actor = await requireAdmin()
  const svc   = createServiceClient()

  const { data: proposal } = await svc
    .from('pricing_proposals')
    .select('*')
    .eq('id', proposalId)
    .eq('status', 'pending')
    .maybeSingle()

  if (!proposal) return { error: 'Proposal not found or already actioned.' }
  if (proposal.assigned_to !== actor.id) return { error: 'You are not the assigned approver.' }
  if (proposal.proposed_by === actor.id) return { error: 'You cannot approve your own proposal.' }

  // Update live price
  const { error: priceErr } = await svc
    .from('pricing_current')
    .update({ price: proposal.new_price, updated_at: new Date().toISOString(), updated_by: actor.id })
    .eq('plan_key', proposal.plan_key)
    .eq('currency', proposal.currency)

  if (priceErr) return { error: priceErr.message }

  // Update proposal status
  await svc
    .from('pricing_proposals')
    .update({ status: 'approved', actioned_by: actor.id, actioned_at: new Date().toISOString() })
    .eq('id', proposalId)

  // Audit log
  await svc.from('pricing_audit_log').insert({
    proposal_id:  proposalId,
    plan_key:     proposal.plan_key,
    currency:     proposal.currency,
    action:       'approved',
    old_price:    proposal.old_price,
    new_price:    proposal.new_price,
    actor_email:  actor.email ?? actor.id,
    notes:        proposal.notes,
  })

  // Notify proposer
  const { data: proposerEmail } = await svc.rpc('get_user_email_by_id', { uid: proposal.proposed_by }).maybeSingle()
  if (proposerEmail) {
    await sendPricingDecisionNotification({
      toEmail:   proposerEmail as string,
      decision:  'approved',
      planLabel: planLabel(proposal.plan_key),
      currency:  proposal.currency,
      newPrice:  proposal.new_price,
    })
  }

  revalidatePath('/admin/pricing')
  revalidatePath('/')
  return { success: true }
}

// ── Reject ────────────────────────────────────────────────────────────────────
export async function rejectProposal(proposalId: string, reason?: string) {
  const actor = await requireAdmin()
  const svc   = createServiceClient()

  const { data: proposal } = await svc
    .from('pricing_proposals')
    .select('*')
    .eq('id', proposalId)
    .eq('status', 'pending')
    .maybeSingle()

  if (!proposal) return { error: 'Proposal not found or already actioned.' }
  if (proposal.assigned_to !== actor.id) return { error: 'You are not the assigned approver.' }

  await svc
    .from('pricing_proposals')
    .update({ status: 'rejected', actioned_by: actor.id, actioned_at: new Date().toISOString() })
    .eq('id', proposalId)

  await svc.from('pricing_audit_log').insert({
    proposal_id: proposalId,
    plan_key:    proposal.plan_key,
    currency:    proposal.currency,
    action:      'rejected',
    old_price:   proposal.old_price,
    new_price:   proposal.new_price,
    actor_email: actor.email ?? actor.id,
    notes:       reason ?? proposal.notes,
  })

  // Notify proposer
  const { data: proposerEmail } = await svc.rpc('get_user_email_by_id', { uid: proposal.proposed_by }).maybeSingle()
  if (proposerEmail) {
    await sendPricingDecisionNotification({
      toEmail:   proposerEmail as string,
      decision:  'rejected',
      planLabel: planLabel(proposal.plan_key),
      currency:  proposal.currency,
      newPrice:  proposal.new_price,
    })
  }

  revalidatePath('/admin/pricing')
  return { success: true }
}
