import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import {
  sendCancellationAdminNotification,
  sendCancellationSubscriberConfirmation,
  sendRevocationConfirmation,
} from '@/lib/email/resend'

type RequestType = 'cancel' | 'delete' | 'revoke'

/** Last day of a given month (month is 0-indexed). */
function lastDayOfMonth(year: number, month: number): Date {
  return new Date(year, month + 1, 0)
}

/** Effective end date based on 15th-of-month cut-off rule. */
function calcEffectiveDate(): { date: Date; pastCutoff: boolean } {
  const today = new Date()
  const pastCutoff = today.getDate() >= 15
  const date = pastCutoff
    ? lastDayOfMonth(today.getFullYear(), today.getMonth() + 1) // end of NEXT month
    : lastDayOfMonth(today.getFullYear(), today.getMonth())     // end of THIS month
  return { date, pastCutoff }
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const type: RequestType = body.type

  if (!['cancel', 'delete', 'revoke'].includes(type)) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }

  const { data: subscriber } = await supabase
    .from('subscribers')
    .select('id, plan, subscription_status, effective_end_date')
    .eq('user_id', user.id)
    .single()

  if (!subscriber) return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 })

  const svc = createServiceClient()
  const email = user.email ?? ''

  // ── Revoke ────────────────────────────────────────────────────────────────
  if (type === 'revoke') {
    if (!['canceling', 'pending_deletion'].includes(subscriber.subscription_status)) {
      return NextResponse.json({ error: 'No pending cancellation to revoke' }, { status: 400 })
    }

    // Restore to active (or trialing — use active; trialing window has likely passed by now)
    await svc.from('subscribers').update({
      subscription_status: 'active',
      cancellation_requested_at: null,
      effective_end_date: null,
    }).eq('id', subscriber.id)

    // Mark latest pending record revoked
    await svc
      .from('account_cancellations')
      .update({ status: 'revoked' })
      .eq('subscriber_id', subscriber.id)
      .eq('status', 'pending')

    await Promise.allSettled([
      sendRevocationConfirmation({ toEmail: email }),
    ])

    return NextResponse.json({ success: true, action: 'revoked' })
  }

  // ── Cancel or Delete ──────────────────────────────────────────────────────
  if (!['trialing', 'active', 'canceling', 'pending_deletion'].includes(subscriber.subscription_status)) {
    return NextResponse.json({ error: 'Account is not in a cancellable state' }, { status: 400 })
  }

  const { date: effectiveDate, pastCutoff } = calcEffectiveDate()
  const effectiveDateStr = effectiveDate.toISOString().slice(0, 10) // YYYY-MM-DD

  const newStatus = type === 'cancel' ? 'canceling' : 'pending_deletion'

  await svc.from('subscribers').update({
    subscription_status: newStatus,
    cancellation_requested_at: new Date().toISOString(),
    effective_end_date: effectiveDateStr,
  }).eq('id', subscriber.id)

  await svc.from('account_cancellations').insert({
    subscriber_id: subscriber.id,
    subscriber_email: email,
    request_type: type,
    effective_date: effectiveDateStr,
    status: 'pending',
  })

  // Format effective date for emails
  const effectiveDateDisplay = effectiveDate.toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  await Promise.allSettled([
    sendCancellationAdminNotification({
      subscriberEmail: email,
      requestType: type,
      effectiveDate: effectiveDateDisplay,
      pastCutoff,
    }),
    sendCancellationSubscriberConfirmation({
      toEmail: email,
      requestType: type,
      effectiveDate: effectiveDateDisplay,
      pastCutoff,
    }),
  ])

  return NextResponse.json({
    success: true,
    effectiveDate: effectiveDateStr,
    effectiveDateDisplay,
    pastCutoff,
  })
}
