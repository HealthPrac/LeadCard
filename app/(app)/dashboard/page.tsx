import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CopyLinkButton } from './CopyLinkButton'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: subscriber } = await supabase
    .from('subscribers')
    .select('id, plan, subscription_status, trial_ends_at')
    .eq('user_id', user.id)
    .single()
  if (!subscriber) redirect('/onboarding')

  const isTeamPlan = subscriber.plan === 'small' || subscriber.plan === 'enterprise'

  const { data: cards } = await supabase
    .from('cards')
    .select('*')
    .eq('subscriber_id', subscriber.id)
    .order('created_at')
  const card = cards?.[0]

  // All leads — used for stat computation
  const { data: allLeads } = await supabase
    .from('leads')
    .select('id, card_id, source, created_at')
    .eq('subscriber_id', subscriber.id)

  // Recent 5 leads with full fields for display
  const { data: recentLeads } = await supabase
    .from('leads')
    .select('*')
    .eq('subscriber_id', subscriber.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Service ratings — most recent 5, aggregate stats
  const { data: allRatings } = await supabase
    .from('service_ratings')
    .select('id, card_id, rating, comment, created_at, session_id')
    .eq('subscriber_id', subscriber.id)
    .order('created_at', { ascending: false })
  const recentRatings = allRatings?.slice(0, 5) ?? []
  const avgRating = allRatings && allRatings.length > 0
    ? allRatings.reduce((s, r) => s + r.rating, 0) / allRatings.length
    : null

  // Computed stats
  const totalLeads = allLeads?.length ?? 0
  const since7 = new Date(Date.now() - 7 * 86400000).toISOString()
  const last7Leads = (allLeads ?? []).filter(l => l.created_at >= since7).length

  const sourceCounts: Record<string, number> = {}
  for (const l of allLeads ?? []) {
    const s = l.source ?? 'direct'
    sourceCounts[s] = (sourceCounts[s] ?? 0) + 1
  }
  const topSource = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
  const uniqueSources = Object.keys(sourceCounts).length

  const cardLeadCounts: Record<string, number> = {}
  for (const l of allLeads ?? []) {
    if (l.card_id) cardLeadCounts[l.card_id] = (cardLeadCounts[l.card_id] ?? 0) + 1
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://leadcard.app'
  const cardUrl = card ? `${appUrl}/c/${card.slug}` : null

  const trialDaysLeft = subscriber.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(subscriber.trial_ends_at).getTime() - Date.now()) / 86400000))
    : null

  return (
    <div style={{ maxWidth: 1100 }}>

      {/* Trial banner */}
      {subscriber.subscription_status === 'trialing' && trialDaysLeft !== null && trialDaysLeft <= 7 && (
        <div style={{ marginBottom: 24, padding: '12px 18px', background: '#FEF9C3', border: '1px solid #FDE047', borderRadius: 10, fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 10 }}>
          ⚠️ Your free trial ends in <strong>{trialDaysLeft} {trialDaysLeft === 1 ? 'day' : 'days'}</strong>.
          <Link href="/settings" style={{ marginLeft: 'auto', color: 'var(--charcoal)', fontWeight: 500, textDecoration: 'underline' }}>Add payment method →</Link>
        </div>
      )}

      {/* Main two-column layout */}
      <div style={{ display: 'flex', gap: 36, alignItems: 'flex-start' }}>

        {/* ── Left: phone mockup ── */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--muted)', fontWeight: 500, marginBottom: 16 }}>
            Live preview
          </div>
          <div className="phone">
            <div className="phone-screen">
              {cardUrl
                ? (
                  <iframe
                    src={cardUrl}
                    style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                    title="Card preview"
                  />
                )
                : (
                  <div style={{ width: '100%', height: '100%', background: 'var(--charcoal)', display: 'grid', placeItems: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                    No card yet
                  </div>
                )
              }
            </div>
          </div>
        </div>

        {/* ── Right: summary ── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {card ? (
            <>
              {/* ── Analytics summary ── */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--muted)', fontWeight: 500 }}>Analytics</span>
                  <Link href="/analytics" style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'none' }}>View all →</Link>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  <div style={{ padding: '18px 20px', borderRadius: 14, background: 'white', border: '1px solid var(--line)' }}>
                    <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--muted)', fontWeight: 500, marginBottom: 6 }}>All-time</div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 38, lineHeight: 1, color: 'var(--charcoal)' }}>{totalLeads}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 4 }}>leads captured</div>
                  </div>
                  <div style={{ padding: '18px 20px', borderRadius: 14, background: 'white', border: '1px solid var(--line)' }}>
                    <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--muted)', fontWeight: 500, marginBottom: 6 }}>Last 7 days</div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 38, lineHeight: 1, color: 'var(--charcoal)' }}>{last7Leads}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 4 }}>new leads</div>
                  </div>
                  <div style={{ padding: '18px 20px', borderRadius: 14, background: 'white', border: '1px solid var(--line)' }}>
                    <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--muted)', fontWeight: 500, marginBottom: 6 }}>
                      {isTeamPlan ? 'Team members' : 'Sources'}
                    </div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 38, lineHeight: 1, color: 'var(--charcoal)' }}>
                      {isTeamPlan ? (cards?.length ?? 1) : (uniqueSources || '—')}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 4 }}>
                      {isTeamPlan ? 'active cards' : (topSource ? `top: ${topSource}` : 'no data yet')}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Team summary (team plans only) ── */}
              {isTeamPlan && cards && cards.length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--muted)', fontWeight: 500 }}>Team</span>
                    <Link href="/team" style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'none' }}>View all →</Link>
                  </div>
                  <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--line)', overflow: 'hidden' }}>
                    {cards.slice(0, 4).map((c, idx) => {
                      const name = (c.display_name ?? '?') as string
                      const initials = name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
                      const leads = cardLeadCounts[c.id] ?? 0
                      const pct = totalLeads > 0 ? Math.round((leads / totalLeads) * 100) : 0
                      return (
                        <div key={c.id} style={{ padding: '11px 20px', borderTop: idx === 0 ? 'none' : '1px solid var(--line-2)', display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--sage-tint)', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>{initials}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{name}</div>
                            {c.title && <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{c.title as string}</div>}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                            <div style={{ width: 56, height: 4, background: 'var(--cream-2)', borderRadius: 99, overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: 'var(--sage)', borderRadius: 99 }} />
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--muted)', width: 54, textAlign: 'right' as const }}>{leads} lead{leads !== 1 ? 's' : ''}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ── Recent leads ── */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--muted)', fontWeight: 500 }}>Leads</span>
                  <Link href="/leads" style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'none' }}>View all →</Link>
                </div>

                {recentLeads && recentLeads.length > 0 ? (
                  <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--line)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: 'var(--cream-2)' }}>
                          {['Person', 'Company', 'Source', 'When'].map(h => (
                            <th key={h} style={{ padding: '9px 18px', textAlign: 'left', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {recentLeads.map(l => (
                          <tr key={l.id} style={{ borderTop: '1px solid var(--line-2)' }}>
                            <td style={{ padding: '11px 18px' }}>
                              <div style={{ fontWeight: 500 }}>{[l.first_name, l.last_name].filter(Boolean).join(' ') || l.email}</div>
                              <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 1 }}>{l.email}</div>
                            </td>
                            <td style={{ padding: '11px 18px', color: 'var(--muted)' }}>{l.org ?? '—'}</td>
                            <td style={{ padding: '11px 18px', color: 'var(--muted)' }}>{l.source ?? '—'}</td>
                            <td style={{ padding: '11px 18px', color: 'var(--muted)', fontSize: 11.5 }}>{formatRelTime(l.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ background: 'var(--cream-2)', borderRadius: 16, padding: '28px 24px', textAlign: 'center' }}>
                    <div style={{ fontSize: 20, marginBottom: 8 }}>◎</div>
                    <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 6px' }}>No leads yet.</p>
                    <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 16px', lineHeight: 1.5 }}>
                      Share your card link to get started — leads appear here the moment someone fills the form.
                    </p>
                    {cardUrl && <CopyLinkButton url={cardUrl} fg="var(--charcoal)" />}
                  </div>
                )}
              </div>
              {/* ── Service ratings ── */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--muted)', fontWeight: 500 }}>Service ratings</span>
                  {avgRating !== null && (
                    <span style={{ fontSize: 13, color: 'var(--charcoal)', fontWeight: 600 }}>
                      {'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))} {avgRating.toFixed(1)} <span style={{ fontWeight: 400, color: 'var(--muted)' }}>({allRatings?.length})</span>
                    </span>
                  )}
                </div>

                {recentRatings.length > 0 ? (
                  <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--line)', overflow: 'hidden' }}>
                    {recentRatings.map((r, idx) => (
                      <div key={r.id} style={{ padding: '12px 20px', borderTop: idx === 0 ? 'none' : '1px solid var(--line-2)', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                        <div style={{ flexShrink: 0, paddingTop: 1 }}>
                          <span style={{ fontSize: 16, color: 'var(--sage)' }}>{'★'.repeat(r.rating)}</span>
                          <span style={{ fontSize: 16, color: 'var(--line)' }}>{'★'.repeat(5 - r.rating)}</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {r.comment && <div style={{ fontSize: 13, color: 'var(--charcoal)', lineHeight: 1.45, marginBottom: 2 }}>&ldquo;{r.comment}&rdquo;</div>}
                          <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{formatRelTime(r.created_at)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ background: 'var(--cream-2)', borderRadius: 16, padding: '22px 24px', textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>
                    No ratings yet — the &ldquo;Rate my service&rdquo; button appears on your card.
                  </div>
                )}
              </div>

            </>
          ) : (
            <div style={{ padding: 36, borderRadius: 16, background: 'var(--cream-2)', border: '2px dashed var(--line)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, textAlign: 'center', minHeight: 300 }}>
              <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>No card yet.</p>
              <Link href="/onboarding" style={{ padding: '10px 20px', background: 'var(--charcoal)', color: 'var(--cream)', borderRadius: 8, fontSize: 13.5, textDecoration: 'none', fontWeight: 500 }}>
                Create your card →
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

function formatRelTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })
}
