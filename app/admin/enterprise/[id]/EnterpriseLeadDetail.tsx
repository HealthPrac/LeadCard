'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import type { EnterpriseLead, EnterpriseEnrollment, EnterprisePricingProposal, EnterprisePricingAuditRow } from '@/lib/admin/enterprise-queries'
import type { AdminOption } from '@/lib/admin/pricing-queries'
import { changeTypeLabel } from '@/lib/admin/enterprise-queries'
import {
  updateLeadStatus,
  enrollEnterprise,
  getSlaSasUrl,
  proposeEnterprisePricingChange,
  approveEnterprisePricingProposal,
  rejectEnterprisePricingProposal,
} from '@/lib/admin/enterprise-actions'

const STATUS_OPTS = ['new', 'contacted', 'enrolled', 'lost'] as const
const STATUS_LABEL: Record<string, string> = { new: 'New', contacted: 'Contacted', enrolled: 'Enrolled', lost: 'Lost' }
const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  new:       { bg: 'rgba(184,116,62,0.12)', color: '#B8743E' },
  contacted: { bg: 'rgba(86,152,195,0.14)', color: '#3B82C4' },
  enrolled:  { bg: 'rgba(42,122,74,0.14)',  color: '#2A7A4A' },
  lost:      { bg: 'rgba(100,100,100,0.1)', color: '#888' },
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })
}

interface Props {
  lead: EnterpriseLead
  enrollment: EnterpriseEnrollment | null
  admins: AdminOption[]
  proposals: EnterprisePricingProposal[]
  auditLog: EnterprisePricingAuditRow[]
  currentAdminId: string
}

export function EnterpriseLeadDetail({ lead, enrollment, admins, proposals, auditLog, currentAdminId }: Props) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showStatusEdit, setShowStatusEdit] = useState(false)
  const [newStatus, setNewStatus] = useState(lead.status)
  const [notesVal, setNotesVal] = useState(lead.admin_notes ?? '')
  const [showEnroll, setShowEnroll] = useState(false)
  const [enrollError, setEnrollError] = useState<string | null>(null)
  const [showPropose, setShowPropose] = useState(false)
  const [proposeError, setProposeError] = useState<string | null>(null)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const enrollRef = useRef<HTMLFormElement>(null)
  const proposeRef = useRef<HTMLFormElement>(null)

  // SLA upload state
  const [slaFile, setSlaFile] = useState<File | null>(null)
  const [slaPath, setSlaPath] = useState(enrollment?.sla_path ?? '')
  const [slaUploading, setSlaUploading] = useState(false)

  async function handleStatusSave() {
    setBusy(true); setError(null)
    const r = await updateLeadStatus(lead.id, newStatus, notesVal)
    setBusy(false)
    if (r.error) { setError(r.error); return }
    setShowStatusEdit(false)
  }

  async function handleSlaUpload(file: File) {
    setSlaUploading(true)
    const r = await getSlaSasUrl(file.name)
    if (r.error) { setSlaUploading(false); setEnrollError(r.error ?? 'Upload failed'); return }
    await fetch(r.uploadUrl!, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
    setSlaPath(r.path!)
    setSlaUploading(false)
  }

  async function handleEnroll(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setEnrollError(null); setBusy(true)
    const fd = new FormData(e.currentTarget)
    fd.set('lead_id', lead.id)
    fd.set('sla_path', slaPath)
    const r = await enrollEnterprise(fd)
    setBusy(false)
    if (r.error) { setEnrollError(r.error); return }
    window.location.reload()
  }

  async function handlePropose(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setProposeError(null); setBusy(true)
    const fd = new FormData(e.currentTarget)
    fd.set('enrollment_id', enrollment!.id)
    const r = await proposeEnterprisePricingChange(fd)
    setBusy(false)
    if (r.error) { setProposeError(r.error); return }
    setShowPropose(false)
    window.location.reload()
  }

  async function handleApprove(id: string) {
    setBusy(true); setError(null)
    const r = await approveEnterprisePricingProposal(id)
    setBusy(false)
    if (r.error) { setError(r.error); return }
    window.location.reload()
  }

  async function handleReject() {
    if (!rejectId) return
    setBusy(true); setError(null)
    const r = await rejectEnterprisePricingProposal(rejectId, rejectReason)
    setBusy(false)
    if (r.error) { setError(r.error); return }
    setRejectId(null); setRejectReason('')
    window.location.reload()
  }

  const otherAdmins = admins.filter(a => a.user_id !== currentAdminId)
  const pendingProposals = proposals.filter(p => p.status === 'pending')
  const ss = STATUS_STYLE[lead.status] ?? STATUS_STYLE.new

  return (
    <div style={{ maxWidth: 860 }}>
      {/* Back */}
      <Link href="/admin/enterprise" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 20 }}>
        ← Enterprise
      </Link>

      {error && (
        <div style={{ margin: '0 0 16px', padding: '10px 14px', background: 'rgba(192,57,43,0.08)', color: '#C0392B', borderLeft: '3px solid #C0392B', fontSize: 13 }}>{error}</div>
      )}

      {/* Lead header */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 14, padding: '24px 28px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--sage)', margin: '0 0 6px' }}>Enterprise inquiry</p>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 400, margin: '0 0 4px', letterSpacing: '-0.01em' }}>{lead.company_name}</h1>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>Received {fmt(lead.created_at)}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, background: ss.bg, color: ss.color, padding: '4px 12px', borderRadius: 4 }}>
              {STATUS_LABEL[lead.status]}
            </span>
            {lead.status !== 'enrolled' && (
              <button onClick={() => setShowStatusEdit(!showStatusEdit)}
                style={{ fontSize: 12, color: 'var(--muted)', background: 'none', border: '1px solid var(--line)', padding: '4px 12px', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit' }}>
                Update status
              </button>
            )}
          </div>
        </div>

        {showStatusEdit && (
          <div style={{ marginTop: 16, padding: '16px', background: 'var(--cream-2)', borderRadius: 8, display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: 5 }}>Status</label>
              <select value={newStatus} onChange={e => setNewStatus(e.target.value as typeof newStatus)}
                style={{ padding: '7px 10px', border: '1px solid var(--line)', background: 'var(--bg-surface)', fontSize: 13, fontFamily: 'inherit', color: 'var(--charcoal)', borderRadius: 4 }}>
                {STATUS_OPTS.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: 5 }}>Admin notes</label>
              <input value={notesVal} onChange={e => setNotesVal(e.target.value)}
                style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--line)', background: 'var(--bg-surface)', fontSize: 13, fontFamily: 'inherit', color: 'var(--charcoal)', borderRadius: 4, boxSizing: 'border-box' }} />
            </div>
            <button onClick={handleStatusSave} disabled={busy}
              style={{ padding: '7px 18px', background: '#17181C', color: '#fff', border: 'none', borderRadius: 4, cursor: busy ? 'not-allowed' : 'pointer', fontSize: 13, fontFamily: 'inherit', fontWeight: 500 }}>
              {busy ? 'Saving…' : 'Save'}
            </button>
          </div>
        )}

        {/* Contact info */}
        <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, paddingTop: 20, borderTop: '1px solid var(--line)' }}>
          {[
            { label: 'Contact', value: lead.contact_name },
            { label: 'Email', value: <a href={`mailto:${lead.contact_email}`} style={{ color: 'var(--charcoal)', textDecoration: 'none' }}>{lead.contact_email}</a> },
            { label: 'Phone', value: lead.contact_phone ?? '—' },
            { label: 'Est. seats', value: lead.estimated_seats ?? '—' },
          ].map(r => (
            <div key={r.label}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)', marginBottom: 4 }}>{r.label}</div>
              <div style={{ fontSize: 14, color: 'var(--charcoal)' }}>{r.value}</div>
            </div>
          ))}
        </div>

        {lead.message && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)', marginBottom: 6 }}>Message</div>
            <p style={{ fontSize: 14, color: 'var(--charcoal)', margin: 0, lineHeight: 1.6 }}>{lead.message}</p>
          </div>
        )}

        {lead.admin_notes && !showStatusEdit && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)', marginBottom: 6 }}>Admin notes</div>
            <p style={{ fontSize: 13.5, color: 'var(--charcoal)', margin: 0 }}>{lead.admin_notes}</p>
          </div>
        )}
      </div>

      {/* ── ENROLLMENT ─────────────────────────────────────────────────────── */}
      {!enrollment && lead.status !== 'lost' && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sage)', margin: 0 }}>Enrollment</p>
            {!showEnroll && (
              <button onClick={() => setShowEnroll(true)}
                style={{ fontSize: 12, fontWeight: 500, background: '#17181C', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit' }}>
                Enroll this tenant
              </button>
            )}
          </div>

          {!showEnroll ? (
            <div style={{ padding: '24px 22px', color: 'var(--muted)', fontSize: 13.5, fontStyle: 'italic' }}>
              Not yet enrolled. Click "Enroll this tenant" to set up the enterprise contract.
            </div>
          ) : (
            <form ref={enrollRef} onSubmit={handleEnroll} style={{ padding: '24px 22px' }}>
              {enrollError && (
                <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(192,57,43,0.08)', color: '#C0392B', borderLeft: '3px solid #C0392B', fontSize: 13 }}>{enrollError}</div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Company name <span style={{ color: '#B8743E' }}>*</span></label>
                  <input name="company_name" required defaultValue={lead.company_name} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Nr of seats <span style={{ color: '#B8743E' }}>*</span></label>
                  <input name="seats" type="number" min="1" required defaultValue={lead.estimated_seats ?? ''} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Price per user <span style={{ color: '#B8743E' }}>*</span></label>
                  <input name="price_per_user_display" required placeholder="e.g. R 150" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Currency</label>
                  <select name="currency" style={inputStyle}>
                    <option value="ZAR">ZAR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Setup fee</label>
                  <input name="setup_fee_display" placeholder="e.g. R 5 000 or Included" style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Discount code</label>
                  <input name="discount_code" style={inputStyle} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input name="api_access" type="checkbox" value="true" style={{ width: 16, height: 16 }} />
                    API access included
                  </label>
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>SLA document</label>
                {slaPath ? (
                  <div style={{ fontSize: 13, color: '#2A7A4A', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>✓ Uploaded</span>
                    <button type="button" onClick={() => { setSlaPath(''); setSlaFile(null) }}
                      style={{ fontSize: 11, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <input type="file" accept=".pdf,.doc,.docx"
                      onChange={async (e) => { const f = e.target.files?.[0]; if (f) { setSlaFile(f); await handleSlaUpload(f) } }}
                      style={{ fontSize: 13, color: 'var(--charcoal)' }} />
                    {slaUploading && <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 8 }}>Uploading…</span>}
                  </>
                )}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={busy || slaUploading}
                  style={{ padding: '10px 24px', background: '#17181C', color: '#fff', border: 'none', borderRadius: 4, cursor: busy ? 'not-allowed' : 'pointer', fontSize: 13.5, fontWeight: 500, fontFamily: 'inherit' }}>
                  {busy ? 'Enrolling…' : 'Confirm enrollment'}
                </button>
                <button type="button" onClick={() => { setShowEnroll(false); setEnrollError(null) }}
                  style={{ padding: '10px 18px', background: 'transparent', color: 'var(--muted)', border: '1px solid var(--line)', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ── ENROLLED: contract summary + pricing ─────────────────────────── */}
      {enrollment && (
        <>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2A7A4A', margin: 0 }}>Contract</p>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>Enrolled {fmtDate(enrollment.enrolled_at)} by {enrollment.enrolled_by}</span>
            </div>
            <div style={{ padding: '20px 22px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
              {[
                { label: 'Seats', value: String(enrollment.seats) },
                { label: 'Price per user', value: `${enrollment.price_per_user_display} / ${enrollment.currency}` },
                { label: 'Setup fee', value: enrollment.setup_fee_display ?? 'Included' },
                { label: 'API access', value: enrollment.api_access ? 'Yes' : 'No' },
                { label: 'Discount code', value: enrollment.discount_code ?? '—' },
                { label: 'SLA', value: enrollment.sla_path ? 'On file' : 'Not uploaded' },
              ].map(r => (
                <div key={r.label}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)', marginBottom: 4 }}>{r.label}</div>
                  <div style={{ fontSize: 14, color: 'var(--charcoal)', fontWeight: r.label === 'Price per user' ? 600 : 400 }}>{r.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending proposals (action required) */}
          {pendingProposals.length > 0 && (
            <div style={{ background: 'var(--bg-surface)', border: '1px solid rgba(184,116,62,0.4)', borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
              <div style={{ padding: '14px 22px', borderBottom: '1px solid var(--line)', background: 'rgba(184,116,62,0.05)' }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#B8743E', margin: 0 }}>
                  Pending pricing proposals · {pendingProposals.length}
                </p>
              </div>
              {pendingProposals.map(p => {
                const canAction = p.assigned_to === currentAdminId && p.proposed_by !== currentAdminId
                return (
                  <div key={p.id} style={{ padding: '18px 22px', borderBottom: '1px solid var(--line)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--charcoal)', marginBottom: 4 }}>{changeTypeLabel(p.change_type)}</div>
                        <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                          <span style={{ textDecoration: 'line-through' }}>{p.old_value}</span>
                          <span style={{ margin: '0 6px' }}>→</span>
                          <strong style={{ color: 'var(--charcoal)' }}>{p.new_value}</strong>
                        </div>
                        {p.notes && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{p.notes}</div>}
                      </div>
                      {canAction && (
                        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                          <button onClick={() => handleApprove(p.id)} disabled={busy}
                            style={{ padding: '6px 14px', background: '#2A7A4A', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12.5, fontFamily: 'inherit', fontWeight: 500 }}>
                            Approve
                          </button>
                          <button onClick={() => setRejectId(p.id)} disabled={busy}
                            style={{ padding: '6px 14px', background: 'transparent', color: '#C0392B', border: '1px solid #C0392B', borderRadius: 4, cursor: 'pointer', fontSize: 12.5, fontFamily: 'inherit' }}>
                            Reject
                          </button>
                        </div>
                      )}
                      {!canAction && (
                        <span style={{ fontSize: 11.5, background: 'rgba(184,116,62,0.12)', color: '#B8743E', padding: '3px 10px', borderRadius: 4 }}>Awaiting approval</span>
                      )}
                    </div>
                    {rejectId === p.id && (
                      <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason (optional)"
                          style={{ flex: 1, padding: '7px 10px', border: '1px solid var(--line)', background: 'var(--cream)', fontSize: 13, fontFamily: 'inherit', color: 'var(--charcoal)', borderRadius: 4 }} />
                        <button onClick={handleReject} disabled={busy}
                          style={{ padding: '7px 14px', background: '#C0392B', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12.5, fontFamily: 'inherit', fontWeight: 500 }}>
                          Confirm reject
                        </button>
                        <button onClick={() => { setRejectId(null); setRejectReason('') }}
                          style={{ padding: '7px 10px', background: 'none', color: 'var(--muted)', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Propose pricing change */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sage)', margin: 0 }}>Propose pricing change</p>
              {!showPropose && (
                <button onClick={() => setShowPropose(true)}
                  style={{ fontSize: 12, fontWeight: 500, background: '#17181C', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Propose change
                </button>
              )}
            </div>
            {showPropose && (
              <form ref={proposeRef} onSubmit={handlePropose} style={{ padding: '20px 22px' }}>
                {proposeError && (
                  <div style={{ marginBottom: 14, padding: '10px 14px', background: 'rgba(192,57,43,0.08)', color: '#C0392B', borderLeft: '3px solid #C0392B', fontSize: 13 }}>{proposeError}</div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
                  <div>
                    <label style={labelStyle}>Change type <span style={{ color: '#B8743E' }}>*</span></label>
                    <select name="change_type" required style={inputStyle}>
                      <option value="per_user">Price per user</option>
                      <option value="setup_fee">Setup fee</option>
                      <option value="seats">Seats</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>New value <span style={{ color: '#B8743E' }}>*</span></label>
                    <input name="new_value" required placeholder="e.g. R 175 or 25" style={inputStyle} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
                  <div>
                    <label style={labelStyle}>Assign approver <span style={{ color: '#B8743E' }}>*</span></label>
                    <select name="assigned_to" required style={inputStyle}>
                      <option value="">Select approver…</option>
                      {otherAdmins.map(a => <option key={a.user_id} value={a.user_id}>{a.email}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Notes</label>
                    <input name="notes" placeholder="Optional" style={inputStyle} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="submit" disabled={busy}
                    style={{ padding: '9px 22px', background: '#B8743E', color: '#fff', border: 'none', borderRadius: 4, cursor: busy ? 'not-allowed' : 'pointer', fontSize: 13.5, fontWeight: 500, fontFamily: 'inherit' }}>
                    {busy ? 'Submitting…' : 'Submit proposal'}
                  </button>
                  <button type="button" onClick={() => { setShowPropose(false); setProposeError(null) }}
                    style={{ padding: '9px 16px', background: 'none', color: 'var(--muted)', border: '1px solid var(--line)', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
            {!showPropose && proposals.filter(p => p.status !== 'pending').length > 0 && (
              <div style={{ padding: '8px 22px 16px' }}>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: '8px 0 0' }}>No active proposal. Submit one above to trigger the approval flow.</p>
              </div>
            )}
          </div>

          {/* Pricing audit log */}
          {auditLog.length > 0 && (
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
              <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--line)' }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sage)', margin: 0 }}>Pricing audit log</p>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--line)' }}>
                    {['Date', 'Change', 'Action', 'Old', 'New', 'By'].map(h => (
                      <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {auditLog.map((row, i) => (
                    <tr key={row.id} style={{ borderBottom: i < auditLog.length - 1 ? '1px solid var(--line)' : 'none' }}>
                      <td style={{ padding: '10px 16px', color: 'var(--muted)' }}>{fmtDate(row.created_at)}</td>
                      <td style={{ padding: '10px 16px', color: 'var(--charcoal)' }}>{changeTypeLabel(row.change_type)}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{
                          fontSize: 11.5, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                          background: row.action === 'approved' ? 'rgba(42,122,74,0.14)' : row.action === 'rejected' ? 'rgba(192,57,43,0.1)' : 'rgba(184,116,62,0.12)',
                          color: row.action === 'approved' ? '#2A7A4A' : row.action === 'rejected' ? '#C0392B' : '#B8743E',
                        }}>
                          {row.action.charAt(0).toUpperCase() + row.action.slice(1)}
                        </span>
                      </td>
                      <td style={{ padding: '10px 16px', color: 'var(--muted)', textDecoration: row.action !== 'proposed' ? 'line-through' : 'none' }}>{row.old_value}</td>
                      <td style={{ padding: '10px 16px', color: 'var(--charcoal)', fontWeight: 500 }}>{row.new_value}</td>
                      <td style={{ padding: '10px 16px', color: 'var(--muted)', fontSize: 12 }}>{row.actor_email ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 600,
  textTransform: 'uppercase', letterSpacing: '0.07em',
  color: 'var(--muted)', marginBottom: 5,
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 11px',
  border: '1px solid var(--line)',
  background: 'var(--cream)', color: 'var(--charcoal)',
  fontSize: 13.5, fontFamily: 'inherit', borderRadius: 4,
  boxSizing: 'border-box',
}
