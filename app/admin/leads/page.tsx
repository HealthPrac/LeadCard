import { getLeadIntel } from '@/lib/admin/queries'

const SOURCE_LABEL: Record<string, string> = {
  qr: 'QR code', nfc: 'NFC tap', direct: 'Direct link',
  'email-sig': 'Email signature', linkedin: 'LinkedIn', unknown: 'Unknown',
}

export default async function LeadsPage() {
  const intel = await getLeadIntel()

  const maxInd     = Math.max(1, ...intel.byIndustry.slice(0, 10).map(i => i.count))
  const maxSrc     = Math.max(1, ...intel.bySource.map(s => s.count))
  const maxCountry = Math.max(1, ...intel.byCountry.slice(0, 8).map(c => c.count))
  const last6      = intel.monthly.slice(-6)
  const maxMonth   = Math.max(1, ...last6.map(m => m.count))

  return (
    <div style={{ maxWidth: 960 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--sage)', marginBottom: 6 }}>
          Admin Console
        </p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 34, fontWeight: 400, margin: 0, letterSpacing: '-0.01em' }}>
          Lead Intelligence
        </h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
          Aggregate lead capture data across all subscribers and cards.
        </p>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total leads captured', value: intel.total,      note: 'all time' },
          { label: 'This month',           value: intel.thisMonth,  note: new Date().toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' }) },
        ].map(stat => (
          <div key={stat.label} style={{ background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--line)', padding: '18px 22px' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--charcoal)', lineHeight: 1 }}>{stat.value.toLocaleString()}</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--charcoal)', marginTop: 6 }}>{stat.label}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{stat.note}</div>
          </div>
        ))}
      </div>

      {/* 2-col: Industry + Sources */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* By industry */}
        <div style={{ background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--line)', padding: '20px 24px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sage)', marginBottom: 16 }}>
            Leads by industry
          </p>
          {intel.byIndustry.length === 0 ? (
            <p style={{ fontSize: 12.5, color: 'var(--muted)', fontStyle: 'italic' }}>No industry-tagged leads yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {intel.byIndustry.slice(0, 10).map(row => (
                <div key={row.industry}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12.5, color: 'var(--charcoal)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '72%' }}>
                      {row.industry}
                    </span>
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--charcoal)', flexShrink: 0 }}>{row.count}</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 99, background: 'var(--cream-2)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 99, background: 'var(--sage)', width: `${(row.count / maxInd) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* By source */}
        <div style={{ background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--line)', padding: '20px 24px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sage)', marginBottom: 16 }}>
            Leads by source
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {intel.bySource.map(row => (
              <div key={row.source}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12.5, color: 'var(--charcoal)' }}>{SOURCE_LABEL[row.source] ?? row.source}</span>
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--charcoal)' }}>{row.count}</span>
                </div>
                <div style={{ height: 5, borderRadius: 99, background: 'var(--cream-2)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 99, background: '#17181C', width: `${(row.count / maxSrc) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* By country */}
      <div style={{ background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--line)', padding: '20px 24px', marginBottom: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sage)', marginBottom: 16 }}>
          Leads by market (subscriber country)
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {intel.byCountry.slice(0, 8).map((c, i) => (
            <div key={c.country} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--muted)', width: 16, textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 12.5, color: 'var(--charcoal)' }}>{c.country}</span>
                  <span style={{ fontSize: 11.5, fontWeight: 600 }}>{c.count}</span>
                </div>
                <div style={{ height: 4, borderRadius: 99, background: 'var(--cream-2)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 99, background: 'var(--sage)', width: `${(c.count / maxCountry) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly trend */}
      <div style={{ background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--line)', padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sage)' }}>
            Monthly lead trend — last 6 months
          </p>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>
            {last6.reduce((s, m) => s + m.count, 0)} leads in period
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 80 }}>
          {last6.map(m => (
            <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--charcoal)', minHeight: 16 }}>{m.count > 0 ? m.count : ''}</span>
              <div style={{ width: '100%', borderRadius: '4px 4px 0 0', background: 'var(--cream-2)', height: 44, overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}>
                <div style={{ width: '100%', borderRadius: '4px 4px 0 0', background: 'var(--sage)', height: maxMonth > 0 ? `${(m.count / maxMonth) * 100}%` : '0%' }} />
              </div>
              <span style={{ fontSize: 10, color: 'var(--muted)' }}>{m.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
