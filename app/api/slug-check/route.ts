import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')?.toLowerCase().replace(/[^a-z0-9-]/g, '')

  if (!slug || slug.length < 2) return NextResponse.json({ available: false })

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('cards')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  return NextResponse.json({ available: !data })
}
