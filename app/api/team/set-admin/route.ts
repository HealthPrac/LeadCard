import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { cardId, isAdmin } = await req.json() as { cardId: string; isAdmin: boolean }
    if (!cardId) return NextResponse.json({ error: 'cardId required' }, { status: 400 })

    const service = createServiceClient()

    // Verify the caller owns this subscriber account
    const { data: subscriber } = await service
      .from('subscribers')
      .select('id, plan')
      .eq('user_id', user.id)
      .single()
    if (!subscriber) return NextResponse.json({ error: 'Not a subscriber' }, { status: 403 })

    // Solo plan cannot have admins
    if (subscriber.plan === 'solo') {
      return NextResponse.json({ error: 'Admin roles are available on Small Business and Enterprise plans.' }, { status: 403 })
    }

    // Confirm the card belongs to this subscriber
    const { data: card } = await service
      .from('cards')
      .select('id')
      .eq('id', cardId)
      .eq('subscriber_id', subscriber.id)
      .maybeSingle()
    if (!card) return NextResponse.json({ error: 'Card not found' }, { status: 404 })

    await service.from('cards').update({ is_account_admin: isAdmin }).eq('id', cardId)

    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
