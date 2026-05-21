'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { Subscriber } from '@/lib/supabase/types'

export async function getSubscriber(): Promise<Subscriber | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('subscribers')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return data
}

export async function createSubscriber(userId: string, email: string, plan: 'solo' | 'small' | 'enterprise' = 'solo') {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('subscribers')
    .insert({ user_id: userId, email, plan })
    .select()
    .single()

  if (error) throw error
  return data
}
