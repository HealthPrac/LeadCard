import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: subscriber } = await supabase.from('subscribers').select('id').eq('user_id', user.id).single()
  if (!subscriber) return NextResponse.json({ error: 'Not found' }, { status: 403 })

  const { data: leads } = await supabase
    .from('leads')
    .select('first_name, last_name, email, org, role, mobile, source, message, created_at')
    .eq('subscriber_id', subscriber.id)
    .order('created_at', { ascending: false })

  const header = ['First name', 'Last name', 'Email', 'Company', 'Role', 'Mobile', 'Source', 'Message', 'Date']
  const rows = (leads ?? []).map(l => [
    l.first_name ?? '',
    l.last_name ?? '',
    l.email,
    l.org ?? '',
    l.role ?? '',
    l.mobile ?? '',
    l.source ?? '',
    (l.message ?? '').replace(/\n/g, ' '),
    new Date(l.created_at).toLocaleDateString('en-ZA'),
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))

  const csv = [header.join(','), ...rows].join('\n')
  const filename = `leads-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
