import { requireAdmin }        from '@/lib/admin/gate'
import { getCurrentPricing, getPricingProposals, getAuditLog, getAdminOptions } from '@/lib/admin/pricing-queries'
import PricingClient           from './PricingClient'

export default async function PricingPage() {
  const user      = await requireAdmin()
  const [current, proposals, audit, admins] = await Promise.all([
    getCurrentPricing(),
    getPricingProposals(),
    getAuditLog(),
    getAdminOptions(),
  ])

  return (
    <PricingClient
      currentUserId={user.id}
      currentPrices={current}
      proposals={proposals}
      auditLog={audit}
      adminOptions={admins}
    />
  )
}
