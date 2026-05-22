'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { COUNTRY_CODES, joinPhone } from '@/lib/phone-codes'

type Plan = 'solo' | 'small' | 'enterprise'
type Step = 'plan' | 'identity' | 'slug'

interface PersonEntry {
  id: string
  name: string
  title: string
  company: string
  mobileCode: string
  mobileNumber: string
  website: string
  slug: string
  slugAvailable: boolean | null
  checkingSlug: boolean
}

function emptyPerson(): PersonEntry {
  return {
    id: crypto.randomUUID(),
    name: '', title: '', company: '',
    mobileCode: '+27', mobileNumber: '',
    website: '', slug: '',
    slugAvailable: null, checkingSlug: false,
  }
}

const PLANS: {
  id: Plan
  name: string
  tagline: string
  features: string[]
  price: string
  period: string
}[] = [
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
    tagline: 'Cards for your whole team',
    features: ['Up to 5 cards', 'Lead capture', 'Team dashboard', 'Priority support'],
    price: '$12',
    period: 'per month',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Built to scale — fully customisable',
    features: ['Unlimited cards', 'Custom branding', 'API access', 'Dedicated support'],
    price: 'Custom',
    period: 'contact us',
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('plan')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [plan, setPlan] = useState<Plan>('solo')
  const [persons, setPersons] = useState<PersonEntry[]>([emptyPerson()])

  function updatePerson(idx: number, updates: Partial<PersonEntry>) {
    setPersons(ps => ps.map((p, i) => i === idx ? { ...p, ...updates } : p))
  }

  function nameToSlug(n: string) {
    return n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  async function checkPersonSlug(idx: number, value: string) {
    if (!value) { updatePerson(idx, { slugAvailable: null, checkingSlug: false }); return }
    updatePerson(idx, { checkingSlug: true })
    const res = await fetch(`/api/slug-check?slug=${encodeURIComponent(value)}`)
    const { available } = await res.json()
    updatePerson(idx, { slugAvailable: available, checkingSlug: false })
  }

  function handleContinueFromPlan() {
    const count = plan === 'small' ? 5 : 1
    setPersons(Array.from({ length: count }, emptyPerson))
    setStep('identity')
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

    const activePeople = persons
      .filter(p => p.name.trim() && p.slug.trim())
      .map(p => ({
        name: p.name.trim(),
        title: p.title.trim(),
        company: p.company.trim(),
        mobile: joinPhone(p.mobileCode, p.mobileNumber),
        website: p.website.trim(),
        slug: p.slug.trim(),
      }))

    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan,
        email: user.email,
        lead_destination_email: user.email,
        persons: activePeople,
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

  const steps: Step[] = ['plan', 'identity', 'slug']
  const stepIdx = steps.indexOf(step)
  const stepLabels = ['Plan', 'Identity', 'Your URL']

  // Active persons = those with a name (used in slug step)
  const activePeople = persons.filter(p => p.name.trim())

  // Can publish: all active people have valid slugs, at least 1 person
  const canPublish = activePeople.length > 0 &&
    activePeople.every(p => p.slug.trim() && p.slugAvailable === true)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', padding: '40px 20px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>

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

          {/* ── Step 1: Plan selection ── */}
          {step === 'plan' && (
            <div>
              <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sage)', fontWeight: 500, margin: '0 0 8px' }}>Step 1 of 3</p>
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
                          <span key={f} style={{
                            fontSize: 11, padding: '2px 9px',
                            background: plan === p.id ? '#e8f0ec' : 'var(--cream)',
                            borderRadius: 999, color: 'var(--charcoal)',
                          }}>{f}</span>
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

          {/* ── Step 2: Identity ── */}
          {step === 'identity' && (
            <div>
              <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sage)', fontWeight: 500, margin: '0 0 8px' }}>Step 2 of 3</p>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 400, margin: '0 0 4px', letterSpacing: '-0.01em' }}>Who&apos;s on the card?</h2>
              <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: '0 0 24px' }}>
                {plan === 'solo' && 'Fill in your details.'}
                {plan === 'small' && 'Up to 5 people. Leave a section blank to skip it.'}
                {plan === 'enterprise' && 'Add as many people as you need.'}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {persons.map((p, idx) => (
                  <PersonBlock
                    key={p.id}
                    person={p}
                    index={idx}
                    required={idx === 0}
                    canRemove={plan === 'enterprise' && idx > 0}
                    onRemove={() => removePerson(idx)}
                    onChange={(updates) => {
                      const next = { ...p, ...updates }
                      if ('name' in updates) {
                        const autoSlug = nameToSlug(updates.name as string)
                        next.slug = autoSlug
                        next.slugAvailable = null
                      }
                      setPersons(ps => ps.map((pp, i) => i === idx ? next : pp))
                    }}
                  />
                ))}
              </div>
              {plan === 'enterprise' && (
                <button
                  onClick={addPerson}
                  style={{ marginTop: 16, width: '100%', padding: '12px', borderRadius: 10, border: '1px dashed var(--line)', background: 'transparent', color: 'var(--muted)', fontSize: 13.5, cursor: 'pointer', fontFamily: 'inherit', transition: '120ms' }}
                >
                  + Add another person
                </button>
              )}
            </div>
          )}

          {/* ── Step 3: URLs ── */}
          {step === 'slug' && (
            <div>
              <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sage)', fontWeight: 500, margin: '0 0 8px' }}>Step 3 of 3</p>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 400, margin: '0 0 6px', letterSpacing: '-0.01em' }}>Claim your URLs.</h2>
              <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: '0 0 24px' }}>Each person gets their own card link.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {persons.map((p, idx) => {
                  if (!p.name.trim()) return null
                  return (
                    <div key={p.id}>
                      <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 6, color: 'var(--charcoal)' }}>{p.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--line)', borderRadius: 10, background: 'white', overflow: 'hidden' }}>
                        <span style={{ padding: '11px 0 11px 14px', fontSize: 13.5, color: 'var(--muted)', whiteSpace: 'nowrap' as const }}>leadcard.app/c/</span>
                        <input
                          style={{ ...inputStyle, border: 'none', borderRadius: 0, paddingLeft: 0 }}
                          value={p.slug}
                          onChange={e => {
                            const v = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                            updatePerson(idx, { slug: v, slugAvailable: null })
                            checkPersonSlug(idx, v)
                          }}
                          placeholder="their-slug"
                        />
                        {p.slug && (
                          <span style={{ paddingRight: 12, fontSize: 12, whiteSpace: 'nowrap' as const, color: p.checkingSlug ? 'var(--muted)' : p.slugAvailable ? '#16a34a' : '#dc2626' }}>
                            {p.checkingSlug ? '…' : p.slugAvailable ? '✓' : '✗ Taken'}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              {activePeople.length > 1 && (
                <div style={{ marginTop: 20, padding: 16, background: 'var(--cream-2)', borderRadius: 12 }}>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    🔒 {activePeople.length} isolated cards. Each person owns their own experience.
                  </div>
                </div>
              )}
              {activePeople.length === 1 && (
                <div style={{ marginTop: 20, padding: 16, background: 'var(--cream-2)', borderRadius: 12 }}>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 4 }}>Your card will live at</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 500 }}>leadcard.app/c/{activePeople[0]?.slug || 'your-slug'}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 6 }}>🔒 Isolated workspace. Nothing leaks to other subscribers.</div>
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
          {step === 'identity' && (
            <button
              onClick={() => setStep('slug')}
              disabled={!persons[0]?.name.trim()}
              style={{ padding: '12px 24px', background: 'var(--charcoal)', color: 'var(--cream)', borderRadius: 10, fontSize: 14, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', border: 'none', opacity: !persons[0]?.name.trim() ? 0.4 : 1 }}
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
              {saving ? 'Publishing…' : 'Publish cards ✦'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Person block ──────────────────────────────────────────────────────────────
interface PersonBlockProps {
  person: PersonEntry
  index: number
  required: boolean
  canRemove: boolean
  onRemove: () => void
  onChange: (updates: Partial<PersonEntry>) => void
}

function PersonBlock({ person, index, required, canRemove, onRemove, onChange }: PersonBlockProps) {
  return (
    <div style={{ borderTop: index > 0 ? '1px solid var(--line-2)' : 'none', paddingTop: index > 0 ? 20 : 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--charcoal)', color: 'var(--cream)', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
            {index + 1}
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--charcoal)' }}>
            Person {index + 1}{required && <span style={{ color: 'var(--sage)', marginLeft: 3 }}>*</span>}
          </span>
        </div>
        {canRemove && (
          <button onClick={onRemove} style={{ fontSize: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', lineHeight: 1, padding: 4 }}>×</button>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 5 }}>Display name{required && <span style={{ color: 'var(--sage)', marginLeft: 3 }}>*</span>}</label>
          <input
            style={inputStyle}
            value={person.name}
            onChange={e => onChange({ name: e.target.value })}
            placeholder="Avery Quinn"
            autoFocus={index === 0}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 5 }}>Role / title</label>
          <input style={inputStyle} value={person.title} onChange={e => onChange({ title: e.target.value })} placeholder="Founder & CEO" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 5 }}>Company</label>
          <input style={inputStyle} value={person.company} onChange={e => onChange({ company: e.target.value })} placeholder="Northwind Studio" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 5 }}>Mobile</label>
          <div style={{ display: 'flex', border: '1px solid var(--line)', borderRadius: 10, overflow: 'hidden', background: 'white' }}>
            <select
              value={person.mobileCode}
              onChange={e => onChange({ mobileCode: e.target.value })}
              style={{ padding: '11px 8px', border: 'none', borderRight: '1px solid var(--line)', fontSize: 13, fontFamily: 'inherit', outline: 'none', background: 'var(--cream-2)', cursor: 'pointer', flexShrink: 0 }}
            >
              {COUNTRY_CODES.map(cc => (
                <option key={cc.code} value={cc.code}>{cc.label}</option>
              ))}
            </select>
            <input
              value={person.mobileNumber}
              onChange={e => onChange({ mobileNumber: e.target.value })}
              placeholder="82 555 0100"
              style={{ flex: 1, padding: '11px 12px', border: 'none', fontSize: 14, fontFamily: 'inherit', outline: 'none', minWidth: 0 }}
            />
          </div>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 5 }}>Website</label>
          <input style={inputStyle} value={person.website} onChange={e => onChange({ website: e.target.value })} placeholder="https://yoursite.com" />
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', border: '1px solid var(--line)',
  borderRadius: 10, fontSize: 14, fontFamily: 'inherit', background: 'white',
  outline: 'none', color: 'var(--charcoal)', boxSizing: 'border-box',
}
