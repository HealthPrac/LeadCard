'use client'

import { useState, useMemo } from 'react'
import type { LeadCrm, CrmStatus } from '@/lib/supabase/types'

interface Lead {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
  org: string | null
  role: string | null
  mobile: string | null
  message: string | null
  source: string | null
  created_at: string
}

interface Card {
  id: string
  display_name: string | null
  title: string | null
  company: string | null
  slug: string
  industry: string | null
  theme_bg: string
  theme_fg: string
  theme_accent: string
}

interface Props {
  token: string
  card: Card
  leads: Lead[]
  crmRows: LeadCrm[]
  cardUrl: string
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
  if (cents == null) return '—'
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 0 }).format(cents / 100)
}

function formatLag(lead: Lead, crm: LeadCrm | undefined): string {
  if (!crm?.first_engaged_at) return '—'
  const diff = new Date(crm.first_engaged_at).getTime() - new Date(lead.created_at).getTime()
  if (diff < 0) return '—'
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

function formatDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  if (d < 30) return `${Math.floor(d / 7)}w ago`
  return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })
}

function Stars({ score, onChange }: { score: number | null; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          onClick={() => onChange(score === n ? 0 : n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '0 1px',
            fontSize: 18, lineHeight: 1,
            color: n <= (hover || score || 0) ? '#D97706' : '#D1D5DB',
            transition: 'color 80ms',
          }}
          title={`${n} star${n > 1 ? 's' : ''}`}
        >★</button>
      ))}
    </div>
  )
}

function CrmForm({
  lead, crm, token, onSaved,
}: {
  lead: Lead
  crm: LeadCrm | undefined
  token: string
  onSaved: (updated: LeadCrm) => void
}) {
  const [status, setStatus] = useState<CrmStatus>(crm?.status ?? 'new')
  const [firstEngagedAt, setFirstEngagedAt] = useState(
    crm?.first_engaged_at ? crm.first_engaged_at.slice(0, 16) : ''
  )
  const [estimatedIncome, setEstimatedIncome] = useState(
    crm?.estimated_income_cents != null ? String(crm.estimated_income_cents / 100) : ''
  )
  const [actualIncome, setActualIncome] = useState(
    crm?.actual_income_cents != null ? String(crm.actual_income_cents / 100) : ''
  )
  const [satisfaction, setSatisfaction] = useState<number | null>(crm?.satisfaction_score ?? null)
  const [industry, setIndustry] = useState(crm?.industry ?? '')
  const [privateNotes, setPrivateNotes] = useState(crm?.private_notes ?? '')
  const [experienceNotes, setExperienceNotes] = useState(crm?.experience_notes ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function handleStatusChange(next: CrmStatus) {
    setStatus(next)
    // Auto-stamp first engagement when marking as engaged
    if (next === 'engaged' && !firstEngagedAt) {
      setFirstEngagedAt(new Date().toISOString().slice(0, 16))
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        token,
        lead_id: lead.id,
        status,
        first_engaged_at: firstEngagedAt || null,
        estimated_income_cents: estimatedIncome ? Math.round(parseFloat(estimatedIncome) * 100) : null,
        actual_income_cents: actualIncome ? Math.round(parseFloat(actualIncome) * 100) : null,
        satisfaction_score: satisfaction,
        industry: industry || null,
        private_notes: privateNotes || null,
        experience_notes: experienceNotes || null,
      }
      // Auto-stamp pipeline milestones
      if (status === 'prospect' && !crm?.converted_to_prospect_at) {
        payload.converted_to_prospect_at = new Date().toISOString()
      }
      if (status === 'client' && !crm?.converted_to_client_at) {
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

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: 8,
    fontSize: 13.5, fontFamily: 'inherit', background: 'white', color: '#17181C',
    outline: 'none', boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em',
    color: '#6B7280', fontWeight: 500, marginBottom: 6,
  }

  return (
    <div style={{ padding: '20px 24px', background: '#F9FAFB', borderTop: '1px solid #E5E7EB' }}>
      {/* Status picker */}
      <div style={{ marginBottom: 20 }}>
        <div style={labelStyle}>Pipeline status</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {STATUSES.map(s => {
            const m = STATUS_META[s]
            const active = status === s
            return (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                style={{
                  padding: '6px 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
                  fontSize: 12.5, fontWeight: 500, fontFamily: 'inherit', transition: '80ms',
                  background: active ? m.bg : 'white',
                  color: active ? m.color : '#9CA3AF',
                  outline: active ? `2px solid ${m.color}` : '1px solid #E5E7EB',
                  outlineOffset: active ? -2 : 0,
                }}
              >
                {m.label}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* First engagement timestamp */}
        <div>
          <label style={labelStyle}>First engaged</label>
          <input
            type="datetime-local"
            value={firstEngagedAt}
            onChange={e => setFirstEngagedAt(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Estimated income */}
        <div>
          <label style={labelStyle}>Estimated value (ZAR)</label>
          <input
            type="number"
            min="0"
            step="100"
            placeholder="0"
            value={estimatedIncome}
            onChange={e => setEstimatedIncome(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Actual income — visible when prospect or client */}
        {(status === 'client' || status === 'prospect') && (
          <div>
            <label style={labelStyle}>Actual value (ZAR)</label>
            <input
              type="number"
              min="0"
              step="100"
              placeholder="0"
              value={actualIncome}
              onChange={e => setActualIncome(e.target.value)}
              style={inputStyle}
            />
          </div>
        )}

        {/* Industry */}
        <div>
          <label style={labelStyle}>Industry</label>
          <input
            type="text"
            placeholder="e.g. Healthcare"
            value={industry}
            onChange={e => setIndustry(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Satisfaction */}
      <div style={{ marginBottom: 20 }}>
        <div style={labelStyle}>Client satisfaction</div>
        <Stars score={satisfaction} onChange={n => setSatisfaction(n || null)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Private notes */}
        <div>
          <label style={labelStyle}>Private notes <span style={{ color: '#9CA3AF', textTransform: 'none', letterSpacing: 0 }}>(only you see this)</span></label>
          <textarea
            rows={3}
            placeholder="Personal notes about this lead…"
            value={privateNotes}
            onChange={e => setPrivateNotes(e.target.value)}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        {/* Experience notes */}
        <div>
          <label style={labelStyle}>Client experience <span style={{ color: '#9CA3AF', textTransform: 'none', letterSpacing: 0 }}>(only you see this)</span></label>
          <textarea
            rows={3}
            placeholder="How did the interaction go? What did they love or struggle with?"
            value={experienceNotes}
            onChange={e => setExperienceNotes(e.target.value)}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          padding: '9px 22px', background: saved ? '#8FAF9D' : '#17181C',
          color: '#F6F7F3', border: 'none', borderRadius: 8,
          fontSize: 13.5, fontWeight: 500, cursor: saving ? 'wait' : 'pointer',
          fontFamily: 'inherit', transition: '200ms',
        }}
      >
        {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  )
}

export function CrmClient({ token, card, leads, crmRows, cardUrl }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [crmMap, setCrmMap] = useState<Record<string, LeadCrm>>(() =>
    Object.fromEntries(crmRows.map(r => [r.lead_id, r]))
  )

  function handleSaved(updated: LeadCrm) {
    setCrmMap(prev => ({ ...prev, [updated.lead_id]: updated }))
  }

  // Aggregate stats
  const stats = useMemo(() => {
    const total = leads.length
    const inPipeline = leads.filter(l => {
      const s = crmMap[l.id]?.status
      return s === 'engaged' || s === 'prospect'
    }).length
    const converted = leads.filter(l => crmMap[l.id]?.status === 'client').length
    const pipeline = leads.reduce((sum, l) => {
      return sum + (crmMap[l.id]?.estimated_income_cents ?? 0)
    }, 0)
    const scores = leads.map(l => crmMap[l.id]?.satisfaction_score).filter((s): s is number => s != null)
    const avgSat = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null
    const lags = leads
      .filter(l => crmMap[l.id]?.first_engaged_at)
      .map(l => {
        const crm = crmMap[l.id]
        return new Date(crm.first_engaged_at!).getTime() - new Date(l.created_at).getTime()
      })
    const avgLagH = lags.length ? Math.round(lags.reduce((a, b) => a + b, 0) / lags.length / 3600000) : null
    return { total, inPipeline, converted, pipeline, avgSat, avgLagH }
  }, [leads, crmMap])

  const initials = (card.display_name ?? '?').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div style={{ minHeight: '100vh', background: '#F6F7F3', fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif' }}>

      {/* Hero header — uses card brand colours */}
      <div style={{ background: card.theme_bg, color: card.theme_fg, padding: '32px 40px 28px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%', flexShrink: 0,
            background: card.theme_accent + '33',
            border: `2px solid ${card.theme_accent}`,
            display: 'grid', placeItems: 'center',
            fontSize: 20, fontWeight: 700, color: card.theme_accent,
            fontFamily: 'Geist, sans-serif',
          }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', fontFamily: 'Instrument Serif, Georgia, serif' }}>
              {card.display_name ?? 'My Leads'}
            </div>
            <div style={{ fontSize: 13.5, opacity: 0.72, marginTop: 2 }}>
              {[card.title, card.company].filter(Boolean).join(' · ')}
            </div>
          </div>
          <a
            href={cardUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '8px 16px', background: card.theme_accent + '22',
              border: `1px solid ${card.theme_accent}44`,
              color: card.theme_accent, borderRadius: 8,
              fontSize: 12.5, textDecoration: 'none', fontWeight: 500, whiteSpace: 'nowrap',
            }}
          >
            View my card ↗
          </a>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ background: 'white', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', padding: '0 40px' }}>
          {[
            { label: 'Total leads',      value: String(stats.total) },
            { label: 'In pipeline',      value: String(stats.inPipeline) },
            { label: 'Converted',        value: String(stats.converted) },
            { label: 'Pipeline value',   value: formatZar(stats.pipeline) },
            { label: 'Avg response',     value: stats.avgLagH != null ? `${stats.avgLagH}h` : '—' },
          ].map(({ label, value }) => (
            <div key={label} style={{ padding: '18px 0', borderRight: '1px solid #F3F4F6' }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF', fontWeight: 500, marginBottom: 4 }}>
                {label}
              </div>
              <div style={{ fontSize: 24, fontFamily: 'Instrument Serif, Georgia, serif', color: '#17181C', lineHeight: 1 }}>
                {value}
              </div>
              {label === 'Avg response' && stats.avgLagH != null && (
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
                  {stats.avgLagH <= 2 ? '🟢 Fast' : stats.avgLagH <= 24 ? '🟡 Good' : '🔴 Slow'}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Leads */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontFamily: 'Instrument Serif, Georgia, serif', color: '#17181C' }}>
            Your leads
          </h2>
          <span style={{ fontSize: 12.5, color: '#9CA3AF' }}>
            {leads.length} total · click a row to update
          </span>
        </div>

        {leads.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E5E7EB', padding: '48px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>◎</div>
            <p style={{ fontSize: 15, fontWeight: 500, color: '#17181C', margin: '0 0 6px' }}>No leads yet</p>
            <p style={{ fontSize: 13.5, color: '#9CA3AF', margin: 0 }}>
              Share your card link and leads will appear here automatically.
            </p>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            {/* Table header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 120px 80px 110px 100px 90px',
              padding: '10px 20px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB',
            }}>
              {['Contact', 'Received', 'Response', 'Status', 'Est. value', 'Rating'].map(h => (
                <div key={h} style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF', fontWeight: 500 }}>
                  {h}
                </div>
              ))}
            </div>

            {leads.map((lead, idx) => {
              const crm = crmMap[lead.id]
              const status = crm?.status ?? 'new'
              const meta = STATUS_META[status]
              const isOpen = expanded === lead.id
              const name = [lead.first_name, lead.last_name].filter(Boolean).join(' ') || lead.email

              return (
                <div key={lead.id} style={{ borderTop: idx === 0 ? 'none' : '1px solid #F3F4F6' }}>
                  {/* Row */}
                  <div
                    onClick={() => setExpanded(isOpen ? null : lead.id)}
                    style={{
                      display: 'grid', gridTemplateColumns: '1fr 120px 80px 110px 100px 90px',
                      padding: '14px 20px', cursor: 'pointer', transition: '80ms',
                      background: isOpen ? '#F9FAFB' : 'white',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#17181C' }}>{name}</div>
                      <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 1 }}>{lead.org ?? lead.email}</div>
                    </div>
                    <div style={{ fontSize: 12.5, color: '#6B7280' }}>{formatDate(lead.created_at)}</div>
                    <div style={{ fontSize: 12.5, color: '#6B7280' }}>{formatLag(lead, crm)}</div>
                    <div>
                      <span style={{
                        display: 'inline-block', padding: '3px 10px', borderRadius: 999,
                        fontSize: 11.5, fontWeight: 500, background: meta.bg, color: meta.color,
                      }}>
                        {meta.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 12.5, color: '#17181C' }}>
                      {formatZar(crm?.estimated_income_cents ?? null)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {crm?.satisfaction_score != null
                        ? <span style={{ fontSize: 13, color: '#D97706' }}>{'★'.repeat(crm.satisfaction_score)}</span>
                        : <span style={{ fontSize: 12, color: '#D1D5DB' }}>—</span>
                      }
                    </div>
                  </div>

                  {/* Expanded CRM form */}
                  {isOpen && (
                    <CrmForm
                      lead={lead}
                      crm={crm}
                      token={token}
                      onSaved={handleSaved}
                    />
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Footer branding */}
        <div style={{ marginTop: 32, textAlign: 'center', fontSize: 12, color: '#D1D5DB' }}>
          Powered by LeadCard · Your personal sales CRM
        </div>
      </div>
    </div>
  )
}
