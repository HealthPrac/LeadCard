import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const PLAN_CAPS: Record<string, number> = {
  solo: 1,
  small: 5,
  enterprise: Infinity,
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { name, title, email, mobile, slug, isAdmin } = body as {
      name: string
      title?: string
      email?: string
      mobile?: string
      slug: string
      isAdmin?: boolean
    }

    if (!name?.trim() || !slug?.trim()) {
      return NextResponse.json({ error: 'Name and URL are required.' }, { status: 400 })
    }

    const service = createServiceClient()

    // Get subscriber + plan
    const { data: subscriber } = await service
      .from('subscribers')
      .select('id, plan, email')
      .eq('user_id', user.id)
      .single()
    if (!subscriber) return NextResponse.json({ error: 'Subscriber not found.' }, { status: 403 })

    const cap = PLAN_CAPS[subscriber.plan] ?? 1
    if (cap === 1) {
      return NextResponse.json({ error: 'Solo plan cannot add team members.' }, { status: 403 })
    }

    // Count existing cards
    const { count } = await service
      .from('cards')
      .select('id', { count: 'exact', head: true })
      .eq('subscriber_id', subscriber.id)

    if ((count ?? 0) >= cap) {
      return NextResponse.json({
        error: `Your ${subscriber.plan} plan is limited to ${cap} cards. Upgrade to add more.`,
      }, { status: 403 })
    }

    // Slug availability check
    const { data: taken } = await service
      .from('cards')
      .select('id')
      .eq('slug', slug.trim())
      .maybeSingle()
    if (taken) return NextResponse.json({ error: `The URL /${slug} is already taken.` }, { status: 409 })

    // Inherit brand from owner card (first card, ordered by created_at)
    const { data: ownerCard } = await service
      .from('cards')
      .select('theme_bg, theme_fg, theme_accent, theme_font, logo_path, company, website, lead_destination_email, industry')
      .eq('subscriber_id', subscriber.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    const { data: newCard, error: insertErr } = await service
      .from('cards')
      .insert({
        subscriber_id: subscriber.id,
        slug: slug.trim(),
        display_name: name.trim(),
        title: title?.trim() ?? null,
        company: ownerCard?.company ?? null,
        website: ownerCard?.website ?? null,
        email: email?.trim() ?? subscriber.email,
        mobile: mobile ?? null,
        lead_destination_email: ownerCard?.lead_destination_email ?? subscriber.email,
        is_published: true,
        is_account_admin: isAdmin === true,
        // Inherit shared brand
        theme_bg: ownerCard?.theme_bg ?? '#17181C',
        theme_fg: ownerCard?.theme_fg ?? '#F6F7F3',
        theme_accent: ownerCard?.theme_accent ?? '#8FAF9D',
        theme_font: ownerCard?.theme_font ?? 'serif',
        logo_path: ownerCard?.logo_path ?? null,
        industry: ownerCard?.industry ?? null,
      })
      .select('id, slug, display_name')
      .single()

    if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })

    return NextResponse.json({ card: newCard })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
