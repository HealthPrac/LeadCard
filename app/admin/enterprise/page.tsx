import Link from 'next/link'
import { requireAdmin } from '@/lib/admin/gate'
import { getEnterpriseLeads, getEnterpriseEnrollments } from '@/lib/admin/enterprise-queries'

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  new:       { bg: 'rgba(184,116,62,0.12)', color: '#B8743E', label: 'New' },
  contacted: { bg: 'rgba(86,152,195,0.14)', color: '#3B82C4', label: 'Contacted' },
  enrolled:  { bg: 'rgba(42,122,74,0.14)',  color: '#2A7A4A', label: 'Enrolled' },
  lost:      { bg: 'rgba(100,100,100,0.1)', color: '#888',    label: 'Lost' },
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function EnterprisePage() {
  await requireAdmin()
  const [leads, enrollments] = await Promise.all([
    getEnterpriseLeads(),
    getEnterpriseEnrollments(),
  ])

  const openLeads = leads.filter(l => l.status !== 'enrolled' && l.status !== 'lost')
  const lostLeads = leads.filter(l => l.status === 'lost')

  return (
    <div style={{ maxWidth: 980 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--sage)', marginBottom: 6 }}>
          Admin Console
        </p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 34, fontWeight: 400, margin: 0, letterSpacing: '-0.01em' }}>
          Enterprise
        </h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
          Inquiries, enrollments, and pricing governance for enterprise tenants.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Total inquiries',  value: leads.length },
          { label: 'Open leads',       value: openLeads.length },
          { label: 'Enrolled',         value: enrollments.length },
          { label: 'Lost',             value: lostLeads.length },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--line)', padding: '16px 20px', borderRadius: 12 }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--charcoal)', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Enrolled tenants */}
      {enrollments.length > 0 && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 14, marginBottom: 24, overflow: 'hidden' }}>
          <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2A7A4A', margin: 0 }}>
              Enrolled tenants
            </p>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{enrollments.length} tenant{enrollments.length !== 1 ? 's' : ''}</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)' }}>
                {['Company', 'Seats', 'Price/user', 'API', 'Currency', 'Enrolled', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e, i) => (
                <tr key={e.id} style={{ borderBottom: i < enrollments.length - 1 ? '1px solid var(--line)' : 'none' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--charcoal)' }}>{e.company_name}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--charcoal)' }}>{e.seats}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--charcoal)', fontWeight: 500 }}>{e.price_per_user_display}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 12, background: e.api_access ? 'rgba(42,122,74,0.14)' : 'rgba(100,100,100,0.1)', color: e.api_access ? '#2A7A4A' : '#888', padding: '2px 8px', borderRadius: 4 }}>
                      {e.api_access ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{e.currency}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{fmt(e.enrolled_at)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {e.lead_id && (
                      <Link href={`/admin/enterprise/${e.lead_id}`} style={{ fontSize: 12, color: '#B8743E', textDecoration: 'none', fontWeight: 500 }}>
                        Manage →
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Open leads */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 14, marginBottom: 24, overflow: 'hidden' }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sage)', margin: 0 }}>
            Open inquiries
          </p>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{openLeads.length} lead{openLeads.length !== 1 ? 's' : ''}</span>
        </div>

        {openLeads.length === 0 ? (
          <div style={{ padding: '32px 22px', textAlign: 'center', color: 'var(--muted)', fontSize: 13.5, fontStyle: 'italic' }}>
            No open inquiries.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)' }}>
                {['Company', 'Contact', 'Est. seats', 'Date', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {openLeads.map((lead, i) => {
                const s = STATUS_STYLE[lead.status] ?? STATUS_STYLE.new
                return (
                  <tr key={lead.id} style={{ borderBottom: i < openLeads.length - 1 ? '1px solid var(--line)' : 'none' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--charcoal)' }}>{lead.company_name}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ color: 'var(--charcoal)' }}>{lead.contact_name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{lead.contact_email}</div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{lead.estimated_seats ?? '—'}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{fmt(lead.created_at)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 11.5, fontWeight: 600, background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 4 }}>{s.label}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Link href={`/admin/enterprise/${lead.id}`} style={{ fontSize: 12, color: '#B8743E', textDecoration: 'none', fontWeight: 500 }}>
                        View →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Lost leads (collapsed) */}
      {lostLeads.length > 0 && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--line)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', margin: 0 }}>
              Lost / closed — {lostLeads.length}
            </p>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
            <tbody>
              {lostLeads.map((lead, i) => (
                <tr key={lead.id} style={{ borderBottom: i < lostLeads.length - 1 ? '1px solid var(--line)' : 'none', opacity: 0.65 }}>
                  <td style={{ padding: '10px 16px', fontWeight: 500, color: 'var(--charcoal)' }}>{lead.company_name}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--muted)' }}>{lead.contact_name}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--muted)' }}>{fmt(lead.created_at)}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <Link href={`/admin/enterprise/${lead.id}`} style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'none' }}>View →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
