import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get('slug')?.toLowerCase().replace(/[^a-z0-9-]/g, '')

    if (!slug || slug.length < 2) return NextResponse.json({ available: false })

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('cards')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (error) return NextResponse.json({ available: false, debug: error.message }, { status: 500 })
    return NextResponse.json({ available: !data })
  } catch (e: any) {
    return NextResponse.json({
      available: false,
      debug: e?.message ?? String(e),
      env: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasPublishableKey: !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        urlStart: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30) ?? 'MISSING',
        keyStart: process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 12) ?? 'MISSING',
      }
    }, { status: 500 })
  }
}
