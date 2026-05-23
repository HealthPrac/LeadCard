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

  const leadIds = (leads ?? []).map(l => l.id)
  const { data: crmRows } = leadIds.length > 0
    ? await supabase.from('lead_crm').select('lead_id, status, estimated_income_cents, actual_income_cents, satisfaction_score, first_engaged_at').in('lead_id', leadIds)
    : { data: [] }

  return (
    <LeadsClient
      leads={leads ?? []}
      cards={cards ?? []}
      crmRows={crmRows ?? []}
    />
  )
}
