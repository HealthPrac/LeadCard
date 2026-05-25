import { requireAdmin } from '@/lib/admin/gate'
import { createServiceClient } from '@/lib/supabase/server'
import { AdminSidebar } from './AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin()
  const service = createServiceClient()

  // Check if this admin also has a subscriber account with at least one card
  const { data: subscriber } = await service
    .from('subscribers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  let cardSlug: string | null = null
  if (subscriber) {
    const { data: card } = await service
      .from('cards')
      .select('slug')
      .eq('subscriber_id', subscriber.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()
    cardSlug = card?.slug ?? null
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--cream)' }}>
      <AdminSidebar adminEmail={user.email ?? ''} cardSlug={cardSlug} />
      <main style={{ flex: 1, minWidth: 0, padding: '36px 40px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
