import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: subscriber } = await supabase
    .from('subscribers')
    .select('id, plan')
    .eq('user_id', user.id)
    .single()
  if (!subscriber) redirect('/onboarding')

  const isTeamPlan = subscriber.plan === 'small' || subscriber.plan === 'enterprise'

  // All leads with card_id and source
  const { data: allLeads } = await supabase
    .from('leads')
    .select('id, card_id, source, created_at')
    .eq('subscriber_id', subscriber.id)

  const total = (allLeads ?? []).length

  const since7 = new Date(Date.now() - 7 * 86400000).toISOString()
  const last7 = (allLeads ?? []).filter(l => l.created_at >= since7).length

  // Source breakdown
  const sourceCounts: Record<string, number> = {}
  for (const l of allLeads ?? []) {
    const s = l.source ?? 'direct'
    sourceCounts[s] = (sourceCounts[s] ?? 0) + 1
  }
  const sortedSources = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])

  // Per-card breakdown (team plans + solo with multiple cards)
  const cardCounts: Record<string, number> = {}
  for (const l of allLeads ?? []) {
    if (l.card_id) cardCounts[l.card_id] = (cardCounts[l.card_id] ?? 0) + 1
  }

  const { data: cards } = await supabase
    .from('cards')
    .select('id, display_name, slug, title, created_at')
    .eq('subscriber_id', subscriber.id)
    .order('created_at', { ascending: true })

  const sortedCards = (cards ?? [])
    .map(c => ({ ...c, leads: cardCounts[c.id] ?? 0 }))
    .sort((a, b) => b.leads - a.leads)

  const statBox = (label: string, value: string | number) => (
    <div style={{ padding: 24, borderRadius: 14, background: 'white', border: '1px solid var(--line)' }}>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 44, lineHeight: 1 }}>{value}</div>
    </div>
  )

  return (
    <div style={{ maxWidth: 900 }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, margin: '0 0 6px', letterSpacing: '-0.01em' }}>Analytics</h1>
      <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 28px' }}>Lead capture overview. View analytics coming in a future update.</p>

      {/* Stat boxes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
        {statBox('All-time leads', total)}
        {statBox('Last 7 days', last7)}
        {statBox(isTeamPlan ? 'Team members' : 'Sources', isTeamPlan ? (cards?.length ?? 0) : sortedSources.length || '—')}
      </div>

      {/* Per-card breakdown — shown for all accounts with cards */}
      {sortedCards.length > 0 && (
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden', marginBottom: 28 }}>
          <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--line-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13.5, fontWeight: 500 }}>{isTeamPlan ? 'Leads per team member' : 'Leads per card'}</span>
            {isTeamPlan && (
              <Link href="/team" style={{ fontSize: 12.5, color: 'var(--muted)', textDecoration: 'none' }}>View team →</Link>
            )}
          </div>
          <div style={{ padding: '8px 0' }}>
            {sortedCards.map((card, idx) => {
              const pct = total > 0 ? Math.round((card.leads / total) * 100) : 0
              const initials = (card.display_name ?? '?').split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
              return (
                <div key={card.id} style={{ padding: '12px 22px', borderTop: idx === 0 ? 'none' : '1px solid var(--line-2)', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--sage-tint)', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                    {initials}
                  </div>
                  <div style={{ width: 160, flexShrink: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--charcoal)' }}>{card.display_name ?? card.slug}</div>
                    {card.title && <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{card.title}</div>}
                  </div>
                  <div style={{ flex: 1, height: 6, background: 'var(--cream-2)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--sage)', borderRadius: 99 }} />
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', width: 80, textAlign: 'right' as const, flexShrink: 0 }}>
                    {card.leads} lead{card.leads !== 1 ? 's' : ''} <span style={{ opacity: 0.6 }}>({pct}%)</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Source breakdown */}
      {sortedSources.length > 0 && (
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden', marginBottom: 28 }}>
          <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--line-2)', fontSize: 13.5, fontWeight: 500 }}>Lead sources</div>
          <div style={{ padding: '8px 0' }}>
            {sortedSources.map(([source, count]) => {
              const pct = total ? Math.round((count / total) * 100) : 0
              return (
                <div key={source} style={{ padding: '10px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 100, fontSize: 13.5, color: 'var(--charcoal)', textTransform: 'capitalize', flexShrink: 0 }}>{source}</div>
                  <div style={{ flex: 1, height: 6, background: 'var(--cream-2)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--sage)', borderRadius: 99 }} />
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', width: 60, textAlign: 'right' as const, flexShrink: 0 }}>{count} ({pct}%)</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* View analytics coming soon */}
      <div style={{ background: 'var(--sage-tint)', borderRadius: 14, padding: '28px 24px', display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ fontSize: 28 }}>↗</div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 4px' }}>View analytics coming soon</p>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>Card views, tap-to-scan conversion, and per-member heatmaps will appear here once available.</p>
        </div>
        <Link href="/share" style={{ marginLeft: 'auto', padding: '9px 18px', background: 'var(--charcoal)', color: 'var(--cream)', borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: 'none', flexShrink: 0 }}>
          Share card →
        </Link>
      </div>
    </div>
  )
}
