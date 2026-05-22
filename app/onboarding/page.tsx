'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { COUNTRY_CODES, joinPhone } from '@/lib/phone-codes'

type Plan = 'solo' | 'small' | 'enterprise'
type Step = 'plan' | 'brand' | 'identity' | 'slug'

const PALETTES = [
  { label: 'Midnight', bg: '#17181C', fg: '#F6F7F3', accent: '#8FAF9D' },
  { label: 'Sage',     bg: '#2C3E2D', fg: '#F0F4F0', accent: '#A3C2A8' },
  { label: 'Linen',    bg: '#F5F0E8', fg: '#2A2118', accent: '#C4956A' },
  { label: 'Slate',    bg: '#1E2A38', fg: '#E8EDF2', accent: '#7BAED4' },
  { label: 'Blush',    bg: '#3D1C2E', fg: '#F9EFF5', accent: '#D4889A' },
  { label: 'Cream',    bg: '#FAF8F3', fg: '#1A1A18', accent: '#9E9E7C' },
  { label: 'Ocean',    bg: '#0D2137', fg: '#E5F0FA', accent: '#5BA3C9' },
  { label: 'Forest',   bg: '#1A2F1E', fg: '#EDF4EE', accent: '#6FAF7F' },
]

const FONT_OPTIONS = [
  { value: 'serif',     label: 'Instrument Serif',   fontFamily: '"Instrument Serif", Georgia, serif' },
  { value: 'playfair',  label: 'Playfair Display',   fontFamily: '"Playfair Display", Georgia, serif' },
  { value: 'cormorant', label: 'Cormorant Garamond', fontFamily: '"Cormorant Garamond", Georgia, serif' },
  { value: 'dm-serif',  label: 'DM Serif Display',   fontFamily: '"DM Serif Display", Georgia, serif' },
  { value: 'sans',      label: 'Geist Sans',          fontFamily: '"Geist", system-ui, sans-serif' },
  { value: 'inter',     label: 'Inter',               fontFamily: '"Inter", system-ui, sans-serif' },
]

const PLANS: { id: Plan; name: string; tagline: string; features: string[]; price: string; period: string }[] = [
  {
    id: 'solo',
    name: 'Solo',
    tagline: 'Your personal digital card',
    features: ['1 digital experience', 'Lead capture', 'Video intro', 'Analytics'],
    price: '$4',
    period: 'per month',
  },
  {
    id: 'small',
    name: 'Small Business',
    tagline: 'One brand, up to 5 team cards',
    features: ['1 company brand', 'Up to 5 cards', 'Lead capture', 'Team dashboard'],
    price: '$12',
    period: 'per month',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'One brand, unlimited team cards',
    features: ['1 company brand', 'Unlimited cards', 'Custom branding', 'API access'],
    price: 'Custom',
    period: 'contact us',
  },
]

interface PersonEntry {
  id: string
  name: string
  title: string
  email: string
  mobileCode: string
  mobileNumber: string
  slug: string
  slugAvailable: boolean | null
  checkingSlug: boolean
}

function emptyPerson(): PersonEntry {
  return {
    id: crypto.randomUUID(),
    name: '', title: '', email: '',
    mobileCode: '+27', mobileNumber: '',
    slug: '', slugAvailable: null, checkingSlug: false,
  }
}

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function getSteps(plan: Plan): Step[] {
  return plan === 'solo' ? ['plan', 'identity', 'slug'] : ['plan', 'brand', 'identity', 'slug']
}

function getStepLabels(plan: Plan): string[] {
  return plan === 'solo' ? ['Plan', 'Your card', 'Your URL'] : ['Plan', 'Company brand', 'Team', 'URLs']
}

export default function OnboardingPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Plan
  const [plan, setPlan] = useState<Plan>('solo')
  const [step, setStep] = useState<Step>('plan')

  // Brand (Small / Enterprise)
  const [companyName, setCompanyName] = useState('')
  const [companyWebsite, setCompanyWebsite] = useState('')
  const [companySlug, setCompanySlug] = useState('')
  const [themeBg, setThemeBg] = useState(PALETTES[0].bg)
  const [themeFg, setThemeFg] = useState(PALETTES[0].fg)
  const [themeAccent, setThemeAccent] = useState(PALETTES[0].accent)
  const [themeFont, setThemeFont] = useState('serif')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  // Solo identity
  const [soloName, setSoloName] = useState('')
  const [soloTitle, setSoloTitle] = useState('')
  const [soloCompany, setSoloCompany] = useState('')
  const [soloWebsite, setSoloWebsite] = useState('')
  const [soloMobileCode, setSoloMobileCode] = useState('+27')
  const [soloMobileNumber, setSoloMobileNumber] = useState('')
  const [soloSlug, setSoloSlug] = useState('')
  const [soloSlugAvailable, setSoloSlugAvailable] = useState<boolean | null>(null)
  const [soloCheckingSlug, setSoloCheckingSlug] = useState(false)

  // Team (Small / Enterprise)
  const [persons, setPersons] = useState<PersonEntry[]>([emptyPerson()])

  function updatePerson(idx: number, updates: Partial<PersonEntry>) {
    setPersons(ps => ps.map((p, i) => i === idx ? { ...p, ...updates } : p))
  }

  async function checkSlug(value: string, onResult: (available: boolean) => void) {
    if (!value) return
    const res = await fetch(`/api/slug-check?slug=${encodeURIComponent(value)}`)
    const { available } = await res.json()
    onResult(available)
  }

  async function checkPersonSlug(idx: number, value: string) {
    if (!value) { updatePerson(idx, { slugAvailable: null, checkingSlug: false }); return }
    updatePerson(idx, { checkingSlug: true })
    await checkSlug(value, available => updatePerson(idx, { slugAvailable: available, checkingSlug: false }))
  }

  // Auto-check all pre-filled slugs whenever the slug step is entered
  useEffect(() => {
    if (step !== 'slug') return
    if (plan === 'solo') {
      if (soloSlug) {
        setSoloCheckingSlug(true)
        setSoloSlugAvailable(null)
        checkSlug(soloSlug, a => { setSoloSlugAvailable(a); setSoloCheckingSlug(false) })
      }
    } else {
      persons.forEach((p, idx) => {
        if (p.name.trim() && p.slug) checkPersonSlug(idx, p.slug)
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  function handleContinueFromPlan() {
    if (plan === 'small') setPersons(Array.from({ length: 5 }, emptyPerson))
    else if (plan === 'enterprise') setPersons([emptyPerson()])
    setStep(plan === 'solo' ? 'identity' : 'brand')
  }

  function addPerson() {
    setPersons(ps => [...ps, emptyPerson()])
  }

  function removePerson(idx: number) {
    setPersons(ps => ps.filter((_, i) => i !== idx))
  }

  async function handleFinish() {
    setSaving(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/sign-in'); return }

    const body = plan === 'solo'
      ? {
          plan,
          email: user.email,
          brand: null,
          persons: [{
            name: soloName.trim(),
            title: soloTitle.trim(),
            company: soloCompany.trim(),
            website: soloWebsite.trim(),
            mobile: joinPhone(soloMobileCode, soloMobileNumber),
            email: user.email,
            slug: soloSlug.trim(),
          }],
        }
      : {
          plan,
          email: user.email,
          brand: {
            companyName: companyName.trim(),
            companyWebsite: companyWebsite.trim(),
            themeBg,
            themeFg,
            themeAccent,
            themeFont,
          },
          persons: persons
            .filter(p => p.name.trim() && p.slug.trim())
            .map(p => ({
              name: p.name.trim(),
              title: p.title.trim(),
              company: companyName.trim(),
              website: companyWebsite.trim(),
              mobile: joinPhone(p.mobileCode, p.mobileNumber),
              email: p.email.trim() || user.email,
              slug: p.slug.trim(),
            })),
        }

    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const { error: msg } = await res.json()
      setError(msg ?? 'Something went wrong.')
      setSaving(false)
      return
    }

    // Upload logo to all cards if one was selected in the brand step
    if (logoFile) {
      try {
        const { cardId, cardIds } = await res.json()
        const urlRes = await fetch(`/api/upload-url?type=logo&cardId=${cardId}&filename=${encodeURIComponent(logoFile.name)}`)
        if (urlRes.ok) {
          const { uploadUrl, path } = await urlRes.json()
          await fetch(uploadUrl, { method: 'PUT', body: logoFile, headers: { 'Content-Type': logoFile.type } })
          // Propagate logo_path to every card under this subscriber
          await Promise.all((cardIds as string[]).map((id: string) =>
            fetch('/api/cards/update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ cardId: id, logo_path: path }),
            })
          ))
        }
      } catch {
        // Logo upload is non-blocking — user can upload later in the editor
      }
    }

    router.push('/dashboard')
  }

  const steps = getSteps(plan)
  const stepLabels = getStepLabels(plan)
  const stepIdx = steps.indexOf(step)

  const activePeople = plan === 'solo'
    ? (soloName.trim() ? [{ name: soloName, slug: soloSlug, slugAvailable: soloSlugAvailable }] : [])
    : persons.filter(p => p.name.trim())

  const canPublish = plan === 'solo'
    ? soloName.trim() && soloSlug.trim() && soloSlugAvailable === true
    : activePeople.length > 0 &&
      persons.filter(p => p.name.trim()).every(p => p.slug.trim() && p.slugAvailable === true)

  const activeFontFamily = FONT_OPTIONS.find(f => f.value === themeFont)?.fontFamily ?? FONT_OPTIONS[0].fontFamily

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', padding: '40px 20px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        {/* LeadCard logo — only visible during setup */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/leadcard-logo-light.svg" alt="LeadCard" height={34} style={{ display: 'inline-block' }} />
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
              {i < stepLabels.length - 1 && <div style={{ width: 24, height: 1, background: 'var(--line)', margin: '0 4px' }}/>}
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--line)', padding: '36px 40px', minHeight: 360 }}>

          {/* ── Step: Plan ── */}
          {step === 'plan' && (
            <div>
              <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sage)', fontWeight: 500, margin: '0 0 8px' }}>Step 1</p>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 400, margin: '0 0 8px', letterSpacing: '-0.01em' }}>Choose your plan.</h2>
              <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: '0 0 28px' }}>Pick the experience that fits your business.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {PLANS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPlan(p.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 20,
                      padding: '18px 22px', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit',
                      border: `2px solid ${plan === p.id ? 'var(--charcoal)' : 'var(--line)'}`,
                      background: plan === p.id ? 'var(--cream-2)' : 'white',
                      textAlign: 'left', width: '100%', transition: '120ms',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--charcoal)' }}>{p.name}</span>
                        {p.id === 'small' && (
                          <span style={{ fontSize: 10, padding: '2px 8px', background: 'var(--sage)', color: 'var(--charcoal)', borderRadius: 999, fontWeight: 600, letterSpacing: '0.04em' }}>POPULAR</span>
                        )}
                      </div>
                      <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 10 }}>{p.tagline}</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
                        {p.features.map(f => (
                          <span key={f} style={{ fontSize: 11, padding: '2px 9px', background: plan === p.id ? '#e8f0ec' : 'var(--cream)', borderRadius: 999, color: 'var(--charcoal)' }}>{f}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 400, color: 'var(--charcoal)', lineHeight: 1 }}>{p.price}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>{p.period}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step: Company Brand (Small / Enterprise only) ── */}
          {step === 'brand' && (
            <div>
              <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sage)', fontWeight: 500, margin: '0 0 8px' }}>Step 2 of {steps.length}</p>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 400, margin: '0 0 6px', letterSpacing: '-0.01em' }}>Brand your cards.</h2>
              <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: '0 0 28px', lineHeight: 1.5 }}>
                All team cards share these settings. Your account owner can update them any time from the editor.
              </p>

              {/* Company details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Company name <span style={{ color: 'var(--sage)' }}>*</span></label>
                  <input
                    style={inputStyle}
                    value={companyName}
                    onChange={e => { setCompanyName(e.target.value); setCompanySlug(toSlug(e.target.value)) }}
                    placeholder="Acme Corp"
                    autoFocus
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Company website</label>
                  <input style={inputStyle} value={companyWebsite} onChange={e => setCompanyWebsite(e.target.value)} placeholder="https://acmecorp.com" />
                </div>
              </div>

              {/* Colour palettes */}
              <div style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: 10 }}>Colour palette</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
                {PALETTES.map(p => (
                  <button
                    key={p.label}
                    onClick={() => { setThemeBg(p.bg); setThemeFg(p.fg); setThemeAccent(p.accent) }}
                    style={{
                      padding: '12px 10px', borderRadius: 10, background: p.bg, color: p.fg,
                      border: `2px solid ${themeBg === p.bg ? p.accent : 'transparent'}`,
                      cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 500,
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Custom hex */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
                {([['Background', themeBg, setThemeBg], ['Text', themeFg, setThemeFg], ['Accent', themeAccent, setThemeAccent]] as [string, string, (v: string) => void][]).map(([lbl, val, set]) => (
                  <div key={lbl}>
                    <div style={{ fontSize: 11, fontWeight: 500, marginBottom: 7, color: 'var(--charcoal)' }}>{lbl}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="color" value={val} onChange={e => set(e.target.value)}
                        style={{ width: 34, height: 34, borderRadius: 7, border: '1px solid var(--line)', cursor: 'pointer', padding: 2, flexShrink: 0 }} />
                      <input value={val} onChange={e => set(e.target.value)}
                        style={{ flex: 1, padding: '7px 9px', borderRadius: 7, border: '1px solid var(--line)', fontSize: 12, fontFamily: 'var(--font-mono)', outline: 'none', minWidth: 0 }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Font */}
              <div style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: 10 }}>Font</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
                {FONT_OPTIONS.map(f => (
                  <button
                    key={f.value}
                    onClick={() => setThemeFont(f.value)}
                    style={{
                      padding: '10px 8px', borderRadius: 9, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                      border: `2px solid ${themeFont === f.value ? 'var(--charcoal)' : 'var(--line)'}`,
                      background: themeFont === f.value ? 'var(--cream-2)' : 'white',
                    }}
                  >
                    <div style={{ fontFamily: f.fontFamily, fontSize: 20, lineHeight: 1, marginBottom: 4, color: 'var(--charcoal)' }}>Aa</div>
                    <div style={{ fontSize: 10.5, color: 'var(--muted)', lineHeight: 1.2 }}>{f.label}</div>
                  </button>
                ))}
              </div>

              {/* Live preview */}
              <div style={{ padding: 18, borderRadius: 12, background: themeBg, color: themeFg }}>
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: themeAccent, marginBottom: 5 }}>Preview</div>
                <div style={{ fontFamily: activeFontFamily, fontSize: 22, lineHeight: 1, marginBottom: 3 }}>{companyName || 'Company Name'}</div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>Team member · {companyWebsite || 'yoursite.com'}</div>
                <div style={{ marginTop: 12, display: 'inline-block', padding: '6px 12px', background: themeFg, color: themeBg, borderRadius: 6, fontSize: 11.5, fontWeight: 500 }}>Connect</div>
              </div>

              {/* Logo upload */}
              <div style={{ borderTop: '1px solid var(--line-2)', paddingTop: 18, marginTop: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: 10 }}>Company logo <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional)</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  {logoPreview && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoPreview} alt="Logo preview" style={{ height: 44, maxWidth: 120, objectFit: 'contain', borderRadius: 6, border: '1px solid var(--line)', background: themeBg, padding: 4 }} />
                  )}
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    style={{ padding: '8px 16px', background: 'var(--cream-2)', color: 'var(--charcoal)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    {logoPreview ? 'Replace logo' : 'Upload logo'}
                  </button>
                  {logoPreview && (
                    <button
                      type="button"
                      onClick={() => { setLogoFile(null); setLogoPreview(null) }}
                      style={{ fontSize: 12.5, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      Remove
                    </button>
                  )}
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const f = e.target.files?.[0]
                      if (f) { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)) }
                    }}
                  />
                </div>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, lineHeight: 1.5 }}>
                  Applies to all team cards. You can update it any time from the Theme tab in the editor.
                </p>
              </div>
            </div>
          )}

          {/* ── Step: Identity ── */}
          {step === 'identity' && (
            <div>
              <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sage)', fontWeight: 500, margin: '0 0 8px' }}>Step {stepIdx + 1} of {steps.length}</p>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 400, margin: '0 0 6px', letterSpacing: '-0.01em' }}>
                {plan === 'solo' ? "Who's on the card?" : "Who's on the team?"}
              </h2>
              <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: '0 0 20px' }}>
                {plan === 'solo' && 'Fill in your details.'}
                {plan === 'small' && 'Up to 5 people. Leave blank sections to skip.'}
                {plan === 'enterprise' && 'Add as many people as you need.'}
              </p>

              {/* Company brand banner (Small / Enterprise) */}
              {plan !== 'solo' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: themeBg, color: themeFg, borderRadius: 10, marginBottom: 24 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: themeAccent, flexShrink: 0 }}/>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{companyName}</div>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>Shared brand — all cards inherit these colours and fonts</div>
                  </div>
                </div>
              )}

              {/* Solo identity form */}
              {plan === 'solo' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Display name <span style={{ color: 'var(--sage)' }}>*</span></label>
                    <input style={inputStyle} value={soloName} onChange={e => { setSoloName(e.target.value); setSoloSlug(toSlug(e.target.value)); setSoloSlugAvailable(null) }} placeholder="Avery Quinn" autoFocus />
                  </div>
                  <div>
                    <label style={labelStyle}>Role / title</label>
                    <input style={inputStyle} value={soloTitle} onChange={e => setSoloTitle(e.target.value)} placeholder="Founder & CEO" />
                  </div>
                  <div>
                    <label style={labelStyle}>Company</label>
                    <input style={inputStyle} value={soloCompany} onChange={e => setSoloCompany(e.target.value)} placeholder="Northwind Studio" />
                  </div>
                  <div>
                    <label style={labelStyle}>Mobile</label>
                    <PhoneField code={soloMobileCode} number={soloMobileNumber} onCode={setSoloMobileCode} onNumber={setSoloMobileNumber} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Website</label>
                    <input style={inputStyle} value={soloWebsite} onChange={e => setSoloWebsite(e.target.value)} placeholder="https://yoursite.com" />
                  </div>
                </div>
              )}

              {/* Team identity forms (Small / Enterprise) */}
              {plan !== 'solo' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {persons.map((p, idx) => (
                    <PersonBlock
                      key={p.id}
                      person={p}
                      index={idx}
                      isOwner={idx === 0}
                      canRemove={plan === 'enterprise' && idx > 0}
                      onRemove={() => removePerson(idx)}
                      companySlug={companySlug}
                      onChange={(updates) => {
                        const next = { ...p, ...updates }
                        if ('name' in updates) {
                          const prefix = companySlug ? `${companySlug}-` : ''
                          next.slug = toSlug(`${prefix}${updates.name}`)
                          next.slugAvailable = null
                        }
                        setPersons(ps => ps.map((pp, i) => i === idx ? next : pp))
                      }}
                    />
                  ))}
                  {plan === 'enterprise' && (
                    <button
                      onClick={addPerson}
                      style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1px dashed var(--line)', background: 'transparent', color: 'var(--muted)', fontSize: 13.5, cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      + Add another person
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Step: URLs ── */}
          {step === 'slug' && (
            <div>
              <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sage)', fontWeight: 500, margin: '0 0 8px' }}>Step {stepIdx + 1} of {steps.length}</p>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 400, margin: '0 0 6px', letterSpacing: '-0.01em' }}>
                {plan === 'solo' ? 'Claim your URL.' : 'Claim your URLs.'}
              </h2>
              <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: '0 0 24px' }}>
                {plan === 'solo' ? 'Print it, paste it in your email signature, generate a QR.' : 'Each team member gets their own card link.'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {plan === 'solo' ? (
                  <SlugRow
                    label={soloName}
                    slug={soloSlug}
                    available={soloSlugAvailable}
                    checking={soloCheckingSlug}
                    onChange={v => {
                      setSoloSlug(v)
                      setSoloSlugAvailable(null)
                      setSoloCheckingSlug(true)
                      checkSlug(v, a => { setSoloSlugAvailable(a); setSoloCheckingSlug(false) })
                    }}
                  />
                ) : (
                  persons.filter(p => p.name.trim()).map((p, idx) => {
                    const realIdx = persons.indexOf(p)
                    return (
                      <SlugRow
                        key={p.id}
                        label={`${p.name}${idx === 0 ? ' (Account owner)' : ''}`}
                        slug={p.slug}
                        available={p.slugAvailable}
                        checking={p.checkingSlug}
                        onChange={v => {
                          updatePerson(realIdx, { slug: v, slugAvailable: null })
                          checkPersonSlug(realIdx, v)
                        }}
                      />
                    )
                  })
                )}
              </div>

              {plan !== 'solo' && activePeople.length > 0 && (
                <div style={{ marginTop: 20, padding: 14, background: 'var(--cream-2)', borderRadius: 10 }}>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                    🔒 All {activePeople.length} cards belong to <strong>{companyName}</strong> and are isolated from other companies.
                  </div>
                </div>
              )}

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

          {step === 'plan' && (
            <button
              onClick={handleContinueFromPlan}
              style={{ padding: '12px 24px', background: 'var(--charcoal)', color: 'var(--cream)', borderRadius: 10, fontSize: 14, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', border: 'none' }}
            >
              Continue →
            </button>
          )}

          {step === 'brand' && (
            <button
              onClick={() => setStep('identity')}
              disabled={!companyName.trim()}
              style={{ padding: '12px 24px', background: 'var(--charcoal)', color: 'var(--cream)', borderRadius: 10, fontSize: 14, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', border: 'none', opacity: !companyName.trim() ? 0.4 : 1 }}
            >
              Continue →
            </button>
          )}

          {step === 'identity' && (
            <button
              onClick={() => setStep('slug')}
              disabled={plan === 'solo' ? !soloName.trim() : !persons[0]?.name.trim()}
              style={{ padding: '12px 24px', background: 'var(--charcoal)', color: 'var(--cream)', borderRadius: 10, fontSize: 14, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', border: 'none', opacity: (plan === 'solo' ? !soloName.trim() : !persons[0]?.name.trim()) ? 0.4 : 1 }}
            >
              Continue →
            </button>
          )}

          {step === 'slug' && (
            <button
              onClick={handleFinish}
              disabled={saving || !canPublish}
              style={{ padding: '12px 24px', background: 'var(--sage)', color: 'var(--charcoal)', borderRadius: 10, fontSize: 14, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', border: 'none', opacity: !canPublish ? 0.4 : 1 }}
            >
              {saving ? 'Publishing…' : plan === 'solo' ? 'Publish my card ✦' : `Publish ${activePeople.length} cards ✦`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Slug row ──────────────────────────────────────────────────────────────────
function SlugRow({ label, slug, available, checking, onChange }: {
  label: string
  slug: string
  available: boolean | null
  checking: boolean
  onChange: (v: string) => void
}) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 6, color: 'var(--charcoal)' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--line)', borderRadius: 10, background: 'white', overflow: 'hidden' }}>
        <span style={{ padding: '11px 0 11px 14px', fontSize: 13.5, color: 'var(--muted)', whiteSpace: 'nowrap' as const }}>leadcard.app/c/</span>
        <input
          style={{ ...inputStyle, border: 'none', borderRadius: 0, paddingLeft: 0 }}
          value={slug}
          onChange={e => onChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
          placeholder="their-slug"
        />
        {slug && (checking || available !== null) && (
          <span style={{ paddingRight: 12, fontSize: 12, whiteSpace: 'nowrap' as const, color: checking ? 'var(--muted)' : available ? '#16a34a' : '#dc2626' }}>
            {checking ? '…' : available ? '✓' : '✗ Taken'}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Person block (team plans) ─────────────────────────────────────────────────
interface PersonBlockProps {
  person: PersonEntry
  index: number
  isOwner: boolean
  canRemove: boolean
  companySlug: string
  onRemove: () => void
  onChange: (updates: Partial<PersonEntry>) => void
}

function PersonBlock({ person, index, isOwner, canRemove, onRemove, onChange }: PersonBlockProps) {
  return (
    <div style={{ borderTop: index > 0 ? '1px solid var(--line-2)' : 'none', paddingTop: index > 0 ? 20 : 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--charcoal)', color: 'var(--cream)', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 600 }}>
            {index + 1}
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--charcoal)' }}>Person {index + 1}</span>
          {isOwner && (
            <span style={{ fontSize: 10, padding: '2px 8px', background: 'var(--sage)', color: 'var(--charcoal)', borderRadius: 999, fontWeight: 600, letterSpacing: '0.04em' }}>ACCOUNT OWNER</span>
          )}
        </div>
        {canRemove && (
          <button onClick={onRemove} style={{ fontSize: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', lineHeight: 1, padding: 4 }}>×</button>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Display name{isOwner && <span style={{ color: 'var(--sage)', marginLeft: 3 }}>*</span>}</label>
          <input style={inputStyle} value={person.name} onChange={e => onChange({ name: e.target.value })} placeholder="Sarah Johnson" autoFocus={index === 0} />
        </div>
        <div>
          <label style={labelStyle}>Role / title</label>
          <input style={inputStyle} value={person.title} onChange={e => onChange({ title: e.target.value })} placeholder="Head of Sales" />
        </div>
        <div>
          <label style={labelStyle}>Mobile</label>
          <div style={{ display: 'flex', border: '1px solid var(--line)', borderRadius: 10, overflow: 'hidden', background: 'white' }}>
            <select value={person.mobileCode} onChange={e => onChange({ mobileCode: e.target.value })}
              style={{ padding: '11px 8px', border: 'none', borderRight: '1px solid var(--line)', fontSize: 13, fontFamily: 'inherit', outline: 'none', background: 'var(--cream-2)', cursor: 'pointer', flexShrink: 0 }}>
              {COUNTRY_CODES.map(cc => <option key={cc.code} value={cc.code}>{cc.label}</option>)}
            </select>
            <input value={person.mobileNumber} onChange={e => onChange({ mobileNumber: e.target.value })} placeholder="82 555 0100"
              style={{ flex: 1, padding: '11px 12px', border: 'none', fontSize: 14, fontFamily: 'inherit', outline: 'none', minWidth: 0 }} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Work email</label>
          <input style={inputStyle} type="email" value={person.email} onChange={e => onChange({ email: e.target.value })} placeholder="sarah@company.com" />
        </div>
      </div>
    </div>
  )
}

// ── Phone field ───────────────────────────────────────────────────────────────
function PhoneField({ code, number, onCode, onNumber }: { code: string; number: string; onCode: (v: string) => void; onNumber: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', border: '1px solid var(--line)', borderRadius: 10, overflow: 'hidden', background: 'white' }}>
      <select value={code} onChange={e => onCode(e.target.value)}
        style={{ padding: '11px 8px', border: 'none', borderRight: '1px solid var(--line)', fontSize: 13, fontFamily: 'inherit', outline: 'none', background: 'var(--cream-2)', cursor: 'pointer', flexShrink: 0 }}>
        {COUNTRY_CODES.map(cc => <option key={cc.code} value={cc.code}>{cc.label}</option>)}
      </select>
      <input value={number} onChange={e => onNumber(e.target.value)} placeholder="82 555 0100"
        style={{ flex: 1, padding: '11px 12px', border: 'none', fontSize: 14, fontFamily: 'inherit', outline: 'none', minWidth: 0 }} />
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 5, color: 'var(--charcoal)',
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', border: '1px solid var(--line)',
  borderRadius: 10, fontSize: 14, fontFamily: 'inherit', background: 'white',
  outline: 'none', color: 'var(--charcoal)', boxSizing: 'border-box',
}
