import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getSignedReadUrl } from '@/lib/cards/actions'
import { AppShell } from './AppShell'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: subscriber } = await supabase
    .from('subscribers')
    .select('id, plan')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!subscriber) {
    const service = createServiceClient()
    const { data: adminRow } = await service.from('admins').select('id').eq('user_id', user.id).maybeSingle()
    redirect(adminRow ? '/admin' : '/onboarding')
  }

  const service = createServiceClient()

  const [{ data: cards }, { data: adminRow }] = await Promise.all([
    supabase
      .from('cards')
      .select('id, slug, display_name, is_published, logo_path')
      .eq('subscriber_id', subscriber.id)
      .order('created_at', { ascending: true }),
    service.from('admins').select('id').eq('user_id', user.id).maybeSingle(),
  ])

  const primaryCard = cards?.[0] ?? null
  const logoUrl = primaryCard?.logo_path
    ? await getSignedReadUrl('card-assets', primaryCard.logo_path)
    : null

  return (
    <AppShell
      plan={subscriber.plan}
      cardSlug={primaryCard?.slug ?? null}
      displayName={primaryCard?.display_name ?? null}
      logoUrl={logoUrl}
      isAdmin={!!adminRow}
    >
      {children}
    </AppShell>
  )
}
