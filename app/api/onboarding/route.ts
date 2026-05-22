import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/email/resend'
import { NextResponse } from 'next/server'

interface BrandPayload {
  companyName: string
  companyWebsite: string
  themeBg: string
  themeFg: string
  themeAccent: string
  themeFont: string
}

interface PersonPayload {
  name: string
  title?: string
  company?: string
  website?: string
  mobile?: string
  email?: string
  slug: string
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

    const body = await req.json()
    const { plan, email, brand, persons } = body as {
      plan: string
      email: string
      brand: BrandPayload | null
      persons: PersonPayload[]
    }

    const activePeople = (persons ?? []).filter(p => p.name?.trim() && p.slug?.trim())
    if (activePeople.length === 0) {
      return NextResponse.json({ error: 'At least one person with a name and URL is required.' }, { status: 400 })
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

    // Check all slugs in one query
    const slugs = activePeople.map(p => p.slug)
    const { data: takenRows } = await service
      .from('cards')
      .select('slug')
      .in('slug', slugs)

    const takenSlugs = (takenRows ?? []).map((r: { slug: string }) => r.slug)
    if (takenSlugs.length > 0) {
      return NextResponse.json({ error: `These URLs are already taken: ${takenSlugs.join(', ')}` }, { status: 409 })
    }

    // Brand settings — shared across all cards for this subscriber
    const sharedTheme = brand
      ? { theme_bg: brand.themeBg, theme_fg: brand.themeFg, theme_accent: brand.themeAccent, theme_font: brand.themeFont }
      : {}

    // Create all cards
    const inserts = activePeople.map(p => ({
      subscriber_id: subscriberId,
      slug: p.slug,
      display_name: p.name,
      title: p.title ?? null,
      company: brand?.companyName ?? p.company ?? null,
      website: brand?.companyWebsite ?? p.website ?? null,
      email: p.email ?? email ?? null,
      mobile: p.mobile ?? null,
      lead_destination_email: email ?? null,
      is_published: true,
      ...sharedTheme,
    }))

    const { data: cards, error: cardErr } = await service
      .from('cards')
      .insert(inserts)
      .select('id, slug')

    if (cardErr) return NextResponse.json({ error: cardErr.message }, { status: 500 })

    // Welcome email for the account owner — non-blocking
    const firstCard = cards?.[0]
    if (user.email && firstCard) {
      sendWelcomeEmail({
        toEmail: user.email,
        toName: activePeople[0].name,
        slug: firstCard.slug,
      }).catch(e => console.error('Welcome email failed:', e))
    }

    return NextResponse.json({
      cardId: firstCard?.id,
      cardIds: (cards ?? []).map(c => c.id),
      slug: firstCard?.slug,
      count: cards?.length ?? 0,
    })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
