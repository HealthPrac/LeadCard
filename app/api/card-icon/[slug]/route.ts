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

  // Only SVG logos are used as the tenant favicon/PWA icon — they scale cleanly at any size.
  // JPEG/PNG uploads fall back to the AvantCard emblem.
  if (card?.logo_path && card.logo_path.toLowerCase().endsWith('.svg')) {
    const { data: rawSignedData } = await supabase.storage
      .from('card-assets')
      .createSignedUrl(card.logo_path, 3600)

    if (rawSignedData?.signedUrl) {
      const imgRes = await fetch(rawSignedData.signedUrl)
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer()
        const contentType = imgRes.headers.get('content-type') ?? 'image/svg+xml'
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
          },
        })
      }
    }
  }

  // Fallback: serve the company emblem SVG
  const svgPath = join(process.cwd(), 'public', 'AvantCard_Emblem.svg')
  const svg = readFileSync(svgPath)
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
