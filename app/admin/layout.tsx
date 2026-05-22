import { requireAdmin } from '@/lib/admin/gate'
import { AdminSidebar } from './AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Gate: non-admins are redirected to /dashboard silently
  const user = await requireAdmin()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--cream)' }}>
      <AdminSidebar adminEmail={user.email ?? ''} />
      <main style={{ flex: 1, minWidth: 0, padding: '36px 40px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
