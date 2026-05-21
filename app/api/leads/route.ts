import { createServiceClient } from '@/lib/supabase/server'
import { sendLeadNotification, sendLeadConfirmation } from '@/lib/email/resend'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()
  const { cardId, firstName, lastName, email, org, role, mobile, message, source } = body

  if (!cardId || !email) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Fetch the card — validates it exists and is published
  const { data: card } = await supabase
    .from('cards')
    .select('id, subscriber_id, slug, display_name, company, email, lead_destination_email, form_fields, is_published')
    .eq('id', cardId)
    .eq('is_published', true)
    .single()

  if (!card) return NextResponse.json({ error: 'Card not found.' }, { status: 404 })

  // Insert the lead — service role, no auth required for this endpoint
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
  const ua = req.headers.get('user-agent') ?? null

  const { error: insertErr } = await supabase.from('leads').insert({
    card_id: card.id,
    subscriber_id: card.subscriber_id,
    first_name: firstName ?? null,
    last_name: lastName ?? null,
    email,
    org: org ?? null,
    role: role ?? null,
    mobile: mobile ?? null,
    message: message ?? null,
    source: source ?? 'direct',
    ip_address: ip,
    user_agent: ua,
    consented_at: new Date().toISOString(),
  })

  if (insertErr) {
    console.error('Lead insert error:', insertErr.message)
    return NextResponse.json({ error: 'Failed to save lead.' }, { status: 500 })
  }

  // Fire emails — non-blocking failures (log but don't error)
  const destination = card.lead_destination_email ?? card.email
  if (destination) {
    sendLeadNotification({
      cardOwnerName: card.display_name ?? 'LeadCard subscriber',
      cardOwnerEmail: destination,
      cardCompany: card.company,
      cardSlug: card.slug,
      firstName: firstName ?? null,
      lastName: lastName ?? null,
      email,
      org: org ?? null,
      role: role ?? null,
      mobile: mobile ?? null,
      message: message ?? null,
      source: source ?? null,
    }).catch(e => console.error('Lead notification email failed:', e))
  }

  if (email && firstName) {
    sendLeadConfirmation({
      toEmail: email,
      toName: firstName,
      ownerName: card.display_name ?? 'the card owner',
      ownerCompany: card.company,
    }).catch(e => console.error('Lead confirmation email failed:', e))
  }

  return NextResponse.json({ ok: true })
}
