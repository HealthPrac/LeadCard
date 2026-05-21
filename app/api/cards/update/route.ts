import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ALLOWED_FIELDS = new Set([
  'display_name', 'title', 'company', 'email', 'mobile', 'website',
  'welcome_headline', 'welcome_body',
  'cta_primary_label', 'cta_primary_url', 'cta_secondary_label', 'cta_secondary_url',
  'form_fields', 'lead_destination_email',
  'links',
  'theme_bg', 'theme_fg', 'theme_accent',
  'photo_path', 'logo_path', 'video_path',
  'is_published',
])

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { cardId, ...rest } = body

  if (!cardId) return NextResponse.json({ error: 'cardId required' }, { status: 400 })

  // Verify the card belongs to this user's subscriber
  const { data: subscriber } = await supabase.from('subscribers').select('id').eq('user_id', user.id).single()
  if (!subscriber) return NextResponse.json({ error: 'Subscriber not found' }, { status: 403 })

  const { data: card } = await supabase.from('cards').select('id').eq('id', cardId).eq('subscriber_id', subscriber.id).single()
  if (!card) return NextResponse.json({ error: 'Card not found' }, { status: 404 })

  // Only allow whitelisted fields
  const update: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(rest)) {
    if (ALLOWED_FIELDS.has(key)) update[key] = value
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ ok: true })
  }

  const { error } = await supabase.from('cards').update(update).eq('id', cardId)
  if (error) {
    console.error('Card update error:', error.message)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
