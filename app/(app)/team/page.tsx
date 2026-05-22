import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function TeamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: subscriber } = await supabase
    .from('subscribers')
    .select('id, plan')
    .eq('user_id', user.id)
    .single()
  if (!subscriber) redirect('/onboarding')

  const { data: cards } = await supabase
    .from('cards')
    .select('id, display_name, title, company, slug, email, mobile, is_published, created_at')
    .eq('subscriber_id', subscriber.id)
    .order('created_at', { ascending: true })

  // Lead counts per card in one query
  const { data: leadRows } = await supabase
    .from('leads')
    .select('card_id')
    .eq('subscriber_id', subscriber.id)

  const leadCounts: Record<string, number> = {}
  for (const l of leadRows ?? []) {
    if (l.card_id) leadCounts[l.card_id] = (leadCounts[l.card_id] ?? 0) + 1
  }

  const totalLeads = (leadRows ?? []).length
  const companyName = cards?.[0]?.company ?? null

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, margin: '0 0 4px', letterSpacing: '-0.01em' }}>Team</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
            {companyName && <span style={{ fontWeight: 500, color: 'var(--charcoal)' }}>{companyName} · </span>}
            {cards?.length ?? 0} active {(cards?.length ?? 0) === 1 ? 'card' : 'cards'} · {totalLeads} total leads
          </p>
        </div>
      </div>

      {/* Cards table */}
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 22px 12px', borderBottom: '1px solid var(--line-2)', display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 16, alignItems: 'center' }}>
          {['Team member', 'Leads', 'Card URL', ''].map((h, i) => (
            <div key={i} style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', fontWeight: 500, textAlign: i > 0 ? 'right' as const : 'left' as const }}>{h}</div>
          ))}
        </div>

        {(cards ?? []).map((card, idx) => {
          const initials = (card.display_name ?? '?').split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
          const leads = leadCounts[card.id] ?? 0
          const pct = totalLeads > 0 ? Math.round((leads / totalLeads) * 100) : 0

          return (
            <div key={card.id} style={{ padding: '16px 22px', borderTop: idx === 0 ? 'none' : '1px solid var(--line-2)', display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 16, alignItems: 'center' }}>

              {/* Identity */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--sage-tint)', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
                  {initials}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{card.display_name ?? '—'}</span>
                    {idx === 0 && (
                      <span style={{ fontSize: 10, padding: '1px 7px', background: 'var(--sage)', color: 'var(--charcoal)', borderRadius: 999, fontWeight: 600, letterSpacing: '0.04em' }}>OWNER</span>
                    )}
                    {!card.is_published && (
                      <span style={{ fontSize: 10, padding: '1px 7px', background: 'var(--cream-2)', color: 'var(--muted)', borderRadius: 999 }}>Draft</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{card.title ?? '—'}</div>
                </div>
              </div>

              {/* Lead count */}
              <div style={{ textAlign: 'right' as const }}>
                <div style={{ fontSize: 18, fontFamily: 'var(--font-serif)', lineHeight: 1 }}>{leads}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{pct}% of total</div>
              </div>

              {/* Card URL */}
              <div style={{ textAlign: 'right' as const }}>
                <a
                  href={`/c/${card.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}
                >
                  /c/{card.slug} ↗
                </a>
              </div>

              {/* Actions */}
              <div style={{ textAlign: 'right' as const }}>
                <Link
                  href={`/editor?card=${card.id}`}
                  style={{ fontSize: 12.5, color: 'var(--charcoal)', textDecoration: 'none', padding: '5px 12px', border: '1px solid var(--line)', borderRadius: 7, whiteSpace: 'nowrap' as const }}
                >
                  Edit →
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {/* Permissions note */}
      <div style={{ marginTop: 16, padding: '14px 18px', background: 'var(--cream-2)', borderRadius: 10, fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5 }}>
        <strong style={{ color: 'var(--charcoal)' }}>Account owner</strong> can edit company branding (colours, logo, fonts) from the editor.
        Team members can update their own photo, mobile number, and email.
      </div>
    </div>
  )
}
