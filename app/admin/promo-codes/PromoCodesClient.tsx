'use client'

import { useState, useTransition } from 'react'
import type { PromoCodeRow } from '@/lib/admin/promo-queries'
import { createPromoCode, togglePromoCode } from '@/lib/admin/promo-actions'

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
}

function randomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export default function PromoCodesClient({ codes }: { codes: PromoCodeRow[] }) {
  const [showForm, setShowForm] = useState(false)
  const [discountType, setDiscountType] = useState<'free' | 'percent'>('free')
  const [formCode, setFormCode] = useState(randomCode())
  const [msg, setMsg] = useState('')
  const [isPending, startTransition] = useTransition()
  const [toggling, setToggling] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMsg('')
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await createPromoCode(fd)
      if (result.error) { setMsg(result.error); return }
      setShowForm(false)
      setFormCode(randomCode())
      setDiscountType('free')
      setMsg('')
    })
  }

  function handleToggle(id: string, currentActive: boolean) {
    setToggling(id)
    startTransition(async () => {
      await togglePromoCode(id, !currentActive)
      setToggling(null)
    })
  }

  const inputStyle: React.CSSProperties = {
    padding: '8px 12px', borderRadius: 8, border: '1px solid var(--line)',
    fontSize: 13.5, fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box',
  }
  const btnPrimary: React.CSSProperties = {
    padding: '9px 20px', background: '#17181C', color: '#F6F7F3',
    border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit',
  }
  const btnSecondary: React.CSSProperties = {
    padding: '9px 16px', background: 'var(--cream-2)', color: 'var(--charcoal)',
    border: '1px solid var(--line)', borderRadius: 8, fontSize: 13,
    cursor: 'pointer', fontFamily: 'inherit',
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, margin: 0, letterSpacing: '-0.01em' }}>Promo codes</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: '4px 0 0' }}>Grant free access or discounts to specific users.</p>
        </div>
        <button onClick={() => { setShowForm(v => !v); setMsg('') }} style={btnPrimary}>
          {showForm ? '✕ Cancel' : '+ New code'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--line)', padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Code</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input name="code" value={formCode} onChange={e => setFormCode(e.target.value.toUpperCase())}
                  style={{ ...inputStyle, flex: 1 }} required />
                <button type="button" onClick={() => setFormCode(randomCode())}
                  style={{ ...btnSecondary, padding: '8px 12px', fontSize: 12, whiteSpace: 'nowrap' }}>
                  Shuffle
                </button>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Description (internal)</label>
              <input name="description" placeholder="e.g. Family & friends, Beta tester" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Discount type</label>
              <select name="discount_type" value={discountType} onChange={e => setDiscountType(e.target.value as 'free' | 'percent')}
                style={{ ...inputStyle }}>
                <option value="free">Free (full access, no charge)</option>
                <option value="percent">Percent off (PayFast discount — manual)</option>
              </select>
            </div>
            {discountType === 'percent' && (
              <div>
                <label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Discount %</label>
                <input name="discount_percent" type="number" min="1" max="100" placeholder="e.g. 50" style={inputStyle} required />
              </div>
            )}
            <div>
              <label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Max uses (blank = unlimited)</label>
              <input name="max_uses" type="number" min="1" placeholder="e.g. 10" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Expires (blank = never)</label>
              <input name="expires_at" type="date" style={inputStyle} />
            </div>
          </div>
          {msg && <div style={{ fontSize: 13, color: '#EF4444', marginBottom: 12 }}>{msg}</div>}
          <button type="submit" disabled={isPending} style={{ ...btnPrimary, opacity: isPending ? 0.6 : 1 }}>
            {isPending ? 'Creating…' : 'Create code'}
          </button>
        </form>
      )}

      {/* Table */}
      {codes.length === 0 ? (
        <div style={{ background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--line)', padding: 48, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--muted)' }}>No promo codes yet. Create one above.</p>
        </div>
      ) : (
        <div style={{ background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--cream-2)' }}>
                  {['Code', 'Description', 'Type', 'Uses', 'Expires', 'Status', ''].map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {codes.map(c => (
                  <tr key={c.id} style={{ borderTop: '1px solid var(--line-2)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <code style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', background: 'var(--cream-2)', padding: '2px 8px', borderRadius: 6 }}>{c.code}</code>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 12.5, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.description ?? <span style={{ fontStyle: 'italic' }}>—</span>}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {c.discount_type === 'free' ? (
                        <span style={{ fontSize: 11.5, fontWeight: 600, color: '#16a34a', background: '#DCFCE7', padding: '2px 8px', borderRadius: 6 }}>Free</span>
                      ) : (
                        <span style={{ fontSize: 11.5, fontWeight: 600, color: '#d97706', background: '#FEF3C7', padding: '2px 8px', borderRadius: 6 }}>{c.discount_percent}% off</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>
                      {c.uses_count}{c.max_uses !== null ? ` / ${c.max_uses}` : ''}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12.5, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{fmtDate(c.expires_at)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: c.is_active ? '#16a34a' : '#6b7280' }}>
                        {c.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        onClick={() => handleToggle(c.id, c.is_active)}
                        disabled={toggling === c.id}
                        style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--cream-2)', cursor: 'pointer', fontFamily: 'inherit', color: 'var(--charcoal)', opacity: toggling === c.id ? 0.5 : 1 }}
                      >
                        {c.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
