import { getAdminAnalytics } from '@/lib/admin/queries'
import { requireAdmin } from '@/lib/admin/gate'

export const dynamic = 'force-dynamic'

function fmtDuration(s: number): string {
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60); const rs = s % 60
  if (m < 60) return rs > 0 ? `${m}m ${rs}s` : `${m}m`
  const h = Math.floor(m / 60); const rm = m % 60
  return rm > 0 ? `${h}h ${rm}m` : `${h}h`
}

const CHANNEL_LABELS: Record<string, string> = {
  qr:        'QR code',
  nfc:       'NFC tap',
  copy_link: 'Copy link',
  email_sig: 'Email signature',
  direct:    'Direct',
  unknown:   'Unknown',
}

export default async function AdminAnalyticsPage() {
  await requireAdmin()

  const {
    dailyViews,
    funnel,
    avgDurationSeconds,
    deviceSplit,
    geoBreakdown,
    industryBreakdown,
    timeOfDay,
    shareChannels,
    topCards,
  } = await getAdminAnalytics()

  const maxDaily   = Math.max(...dailyViews.map(d => d.views), 1)
  const maxHour    = Math.max(...timeOfDay.map(h => h.views), 1)
  const peakHour   = timeOfDay.reduce((a, b) => b.views > a.views ? b : a, timeOfDay[0])

  const funnelRows = [
    { label: 'Card views',       value: funnel.views30,     pct: 100 },
    { label: 'Video plays',      value: funnel.videoStarts, pct: funnel.views30 ? Math.round(funnel.videoStarts  / funnel.views30 * 100) : 0 },
    { label: 'CTA clicks',       value: funnel.ctaClicks,   pct: funnel.views30 ? Math.round(funnel.ctaClicks    / funnel.views30 * 100) : 0 },
    { label: 'Form opens',       value: funnel.formStarts,  pct: funnel.views30 ? Math.round(funnel.formStarts   / funnel.views30 * 100) : 0 },
    { label: 'Form submissions', value: funnel.formSubmits, pct: funnel.views30 ? Math.round(funnel.formSubmits  / funnel.views30 * 100) : 0 },
  ]

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1040 }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, margin: '0 0 4px', letterSpacing: '-0.01em' }}>Platform analytics</h1>
      <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 28px' }}>Last 30 days — engagement, geography, industry, and timing across all subscriber cards.</p>

      {/* ── Top stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Card views (30d)',    value: funnel.views30.toLocaleString() },
          { label: 'Form submissions',   value: funnel.formSubmits.toLocaleString() },
          { label: 'Conversion rate',    value: funnel.views30 ? `${Math.round(funnel.formSubmits / funnel.views30 * 100)}%` : '—' },
          { label: 'Avg time on card',   value: avgDurationSeconds !== null ? fmtDuration(avgDurationSeconds) : '—' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 34, lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── Daily views bar chart ── */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 14, padding: 24, marginBottom: 16 }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 16 }}>Daily card views — last 30 days</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 120 }}>
          {dailyViews.map(d => (
            <div key={d.date} title={`${d.label}: ${d.views} views`}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{
                width: '100%',
                height: `${Math.max(2, (d.views / maxDaily) * 100)}%`,
                background: d.views > 0 ? 'var(--charcoal)' : 'var(--line)',
                borderRadius: '2px 2px 0 0',
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

      {/* ── Time of day ── */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 14, padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)' }}>Time of day (UTC) — peak: {peakHour?.label}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>Hover bar for count</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 80 }}>
          {timeOfDay.map(h => (
            <div key={h.hour} title={`${h.label} UTC: ${h.views} views`}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{
                width: '100%',
                height: `${Math.max(2, (h.views / maxHour) * 100)}%`,
                background: h.hour === peakHour?.hour ? 'var(--sage)' : h.views > 0 ? 'var(--charcoal)' : 'var(--line)',
                borderRadius: '2px 2px 0 0',
                opacity: h.views > 0 ? 1 : 0.4,
              }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 9, color: 'var(--muted)' }}>
          {['00:00', '06:00', '12:00', '18:00', '23:00'].map(l => <span key={l}>{l}</span>)}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* ── Engagement funnel ── */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 14, padding: 24 }}>
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
                <div style={{ width: `${row.pct}%`, height: '100%', background: 'var(--charcoal)', borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>

        {/* ── Share channels ── */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 16 }}>Share channels</div>
          {shareChannels.length === 0
            ? <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>No tracked share links yet.</p>
            : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--line)' }}>
                    <th style={{ textAlign: 'left',  padding: '0 0 8px', fontWeight: 500, color: 'var(--muted)', fontSize: 11 }}>Channel</th>
                    <th style={{ textAlign: 'right', padding: '0 0 8px', fontWeight: 500, color: 'var(--muted)', fontSize: 11 }}>Views</th>
                    <th style={{ textAlign: 'right', padding: '0 0 8px', fontWeight: 500, color: 'var(--muted)', fontSize: 11 }}>Leads</th>
                  </tr>
                </thead>
                <tbody>
                  {shareChannels.map(c => (
                    <tr key={c.channel} style={{ borderBottom: '1px solid var(--line-2)' }}>
                      <td style={{ padding: '9px 0' }}>{CHANNEL_LABELS[c.channel] ?? c.channel}</td>
                      <td style={{ padding: '9px 0', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{c.views.toLocaleString()}</td>
                      <td style={{ padding: '9px 0', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--sage)' }}>{c.leads.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* ── Geographic breakdown ── */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 16 }}>Geography (top 20 countries)</div>
          {geoBreakdown.length === 0
            ? <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>No geo data yet — starts populating once visitors arrive via tracked cards.</p>
            : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--line)' }}>
                    <th style={{ textAlign: 'left',  padding: '0 0 8px', fontWeight: 500, color: 'var(--muted)', fontSize: 11 }}>Country</th>
                    <th style={{ textAlign: 'right', padding: '0 0 8px', fontWeight: 500, color: 'var(--muted)', fontSize: 11 }}>Views</th>
                    <th style={{ textAlign: 'right', padding: '0 0 8px', fontWeight: 500, color: 'var(--muted)', fontSize: 11 }}>Leads</th>
                  </tr>
                </thead>
                <tbody>
                  {geoBreakdown.map(g => (
                    <tr key={g.countryCode} style={{ borderBottom: '1px solid var(--line-2)' }}>
                      <td style={{ padding: '9px 0' }}>
                        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--muted)', marginRight: 8 }}>{g.countryCode}</span>
                        {g.country}
                      </td>
                      <td style={{ padding: '9px 0', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{g.views.toLocaleString()}</td>
                      <td style={{ padding: '9px 0', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--sage)' }}>{g.leads > 0 ? g.leads.toLocaleString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>

        {/* ── Industry breakdown ── */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 16 }}>Industry breakdown</div>
          {industryBreakdown.length === 0
            ? <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>No industry data yet — set industries on subscriber cards in the editor.</p>
            : (() => {
                const maxViews = Math.max(...industryBreakdown.map(i => i.views), 1)
                return industryBreakdown.map(ind => (
                  <div key={ind.industry} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 13 }}>
                      <span>{ind.industry}</span>
                      <span style={{ color: 'var(--muted)', fontVariantNumeric: 'tabular-nums', fontSize: 12 }}>
                        {ind.views} views · <span style={{ color: 'var(--sage)' }}>{ind.leads} leads</span>
                      </span>
                    </div>
                    <div style={{ height: 6, background: 'var(--cream-2)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${Math.round(ind.views / maxViews * 100)}%`, height: '100%', background: 'var(--charcoal)', borderRadius: 3 }} />
                    </div>
                  </div>
                ))
              })()
          }
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* ── Device split ── */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 16 }}>Device split</div>
          {deviceSplit.length === 0
            ? <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>No data yet.</p>
            : (() => {
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
              })()
          }
        </div>

        {/* ── Top cards ── */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 16 }}>Top cards by tracked views</div>
          {topCards.length === 0
            ? <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>No tracked views yet.</p>
            : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--line)' }}>
                    <th style={{ textAlign: 'left',  padding: '0 0 8px', fontWeight: 500, color: 'var(--muted)', fontSize: 11 }}>Card</th>
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
                      <td style={{ padding: '9px 0', textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
                        {c.views.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>
      </div>
    </div>
  )
}
