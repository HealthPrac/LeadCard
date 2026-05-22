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
    console.error('slug-check error:', e?.message ?? String(e))
    return NextResponse.json({ available: false }, { status: 500 })
  }
}
