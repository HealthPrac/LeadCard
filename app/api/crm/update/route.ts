import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ALLOWED_FIELDS = [
  'status', 'first_engaged_at', 'converted_to_prospect_at', 'converted_to_client_at',
  'estimated_income_cents', 'actual_income_cents', 'satisfaction_score',
  'industry', 'private_notes', 'experience_notes',
] as const

export async function POST(req: Request) {
  try {
    const body = await req.json() as Record<string, unknown>
    const { lead_id, token } = body

    if (!lead_id || typeof lead_id !== 'string') {
      return NextResponse.json({ error: 'lead_id required' }, { status: 400 })
    }

    const service = createServiceClient()
    let cardId: string
    let subscriberId: string

    if (token && typeof token === 'string') {
      // Magic-link auth path
      const { data: tokenRow } = await service
        .from('card_holder_tokens')
        .select('card_id, subscriber_id')
        .eq('token', token)
        .eq('is_active', true)
        .single()

      if (!tokenRow) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })

      cardId = tokenRow.card_id
      subscriberId = tokenRow.subscriber_id

      // Verify lead belongs to this card
      const { data: lead } = await service
        .from('leads')
        .select('card_id')
        .eq('id', lead_id)
        .eq('card_id', cardId)
        .single()
      if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

      // Touch last_accessed_at (fire-and-forget)
      service.from('card_holder_tokens')
        .update({ last_accessed_at: new Date().toISOString() })
        .eq('token', token)
        .then(() => {})
    } else {
      // Owner session auth path
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

      const { data: subscriber } = await service
        .from('subscribers')
        .select('id')
        .eq('user_id', user.id)
        .single()
      if (!subscriber) return NextResponse.json({ error: 'Subscriber not found' }, { status: 403 })

      subscriberId = subscriber.id

      const { data: lead } = await service
        .from('leads')
        .select('card_id')
        .eq('id', lead_id)
        .eq('subscriber_id', subscriberId)
        .single()
      if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

      cardId = lead.card_id as string
    }

    // Build update payload from allowlist only
    const update: Record<string, unknown> = { card_id: cardId, subscriber_id: subscriberId }
    for (const field of ALLOWED_FIELDS) {
      if (field in body) update[field] = body[field]
    }

    const { data, error } = await service
      .from('lead_crm')
      .upsert({ lead_id, ...update }, { onConflict: 'lead_id' })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ crm: data })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
