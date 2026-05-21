import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: subscriber } = await supabase.from('subscribers').select('id, plan, subscription_status, trial_ends_at').eq('user_id', user.id).single()
  if (!subscriber) redirect('/onboarding')

  const { data: cards } = await supabase.from('cards').select('*').eq('subscriber_id', subscriber.id).order('created_at')
  const card = cards?.[0]

  const { data: recentLeads } = await supabase
    .from('leads').select('*')
    .eq('subscriber_id', subscriber.id)
    .order('created_at', { ascending: false })
    .limit(6)

  const { count: totalLeads } = await supabase
    .from('leads').select('*', { count: 'exact', head: true })
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

      {/* Hero card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 20 }}>
        {card ? (
          <div style={{ padding: 28, borderRadius: 14, background: card.theme_bg, color: card.theme_fg, position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: card.theme_accent, marginBottom: 8 }}>Your card</div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 40, margin: '0 0 4px', color: card.theme_fg, letterSpacing: '-0.01em' }}>{card.display_name}</h2>
            <div style={{ fontSize: 13.5, opacity: 0.7 }}>{[card.title, card.company].filter(Boolean).join(' · ')}</div>
            <div style={{ fontFamily: 'var(--font-mono)', marginTop: 22, fontSize: 12.5, opacity: 0.8 }}>
              leadcard.app/c/{card.slug}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              <Link href="/editor" style={{ padding: '8px 14px', background: card.theme_fg, color: card.theme_bg, borderRadius: 8, fontSize: 12.5, fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                ✦ Edit card
              </Link>
              <Link href="/share" style={{ padding: '8px 14px', background: `rgba(255,255,255,0.10)`, color: card.theme_fg, border: '1px solid rgba(255,255,255,0.18)', borderRadius: 8, fontSize: 12.5, fontWeight: 500, textDecoration: 'none' }}>
                ⊡ Share
              </Link>
              {cardUrl && (
                <a href={cardUrl} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 14px', background: `rgba(255,255,255,0.10)`, color: card.theme_fg, border: '1px solid rgba(255,255,255,0.18)', borderRadius: 8, fontSize: 12.5, fontWeight: 500, textDecoration: 'none' }}>
                  ↗ View live
                </a>
              )}
            </div>
            {/* Decorative rings */}
            <div style={{ position: 'absolute', right: -30, top: -30, width: 200, height: 200, borderRadius: '50%', border: `1px solid ${card.theme_accent}40` }}/>
            <div style={{ position: 'absolute', right: -60, top: -60, width: 260, height: 260, borderRadius: '50%', border: `1px solid ${card.theme_accent}18` }}/>
          </div>
        ) : (
          <div style={{ padding: 28, borderRadius: 14, background: 'var(--cream-2)', border: '2px dashed var(--line)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, textAlign: 'center' }}>
            <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>No card yet.</p>
            <Link href="/onboarding" style={{ padding: '10px 20px', background: 'var(--charcoal)', color: 'var(--cream)', borderRadius: 8, fontSize: 13.5, textDecoration: 'none', fontWeight: 500 }}>Create your card →</Link>
          </div>
        )}

        <div style={{ padding: 24, borderRadius: 14, background: 'white', border: '1px solid var(--line)' }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 10 }}>All time</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 20 }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 52, lineHeight: 1 }}>{totalLeads ?? 0}</span>
            <span style={{ fontSize: 14, color: 'var(--muted)' }}>leads captured</span>
          </div>
          <Link href="/leads" style={{ fontSize: 13, color: 'var(--charcoal)', textDecoration: 'underline' }}>View all leads →</Link>
        </div>
      </div>

      {/* Recent leads */}
      {recentLeads && recentLeads.length > 0 ? (
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px 14px', borderBottom: '1px solid var(--line-2)' }}>
            <span style={{ fontSize: 13.5, fontWeight: 500 }}>Recent leads</span>
            <Link href="/leads" style={{ fontSize: 12.5, color: 'var(--muted)', textDecoration: 'none' }}>View all</Link>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: 'var(--cream-2)' }}>
                {['Person', 'Company', 'Source', 'When'].map(h => (
                  <th key={h} style={{ padding: '10px 22px', textAlign: 'left', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentLeads.map((l, i) => (
                <tr key={l.id} style={{ borderTop: '1px solid var(--line-2)' }}>
                  <td style={{ padding: '13px 22px' }}>
                    <div style={{ fontWeight: 500 }}>{[l.first_name, l.last_name].filter(Boolean).join(' ') || l.email}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{l.email}</div>
                  </td>
                  <td style={{ padding: '13px 22px', color: 'var(--muted)' }}>{l.org ?? '—'}</td>
                  <td style={{ padding: '13px 22px', color: 'var(--muted)' }}>{l.source ?? '—'}</td>
                  <td style={{ padding: '13px 22px', color: 'var(--muted)', fontSize: 12 }}>{formatRelTime(l.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ background: 'var(--sage-tint)', borderRadius: 14, padding: '32px 28px', textAlign: 'center' }}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>◎</div>
          <p style={{ fontSize: 15, fontWeight: 500, margin: '0 0 6px' }}>No leads yet — share your card to get started.</p>
          <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: '0 0 18px' }}>When someone fills the form on your card, they&apos;ll appear here instantly.</p>
          {cardUrl && (
            <a href={cardUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '10px 20px', background: 'var(--charcoal)', color: 'var(--cream)', borderRadius: 8, fontSize: 13.5, textDecoration: 'none', fontWeight: 500 }}>
              View your live card →
            </a>
          )}
        </div>
      )}
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
