import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EditorClient from './EditorClient'
import { getSignedReadUrl } from '@/lib/cards/actions'

export default async function EditorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: subscriber } = await supabase.from('subscribers').select('id').eq('user_id', user.id).single()
  if (!subscriber) redirect('/onboarding')

  const { data: cards } = await supabase
    .from('cards')
    .select('*')
    .eq('subscriber_id', subscriber.id)
    .order('created_at', { ascending: true })

  const card = cards?.[0]
  if (!card) redirect('/onboarding')

  // Resolve signed read URLs server-side
  const photoUrl = card.photo_path ? await getSignedReadUrl('card-assets', card.photo_path) : null
  const logoUrl = card.logo_path ? await getSignedReadUrl('card-assets', card.logo_path) : null
  const videoUrl = card.video_path ? await getSignedReadUrl('card-videos', card.video_path) : null

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://leadcard.app'

  return (
    <EditorClient
      card={card}
      photoUrl={photoUrl}
      logoUrl={logoUrl}
      videoUrl={videoUrl}
      appUrl={appUrl}
    />
  )
}
