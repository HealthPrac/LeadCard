import { createServiceClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CrmClient } from './CrmClient'

interface Props {
  params: { token: string }
}

export default async function MyLeadsPage({ params }: Props) {
  const { token } = params
  const service = createServiceClient()

  // Validate magic-link token
  const { data: tokenRow } = await service
    .from('card_holder_tokens')
    .select('card_id, subscriber_id')
    .eq('token', token)
    .eq('is_active', true)
    .single()

  if (!tokenRow) notFound()

  // Touch last_accessed_at (fire-and-forget)
  service
    .from('card_holder_tokens')
    .update({ last_accessed_at: new Date().toISOString() })
    .eq('token', token)
    .then(() => {})

  const { data: card } = await service
    .from('cards')
    .select('id, display_name, title, company, slug, industry, theme_bg, theme_fg, theme_accent')
    .eq('id', tokenRow.card_id)
    .single()

  if (!card) notFound()

  const { data: leads } = await service
    .from('leads')
    .select('id, first_name, last_name, email, org, role, mobile, message, source, created_at')
    .eq('card_id', tokenRow.card_id)
    .order('created_at', { ascending: false })

  const leadIds = (leads ?? []).map(l => l.id)
  const { data: crmRows } = leadIds.length > 0
    ? await service.from('lead_crm').select('*').in('lead_id', leadIds)
    : { data: [] }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  return (
    <CrmClient
      token={token}
      card={card}
      leads={leads ?? []}
      crmRows={crmRows ?? []}
      cardUrl={`${appUrl}/c/${card.slug}`}
    />
  )
}
