import { getAdminOverview } from '@/lib/admin/queries'

function fmtMonth(label: string) { return label }

const STATUS_LABEL: Record<string, string> = {
  qr: 'QR code', nfc: 'NFC tap', direct: 'Direct link',
  'email-sig': 'Email sig', linkedin: 'LinkedIn', unknown: 'Unknown',
}

export default async function AdminOverviewPage() {
  const { summary, plans, industries, countries, monthlySignups, leadSources } = await getAdminOverview()

  const maxInd     = Math.max(1, ...industries.map(i => i.subscribers))
  const maxCountry = Math.max(1, ...countries.slice(0, 8).map(c => c.count))
  const last6      = monthlySignups.slice(-6)
  const maxMonth   = Math.max(1, ...last6.map(m => m.count))

  return (
    <div style={{ maxWidth: 960 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--sage)', marginBottom: 6 }}>
          LeadCard Admin Console
        </p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 34, fontWeight: 400, margin: '0 0 4px', letterSpacing: '-0.01em' }}>
          Overview
        </h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
          Aggregate platform intelligence — internal use only. Updated live.
        </p>
      </div>

      {/* Summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 32 }}>
        {[
          { label: 'Total subscribers', value: summary.total,           sub: 'all time' },
          { label: 'Active',            value: summary.active,          sub: 'paying' },
          { label: 'Trialing',          value: summary.trialing,        sub: 'free trial' },
          { label: 'Churned',           value: summary.churned,         sub: 'canceled / past due' },
          { label: 'Total leads',       value: summary.totalLeads,      sub: 'across all cards' },
          { label: 'Cards in use',      value: summary.totalCards,      sub: 'published cards' },
          { label: 'Card views',        value: summary.totalViews.toLocaleString(), sub: 'all time, all cards' },
          { label: 'View → lead rate',  value: summary.platformConvRate > 0 ? `${summary.platformConvRate}%` : '—', sub: 'platform-wide conversion' },
        ].map(stat => (
          <div key={stat.label} style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', padding: '18px 20px' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--charcoal)', lineHeight: 1 }}>
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--charcoal)', marginTop: 6, fontWeight: 500 }}>{stat.label}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Plan split */}
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', padding: '20px 24px', marginBottom: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sage)', marginBottom: 14 }}>Plan distribution</p>
        <div style={{ display: 'flex', gap: 24 }}>
          {[
            { label: 'Solo', value: plans.solo,       color: '#8FAF9D' },
            { label: 'Small Business', value: plans.small,  color: '#6B9B82' },
            { label: 'Enterprise', value: plans.enterprise, color: '#4A7A62' },
          ].map(p => (
            <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--charcoal)' }}>{p.value}</span>
              <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>{p.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2-col: Industry + Countries */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Industry breakdown */}
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', padding: '20px 24px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sage)', marginBottom: 16 }}>
            Industries — subscribers
          </p>
          {industries.length === 0 ? (
            <p style={{ fontSize: 12.5, color: 'var(--muted)', fontStyle: 'italic' }}>No industry data yet. Apply migration 004 and ask subscribers to update their profile.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {industries.slice(0, 10).map(ind => (
                <div key={ind.industry}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12.5, color: 'var(--charcoal)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' }}>
                      {ind.industry}
                    </span>
                    <div style={{ display: 'flex', gap: 10, fontSize: 11.5, flexShrink: 0 }}>
                      <span style={{ fontWeight: 600, color: 'var(--charcoal)' }}>{ind.subscribers}</span>
                      {ind.leads > 0 && <span style={{ color: '#16a34a' }}>{ind.leads} leads</span>}
                    </div>
                  </div>
                  <div style={{ height: 5, borderRadius: 99, background: 'var(--cream-2)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 99, background: 'var(--sage)', width: `${(ind.subscribers / maxInd) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Countries */}
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', padding: '20px 24px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sage)', marginBottom: 16 }}>
            Top markets — country
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {countries.slice(0, 8).map((c, i) => (
              <div key={c.country} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 11, color: 'var(--muted)', width: 16, textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 12.5, color: 'var(--charcoal)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.country}</span>
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--charcoal)', flexShrink: 0, marginLeft: 8 }}>{c.count}</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 99, background: 'var(--cream-2)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 99, background: '#17181C', width: `${(c.count / maxCountry) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lead sources */}
      {leadSources.length > 0 && (
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', padding: '20px 24px', marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sage)', marginBottom: 14 }}>
            Lead sources
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {leadSources.map(s => (
              <div key={s.source} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--cream-2)', borderRadius: 8, padding: '8px 14px' }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--charcoal)' }}>{s.count}</span>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{STATUS_LABEL[s.source] ?? s.source}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly growth */}
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sage)' }}>
            Monthly growth — last 6 months
          </p>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>
            {last6.reduce((s, m) => s + m.count, 0)} new subscribers
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 80 }}>
          {last6.map(m => (
            <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--charcoal)', minHeight: 16 }}>{m.count > 0 ? m.count : ''}</span>
              <div style={{ width: '100%', borderRadius: '4px 4px 0 0', background: 'var(--cream-2)', height: 44, overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}>
                <div style={{ width: '100%', borderRadius: '4px 4px 0 0', background: 'var(--sage)', height: maxMonth > 0 ? `${(m.count / maxMonth) * 100}%` : '0%', transition: 'height 0.3s' }} />
              </div>
              <span style={{ fontSize: 10, color: 'var(--muted)' }}>{fmtMonth(m.label)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
