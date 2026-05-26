import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendPlanChangeAdminNotification, sendPlanChangeSubscriberConfirmation } from '@/lib/email/resend'

const VALID_PLANS = ['solo', 'small', 'enterprise'] as const
type Plan = typeof VALID_PLANS[number]

const PLAN_ORDER: Record<Plan, number> = { solo: 0, small: 1, enterprise: 2 }
const PLAN_LABELS: Record<Plan, string> = { solo: 'Solo', small: 'Small Business', enterprise: 'Enterprise' }
const PLAN_PRICES: Record<Plan, string> = { solo: 'R 69/mo', small: 'R 199/mo', enterprise: 'Custom' }

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const newPlan = body.plan as Plan
  if (!VALID_PLANS.includes(newPlan)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const { data: subscriber } = await supabase
    .from('subscribers')
    .select('id, plan, email')
    .eq('user_id', user.id)
    .single()
  if (!subscriber) return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 })

  const oldPlan = subscriber.plan as Plan
  if (oldPlan === newPlan) return NextResponse.json({ error: 'Already on this plan' }, { status: 400 })

  // Enterprise downgrade must go through admin
  if (oldPlan === 'enterprise') {
    return NextResponse.json({ requiresAdminContact: true })
  }

  // Upgrade to enterprise requires inquiry flow
  if (newPlan === 'enterprise') {
    return NextResponse.json({ requiresInquiry: true })
  }

  // Remaining cases: solo ↔ small
  const svc = createServiceClient()
  let cardsUnpublished = 0

  // Downgrading to solo: unpublish all non-owner cards
  if (newPlan === 'solo') {
    const { data: extraCards } = await svc
      .from('cards')
      .select('id')
      .eq('subscriber_id', subscriber.id)
      .eq('is_owner_card', false)

    if (extraCards && extraCards.length > 0) {
      await svc
        .from('cards')
        .update({ is_published: false })
        .eq('subscriber_id', subscriber.id)
        .eq('is_owner_card', false)
      cardsUnpublished = extraCards.length
    }
  }

  // Update plan
  await svc.from('subscribers').update({ plan: newPlan }).eq('id', subscriber.id)

  // Audit log
  await svc.from('plan_change_history').insert({
    subscriber_id: subscriber.id,
    subscriber_email: user.email ?? '',
    from_plan: oldPlan,
    to_plan: newPlan,
    cards_unpublished: cardsUnpublished,
    status: 'pending_billing',
  })

  // Emails — fire-and-forget
  await Promise.allSettled([
    sendPlanChangeAdminNotification({
      subscriberEmail: user.email ?? '',
      fromPlan: PLAN_LABELS[oldPlan],
      toPlan: PLAN_LABELS[newPlan],
      fromPrice: PLAN_PRICES[oldPlan],
      toPrice: PLAN_PRICES[newPlan],
      cardsUnpublished,
    }),
    sendPlanChangeSubscriberConfirmation({
      toEmail: user.email ?? '',
      fromPlan: PLAN_LABELS[oldPlan],
      toPlan: PLAN_LABELS[newPlan],
      toPrice: PLAN_PRICES[newPlan],
      cardsUnpublished,
    }),
  ])

  return NextResponse.json({ success: true, newPlan, cardsUnpublished })
}
