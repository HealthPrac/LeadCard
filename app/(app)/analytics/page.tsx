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

  const { data: cards } = await supabase
    .from('cards')
    .select('id, display_name, slug, title, created_at')
    .eq('subscriber_id', subscriber.id)
    .order('created_at', { ascending: true })

  // Leads + events in parallel
  const [{ data: allLeads }, { data: allEvents }] = await Promise.all([
    supabase
      .from('leads')
      .select('id, card_id, source, created_at')
      .eq('subscriber_id', subscriber.id),
    supabase
      .from('card_events')
      .select('id, event_name, card_id, cta_label, cta_type, device_type, occurred_at')
      .eq('subscriber_id', subscriber.id)
      .order('occurred_at', { ascending: false })
      .limit(5000),
  ])

  const since7 = new Date(Date.now() - 7 * 86400000).toISOString()

  // ── Lead stats ──────────────────────────────────────────────────────────────
  const leads = allLeads ?? []
  const totalLeads = leads.length
  const last7Leads = leads.filter(l => l.created_at >= since7).length

  const sourceCounts: Record<string, number> = {}
  for (const l of leads) {
    const s = l.source ?? 'direct'
    sourceCounts[s] = (sourceCounts[s] ?? 0) + 1
  }
  const sortedSources = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])

  const cardLeadCounts: Record<string, number> = {}
  for (const l of leads) {
    if (l.card_id) cardLeadCounts[l.card_id] = (cardLeadCounts[l.card_id] ?? 0) + 1
  }

  const sortedCards = (cards ?? [])
    .map(c => ({ ...c, leads: cardLeadCounts[c.id] ?? 0 }))
    .sort((a, b) => b.leads - a.leads)

  // ── View/event stats ────────────────────────────────────────────────────────
  const events = allEvents ?? []
  const views = events.filter(e => e.event_name === 'card_view_started')
  const totalViews = views.length
  const last7Views = views.filter(e => e.occurred_at >= since7).length
  const formSubmits = events.filter(e => e.event_name === 'lead_form_submitted').length
  const convRate = totalViews > 0 ? ((formSubmits / totalViews) * 100).toFixed(1) : null

  // CTA clicks grouped by label
  const ctaEvents = events.filter(e => e.event_name === 'cta_clicked')
  const ctaCounts: Record<string, number> = {}
  for (const e of ctaEvents) {
    const label = e.cta_label ?? 'CTA'
    ctaCounts[label] = (ctaCounts[label] ?? 0) + 1
  }
  const sortedCtas = Object.entries(ctaCounts).sort((a, b) => b[1] - a[1])

  // Device split
  const deviceCounts: Record<string, number> = {}
  for (const v of views) {
    const d = v.device_type ?? 'unknown'
    deviceCounts[d] = (deviceCounts[d] ?? 0) + 1
  }
  const sortedDevices = Object.entries(deviceCounts).sort((a, b) => b[1] - a[1])

  // Monthly views — last 6 months
  const now = new Date()
  const monthViewMap = new Map<string, number>()
  for (const v of views) {
    const d = new Date(v.occurred_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthViewMap.set(key, (monthViewMap.get(key) ?? 0) + 1)
  }
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    return {
      label: d.toLocaleDateString('en-ZA', { month: 'short' }),
      count: monthViewMap.get(key) ?? 0,
    }
  })
  const maxMonth = Math.max(1, ...last6Months.map(m => m.count))

  const statBox = (label: string, value: string | number, sub?: string) => (
    <div style={{ padding: 24, borderRadius: 14, background: 'white', border: '1px solid var(--line)' }}>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 44, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>{sub}</div>}
    </div>
  )

  return (
    <div style={{ maxWidth: 900 }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, margin: '0 0 6px', letterSpacing: '-0.01em' }}>Analytics</h1>
      <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 28px' }}>Card views, lead capture, and engagement.</p>

      {/* Stat row — views */}
      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sage)', margin: '0 0 12px' }}>Card views</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
        {statBox('All-time views', totalViews.toLocaleString())}
        {statBox('Last 7 days', last7Views.toLocaleString())}
        {statBox('View → lead rate', convRate !== null ? `${convRate}%` : '—', totalViews > 0 ? `${formSubmits} form submits` : 'No data yet')}
      </div>

      {/* Monthly views chart */}
      {totalViews > 0 && (
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', padding: '20px 24px', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sage)', margin: 0 }}>Views — last 6 months</p>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{last6Months.reduce((s, m) => s + m.count, 0)} total</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 80 }}>
            {last6Months.map(m => (
              <div key={m.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--charcoal)', minHeight: 16 }}>{m.count > 0 ? m.count : ''}</span>
                <div style={{ width: '100%', borderRadius: '4px 4px 0 0', background: 'var(--cream-2)', height: 44, overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}>
                  <div style={{ width: '100%', borderRadius: '4px 4px 0 0', background: 'var(--sage)', height: `${(m.count / maxMonth) * 100}%`, transition: 'height 0.3s' }} />
                </div>
                <span style={{ fontSize: 10, color: 'var(--muted)' }}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA performance */}
      {sortedCtas.length > 0 && (
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden', marginBottom: 28 }}>
          <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--line-2)', fontSize: 13.5, fontWeight: 500 }}>CTA clicks</div>
          <div style={{ padding: '8px 0' }}>
            {sortedCtas.map(([label, count], idx) => {
              const pct = ctaEvents.length > 0 ? Math.round((count / ctaEvents.length) * 100) : 0
              return (
                <div key={label} style={{ padding: '10px 22px', borderTop: idx === 0 ? 'none' : '1px solid var(--line-2)', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 160, fontSize: 13.5, color: 'var(--charcoal)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}>{label}</div>
                  <div style={{ flex: 1, height: 6, background: 'var(--cream-2)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--charcoal)', borderRadius: 99 }} />
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', width: 80, textAlign: 'right' as const, flexShrink: 0 }}>{count} ({pct}%)</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Device split */}
      {sortedDevices.length > 0 && (
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', padding: '18px 22px', marginBottom: 28, display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sage)', flexShrink: 0 }}>Device split</span>
          {sortedDevices.map(([device, count]) => {
            const pct = totalViews > 0 ? Math.round((count / totalViews) * 100) : 0
            return (
              <div key={device} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--charcoal)' }}>{pct}%</span>
                <span style={{ fontSize: 13, color: 'var(--muted)', textTransform: 'capitalize' }}>{device}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Stat row — leads */}
      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sage)', margin: '0 0 12px' }}>Lead capture</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
        {statBox('All-time leads', totalLeads)}
        {statBox('Last 7 days', last7Leads)}
        {statBox(isTeamPlan ? 'Team members' : 'Sources', isTeamPlan ? (cards?.length ?? 0) : sortedSources.length || '—')}
      </div>

      {/* Per-card breakdown */}
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
              const pct = totalLeads > 0 ? Math.round((card.leads / totalLeads) * 100) : 0
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
              const pct = totalLeads ? Math.round((count / totalLeads) * 100) : 0
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

      {/* Empty state: no events yet */}
      {totalViews === 0 && (
        <div style={{ background: 'var(--sage-tint)', borderRadius: 14, padding: '28px 24px', display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ fontSize: 28 }}>↗</div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 4px' }}>Views will appear here once someone visits your card</p>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>Share your card link or QR code to start seeing view analytics, CTA clicks, and conversion data.</p>
          </div>
          <Link href="/share" style={{ marginLeft: 'auto', padding: '9px 18px', background: 'var(--charcoal)', color: 'var(--cream)', borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: 'none', flexShrink: 0 }}>
            Share card →
          </Link>
        </div>
      )}
    </div>
  )
}
