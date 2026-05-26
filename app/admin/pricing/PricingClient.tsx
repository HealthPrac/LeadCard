'use client'

import { useState, useTransition } from 'react'
import { proposePriceChange, approveProposal, rejectProposal } from '@/lib/admin/pricing-actions'
import type { PricingCurrentRow, PricingProposalRow, PricingAuditRow, AdminOption } from '@/lib/admin/pricing-queries'
import { planLabel } from '@/lib/admin/pricing-queries'

/* ── helpers ─────────────────────────────────────────────────────────────── */
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function statusBadge(status: string) {
  const map: Record<string, { bg: string; color: string }> = {
    pending:  { bg: '#FEF3E2', color: '#9A5E0A' },
    approved: { bg: '#E8F5EE', color: '#1A6B3A' },
    rejected: { bg: '#FDE8E8', color: '#9B1C1C' },
  }
  const s = map[status] ?? { bg: '#F0F0F0', color: '#555' }
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, letterSpacing: '0.07em',
      textTransform: 'uppercase' as const, padding: '2px 8px',
      borderRadius: 4, background: s.bg, color: s.color,
    }}>
      {status}
    </span>
  )
}

/* ── styles ──────────────────────────────────────────────────────────────── */
const input: React.CSSProperties = {
  padding: '8px 12px', borderRadius: 8, border: '1px solid var(--line)',
  fontSize: 13.5, fontFamily: 'inherit', outline: 'none',
  width: '100%', boxSizing: 'border-box', background: 'var(--cream)',
  color: 'var(--charcoal)',
}
const btnPrimary: React.CSSProperties = {
  padding: '9px 20px', background: '#17181C', color: '#F6F7F3',
  border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500,
  cursor: 'pointer', fontFamily: 'inherit',
}
const btnCopper: React.CSSProperties = {
  padding: '8px 16px', background: '#B8743E', color: '#fff',
  border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 500,
  cursor: 'pointer', fontFamily: 'inherit',
}
const btnGhost: React.CSSProperties = {
  padding: '8px 14px', background: 'var(--cream-2)', color: 'var(--charcoal)',
  border: '1px solid var(--line)', borderRadius: 8, fontSize: 12.5,
  cursor: 'pointer', fontFamily: 'inherit',
}
const btnDanger: React.CSSProperties = {
  padding: '8px 14px', background: '#FDE8E8', color: '#9B1C1C',
  border: '1px solid #FCA5A5', borderRadius: 8, fontSize: 12.5,
  cursor: 'pointer', fontFamily: 'inherit',
}
const card: React.CSSProperties = {
  background: 'var(--cream)', border: '1px solid var(--line)',
  borderRadius: 12, padding: '20px 24px',
}
const th: React.CSSProperties = {
  padding: '10px 14px', fontSize: 11, fontWeight: 600,
  letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--muted)',
  borderBottom: '1px solid var(--line)', textAlign: 'left' as const,
}
const td: React.CSSProperties = {
  padding: '12px 14px', fontSize: 13, borderBottom: '1px solid var(--line)',
  color: 'var(--charcoal)', verticalAlign: 'middle' as const,
}

/* ── plan ordering ────────────────────────────────────────────────────────── */
const PLAN_ORDER = ['solo', 'small_business', 'enterprise']
const CURRENCIES = ['ZAR', 'USD']

/* ── main component ──────────────────────────────────────────────────────── */
interface Props {
  currentUserId:  string
  currentPrices:  PricingCurrentRow[]
  proposals:      PricingProposalRow[]
  auditLog:       PricingAuditRow[]
  adminOptions:   AdminOption[]
}

export default function PricingClient({ currentUserId, currentPrices, proposals, auditLog, adminOptions }: Props) {
  const [tab,         setTab]         = useState<'prices' | 'pending' | 'audit'>('prices')
  const [proposeFor,  setProposeFor]  = useState<{ plan_key: string; currency: string; current_price: string } | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [msg,         setMsg]         = useState('')
  const [isPending,   startTransition] = useTransition()

  const pendingCount = proposals.filter(p => p.status === 'pending').length
  const myPendingCount = proposals.filter(p => p.status === 'pending' && p.assigned_to === currentUserId).length

  /* ── propose submit ──────────────────────────────────────────────────────── */
  function handlePropose(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMsg('')
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await proposePriceChange(fd)
      if (res.error) { setMsg(res.error); return }
      setProposeFor(null)
      setMsg('Proposal submitted — approver has been notified by email.')
    })
  }

  /* ── approve ─────────────────────────────────────────────────────────────── */
  function handleApprove(id: string) {
    setMsg('')
    startTransition(async () => {
      const res = await approveProposal(id)
      if (res.error) { setMsg(res.error); return }
      setMsg('Approved. Price is now live on the website.')
    })
  }

  /* ── reject ──────────────────────────────────────────────────────────────── */
  function handleReject(id: string) {
    setMsg('')
    startTransition(async () => {
      const res = await rejectProposal(id, rejectReason || undefined)
      if (res.error) { setMsg(res.error); return }
      setRejectingId(null)
      setRejectReason('')
      setMsg('Proposal rejected.')
    })
  }

  /* ── CSV export ──────────────────────────────────────────────────────────── */
  function exportCsv() {
    const headers = ['Date', 'Action', 'Plan', 'Currency', 'Old Price', 'New Price', 'Actor', 'Notes']
    const rows = auditLog.map(r => [
      new Date(r.created_at).toISOString(),
      r.action,
      planLabel(r.plan_key),
      r.currency,
      r.old_price ?? '',
      r.new_price,
      r.actor_email,
      (r.notes ?? '').replace(/"/g, '""'),
    ].map(v => `"${v}"`).join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `pricing-audit-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  /* ── price lookup helpers ────────────────────────────────────────────────── */
  function currentPrice(plan_key: string, currency: string) {
    return currentPrices.find(p => p.plan_key === plan_key && p.currency === currency)?.price ?? '—'
  }

  const otherAdmins = adminOptions.filter(a => a.user_id !== currentUserId)

  /* ── render ──────────────────────────────────────────────────────────────── */
  return (
    <div style={{ padding: '36px 40px', maxWidth: 1000, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 300, margin: '0 0 6px', color: 'var(--charcoal)' }}>
          Pricing
        </h1>
        <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: 0 }}>
          Manage subscription prices. Changes require a second admin to approve. PayFast ZAR prices must be updated manually after approval.
        </p>
      </div>

      {/* Global message */}
      {msg && (
        <div style={{
          marginBottom: 20, padding: '12px 16px', borderRadius: 8,
          background: msg.includes('error') || msg.includes('Error') || msg.toLowerCase().includes('cannot') || msg.toLowerCase().includes('failed')
            ? '#FDE8E8' : '#E8F5EE',
          color: msg.includes('error') || msg.toLowerCase().includes('cannot') || msg.toLowerCase().includes('failed')
            ? '#9B1C1C' : '#1A6B3A',
          fontSize: 13.5,
        }}>
          {msg}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--line)', paddingBottom: 0 }}>
        {([
          { key: 'prices', label: 'Current Prices' },
          { key: 'pending', label: `Pending Approvals${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
          { key: 'audit',  label: 'Audit Log' },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '8px 16px', border: 'none', background: 'none',
              fontFamily: 'inherit', fontSize: 13.5, cursor: 'pointer',
              color: tab === t.key ? '#B8743E' : 'var(--muted)',
              fontWeight: tab === t.key ? 600 : 400,
              borderBottom: tab === t.key ? '2px solid #B8743E' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {t.label}
            {t.key === 'pending' && myPendingCount > 0 && (
              <span style={{
                marginLeft: 6, background: '#B8743E', color: '#fff',
                fontSize: 10, fontWeight: 700, padding: '1px 5px',
                borderRadius: 8,
              }}>
                {myPendingCount} need your action
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB: Current Prices ─────────────────────────────────────────────── */}
      {tab === 'prices' && (
        <div>
          {/* Propose form panel */}
          {proposeFor && (
            <div style={{ ...card, marginBottom: 24, borderColor: '#B8743E', borderWidth: 1.5 }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>
                Propose change — {planLabel(proposeFor.plan_key)} ({proposeFor.currency})
              </h3>
              <form onSubmit={handlePropose} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <input type="hidden" name="plan_key"  value={proposeFor.plan_key} />
                <input type="hidden" name="currency"  value={proposeFor.currency} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 5 }}>
                      Current price
                    </label>
                    <input style={{ ...input, color: 'var(--muted)', background: 'var(--cream-2)' }}
                      value={proposeFor.current_price} readOnly />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 5 }}>
                      New price <span style={{ color: '#B8743E' }}>*</span>
                    </label>
                    <input style={input} name="new_price" placeholder={proposeFor.currency === 'ZAR' ? 'e.g. R 99' : 'e.g. $ 6'}
                      required autoFocus />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 5 }}>
                    Assign approver <span style={{ color: '#B8743E' }}>*</span>
                  </label>
                  {otherAdmins.length === 0 ? (
                    <p style={{ fontSize: 13, color: '#9B1C1C', margin: 0 }}>
                      No other admins available. Add a second admin first.
                    </p>
                  ) : (
                    <select style={input} name="assigned_to" required>
                      <option value="">Select approver…</option>
                      {otherAdmins.map(a => (
                        <option key={a.user_id} value={a.user_id}>{a.email}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 5 }}>
                    Notes (reason for change)
                  </label>
                  <textarea style={{ ...input, resize: 'vertical', minHeight: 72 }}
                    name="notes" placeholder="e.g. Q3 2026 pricing review — CPI adjustment" />
                </div>

                {proposeFor.currency === 'ZAR' && (
                  <div style={{ background: '#FEF3E2', border: '1px solid #F6C675', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#7A4A0F' }}>
                    ⚠️ <strong>PayFast:</strong> If approved, update the ZAR price in PayFast manually.
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="submit" style={btnCopper} disabled={isPending || otherAdmins.length === 0}>
                    {isPending ? 'Submitting…' : 'Submit for approval'}
                  </button>
                  <button type="button" style={btnGhost} onClick={() => { setProposeFor(null); setMsg('') }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Price grid */}
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={th}>Plan</th>
                  <th style={th}>ZAR price</th>
                  <th style={th}>USD price</th>
                  <th style={th}>Last updated</th>
                  <th style={{ ...th, width: 200 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {PLAN_ORDER.map(key => {
                  const zarRow  = currentPrices.find(p => p.plan_key === key && p.currency === 'ZAR')
                  const usdRow  = currentPrices.find(p => p.plan_key === key && p.currency === 'USD')
                  const pending = proposals.find(p => p.plan_key === key && p.status === 'pending')
                  const zarUpdated = zarRow?.updated_at
                  const usdUpdated = usdRow?.updated_at
                  const lastUpdated = [zarUpdated, usdUpdated].filter(Boolean)
                    .sort().reverse()[0]

                  return (
                    <tr key={key}>
                      <td style={td}>
                        <span style={{ fontWeight: 600 }}>{planLabel(key)}</span>
                        {pending && (
                          <span style={{ marginLeft: 8, fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em',
                            textTransform: 'uppercase' as const, background: '#FEF3E2', color: '#9A5E0A',
                            padding: '1px 6px', borderRadius: 4 }}>
                            change pending
                          </span>
                        )}
                      </td>
                      <td style={td}>
                        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 400 }}>
                          {zarRow?.price ?? '—'}
                        </span>
                      </td>
                      <td style={td}>
                        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 400 }}>
                          {usdRow?.price ?? '—'}
                        </span>
                      </td>
                      <td style={{ ...td, color: 'var(--muted)', fontSize: 12 }}>
                        {lastUpdated ? fmtDate(lastUpdated) : '—'}
                      </td>
                      <td style={td}>
                        {pending ? (
                          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Pending approval</span>
                        ) : (
                          <div style={{ display: 'flex', gap: 8 }}>
                            {CURRENCIES.map(cur => (
                              <button
                                key={cur}
                                style={{ ...btnGhost, fontSize: 11.5 }}
                                onClick={() => {
                                  setMsg('')
                                  setProposeFor({
                                    plan_key: key,
                                    currency: cur,
                                    current_price: currentPrice(key, cur),
                                  })
                                  setTab('prices')
                                  setTimeout(() => document.querySelector<HTMLInputElement>('[name="new_price"]')?.focus(), 50)
                                }}
                              >
                                Propose {cur}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB: Pending Approvals ───────────────────────────────────────────── */}
      {tab === 'pending' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {proposals.filter(p => p.status === 'pending').length === 0 ? (
            <div style={{ ...card, color: 'var(--muted)', fontSize: 14, textAlign: 'center' as const, padding: 48 }}>
              No pending proposals.
            </div>
          ) : (
            proposals.filter(p => p.status === 'pending').map(p => {
              const isMyApproval = p.assigned_to === currentUserId
              const isMine = p.proposed_by === currentUserId

              return (
                <div key={p.id} style={{ ...card, borderLeft: isMyApproval ? '3px solid #B8743E' : '3px solid var(--line)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <span style={{ fontWeight: 600, fontSize: 15 }}>{planLabel(p.plan_key)}</span>
                        <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>{p.currency}</span>
                        {statusBadge(p.status)}
                        {isMyApproval && (
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#B8743E', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>
                            ← Action required
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--muted)', textDecoration: 'line-through' }}>
                          {p.old_price}
                        </span>
                        <span style={{ fontSize: 16, color: 'var(--muted)' }}>→</span>
                        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 500, color: 'var(--charcoal)' }}>
                          {p.new_price}
                        </span>
                      </div>

                      <div style={{ fontSize: 12.5, color: 'var(--muted)', display: 'flex', flexWrap: 'wrap' as const, gap: '4px 16px' }}>
                        <span>Proposed by: <strong style={{ color: 'var(--charcoal)' }}>{p.proposed_by_email}</strong></span>
                        <span>Approver: <strong style={{ color: 'var(--charcoal)' }}>{p.assigned_to_email}</strong></span>
                        <span>{fmtDate(p.created_at)}</span>
                      </div>

                      {p.notes && (
                        <p style={{ margin: '10px 0 0', fontSize: 13, color: 'var(--charcoal)', fontStyle: 'italic' }}>
                          "{p.notes}"
                        </p>
                      )}

                      {p.currency === 'ZAR' && isMyApproval && (
                        <div style={{ marginTop: 10, background: '#FEF3E2', border: '1px solid #F6C675', borderRadius: 8, padding: '8px 12px', fontSize: 12.5, color: '#7A4A0F' }}>
                          ⚠️ <strong>PayFast reminder:</strong> If you approve, update the ZAR price in PayFast manually.
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {isMyApproval && !isMine && (
                      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8, flexShrink: 0 }}>
                        {rejectingId === p.id ? (
                          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8, minWidth: 200 }}>
                            <textarea
                              style={{ ...input, resize: 'vertical', minHeight: 64, fontSize: 12.5 }}
                              placeholder="Reason for rejection (optional)"
                              value={rejectReason}
                              onChange={e => setRejectReason(e.target.value)}
                            />
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button style={btnDanger} disabled={isPending}
                                onClick={() => handleReject(p.id)}>
                                {isPending ? 'Rejecting…' : 'Confirm reject'}
                              </button>
                              <button style={btnGhost} onClick={() => { setRejectingId(null); setRejectReason('') }}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <button style={btnPrimary} disabled={isPending} onClick={() => handleApprove(p.id)}>
                              {isPending ? 'Processing…' : '✓ Approve'}
                            </button>
                            <button style={btnDanger} onClick={() => setRejectingId(p.id)}>
                              ✕ Reject
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {isMine && (
                      <span style={{ fontSize: 12, color: 'var(--muted)', flexShrink: 0 }}>
                        Awaiting {p.assigned_to_email}
                      </span>
                    )}
                  </div>
                </div>
              )
            })
          )}

          {/* Recently resolved */}
          {proposals.filter(p => p.status !== 'pending').length > 0 && (
            <>
              <h3 style={{ margin: '16px 0 8px', fontSize: 13, fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.07em', textTransform: 'uppercase' as const }}>
                Recently resolved
              </h3>
              {proposals.filter(p => p.status !== 'pending').slice(0, 5).map(p => (
                <div key={p.id} style={{ ...card, opacity: 0.7 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' as const }}>
                    <span style={{ fontWeight: 600 }}>{planLabel(p.plan_key)}</span>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{p.currency}</span>
                    {statusBadge(p.status)}
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                      {p.old_price} → {p.new_price}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 'auto' as const }}>
                      {p.actioned_at ? fmtDate(p.actioned_at) : ''}
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ── TAB: Audit Log ──────────────────────────────────────────────────── */}
      {tab === 'audit' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 13.5, color: 'var(--muted)' }}>
              {auditLog.length} entries
            </p>
            <button style={btnCopper} onClick={exportCsv} disabled={auditLog.length === 0}>
              ↓ Export CSV
            </button>
          </div>

          {auditLog.length === 0 ? (
            <div style={{ ...card, color: 'var(--muted)', fontSize: 14, textAlign: 'center' as const, padding: 48 }}>
              No audit entries yet.
            </div>
          ) : (
            <div style={{ ...card, padding: 0, overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={th}>Date</th>
                    <th style={th}>Action</th>
                    <th style={th}>Plan</th>
                    <th style={th}>Currency</th>
                    <th style={th}>Old price</th>
                    <th style={th}>New price</th>
                    <th style={th}>Actor</th>
                    <th style={th}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLog.map(r => (
                    <tr key={r.id}>
                      <td style={{ ...td, fontSize: 12, whiteSpace: 'nowrap' as const }}>{fmtDate(r.created_at)}</td>
                      <td style={td}>{statusBadge(r.action)}</td>
                      <td style={{ ...td, fontWeight: 500 }}>{planLabel(r.plan_key)}</td>
                      <td style={td}>{r.currency}</td>
                      <td style={{ ...td, color: 'var(--muted)', textDecoration: r.action !== 'proposed' ? 'line-through' : undefined }}>
                        {r.old_price ?? '—'}
                      </td>
                      <td style={{ ...td, fontWeight: r.action === 'approved' ? 600 : 400 }}>{r.new_price}</td>
                      <td style={{ ...td, fontSize: 12, color: 'var(--muted)' }}>{r.actor_email}</td>
                      <td style={{ ...td, fontSize: 12, color: 'var(--muted)', maxWidth: 200 }}>{r.notes ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
