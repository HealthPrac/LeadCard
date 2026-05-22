import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params
  const supabase = createServiceClient()

  const { data: card } = await supabase
    .from('cards')
    .select('logo_path')
    .eq('slug', slug)
    .single()

  if (card?.logo_path) {
    const { data: signedData } = await supabase.storage
      .from('card-assets')
      .createSignedUrl(card.logo_path, 3600)

    if (signedData?.signedUrl) {
      const imgRes = await fetch(signedData.signedUrl)
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer()
        const contentType = imgRes.headers.get('content-type') ?? 'image/png'
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
          },
        })
      }
    }
  }

  // Fallback: serve the LeadCard emblem SVG
  const svgPath = join(process.cwd(), 'public', 'leadcard-emblem.svg')
  const svg = readFileSync(svgPath)
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
