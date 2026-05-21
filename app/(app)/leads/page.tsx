import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LeadsClient from './LeadsClient'

export default async function LeadsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: subscriber } = await supabase.from('subscribers').select('id').eq('user_id', user.id).single()
  if (!subscriber) redirect('/onboarding')

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('subscriber_id', subscriber.id)
    .order('created_at', { ascending: false })

  const { data: cards } = await supabase
    .from('cards')
    .select('id, display_name, slug')
    .eq('subscriber_id', subscriber.id)

  return <LeadsClient leads={leads ?? []} cards={cards ?? []} />
}
