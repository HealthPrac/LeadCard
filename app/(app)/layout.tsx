import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/ui/AppSidebar'

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
  if (!subscriber) redirect('/onboarding')

  const { data: cards } = await supabase
    .from('cards')
    .select('id, slug, display_name, is_published')
    .eq('subscriber_id', subscriber.id)
    .order('created_at', { ascending: true })

  const primaryCard = cards?.[0] ?? null

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh', background: 'var(--cream)' }}>
      <AppSidebar
        plan={subscriber.plan}
        cardSlug={primaryCard?.slug ?? null}
        displayName={primaryCard?.display_name ?? null}
      />
      <main style={{ minWidth: 0, padding: '36px 40px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
