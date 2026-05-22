// Server-side admin gate. Call at the top of every admin layout / page.
// Redirects non-admins silently to /dashboard — they see nothing.

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

export async function requireAdmin(): Promise<User> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const service = createServiceClient()
  const { data: adminRow } = await service
    .from('admins')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  // Not in the admins table → redirect silently, reveal nothing
  if (!adminRow) redirect('/dashboard')

  return user
}
