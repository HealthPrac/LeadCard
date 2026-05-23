import { getAdminAnalytics } from '@/lib/admin/queries'
import { requireAdmin } from '@/lib/admin/gate'

export const dynamic = 'force-dynamic'

export default async function AdminAnalyticsPage() {
  await requireAdmin()

  const data = await getAdminAnalytics()
  const { dailyViews, funnel, deviceSplit, shareChannels, topCards } = data

  const maxDaily = Math.max(...dailyViews.map(d => d.views), 1)

  const funnelRows = [
    { label: 'Card views',        value: funnel.views30,      pct: 100 },
    { label: 'Video plays',       value: funnel.videoStarts,  pct: funnel.views30 ? Math.round(funnel.videoStarts  / funnel.views30 * 100) : 0 },
    { label: 'CTA clicks',        value: funnel.ctaClicks,    pct: funnel.views30 ? Math.round(funnel.ctaClicks    / funnel.views30 * 100) : 0 },
    { label: 'Form opens',        value: funnel.formStarts,   pct: funnel.views30 ? Math.round(funnel.formStarts   / funnel.views30 * 100) : 0 },
    { label: 'Form submissions',  value: funnel.formSubmits,  pct: funnel.views30 ? Math.round(funnel.formSubmits  / funnel.views30 * 100) : 0 },
  ]

  const channelLabels: Record<string, string> = {
    qr:        'QR code',
    nfc:       'NFC tap',
    copy_link: 'Copy link',
    email_sig: 'Email signature',
    direct:    'Direct',
    unknown:   'Unknown',
  }

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1000 }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, margin: '0 0 4px', letterSpacing: '-0.01em' }}>Platform analytics</h1>
      <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 28px' }}>Last 30 days of engagement across all subscriber cards.</p>

      {/* Daily views bar chart */}
      <div style={{ background: 'white', border: '1px solid var(--line)', borderRadius: 14, padding: 24, marginBottom: 16 }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 16 }}>Daily card views — last 30 days</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 120 }}>
          {dailyViews.map(d => (
            <div key={d.date} title={`${d.label}: ${d.views} views`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
              <div style={{
                width: '100%',
                height: `${Math.max(2, (d.views / maxDaily) * 100)}%`,
                background: d.views > 0 ? 'var(--charcoal)' : 'var(--line)',
                borderRadius: '2px 2px 0 0',
                transition: '200ms',
              }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: 'var(--muted)' }}>
          <span>{dailyViews[0]?.label}</span>
          <span>{dailyViews[14]?.label}</span>
          <span>{dailyViews[29]?.label}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Engagement funnel */}
        <div style={{ background: 'white', border: '1px solid var(--line)', borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 16 }}>Engagement funnel</div>
          {funnelRows.map(row => (
            <div key={row.label} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 13 }}>
                <span>{row.label}</span>
                <span style={{ color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>
                  {row.value.toLocaleString()} <span style={{ fontSize: 11 }}>({row.pct}%)</span>
                </span>
              </div>
              <div style={{ height: 6, background: 'var(--cream-2)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${row.pct}%`, height: '100%', background: 'var(--charcoal)', borderRadius: 3, transition: '400ms' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Share channels */}
        <div style={{ background: 'white', border: '1px solid var(--line)', borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 16 }}>Share channels</div>
          {shareChannels.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>No tracked share links yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <th style={{ textAlign: 'left', padding: '0 0 8px', fontWeight: 500, color: 'var(--muted)', fontSize: 11 }}>Channel</th>
                  <th style={{ textAlign: 'right', padding: '0 0 8px', fontWeight: 500, color: 'var(--muted)', fontSize: 11 }}>Views</th>
                  <th style={{ textAlign: 'right', padding: '0 0 8px', fontWeight: 500, color: 'var(--muted)', fontSize: 11 }}>Leads</th>
                </tr>
              </thead>
              <tbody>
                {shareChannels.map(c => (
                  <tr key={c.channel} style={{ borderBottom: '1px solid var(--line-2)' }}>
                    <td style={{ padding: '9px 0' }}>{channelLabels[c.channel] ?? c.channel}</td>
                    <td style={{ padding: '9px 0', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{c.views.toLocaleString()}</td>
                    <td style={{ padding: '9px 0', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--sage)' }}>{c.leads.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Device split */}
        <div style={{ background: 'white', border: '1px solid var(--line)', borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 16 }}>Device split (views)</div>
          {deviceSplit.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>No data yet.</p>
          ) : (() => {
            const total = deviceSplit.reduce((s, d) => s + d.count, 0)
            return deviceSplit.map(d => (
              <div key={d.device} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 13 }}>
                  <span style={{ textTransform: 'capitalize' }}>{d.device}</span>
                  <span style={{ color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>
                    {d.count.toLocaleString()} <span style={{ fontSize: 11 }}>({Math.round(d.count / total * 100)}%)</span>
                  </span>
                </div>
                <div style={{ height: 6, background: 'var(--cream-2)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.round(d.count / total * 100)}%`, height: '100%', background: 'var(--sage)', borderRadius: 3 }} />
                </div>
              </div>
            ))
          })()}
        </div>

        {/* Top cards */}
        <div style={{ background: 'white', border: '1px solid var(--line)', borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 16 }}>Top cards by tracked views</div>
          {topCards.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>No tracked views yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <th style={{ textAlign: 'left', padding: '0 0 8px', fontWeight: 500, color: 'var(--muted)', fontSize: 11 }}>Card</th>
                  <th style={{ textAlign: 'right', padding: '0 0 8px', fontWeight: 500, color: 'var(--muted)', fontSize: 11 }}>Views</th>
                </tr>
              </thead>
              <tbody>
                {topCards.map(c => (
                  <tr key={c.cardId} style={{ borderBottom: '1px solid var(--line-2)' }}>
                    <td style={{ padding: '9px 0' }}>
                      <div style={{ fontWeight: 500 }}>{c.displayName ?? 'Unnamed'}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>/c/{c.slug}</div>
                    </td>
                    <td style={{ padding: '9px 0', textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>{c.views.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
