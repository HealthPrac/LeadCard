'use client'

import type { SubscriberRow } from '@/lib/admin/queries'

const PLAN_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  solo:       { bg: '#DCE6DE', color: '#17181C', label: 'Solo' },
  small:      { bg: '#B8D4BD', color: '#17181C', label: 'Small Biz' },
  enterprise: { bg: '#17181C', color: '#F6F7F3', label: 'Enterprise' },
}

const STATUS_STYLE: Record<string, { color: string; label: string }> = {
  active:     { color: '#16a34a', label: 'Active' },
  trialing:   { color: '#d97706', label: 'Trialing' },
  past_due:   { color: '#dc2626', label: 'Past due' },
  canceled:   { color: '#6b7280', label: 'Canceled' },
  incomplete: { color: '#9ca3af', label: 'Incomplete' },
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function SubscribersClient({ subscribers }: { subscribers: SubscriberRow[] }) {
  if (subscribers.length === 0) {
    return (
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', padding: 48, textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>No subscribers yet.</p>
      </div>
    )
  }

  return (
    <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--cream-2)' }}>
              {['#', 'Joined', 'Company', 'Plan', 'Status', 'Industry', 'Country', 'Cards', 'Leads', 'Email'].map(h => (
                <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subscribers.map((s, i) => {
              const plan   = PLAN_STYLE[s.plan]   ?? { bg: 'var(--cream-2)', color: 'var(--charcoal)', label: s.plan }
              const status = STATUS_STYLE[s.subscription_status] ?? { color: 'var(--muted)', label: s.subscription_status }
              return (
                <tr
                  key={s.id}
                  style={{ borderTop: '1px solid var(--line-2)', transition: 'background 120ms' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--cream-2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  <td style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 11.5 }}>{i + 1}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted)', whiteSpace: 'nowrap', fontSize: 12 }}>{fmtDate(s.created_at)}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 500, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.company ?? <span style={{ color: 'var(--muted)', fontStyle: 'italic', fontWeight: 400 }}>—</span>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ display: 'inline-block', background: plan.bg, color: plan.color, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
                      {plan.label}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: status.color }}>{status.label}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--muted)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.industry ?? '—'}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                    {s.country ?? '—'}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>{s.cardCount}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: s.leadCount > 0 ? '#16a34a' : 'var(--muted)' }}>{s.leadCount}</td>
                  <td style={{ padding: '12px 16px', fontSize: 11.5, color: 'var(--muted)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.email}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
