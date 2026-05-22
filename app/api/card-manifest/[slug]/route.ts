import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params
  const supabase = createServiceClient()

  const { data: card } = await supabase
    .from('cards')
    .select('display_name, company, theme_bg, theme_accent, slug')
    .eq('slug', slug)
    .single()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://leadcard.app'
  const name = card
    ? [card.display_name, card.company].filter(Boolean).join(' · ')
    : 'LeadCard'
  const shortName = card?.company ?? card?.display_name ?? 'LeadCard'

  const manifest = {
    name,
    short_name: shortName,
    display: 'standalone',
    start_url: `${appUrl}/c/${slug}`,
    background_color: card?.theme_bg ?? '#f5f0e8',
    theme_color: card?.theme_accent ?? '#8aad8a',
    icons: [
      {
        src: `${appUrl}/api/card-icon/${slug}`,
        sizes: 'any',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  }

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
