import { requireAdmin } from '@/lib/admin/gate'
import { createServiceClient } from '@/lib/supabase/server'
import { AdminShell } from './AdminShell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin()
  const service = createServiceClient()

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
    <AdminShell adminEmail={user.email ?? ''} cardSlug={cardSlug}>
      {children}
    </AdminShell>
  )
}
