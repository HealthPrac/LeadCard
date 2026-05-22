import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/email/resend'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const body = await req.json()
  const { plan, display_name, title, company, email, mobile, website, slug, theme_bg, theme_fg, theme_accent, lead_destination_email } = body

  if (!display_name?.trim() || !slug?.trim()) {
    return NextResponse.json({ error: 'Name and slug are required.' }, { status: 400 })
  }

  const service = createServiceClient()

  // Idempotent — if subscriber already exists just get it
  let subscriberId: string
  const { data: existing } = await service
    .from('subscribers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    subscriberId = existing.id
  } else {
    const { data: sub, error: subErr } = await service
      .from('subscribers')
      .insert({ user_id: user.id, email: user.email!, plan: plan ?? 'solo' })
      .select('id')
      .single()

    if (subErr) return NextResponse.json({ error: subErr.message }, { status: 500 })
    subscriberId = sub.id
  }

  // Check slug availability
  const { data: taken } = await service
    .from('cards')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (taken) return NextResponse.json({ error: 'That slug is already taken.' }, { status: 409 })

  // Create the first card, published immediately
  const { data: card, error: cardErr } = await service
    .from('cards')
    .insert({
      subscriber_id: subscriberId,
      slug,
      display_name,
      title,
      company,
      email,
      mobile,
      website,
      theme_bg,
      theme_fg,
      theme_accent,
      lead_destination_email,
      is_published: true,
    })
    .select('id, slug')
    .single()

  if (cardErr) return NextResponse.json({ error: cardErr.message }, { status: 500 })

  // Welcome email — non-blocking
  if (user.email) {
    sendWelcomeEmail({
      toEmail: user.email,
      toName: display_name,
      slug: card.slug,
    }).catch(e => console.error('Welcome email failed:', e))
  }

  return NextResponse.json({ cardId: card.id, slug: card.slug })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? String(e) }, { status: 500 })
  }
}
