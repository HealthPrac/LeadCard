import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AddMemberModal } from '@/components/ui/AddMemberModal'
import { ShareDashboardButton } from './ShareDashboardButton'
import { ToggleAdminButton } from './ToggleAdminButton'
import type { LeadCrm } from '@/lib/supabase/types'

function formatZar(cents: number): string {
  if (cents === 0) return '—'
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 0 }).format(cents / 100)
}

function avgSatisfaction(rows: LeadCrm[]): string {
  const scores = rows.map(r => r.satisfaction_score).filter((s): s is number => s != null)
  if (!scores.length) return '—'
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  return avg.toFixed(1) + ' ★'
}

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
    .select('id, display_name, title, company, slug, email, mobile, is_published, is_account_admin, created_at')
    .eq('subscriber_id', subscriber.id)
    .order('created_at', { ascending: true })

  // Lead counts per card
  const { data: leadRows } = await supabase
    .from('leads')
    .select('card_id')
    .eq('subscriber_id', subscriber.id)

  const leadCounts: Record<string, number> = {}
  for (const l of leadRows ?? []) {
    if (l.card_id) leadCounts[l.card_id] = (leadCounts[l.card_id] ?? 0) + 1
  }

  // CRM rows for all leads under this subscriber
  const { data: allCrm } = await supabase
    .from('lead_crm')
    .select('lead_id, card_id, status, estimated_income_cents, actual_income_cents, satisfaction_score, first_engaged_at, converted_to_prospect_at, converted_to_client_at')
    .eq('subscriber_id', subscriber.id)

  // Group CRM by card_id
  const crmByCard: Record<string, LeadCrm[]> = {}
  for (const row of allCrm ?? []) {
    if (!crmByCard[row.card_id]) crmByCard[row.card_id] = []
    crmByCard[row.card_id].push(row as LeadCrm)
  }

  // Existing dashboard tokens per card
  const { data: tokenRows } = await supabase
    .from('card_holder_tokens')
    .select('card_id, token')
    .eq('subscriber_id', subscriber.id)
    .eq('is_active', true)

  const tokenByCard: Record<string, string> = {}
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  for (const t of tokenRows ?? []) {
    tokenByCard[t.card_id] = `${appUrl}/my-leads/${t.token}`
  }

  const totalLeads = (leadRows ?? []).length
  const companyName = cards?.[0]?.company ?? null
  const ownerSlug = cards?.[0]?.slug ?? ''
  const companySlug = ownerSlug.includes('-') ? ownerSlug.split('-').slice(0, -1).join('-') : ownerSlug
  const cardCount = cards?.length ?? 0

  // Admin rollup: aggregate CRM across all cards (no private notes)
  const allCrmRows = (allCrm ?? []) as LeadCrm[]
  const totalPipeline = allCrmRows.reduce((s, r) => s + (r.estimated_income_cents ?? 0), 0)
  const totalConverted = allCrmRows.filter(r => r.status === 'client').length
  const conversionRate = totalLeads > 0 ? Math.round((totalConverted / totalLeads) * 100) : 0

  return (
    <div style={{ maxWidth: 960 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, margin: '0 0 4px', letterSpacing: '-0.01em' }}>Team</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
            {companyName && <span style={{ fontWeight: 500, color: 'var(--charcoal)' }}>{companyName} · </span>}
            {cardCount} active {cardCount === 1 ? 'card' : 'cards'} · {totalLeads} total leads
          </p>
        </div>
        <AddMemberModal plan={subscriber.plan} cardCount={cardCount} companySlug={companySlug} />
      </div>

      {/* CRM summary strip */}
      {allCrmRows.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
          {[
            { label: 'Total leads',      value: String(totalLeads) },
            { label: 'Converted',        value: `${totalConverted} (${conversionRate}%)` },
            { label: 'Pipeline value',   value: formatZar(totalPipeline) },
            { label: 'Avg satisfaction', value: avgSatisfaction(allCrmRows) },
          ].map(({ label, value }) => (
            <div key={label} style={{ padding: '16px 18px', background: 'var(--bg-surface)', borderRadius: 12, border: '1px solid var(--line)' }}>
              <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)', fontWeight: 500, marginBottom: 4 }}>{label}</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--charcoal)', lineHeight: 1 }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Cards table */}
      <div style={{ background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 22px 12px', borderBottom: '1px solid var(--line-2)', display: 'grid', gridTemplateColumns: '1fr auto auto auto auto', gap: 16, alignItems: 'center' }}>
          {['Team member', 'Leads', 'Pipeline', 'Card URL', ''].map((h, i) => (
            <div key={i} style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', fontWeight: 500, textAlign: i > 0 ? 'right' as const : 'left' as const }}>{h}</div>
          ))}
        </div>

        {(cards ?? []).map((card, idx) => {
          const initials = (card.display_name ?? '?').split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
          const leads = leadCounts[card.id] ?? 0
          const pct = totalLeads > 0 ? Math.round((leads / totalLeads) * 100) : 0
          const cardCrm = crmByCard[card.id] ?? []
          const converted = cardCrm.filter(r => r.status === 'client').length
          const pipeline = cardCrm.reduce((s, r) => s + (r.estimated_income_cents ?? 0), 0)
          const convRate = leads > 0 ? Math.round((converted / leads) * 100) : 0
          const existingUrl = tokenByCard[card.id] ?? null

          return (
            <div key={card.id} style={{ borderTop: idx === 0 ? 'none' : '1px solid var(--line-2)' }}>
              {/* Main row */}
              <div style={{ padding: '16px 22px', display: 'grid', gridTemplateColumns: '1fr auto auto auto auto', gap: 16, alignItems: 'center' }}>
                {/* Identity */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--sage-tint)', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
                    {initials}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, flexWrap: 'wrap' as const }}>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{card.display_name ?? '—'}</span>
                      {idx === 0 && (
                        <span style={{ fontSize: 10, padding: '1px 7px', background: 'var(--copper)', color: '#fff', borderRadius: 999, fontWeight: 600, letterSpacing: '0.04em' }}>OWNER</span>
                      )}
                      {card.is_account_admin && (
                        <span style={{ fontSize: 10, padding: '1px 7px', background: 'rgba(184,116,62,0.15)', color: 'var(--copper)', borderRadius: 999, fontWeight: 600, letterSpacing: '0.04em', border: '1px solid rgba(184,116,62,0.3)' }}>ADMIN</span>
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

                {/* Pipeline value + conversion */}
                <div style={{ textAlign: 'right' as const, minWidth: 100 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--charcoal)' }}>{formatZar(pipeline)}</div>
                  {leads > 0 && (
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>
                      {converted}/{leads} converted ({convRate}%)
                    </div>
                  )}
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
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                  {idx > 0 && subscriber.plan !== 'solo' && (
                    <ToggleAdminButton cardId={card.id} isAdmin={card.is_account_admin ?? false} />
                  )}
                  <Link
                    href={`/editor?card=${card.id}`}
                    style={{ fontSize: 12.5, color: 'var(--charcoal)', textDecoration: 'none', padding: '5px 12px', border: '1px solid var(--line)', borderRadius: 7, whiteSpace: 'nowrap' as const }}
                  >
                    Edit →
                  </Link>
                </div>
              </div>

              {/* CRM sub-row: satisfaction + share link */}
              {leads > 0 && (
                <div style={{ padding: '0 22px 14px', display: 'flex', alignItems: 'center', gap: 20, borderTop: '1px dashed var(--line-2)' }}>
                  {/* Satisfaction */}
                  {cardCrm.length > 0 && (
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                      Satisfaction: <strong style={{ color: 'var(--charcoal)' }}>{avgSatisfaction(cardCrm)}</strong>
                    </span>
                  )}

                  <span style={{ flex: 1 }} />

                  {/* Share dashboard button */}
                  <ShareDashboardButton cardId={card.id} existingUrl={existingUrl} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Permissions note */}
      <div style={{ marginTop: 16, padding: '14px 18px', background: 'var(--cream-2)', borderRadius: 10, fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5 }}>
        <strong style={{ color: 'var(--charcoal)' }}>Share dashboard</strong> sends a card holder their personal CRM link.
        They can track leads, update pipeline status, and log notes — without accessing the full account.
        Links can be revoked and regenerated at any time.
      </div>
    </div>
  )
}
