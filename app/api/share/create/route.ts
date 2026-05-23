import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ALLOWED_CHANNELS = new Set([
  'qr', 'nfc', 'copy_link', 'email_sig', 'direct', 'unknown',
])

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Bad request' }, { status: 400 })

  const { cardId, channelType = 'unknown' } = body
  if (!cardId) return NextResponse.json({ error: 'cardId required' }, { status: 400 })

  const channel = ALLOWED_CHANNELS.has(channelType) ? channelType : 'unknown'
  const service = createServiceClient()

  // Verify card belongs to this user's subscriber
  const { data: sub } = await service
    .from('subscribers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: card } = await service
    .from('cards')
    .select('id, slug')
    .eq('id', cardId)
    .eq('subscriber_id', sub.id)
    .single()

  if (!card) return NextResponse.json({ error: 'Card not found' }, { status: 404 })

  // Generate a 12-char hex token — 16^12 ≈ 281 trillion combinations
  const token = crypto.randomUUID().replace(/-/g, '').slice(0, 12)

  const { error } = await service.from('share_links').insert({
    share_token:    token,
    card_id:        card.id,
    subscriber_id:  sub.id,
    channel_type:   channel,
    source_context: 'direct_send',
    forward_depth:  0,
  })

  if (error) {
    return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 })
  }

  return NextResponse.json({ token })
}
