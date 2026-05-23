import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()
  const { cardId, rating, comment, sessionId } = body

  if (!cardId || !rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const supabase = createServiceClient()

  const { data: card } = await supabase
    .from('cards')
    .select('subscriber_id')
    .eq('id', cardId)
    .eq('is_published', true)
    .single()

  if (!card) return NextResponse.json({ error: 'Card not found' }, { status: 404 })

  const { error } = await supabase.from('service_ratings').insert({
    card_id: cardId,
    subscriber_id: card.subscriber_id,
    session_id: sessionId ?? null,
    rating,
    comment: comment?.trim() || null,
  })

  if (error) {
    console.error('Rating insert error:', error.message)
    return NextResponse.json({ error: 'Failed to save rating' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
