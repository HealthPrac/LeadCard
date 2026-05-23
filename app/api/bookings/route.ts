import { createServiceClient } from '@/lib/supabase/server'
import { sendLeadNotification } from '@/lib/email/resend'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()
  const { cardId, firstName, lastName, email, mobile } = body

  if (!cardId) return NextResponse.json({ error: 'Missing cardId.' }, { status: 400 })

  const supabase = createServiceClient()

  const { data: card } = await supabase
    .from('cards')
    .select('id, subscriber_id, slug, display_name, company, email, lead_destination_email, is_published')
    .eq('id', cardId)
    .eq('is_published', true)
    .single()

  if (!card) return NextResponse.json({ error: 'Card not found.' }, { status: 404 })

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
  const ua = req.headers.get('user-agent') ?? null

  const { data: lead, error: insertErr } = await supabase
    .from('leads')
    .insert({
      card_id: card.id,
      subscriber_id: card.subscriber_id,
      first_name: firstName ?? null,
      last_name: lastName ?? null,
      email: email ?? null,
      mobile: mobile ?? null,
      source: 'booking',
      ip_address: ip,
      user_agent: ua,
      consented_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (insertErr) {
    console.error('Booking insert error:', insertErr.message)
    return NextResponse.json({ error: 'Failed to record booking.' }, { status: 500 })
  }

  if (email) {
    const destination = card.lead_destination_email ?? card.email
    if (destination) {
      sendLeadNotification({
        cardOwnerName: card.display_name ?? 'Card subscriber',
        cardOwnerEmail: destination,
        cardCompany: card.company,
        cardSlug: card.slug,
        firstName: firstName ?? null,
        lastName: lastName ?? null,
        email,
        org: null,
        role: null,
        mobile: mobile ?? null,
        message: null,
        source: 'booking',
      }).catch(e => console.error('Booking notification email failed:', e))
    }
  }

  return NextResponse.json({ ok: true, leadId: lead?.id ?? null })
}
