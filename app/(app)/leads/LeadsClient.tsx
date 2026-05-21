'use client'

import { useState, useMemo } from 'react'

interface Lead {
  id: string
  created_at: string
  first_name: string | null
  last_name: string | null
  email: string
  org: string | null
  role: string | null
  mobile: string | null
  message: string | null
  source: string | null
  card_id: string | null
}

interface Card {
  id: string
  display_name: string | null
  slug: string
}

interface Props {
  leads: Lead[]
  cards: Card[]
}

export default function LeadsClient({ leads, cards }: Props) {
  const [search, setSearch] = useState('')
  const [cardFilter, setCardFilter] = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return leads.filter(l => {
      const name = [l.first_name, l.last_name].filter(Boolean).join(' ').toLowerCase()
      const q = search.toLowerCase()
      const matchesSearch = !q || name.includes(q) || l.email.toLowerCase().includes(q) || (l.org ?? '').toLowerCase().includes(q)
      const matchesCard = cardFilter === 'all' || l.card_id === cardFilter
      return matchesSearch && matchesCard
    })
  }, [leads, search, cardFilter])

  function exportCsv() {
    const rows = [
      ['First name', 'Last name', 'Email', 'Company', 'Role', 'Mobile', 'Source', 'Message', 'Date'].join(','),
      ...filtered.map(l => [
        l.first_name ?? '',
        l.last_name ?? '',
        l.email,
        l.org ?? '',
        l.role ?? '',
        l.mobile ?? '',
        l.source ?? '',
        (l.message ?? '').replace(/,/g, ';').replace(/\n/g, ' '),
        new Date(l.created_at).toLocaleDateString('en-ZA'),
      ].map(v => `"${v}"`).join(','))
    ].join('\n')
    const blob = new Blob([rows], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  return (
    <div style={{ maxWidth: 1000 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, margin: '0 0 2px', letterSpacing: '-0.01em' }}>Leads</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>{leads.length} total captured</p>
        </div>
        {filtered.length > 0 && (
          <button onClick={exportCsv} style={{ padding: '8px 16px', background: 'var(--charcoal)', color: 'var(--cream)', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
            ↓ Export CSV
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search name, email, company…"
          style={{ flex: 1, padding: '9px 14px', borderRadius: 8, border: '1px solid var(--line)', fontSize: 13.5, background: 'white', fontFamily: 'inherit', outline: 'none' }}
        />
        {cards.length > 1 && (
          <select
            value={cardFilter}
            onChange={e => setCardFilter(e.target.value)}
            style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid var(--line)', fontSize: 13.5, background: 'white', fontFamily: 'inherit', color: 'var(--charcoal)', outline: 'none' }}
          >
            <option value="all">All cards</option>
            {cards.map(c => (
              <option key={c.id} value={c.id}>{c.display_name ?? c.slug}</option>
            ))}
          </select>
        )}
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: 'var(--sage-tint)', borderRadius: 14, padding: '48px 28px', textAlign: 'center' }}>
          <div style={{ fontSize: 24, marginBottom: 10 }}>◎</div>
          <p style={{ fontSize: 15, fontWeight: 500, margin: '0 0 6px' }}>
            {leads.length === 0 ? 'No leads yet.' : 'No leads match your search.'}
          </p>
          <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: 0 }}>
            {leads.length === 0 ? 'Share your card to start collecting contacts.' : 'Try a different search or filter.'}
          </p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: 'var(--cream-2)' }}>
                {['Person', 'Company / Role', 'Source', 'Date', ''].map((h, i) => (
                  <th key={i} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <>
                  <tr key={l.id} style={{ borderTop: '1px solid var(--line-2)', cursor: 'pointer' }} onClick={() => setExpanded(expanded === l.id ? null : l.id)}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontWeight: 500 }}>{[l.first_name, l.last_name].filter(Boolean).join(' ') || '—'}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{l.email}</div>
                      {l.mobile && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{l.mobile}</div>}
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--muted)' }}>
                      <div>{l.org ?? '—'}</div>
                      {l.role && <div style={{ fontSize: 12 }}>{l.role}</div>}
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--muted)' }}>{l.source ?? '—'}</td>
                    <td style={{ padding: '14px 20px', color: 'var(--muted)', fontSize: 12 }}>
                      {new Date(l.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--muted)', textAlign: 'right' }}>
                      <span style={{ fontSize: 11, background: 'var(--cream-2)', padding: '3px 8px', borderRadius: 6 }}>{expanded === l.id ? '▲' : '▼'}</span>
                    </td>
                  </tr>
                  {expanded === l.id && (
                    <tr key={`${l.id}-expanded`} style={{ borderTop: '1px solid var(--line-2)', background: 'var(--cream-2)' }}>
                      <td colSpan={5} style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                          {l.message && (
                            <div style={{ gridColumn: '1 / -1' }}>
                              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: 4 }}>Message</div>
                              <div style={{ fontSize: 13.5, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{l.message}</div>
                            </div>
                          )}
                          <div>
                            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: 4 }}>Reply</div>
                            <a href={`mailto:${l.email}`} style={{ fontSize: 13.5, color: 'var(--charcoal)', textDecoration: 'underline' }}>{l.email}</a>
                          </div>
                          {l.mobile && (
                            <div>
                              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: 4 }}>Call / WhatsApp</div>
                              <a href={`tel:${l.mobile}`} style={{ fontSize: 13.5, color: 'var(--charcoal)', textDecoration: 'underline' }}>{l.mobile}</a>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
