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

  const { data: cards } = await supabase
    .from('cards')
    .select('*')
    .eq('subscriber_id', subscriber.id)
    .order('created_at')
  const card = cards?.[0]

  const { data: recentLeads } = await supabase
    .from('leads')
    .select('*')
    .eq('subscriber_id', subscriber.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const { count: totalLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('subscriber_id', subscriber.id)

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

        {/* ── Right: info + stats + leads ── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {card ? (
            <>
              {/* Card identity tile */}
              <div style={{ padding: '28px 32px', borderRadius: 16, background: card.theme_bg, color: card.theme_fg, position: 'relative', overflow: 'hidden' }}>
                {/* Decorative rings */}
                <div style={{ position: 'absolute', right: -40, top: -40, width: 260, height: 260, borderRadius: '50%', border: `1px solid ${card.theme_accent}30`, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', right: -80, top: -80, width: 340, height: 340, borderRadius: '50%', border: `1px solid ${card.theme_accent}16`, pointerEvents: 'none' }} />

                <div style={{ position: 'relative' }}>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: card.theme_accent, fontWeight: 600, marginBottom: 12 }}>
                    Your card
                  </div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 30, lineHeight: 1.05, letterSpacing: '-0.01em', marginBottom: 4 }}>
                    {card.display_name}
                  </div>
                  <div style={{ fontSize: 13.5, opacity: 0.72, marginBottom: card.industry ? 10 : 18 }}>
                    {[card.title, card.company].filter(Boolean).join(' · ') || <span style={{ opacity: 0.45 }}>No title set</span>}
                  </div>
                  {card.industry && (
                    <div style={{ display: 'inline-block', padding: '3px 11px', background: `${card.theme_accent}22`, color: card.theme_accent, borderRadius: 999, fontSize: 11.5, fontWeight: 500, letterSpacing: '0.02em', marginBottom: 18 }}>
                      {card.industry}
                    </div>
                  )}
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, opacity: 0.5, marginBottom: 22 }}>
                    leadcard.app/c/{card.slug}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
                    <Link href="/editor" style={{ padding: '9px 18px', background: card.theme_fg, color: card.theme_bg, borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', letterSpacing: '0.01em' }}>
                      ✦ Edit card
                    </Link>
                    <Link href="/share" style={{ padding: '9px 18px', background: 'rgba(255,255,255,0.08)', color: card.theme_fg, border: '1px solid rgba(255,255,255,0.14)', borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
                      ⊡ Share
                    </Link>
                    {cardUrl && <CopyLinkButton url={cardUrl} fg={card.theme_fg} />}
                  </div>
                </div>
              </div>

              {/* Stats tile */}
              <div style={{ padding: '22px 28px', borderRadius: 16, background: 'white', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 24 }}>
                <div>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--muted)', fontWeight: 500, marginBottom: 6 }}>All time</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: 44, lineHeight: 1, color: 'var(--charcoal)' }}>{totalLeads ?? 0}</span>
                    <span style={{ fontSize: 14, color: 'var(--muted)' }}>leads captured</span>
                  </div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <Link href="/leads" style={{ fontSize: 13, color: 'var(--charcoal)', textDecoration: 'none', padding: '8px 16px', background: 'var(--cream-2)', borderRadius: 8, fontWeight: 500, whiteSpace: 'nowrap' as const }}>
                    View all leads →
                  </Link>
                </div>
              </div>

              {/* Recent leads */}
              {recentLeads && recentLeads.length > 0 ? (
                <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--line)', overflow: 'hidden', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px 12px', borderBottom: '1px solid var(--line-2)' }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--charcoal)' }}>Recent leads</span>
                    <Link href="/leads" style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'none' }}>View all</Link>
                  </div>
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
                <div style={{ background: 'var(--cream-2)', borderRadius: 16, padding: '28px 24px', textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 20, marginBottom: 8 }}>◎</div>
                  <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 6px' }}>No leads yet.</p>
                  <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 16px', lineHeight: 1.5 }}>
                    Share your card link to get started — leads appear here the moment someone fills the form.
                  </p>
                  {cardUrl && (
                    <CopyLinkButton url={cardUrl} fg="var(--charcoal)" />
                  )}
                </div>
              )}
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
