import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ALLOWED_TYPES = {
  photo: { bucket: 'card-assets', maxSize: 5 * 1024 * 1024, mime: ['image/jpeg', 'image/png', 'image/webp'] },
  logo: { bucket: 'card-assets', maxSize: 5 * 1024 * 1024, mime: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'] },
  video: { bucket: 'card-videos', maxSize: 100 * 1024 * 1024, mime: ['video/mp4', 'video/webm', 'video/quicktime'] },
}

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: subscriber } = await supabase.from('subscribers').select('id').eq('user_id', user.id).single()
  if (!subscriber) return NextResponse.json({ error: 'Not found' }, { status: 403 })

  const url = new URL(req.url)
  const type = url.searchParams.get('type') as keyof typeof ALLOWED_TYPES | null
  const cardId = url.searchParams.get('cardId')
  const filename = url.searchParams.get('filename') ?? 'upload'

  if (!type || !ALLOWED_TYPES[type]) return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  if (!cardId) return NextResponse.json({ error: 'cardId required' }, { status: 400 })

  // Verify card ownership
  const { data: card } = await supabase.from('cards').select('id').eq('id', cardId).eq('subscriber_id', subscriber.id).single()
  if (!card) return NextResponse.json({ error: 'Card not found' }, { status: 404 })

  const config = ALLOWED_TYPES[type]
  const ext = filename.split('.').pop() ?? 'bin'
  const path = `${subscriber.id}/${cardId}/${type}.${ext}`

  const service = createServiceClient()
  const { data, error } = await service.storage.from(config.bucket).createSignedUploadUrl(path)

  if (error || !data) {
    console.error('Signed upload URL error:', error?.message)
    return NextResponse.json({ error: 'Could not create upload URL' }, { status: 500 })
  }

  return NextResponse.json({ uploadUrl: data.signedUrl, path })
}
