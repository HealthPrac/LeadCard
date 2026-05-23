import { requireAdmin } from '@/lib/admin/gate'
import { getPromoCodes } from '@/lib/admin/promo-queries'
import PromoCodesClient from './PromoCodesClient'

export default async function PromoCodesPage() {
  await requireAdmin()
  const codes = await getPromoCodes()
  return <PromoCodesClient codes={codes} />
}
