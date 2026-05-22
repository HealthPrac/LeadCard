'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from './gate'

export async function addAdmin(formData: FormData) {
  const currentUser = await requireAdmin()
  const email = (formData.get('email') as string ?? '').trim().toLowerCase()

  if (!email) return { error: 'Email is required.' }

  const service = createServiceClient()

  // Look up user_id by email via SQL function
  const { data: userId, error: lookupError } = await service.rpc('get_user_id_by_email', { input_email: email })
  if (lookupError || !userId) {
    return { error: 'No LeadCard account found with that email. They must sign up first.' }
  }

  // Check not already an admin
  const { data: existing } = await service.from('admins').select('id').eq('user_id', userId).maybeSingle()
  if (existing) return { error: 'This person is already an admin.' }

  const { error: insertError } = await service
    .from('admins')
    .insert({ user_id: userId, added_by: currentUser.id })

  if (insertError) return { error: insertError.message }

  revalidatePath('/admin/team')
  return { success: true }
}

export async function removeAdmin(adminId: string) {
  const currentUser = await requireAdmin()

  const service = createServiceClient()

  // Prevent self-removal
  const { data: row } = await service.from('admins').select('user_id').eq('id', adminId).maybeSingle()
  if (row?.user_id === currentUser.id) {
    return { error: "You can't remove yourself. Ask another admin." }
  }

  const { error } = await service.from('admins').delete().eq('id', adminId)
  if (error) return { error: error.message }

  revalidatePath('/admin/team')
  return { success: true }
}
