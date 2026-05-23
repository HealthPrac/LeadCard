'use client'

import { useState, useMemo } from 'react'
import type { CrmStatus } from '@/lib/supabase/types'

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

interface CrmRow {
  lead_id: string
  status: CrmStatus
  estimated_income_cents: number | null
  actual_income_cents: number | null
  satisfaction_score: number | null
  first_engaged_at: string | null
}

interface Props {
  leads: Lead[]
  cards: Card[]
  crmRows: CrmRow[]
}

const STATUS_META: Record<CrmStatus, { label: string; bg: string; color: string }> = {
  new:      { label: 'New',      bg: '#F3F4F6', color: '#6B7280' },
  engaged:  { label: 'Engaged',  bg: '#DBEAFE', color: '#1D4ED8' },
  prospect: { label: 'Prospect', bg: '#FEF3C7', color: '#D97706' },
  client:   { label: 'Client',   bg: '#DCE6DE', color: '#17181C' },
  lost:     { label: 'Lost',     bg: '#FEE2E2', color: '#DC2626' },
}

const STATUSES: CrmStatus[] = ['new', 'engaged', 'prospect', 'client', 'lost']

function formatZar(cents: number | null): string {
  if (cents == null || cents === 0) return '—'
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 0 }).format(cents / 100)
}

const cardMap = (cards: Card[]) => Object.fromEntries(cards.map(c => [c.id, c]))

function QuickCrm({ leadId, initial, onSaved }: {
  leadId: string
  initial: CrmRow | undefined
  onSaved: (row: CrmRow) => void
}) {
  const [status, setStatus] = useState<CrmStatus>(initial?.status ?? 'new')
  const [income, setIncome] = useState(initial?.estimated_income_cents != null ? String(initial.estimated_income_cents / 100) : '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    setSaving(true)
    try {
      const payload: Record<string, unknown> = { lead_id: leadId, status }
      if (income) payload.estimated_income_cents = Math.round(parseFloat(income) * 100)
      if (status === 'engaged' && !initial?.first_engaged_at) {
        payload.first_engaged_at = new Date().toISOString()
      }
      if (status === 'prospect' && !initial?.estimated_income_cents) {
        payload.converted_to_prospect_at = new Date().toISOString()
      }
      if (status === 'client') {
        payload.converted_to_client_at = new Date().toISOString()
      }
      const res = await fetch('/api/crm/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Save failed')
      onSaved(json.crm)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line-2)' }}>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: 8, fontWeight: 500 }}>CRM</div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {STATUSES.map(s => {
            const m = STATUS_META[s]
            const active = status === s
            return (
              <button
                key={s}
                onClick={() => setStatus(s)}
                style={{
                  padding: '4px 10px', borderRadius: 999, border: 'none', cursor: 'pointer',
                  fontSize: 11.5, fontWeight: 500, fontFamily: 'inherit', transition: '80ms',
                  background: active ? m.bg : 'var(--cream)',
                  color: active ? m.color : 'var(--muted)',
                  outline: active ? `2px solid ${m.color}` : '1px solid var(--line)',
                  outlineOffset: active ? -2 : 0,
                }}
              >
                {m.label}
              </button>
            )
          })}
        </div>
        <input
          type="number"
          min="0"
          step="100"
          placeholder="Est. value (ZAR)"
          value={income}
          onChange={e => setIncome(e.target.value)}
          style={{ padding: '5px 10px', border: '1px solid var(--line)', borderRadius: 7, fontSize: 12.5, fontFamily: 'inherit', width: 160, background: 'white', outline: 'none' }}
        />
        <button
          onClick={save}
          disabled={saving}
          style={{
            padding: '5px 14px', background: saved ? 'var(--sage)' : 'var(--charcoal)',
            color: 'var(--cream)', border: 'none', borderRadius: 7,
            fontSize: 12.5, fontWeight: 500, cursor: saving ? 'wait' : 'pointer', fontFamily: 'inherit', transition: '200ms',
          }}
        >
          {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}

export default function LeadsClient({ leads, cards, crmRows }: Props) {
  const [search, setSearch] = useState('')
  const [cardFilter, setCardFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [crmMap, setCrmMap] = useState<Record<string, CrmRow>>(
    () => Object.fromEntries(crmRows.map(r => [r.lead_id, r]))
  )
  const byId = cardMap(cards)
  const isTeam = cards.length > 1

  function handleCrmSaved(row: CrmRow) {
    setCrmMap(prev => ({ ...prev, [row.lead_id]: row }))
  }

  const filtered = useMemo(() => {
    return leads.filter(l => {
      const name = [l.first_name, l.last_name].filter(Boolean).join(' ').toLowerCase()
      const q = search.toLowerCase()
      const matchesSearch = !q || name.includes(q) || l.email.toLowerCase().includes(q) || (l.org ?? '').toLowerCase().includes(q)
      const matchesCard = cardFilter === 'all' || l.card_id === cardFilter
      const crm = crmMap[l.id]
      const matchesStatus = statusFilter === 'all' || (crm?.status ?? 'new') === statusFilter
      return matchesSearch && matchesCard && matchesStatus
    })
  }, [leads, search, cardFilter, statusFilter, crmMap])

  function exportCsv() {
    const rows = [
      ['First name', 'Last name', 'Email', 'Company', 'Role', 'Mobile', 'Source', 'Status', 'Est. value', 'Message', 'Date'].join(','),
      ...filtered.map(l => {
        const crm = crmMap[l.id]
        return [
          l.first_name ?? '',
          l.last_name ?? '',
          l.email,
          l.org ?? '',
          l.role ?? '',
          l.mobile ?? '',
          l.source ?? '',
          crm?.status ?? 'new',
          crm?.estimated_income_cents != null ? String(crm.estimated_income_cents / 100) : '',
          (l.message ?? '').replace(/,/g, ';').replace(/\n/g, ' '),
          new Date(l.created_at).toLocaleDateString('en-ZA'),
        ].map(v => `"${v}"`).join(',')
      })
    ].join('\n')
    const blob = new Blob([rows], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  return (
    <div style={{ maxWidth: 1050 }}>
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
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search name, email, company…"
          style={{ flex: 1, minWidth: 200, padding: '9px 14px', borderRadius: 8, border: '1px solid var(--line)', fontSize: 13.5, background: 'white', fontFamily: 'inherit', outline: 'none' }}
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid var(--line)', fontSize: 13.5, background: 'white', fontFamily: 'inherit', color: 'var(--charcoal)', outline: 'none' }}
        >
          <option value="all">All statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
        </select>
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
                {['Lead', 'Company / Role', ...(isTeam ? ['Card'] : []), 'Source', 'Status', 'Est. value', 'Date', ''].map((h, i) => (
                  <th key={i} style={{ padding: '10px 18px', textAlign: 'left', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => {
                const cardOwner = l.card_id ? byId[l.card_id] : null
                const crm = crmMap[l.id]
                const status = crm?.status ?? 'new'
                const meta = STATUS_META[status]

                return (
                  <>
                    <tr
                      key={l.id}
                      style={{ borderTop: '1px solid var(--line-2)', cursor: 'pointer', background: expanded === l.id ? 'var(--cream-2)' : 'white' }}
                      onClick={() => setExpanded(expanded === l.id ? null : l.id)}
                    >
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 500 }}>{[l.first_name, l.last_name].filter(Boolean).join(' ') || '—'}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{l.email}</div>
                        {l.mobile && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{l.mobile}</div>}
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--muted)' }}>
                        <div>{l.org ?? '—'}</div>
                        {l.role && <div style={{ fontSize: 12 }}>{l.role}</div>}
                      </td>
                      {isTeam && (
                        <td style={{ padding: '14px 18px' }}>
                          {cardOwner ? (
                            <>
                              <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--charcoal)' }}>{cardOwner.display_name ?? cardOwner.slug}</div>
                              <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>/c/{cardOwner.slug}</div>
                            </>
                          ) : <span style={{ color: 'var(--muted)' }}>—</span>}
                        </td>
                      )}
                      <td style={{ padding: '14px 18px', color: 'var(--muted)' }}>{l.source ?? '—'}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          display: 'inline-block', padding: '3px 9px', borderRadius: 999,
                          fontSize: 11.5, fontWeight: 500, background: meta.bg, color: meta.color,
                        }}>
                          {meta.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--charcoal)', fontSize: 13 }}>
                        {formatZar(crm?.estimated_income_cents ?? null)}
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--muted)', fontSize: 12 }}>
                        {new Date(l.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--muted)', textAlign: 'right' }}>
                        <span style={{ fontSize: 11, background: 'var(--cream-2)', padding: '3px 8px', borderRadius: 6 }}>{expanded === l.id ? '▲' : '▼'}</span>
                      </td>
                    </tr>

                    {expanded === l.id && (
                      <tr key={`${l.id}-expanded`} style={{ borderTop: '1px solid var(--line-2)', background: 'var(--cream-2)' }}>
                        <td colSpan={isTeam ? 8 : 7} style={{ padding: '16px 18px' }}>
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
                          {/* Quick CRM update */}
                          <QuickCrm leadId={l.id} initial={crm} onSaved={handleCrmSaved} />
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
