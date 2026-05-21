import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SettingsClient from './SettingsClient'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: subscriber } = await supabase
    .from('subscribers')
    .select('id, plan, subscription_status, trial_ends_at')
    .eq('user_id', user.id)
    .single()
  if (!subscriber) redirect('/onboarding')

  const { data: cards } = await supabase
    .from('cards')
    .select('id, display_name, slug')
    .eq('subscriber_id', subscriber.id)
    .order('created_at', { ascending: true })

  const { count: leadCount } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('subscriber_id', subscriber.id)

  const payfastMerchantId = process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID ?? ''

  return (
    <SettingsClient
      email={user.email ?? ''}
      subscriber={subscriber}
      cards={cards ?? []}
      leadCount={leadCount ?? 0}
      payfastMerchantId={payfastMerchantId}
    />
  )
}
