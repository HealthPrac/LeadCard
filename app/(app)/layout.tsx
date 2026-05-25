import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/ui/AppSidebar'
import { getSignedReadUrl } from '@/lib/cards/actions'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: subscriber } = await supabase
    .from('subscribers')
    .select('id, plan')
    .eq('user_id', user.id)
    .maybeSingle()

  // New user hasn't completed onboarding yet
  if (!subscriber) {
    // Pure admin accounts don't need a card — send them to the console
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
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh', background: 'var(--cream)' }}>
      <AppSidebar
        plan={subscriber.plan}
        cardSlug={primaryCard?.slug ?? null}
        displayName={primaryCard?.display_name ?? null}
        logoUrl={logoUrl}
        isAdmin={!!adminRow}
      />
      <main style={{ minWidth: 0, padding: '40px 48px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
