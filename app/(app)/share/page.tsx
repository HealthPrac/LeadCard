import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ShareClient from './ShareClient'

export default async function SharePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: subscriber } = await supabase.from('subscribers').select('id').eq('user_id', user.id).single()
  if (!subscriber) redirect('/onboarding')

  const { data: cards } = await supabase
    .from('cards')
    .select('id, slug, display_name, title, company, email, mobile')
    .eq('subscriber_id', subscriber.id)
    .order('created_at', { ascending: true })

  const card = cards?.[0] ?? null
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://leadcard.app'

  return <ShareClient card={card} appUrl={appUrl} />
}
