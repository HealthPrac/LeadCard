'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { COUNTRY_CODES, splitPhone, joinPhone } from '@/lib/phone-codes'

type Step = 'identity' | 'slug'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('identity')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [mobileCode, setMobileCode] = useState('+27')
  const [mobileNumber, setMobileNumber] = useState('')
  const [website, setWebsite] = useState('')
  const [slug, setSlug] = useState('')
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [checkingSlug, setCheckingSlug] = useState(false)

  function nameToSlug(n: string) {
    return n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  async function checkSlug(value: string) {
    if (!value) { setSlugAvailable(null); return }
    setCheckingSlug(true)
    const res = await fetch(`/api/slug-check?slug=${encodeURIComponent(value)}`)
    const { available } = await res.json()
    setSlugAvailable(available)
    setCheckingSlug(false)
  }

  async function handleFinish() {
    setSaving(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/sign-in'); return }

    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        display_name: name,
        title,
        company,
        email: user.email,
        mobile: joinPhone(mobileCode, mobileNumber),
        website,
        slug,
        lead_destination_email: user.email,
      }),
    })

    if (!res.ok) {
      const { error: msg } = await res.json()
      setError(msg ?? 'Something went wrong.')
      setSaving(false)
      return
    }

    router.push('/dashboard')
  }

  const steps: Step[] = ['identity', 'slug']
  const stepIdx = steps.indexOf(step)
  const stepLabels = ['Identity', 'Your URL']

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', padding: '40px 20px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {/* Brand */}
        <div style={{ marginBottom: 48 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="LeadCard" height={34} style={{ display: 'block', borderRadius: 10 }} />
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40 }}>
          {stepLabels.map((label, i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 500,
                  background: i < stepIdx ? 'var(--sage)' : i === stepIdx ? 'var(--charcoal)' : 'var(--cream-2)',
                  color: i < stepIdx ? 'var(--charcoal)' : i === stepIdx ? 'var(--cream)' : 'var(--muted)',
                }}>
                  {i < stepIdx ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 13, color: i === stepIdx ? 'var(--charcoal)' : 'var(--muted)', fontWeight: i === stepIdx ? 500 : 400 }}>{label}</span>
              </div>
              {i < stepLabels.length - 1 && <div style={{ width: 32, height: 1, background: 'var(--line)', margin: '0 4px' }}/>}
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--line)', padding: '36px 40px', minHeight: 360 }}>
          {step === 'identity' && (
            <div>
              <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sage)', fontWeight: 500, margin: '0 0 8px' }}>Step 1 of 2</p>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 400, margin: '0 0 24px', letterSpacing: '-0.01em' }}>Who&apos;s on the card?</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field label="Display name" required>
                  <input style={inputStyle} value={name} onChange={e => { setName(e.target.value); setSlug(nameToSlug(e.target.value)) }} placeholder="Avery Quinn" autoFocus />
                </Field>
                <Field label="Role / title">
                  <input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} placeholder="Founder & CEO" />
                </Field>
                <Field label="Company">
                  <input style={inputStyle} value={company} onChange={e => setCompany(e.target.value)} placeholder="Northwind Studio" />
                </Field>
                <Field label="Mobile" hint="Tap-to-call on your card">
                  <PhoneField code={mobileCode} number={mobileNumber} onCode={setMobileCode} onNumber={setMobileNumber} />
                </Field>
                <div style={{ gridColumn: '1 / -1' }}>
                  <Field label="Website">
                    <input style={inputStyle} value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yoursite.com" />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {step === 'slug' && (
            <div>
              <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sage)', fontWeight: 500, margin: '0 0 8px' }}>Step 2 of 2</p>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 400, margin: '0 0 6px', letterSpacing: '-0.01em' }}>Claim your URL.</h2>
              <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: '0 0 24px' }}>Print it, paste it in your email signature, generate a QR.</p>
              <Field label="Your card URL" hint="Letters, numbers, dashes. You can change this later.">
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--line)', borderRadius: 10, background: 'white', overflow: 'hidden' }}>
                  <span style={{ padding: '11px 0 11px 14px', fontSize: 13.5, color: 'var(--muted)', whiteSpace: 'nowrap' }}>leadcard.app/c/</span>
                  <input
                    style={{ ...inputStyle, border: 'none', borderRadius: 0, paddingLeft: 0 }}
                    value={slug}
                    onChange={e => { const v = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''); setSlug(v); checkSlug(v) }}
                    placeholder="your-slug"
                  />
                  {slug && (
                    <span style={{ paddingRight: 12, fontSize: 12, whiteSpace: 'nowrap', color: checkingSlug ? 'var(--muted)' : slugAvailable ? '#16a34a' : '#dc2626' }}>
                      {checkingSlug ? '…' : slugAvailable ? '✓ Available' : '✗ Taken'}
                    </span>
                  )}
                </div>
              </Field>
              <div style={{ marginTop: 20, padding: 18, background: 'var(--cream-2)', borderRadius: 12 }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 4 }}>Your card will live at</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 500 }}>leadcard.app/c/{slug || 'your-slug'}</div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                  🔒 Isolated workspace. Nothing leaks to other subscribers.
                </div>
              </div>
              {error && <div style={{ marginTop: 14, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#B91C1C' }}>{error}</div>}
            </div>
          )}
        </div>

        {/* Nav */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
          <button
            onClick={() => setStep(steps[stepIdx - 1])}
            disabled={stepIdx === 0}
            style={{ padding: '12px 20px', border: '1px solid var(--line)', borderRadius: 10, fontSize: 14, background: 'transparent', cursor: stepIdx === 0 ? 'not-allowed' : 'pointer', color: stepIdx === 0 ? 'var(--muted)' : 'var(--charcoal)', fontFamily: 'inherit' }}
          >
            ← Back
          </button>
          {step !== 'slug' ? (
            <button
              onClick={() => setStep(steps[stepIdx + 1])}
              disabled={step === 'identity' && !name.trim()}
              style={{ padding: '12px 24px', background: 'var(--charcoal)', color: 'var(--cream)', borderRadius: 10, fontSize: 14, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', border: 'none', opacity: (step === 'identity' && !name.trim()) ? 0.4 : 1 }}
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={saving || !slug || slugAvailable === false}
              style={{ padding: '12px 24px', background: 'var(--sage)', color: 'var(--charcoal)', borderRadius: 10, fontSize: 14, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', border: 'none', opacity: (!slug || slugAvailable === false) ? 0.4 : 1 }}
            >
              {saving ? 'Publishing…' : 'Publish my card ✦'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function PhoneField({ code, number, onCode, onNumber }: {
  code: string; number: string; onCode: (v: string) => void; onNumber: (v: string) => void
}) {
  return (
    <div style={{ display: 'flex', border: '1px solid var(--line)', borderRadius: 10, overflow: 'hidden', background: 'white' }}>
      <select
        value={code}
        onChange={e => onCode(e.target.value)}
        style={{ padding: '11px 8px', border: 'none', borderRight: '1px solid var(--line)', fontSize: 13, fontFamily: 'inherit', outline: 'none', background: 'var(--cream-2)', cursor: 'pointer', flexShrink: 0 }}
      >
        {COUNTRY_CODES.map(cc => (
          <option key={cc.code} value={cc.code}>{cc.label}</option>
        ))}
      </select>
      <input
        value={number}
        onChange={e => onNumber(e.target.value)}
        placeholder="82 555 0100"
        style={{ flex: 1, padding: '11px 12px', border: 'none', fontSize: 14, fontFamily: 'inherit', outline: 'none', minWidth: 0 }}
      />
    </div>
  )
}

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
        {label}{required && <span style={{ color: 'var(--sage)', marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {hint && <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 4 }}>{hint}</div>}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', border: '1px solid var(--line)',
  borderRadius: 10, fontSize: 14, fontFamily: 'inherit', background: 'white',
  outline: 'none', color: 'var(--charcoal)', boxSizing: 'border-box',
}
