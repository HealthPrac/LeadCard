import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { PromoCode, Subscriber } from '@/lib/supabase/types'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { code } = await req.json()
  if (!code?.trim()) return NextResponse.json({ error: 'Code is required.' }, { status: 400 })

  const service = createServiceClient()

  // Get subscriber
  const { data: subscriberData } = await service
    .from('subscribers')
    .select('id, promo_code_id, subscription_status')
    .eq('user_id', user.id)
    .single() as unknown as { data: Pick<Subscriber, 'id' | 'promo_code_id' | 'subscription_status'> | null }
  if (!subscriberData) return NextResponse.json({ error: 'Subscriber not found.' }, { status: 404 })
  if (subscriberData.promo_code_id) return NextResponse.json({ error: 'You have already redeemed a promo code.' }, { status: 409 })

  // Look up code
  const { data: promo } = await service
    .from('promo_codes' as never)
    .select('*')
    .eq('code', code.trim().toUpperCase())
    .eq('is_active', true)
    .single() as unknown as { data: PromoCode | null }

  if (!promo) return NextResponse.json({ error: 'Invalid or inactive promo code.' }, { status: 404 })
  if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This promo code has expired.' }, { status: 410 })
  }
  if (promo.max_uses !== null && promo.uses_count >= promo.max_uses) {
    return NextResponse.json({ error: 'This promo code has reached its usage limit.' }, { status: 410 })
  }

  // Record redemption
  const { error: redemptionError } = await service
    .from('promo_code_redemptions' as never)
    .insert({ code_id: promo.id, subscriber_id: subscriberData.id } as never)
  if (redemptionError) return NextResponse.json({ error: 'Failed to redeem code.' }, { status: 500 })

  // Increment usage count
  await service
    .from('promo_codes' as never)
    .update({ uses_count: promo.uses_count + 1 } as never)
    .eq('id', promo.id)

  // Update subscriber
  const subscriberUpdate: Record<string, unknown> = { promo_code_id: promo.id }
  if (promo.discount_type === 'free') {
    subscriberUpdate.subscription_status = 'active'
  }
  await service.from('subscribers').update(subscriberUpdate as never).eq('id', subscriberData.id)

  return NextResponse.json({
    success: true,
    discount_type: promo.discount_type,
    discount_percent: promo.discount_percent,
    description: promo.description,
  })
}
