'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from './gate'
import { revalidatePath } from 'next/cache'
import type { PromoCode } from '@/lib/supabase/types'

type InsertPromoCode = Omit<PromoCode, 'id' | 'uses_count' | 'created_at'>

export async function createPromoCode(formData: FormData) {
  const admin = await requireAdmin()
  const service = createServiceClient()

  const code = (formData.get('code') as string ?? '').trim().toUpperCase()
  const description = (formData.get('description') as string ?? '').trim()
  const discount_type = (formData.get('discount_type') as string) === 'percent' ? 'percent' : 'free'
  const discount_percent = discount_type === 'percent' ? parseInt(formData.get('discount_percent') as string, 10) : null
  const max_uses_raw = (formData.get('max_uses') as string ?? '').trim()
  const max_uses = max_uses_raw ? parseInt(max_uses_raw, 10) : null
  const expires_at_raw = (formData.get('expires_at') as string ?? '').trim()
  const expires_at = expires_at_raw || null

  if (!code) return { error: 'Code is required.' }
  if (discount_type === 'percent' && (!discount_percent || discount_percent < 1 || discount_percent > 100)) {
    return { error: 'Discount percent must be 1–100.' }
  }

  const payload: InsertPromoCode = {
    code,
    description: description || null,
    discount_type: discount_type as 'free' | 'percent',
    discount_percent: discount_percent ?? null,
    max_uses: max_uses ?? null,
    expires_at: expires_at ?? null,
    is_active: true,
    created_by: admin.id,
  }

  const { error } = await service.from('promo_codes' as never).insert(payload as never)

  if (error) {
    const pgErr = error as { code?: string; message?: string }
    return { error: pgErr.code === '23505' ? 'That code already exists.' : (pgErr.message ?? 'Unknown error') }
  }

  revalidatePath('/admin/promo-codes')
  return { success: true }
}

export async function togglePromoCode(id: string, is_active: boolean) {
  await requireAdmin()
  const service = createServiceClient()
  const { error } = await service.from('promo_codes' as never).update({ is_active } as never).eq('id', id)
  if (error) {
    const pgErr = error as { message?: string }
    return { error: pgErr.message ?? 'Unknown error' }
  }
  revalidatePath('/admin/promo-codes')
  return { success: true }
}
