'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { COUNTRY_CODES, joinPhone } from '@/lib/phone-codes'

interface Props {
  plan: string
  cardCount: number
  companySlug: string
}

const PLAN_CAPS: Record<string, number> = { solo: 1, small: 5, enterprise: Infinity }

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function AddMemberModal({ plan, cardCount, companySlug }: Props) {
  const router = useRouter()
  const cap = PLAN_CAPS[plan] ?? 1
  const slotsLeft = cap === Infinity ? Infinity : cap - cardCount

  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [titleVal, setTitleVal] = useState('')
  const [email, setEmail] = useState('')
  const [mobileCode, setMobileCode] = useState('+27')
  const [mobileNumber, setMobileNumber] = useState('')
  const [slug, setSlug] = useState('')
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [checkingSlug, setCheckingSlug] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (cap <= 1) return null  // solo plan — no button shown

  function resetForm() {
    setName(''); setTitleVal(''); setEmail('')
    setMobileCode('+27'); setMobileNumber('')
    setSlug(''); setSlugAvailable(null); setCheckingSlug(false)
    setError(null)
  }

  function handleOpen() { resetForm(); setOpen(true) }
  function handleClose() { setOpen(false) }

  async function checkSlug(value: string) {
    if (!value) { setSlugAvailable(null); return }
    setCheckingSlug(true)
    const res = await fetch(`/api/slug-check?slug=${encodeURIComponent(value)}`)
    const { available } = await res.json()
    setSlugAvailable(available)
    setCheckingSlug(false)
  }

  function handleNameChange(v: string) {
    setName(v)
    const prefix = companySlug ? `${companySlug}-` : ''
    const auto = toSlug(`${prefix}${v}`)
    setSlug(auto)
    setSlugAvailable(null)
    if (auto) checkSlug(auto)
  }

  async function handleSubmit() {
    if (!name.trim() || !slug.trim() || !slugAvailable) return
    setSaving(true)
    setError(null)
    const res = await fetch('/api/team/add-member', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        title: titleVal.trim() || undefined,
        email: email.trim() || undefined,
        mobile: joinPhone(mobileCode, mobileNumber) || undefined,
        slug: slug.trim(),
      }),
    })
    const json = await res.json()
    if (!res.ok) {
      setError(json.error ?? 'Something went wrong.')
      setSaving(false)
      return
    }
    setSaving(false)
    setOpen(false)
    router.refresh()
  }

  const canSubmit = name.trim() && slug.trim() && slugAvailable === true && !saving

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', border: '1px solid var(--line)',
    borderRadius: 9, fontSize: 13.5, fontFamily: 'inherit', outline: 'none',
    background: 'white', color: 'var(--charcoal)', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 5, color: 'var(--charcoal)',
  }

  return (
    <>
      <button
        onClick={handleOpen}
        disabled={slotsLeft <= 0}
        style={{
          padding: '9px 20px', background: slotsLeft > 0 ? 'var(--charcoal)' : 'var(--cream-2)',
          color: slotsLeft > 0 ? 'var(--cream)' : 'var(--muted)',
          border: 'none', borderRadius: 9, fontSize: 13.5, fontWeight: 500,
          cursor: slotsLeft > 0 ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
        }}
      >
        + Add team member
        {cap !== Infinity && (
          <span style={{ marginLeft: 8, fontSize: 11, opacity: 0.7 }}>
            {cardCount}/{cap} slots
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div style={{
            background: 'white', borderRadius: 16, padding: '32px 36px', width: '100%',
            maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, margin: 0, letterSpacing: '-0.01em' }}>
                Add team member
              </h2>
              <button onClick={handleClose} style={{ fontSize: 20, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', lineHeight: 1 }}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Display name <span style={{ color: 'var(--sage)' }}>*</span></label>
                <input
                  style={inputStyle}
                  value={name}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="Sarah Johnson"
                  autoFocus
                />
              </div>
              <div>
                <label style={labelStyle}>Role / title</label>
                <input style={inputStyle} value={titleVal} onChange={e => setTitleVal(e.target.value)} placeholder="Head of Sales" />
              </div>
              <div>
                <label style={labelStyle}>Work email</label>
                <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="sarah@company.com" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Mobile</label>
                <div style={{ display: 'flex', border: '1px solid var(--line)', borderRadius: 9, overflow: 'hidden', background: 'white' }}>
                  <select value={mobileCode} onChange={e => setMobileCode(e.target.value)}
                    style={{ padding: '10px 8px', border: 'none', borderRight: '1px solid var(--line)', fontSize: 13, fontFamily: 'inherit', outline: 'none', background: 'var(--cream-2)', cursor: 'pointer', flexShrink: 0 }}>
                    {COUNTRY_CODES.map(cc => <option key={cc.code} value={cc.code}>{cc.label}</option>)}
                  </select>
                  <input value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} placeholder="82 555 0100"
                    style={{ flex: 1, padding: '10px 12px', border: 'none', fontSize: 13.5, fontFamily: 'inherit', outline: 'none', minWidth: 0 }} />
                </div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Card URL <span style={{ color: 'var(--sage)' }}>*</span></label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--line)', borderRadius: 9, background: 'white', overflow: 'hidden' }}>
                  <span style={{ padding: '10px 0 10px 14px', fontSize: 13, color: 'var(--muted)', whiteSpace: 'nowrap' }}>leadcard.app/c/</span>
                  <input
                    style={{ ...inputStyle, border: 'none', borderRadius: 0, paddingLeft: 0 }}
                    value={slug}
                    onChange={e => {
                      const v = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                      setSlug(v)
                      setSlugAvailable(null)
                      checkSlug(v)
                    }}
                    placeholder="their-slug"
                  />
                  {slug && (
                    <span style={{ paddingRight: 12, fontSize: 12, whiteSpace: 'nowrap', color: checkingSlug ? 'var(--muted)' : slugAvailable ? '#16a34a' : '#dc2626' }}>
                      {checkingSlug ? '…' : slugAvailable ? '✓ Available' : '✗ Taken'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div style={{ marginTop: 14, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#B91C1C' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button onClick={handleClose} style={{ padding: '10px 18px', border: '1px solid var(--line)', borderRadius: 9, fontSize: 13.5, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', color: 'var(--charcoal)' }}>
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                style={{ padding: '10px 22px', background: 'var(--sage)', color: 'var(--charcoal)', border: 'none', borderRadius: 9, fontSize: 13.5, fontWeight: 500, cursor: canSubmit ? 'pointer' : 'not-allowed', opacity: canSubmit ? 1 : 0.45, fontFamily: 'inherit' }}
              >
                {saving ? 'Adding…' : 'Add member ✦'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
