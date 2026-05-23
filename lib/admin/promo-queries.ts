import { createServiceClient } from '@/lib/supabase/server'
import type { PromoCode } from '@/lib/supabase/types'

export async function getPromoCodes(): Promise<PromoCode[]> {
  const service = createServiceClient()
  const { data, error } = await service.from('promo_codes' as never).select('*') as unknown as { data: PromoCode[] | null; error: Error | null }
  if (error) throw error
  return data ?? []
}

export type PromoCodeRow = PromoCode
