'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const PLAN_ORDER: Record<string, number> = { solo: 0, small: 1, enterprise: 2 }

interface PlanMeta {
  label: string
  zarPrice: string
  features: string[]
  cardLimit: string
}

function buildPlanMeta(priceMap?: Record<string, string>): Record<string, PlanMeta> {
  return {
    solo: {
      label: 'Solo',
      zarPrice: priceMap?.['solo:ZAR'] ?? 'R 69',
      features: ['1 card', 'Unlimited leads', 'Analytics', 'QR + NFC sharing'],
      cardLimit: '1 card',
    },
    small: {
      label: 'Small Business',
      zarPrice: priceMap?.['small_business:ZAR'] ?? 'R 199',
      features: ['Up to 5 cards', 'Team management', 'Priority support', 'Brand theming'],
      cardLimit: '5 cards',
    },
    enterprise: {
      label: 'Enterprise',
      zarPrice: 'Custom',
      features: ['Unlimited cards', 'SSO', 'Dedicated account manager', 'Custom SLA'],
      cardLimit: 'Unlimited',
    },
  }
}

interface Subscriber {
  id: string
  plan: string
  subscription_status: string
  trial_ends_at: string | null
  promo_code_id: string | null
}

interface Card {
  id: string
  display_name: string | null
  slug: string
  is_owner_card: boolean
}

interface Props {
  email: string
  subscriber: Subscriber
  cards: Card[]
  leadCount: number
  payfastMerchantId: string
  priceMap?: Record<string, string>
}

export default function SettingsClient({ email, subscriber, cards, leadCount, payfastMerchantId, priceMap }: Props) {
  const router = useRouter()
  const [section, setSection] = useState<'account' | 'billing' | 'data'>('account')
  const [newEmail, setNewEmail] = useState(email)
  const [emailMsg, setEmailMsg] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [pwMsg, setPwMsg] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [promoMsg, setPromoMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [promoOpen, setPromoOpen] = useState(false)
  const [promoLoading, setPromoLoading] = useState(false)

  // Plan change state
  const [planTarget, setPlanTarget] = useState<string | null>(null)
  const [planLoading, setPlanLoading] = useState(false)
  const [planError, setPlanError] = useState<string | null>(null)
  const [planSuccess, setPlanSuccess] = useState<string | null>(null)
  const [downgradeConfirm, setDowngradeConfirm] = useState('')

  const PLANS = buildPlanMeta(priceMap)

  async function applyPromo() {
    if (!promoCode.trim()) return
    setPromoLoading(true)
    setPromoMsg(null)
    const res = await fetch('/api/billing/apply-promo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: promoCode.trim() }),
    })
    const json = await res.json()
    setPromoLoading(false)
    if (!res.ok) { setPromoMsg({ type: 'err', text: json.error ?? 'Something went wrong.' }); return }
    setPromoMsg({ type: 'ok', text: json.discount_type === 'free' ? 'Promo applied — your account is now active. Enjoy!' : `Promo applied — ${json.discount_percent}% discount active.` })
    setPromoCode('')
    router.refresh()
  }

  async function submitPlanChange() {
    if (!planTarget) return
    setPlanLoading(true)
    setPlanError(null)

    const res = await fetch('/api/billing/change-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: planTarget }),
    })
    const json = await res.json()
    setPlanLoading(false)

    if (json.requiresInquiry) {
      router.push('/#enterprise')
      return
    }
    if (json.requiresAdminContact) {
      setPlanError('Enterprise plan changes require contacting billing@leadcard.app.')
      return
    }
    if (!res.ok || !json.success) {
      setPlanError(json.error ?? 'Something went wrong. Please try again.')
      return
    }

    const targetMeta = PLANS[planTarget]
    let msg = `You're now on ${targetMeta.label}.`
    if (json.cardsUnpublished > 0) {
      msg += ` ${json.cardsUnpublished} team card${json.cardsUnpublished !== 1 ? 's were' : ' was'} unpublished.`
    }
    msg += ' Billing will be adjusted within 24 hours.'
    setPlanSuccess(msg)
    setPlanTarget(null)
    setDowngradeConfirm('')
    router.refresh()
  }

  function cancelPlanChange() {
    setPlanTarget(null)
    setPlanError(null)
    setDowngradeConfirm('')
  }

  const currentPlan = subscriber.plan
  const isTrialing = subscriber.subscription_status === 'trialing'
  const trialDaysLeft = subscriber.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(subscriber.trial_ends_at).getTime() - Date.now()) / 86400000))
    : null

  const currentMeta = PLANS[currentPlan] ?? PLANS.solo

  async function updateEmail() {
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ email: newEmail })
    setEmailMsg(error ? error.message : 'Confirmation email sent. Check your inbox.')
  }

  async function updatePassword() {
    if (newPassword.length < 8) { setPwMsg('Minimum 8 characters.'); return }
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setPwMsg(error ? error.message : 'Password updated.')
    setNewPassword('')
  }

  async function initPayfast() {
    const res = await fetch('/api/billing/payfast-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: 'solo' }),
    })
    if (!res.ok) { alert('Billing not configured. Contact support@leadcard.app'); return }
    const { url } = await res.json()
    window.location.href = url
  }

  function exportLeadsCsv() {
    window.location.href = '/api/export/leads'
  }

  const tab = (key: typeof section, label: string) => (
    <button
      onClick={() => setSection(key)}
      style={{
        padding: '8px 16px', borderRadius: 8, fontSize: 13.5, fontWeight: section === key ? 500 : 400,
        background: section === key ? 'var(--cream-2)' : 'transparent',
        color: section === key ? 'var(--charcoal)' : 'var(--muted)',
        border: 'none', cursor: 'pointer', fontFamily: 'inherit',
      }}
    >
      {label}
    </button>
  )

  // Extra non-owner cards (relevant for Small→Solo downgrade warning)
  const extraCards = cards.filter(c => !c.is_owner_card)
  const isDowngrade = planTarget ? PLAN_ORDER[planTarget] < PLAN_ORDER[currentPlan] : false
  const needsDowngradeConfirm = isDowngrade && planTarget === 'solo' && extraCards.length > 0

  return (
    <div style={{ maxWidth: 680 }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, margin: '0 0 24px', letterSpacing: '-0.01em' }}>Settings</h1>

      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--cream-2)', padding: 4, borderRadius: 10, width: 'fit-content' }}>
        {tab('account', 'Account')}
        {tab('billing', 'Billing')}
        {tab('data', 'Data & privacy')}
      </div>

      {/* ── Account ─────────────────────────────────────────────────────── */}
      {section === 'account' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: 24, borderRadius: 14, background: 'var(--bg-surface)', border: '1px solid var(--line)' }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 14 }}>Email address</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <input value={newEmail} onChange={e => setNewEmail(e.target.value)} type="email"
                style={{ flex: 1, padding: '9px 14px', borderRadius: 8, border: '1px solid var(--line)', fontSize: 13.5, fontFamily: 'inherit', outline: 'none' }} />
              <button onClick={updateEmail} style={{ padding: '9px 18px', background: 'var(--charcoal)', color: 'var(--cream)', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Update</button>
            </div>
            {emailMsg && <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 8 }}>{emailMsg}</div>}
          </div>

          <div style={{ padding: 24, borderRadius: 14, background: 'var(--bg-surface)', border: '1px solid var(--line)' }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 14 }}>Password</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <input value={newPassword} onChange={e => setNewPassword(e.target.value)} type="password" placeholder="New password (min 8 chars)"
                style={{ flex: 1, padding: '9px 14px', borderRadius: 8, border: '1px solid var(--line)', fontSize: 13.5, fontFamily: 'inherit', outline: 'none' }} />
              <button onClick={updatePassword} style={{ padding: '9px 18px', background: 'var(--charcoal)', color: 'var(--cream)', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Update</button>
            </div>
            {pwMsg && <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 8 }}>{pwMsg}</div>}
          </div>
        </div>
      )}

      {/* ── Billing ─────────────────────────────────────────────────────── */}
      {section === 'billing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Current plan summary */}
          <div style={{ padding: 24, borderRadius: 14, background: 'var(--bg-surface)', border: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 8 }}>Current plan</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, marginBottom: 2 }}>{currentMeta.label}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>{currentMeta.cardLimit} · Unlimited leads</div>
                {isTrialing && trialDaysLeft !== null && (
                  <div style={{ marginTop: 10, padding: '6px 12px', background: '#FEF9C3', border: '1px solid #FDE047', borderRadius: 8, fontSize: 13, display: 'inline-block' }}>
                    ⚠️ Trial ends in <strong>{trialDaysLeft} {trialDaysLeft === 1 ? 'day' : 'days'}</strong>
                  </div>
                )}
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22 }}>{currentMeta.zarPrice}{currentMeta.zarPrice !== 'Custom' ? '/mo' : ''}</div>
            </div>
          </div>

          {/* Activate (trial / inactive) */}
          {(isTrialing || subscriber.subscription_status === 'inactive') && (
            <div style={{ padding: 24, borderRadius: 14, background: 'var(--sage-tint)', border: '1px solid var(--line)' }}>
              <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 6 }}>Activate your subscription</div>
              <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 16px' }}>Add a payment method to keep your card live and leads flowing after the trial ends.</p>
              <button onClick={initPayfast} style={{ padding: '10px 22px', background: 'var(--charcoal)', color: 'var(--cream)', border: 'none', borderRadius: 8, fontSize: 13.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                ◈ Add payment method — {currentMeta.zarPrice}/mo
              </button>
              <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 10 }}>Powered by PayFast · Secure · Cancel anytime</div>
            </div>
          )}

          {/* Success banner */}
          {planSuccess && (
            <div style={{ padding: '14px 18px', borderRadius: 10, background: '#F0FDF4', border: '1px solid #86EFAC', fontSize: 13.5, color: '#166534' }}>
              ✓ {planSuccess}
            </div>
          )}

          {/* Plan change — not available for enterprise (custom pricing) */}
          {currentPlan !== 'enterprise' && !planTarget && (
            <div style={{ padding: 24, borderRadius: 14, background: 'var(--bg-surface)', border: '1px solid var(--line)' }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 16 }}>Change plan</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {(['solo', 'small', 'enterprise'] as const).map(key => {
                  const meta = PLANS[key]
                  const isCurrent = key === currentPlan
                  const isHigher = PLAN_ORDER[key] > PLAN_ORDER[currentPlan]
                  const isLower = PLAN_ORDER[key] < PLAN_ORDER[currentPlan]

                  return (
                    <div
                      key={key}
                      style={{
                        padding: '16px 14px',
                        borderRadius: 12,
                        border: isCurrent ? '2px solid var(--charcoal)' : '1px solid var(--line)',
                        background: isCurrent ? 'var(--cream-2)' : 'var(--bg-surface)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 15 }}>{meta.label}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--charcoal)', lineHeight: 1 }}>
                        {meta.zarPrice === 'Custom' ? (
                          <span>Custom</span>
                        ) : (
                          <span>{meta.zarPrice}<span style={{ fontSize: 11, fontWeight: 400, color: 'var(--muted)' }}>/mo</span></span>
                        )}
                      </div>
                      <ul style={{ margin: 0, padding: '0 0 0 14px', fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.7 }}>
                        {meta.features.map(f => <li key={f}>{f}</li>)}
                      </ul>
                      {isCurrent ? (
                        <div style={{ marginTop: 4, fontSize: 11.5, fontWeight: 600, color: 'var(--charcoal)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Current plan
                        </div>
                      ) : key === 'enterprise' ? (
                        <a
                          href="/#enterprise"
                          style={{ marginTop: 4, display: 'inline-block', padding: '7px 14px', borderRadius: 7, background: '#B8743E', color: '#fff', fontSize: 12.5, fontWeight: 500, textDecoration: 'none', textAlign: 'center' }}
                        >
                          Contact us →
                        </a>
                      ) : (
                        <button
                          onClick={() => { setPlanTarget(key); setPlanError(null); setPlanSuccess(null) }}
                          style={{
                            marginTop: 4, padding: '7px 14px', borderRadius: 7,
                            background: isHigher ? 'var(--charcoal)' : 'transparent',
                            color: isHigher ? 'var(--cream)' : 'var(--muted)',
                            border: isHigher ? 'none' : '1px solid var(--line)',
                            fontSize: 12.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                          }}
                        >
                          {isHigher ? 'Upgrade →' : 'Downgrade'}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Enterprise plan — direct to billing for changes */}
          {currentPlan === 'enterprise' && (
            <div style={{ padding: 24, borderRadius: 14, background: 'var(--bg-surface)', border: '1px solid var(--line)' }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 8 }}>Plan changes</div>
              <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
                Enterprise plan changes are handled by our team. Contact <a href="mailto:billing@leadcard.app" style={{ color: 'var(--charcoal)' }}>billing@leadcard.app</a> to adjust your plan or seats.
              </p>
            </div>
          )}

          {/* Plan change confirmation panel */}
          {planTarget && (() => {
            const targetMeta = PLANS[planTarget]
            const isUpgrade = PLAN_ORDER[planTarget] > PLAN_ORDER[currentPlan]

            return (
              <div style={{ padding: 24, borderRadius: 14, background: isUpgrade ? '#F0FDF4' : '#FEF9C3', border: `1px solid ${isUpgrade ? '#86EFAC' : '#FDE047'}` }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: isUpgrade ? '#166534' : '#854D0E', marginBottom: 12, fontWeight: 600 }}>
                  {isUpgrade ? 'Confirm upgrade' : 'Confirm downgrade'}
                </div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, marginBottom: 8 }}>
                  {currentMeta.label} → {targetMeta.label}
                </div>
                <p style={{ fontSize: 13.5, color: '#444', margin: '0 0 12px', lineHeight: 1.6 }}>
                  Your plan will update immediately. Billing will be adjusted from{' '}
                  <strong>{currentMeta.zarPrice}{currentMeta.zarPrice !== 'Custom' ? '/mo' : ''}</strong> to{' '}
                  <strong>{targetMeta.zarPrice}{targetMeta.zarPrice !== 'Custom' ? '/mo' : ''}</strong> within 24 hours.
                </p>

                {/* Downgrade + extra cards warning */}
                {needsDowngradeConfirm && (
                  <div style={{ background: 'rgba(180,60,0,0.07)', borderRadius: 8, padding: '12px 14px', marginBottom: 14, fontSize: 13 }}>
                    <strong>⚠️ {extraCards.length} team card{extraCards.length !== 1 ? 's' : ''} will be unpublished</strong>
                    <p style={{ margin: '6px 0 0', color: '#7A4A0F', lineHeight: 1.5 }}>
                      The Solo plan supports 1 card. Your team cards and all their data will be preserved but unpublished. They can be re-activated if you upgrade again.
                    </p>
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 12, color: '#7A4A0F', marginBottom: 6 }}>Type <strong>downgrade</strong> to confirm:</div>
                      <input
                        value={downgradeConfirm}
                        onChange={e => setDowngradeConfirm(e.target.value)}
                        placeholder="downgrade"
                        style={{ padding: '8px 12px', borderRadius: 7, border: '1px solid #F6C675', fontSize: 13.5, fontFamily: 'inherit', outline: 'none', width: 160 }}
                      />
                    </div>
                  </div>
                )}

                {planError && (
                  <div style={{ fontSize: 13, color: '#EF4444', marginBottom: 12 }}>{planError}</div>
                )}

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={submitPlanChange}
                    disabled={planLoading || (needsDowngradeConfirm && downgradeConfirm !== 'downgrade')}
                    style={{
                      padding: '9px 20px', background: isUpgrade ? '#17181C' : '#B8743E',
                      color: '#fff', border: 'none', borderRadius: 8, fontSize: 13.5, fontWeight: 500,
                      cursor: (planLoading || (needsDowngradeConfirm && downgradeConfirm !== 'downgrade')) ? 'not-allowed' : 'pointer',
                      opacity: (planLoading || (needsDowngradeConfirm && downgradeConfirm !== 'downgrade')) ? 0.55 : 1,
                      fontFamily: 'inherit',
                    }}
                  >
                    {planLoading ? 'Updating…' : isUpgrade ? 'Confirm upgrade' : 'Confirm downgrade'}
                  </button>
                  <button
                    onClick={cancelPlanChange}
                    style={{ padding: '9px 18px', background: 'transparent', color: 'var(--muted)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )
          })()}

          {/* Promo code */}
          {!subscriber.promo_code_id && (
            <div style={{ padding: 24, borderRadius: 14, background: 'var(--bg-surface)', border: '1px solid var(--line)' }}>
              <button
                onClick={() => { setPromoOpen(v => !v); setPromoMsg(null) }}
                style={{ fontSize: 13, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0, textDecoration: 'underline' }}
              >
                {promoOpen ? 'Hide promo code' : 'Have a promo code?'}
              </button>
              {promoOpen && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="e.g. FRIEND2024"
                      style={{ flex: 1, padding: '9px 14px', borderRadius: 8, border: '1px solid var(--line)', fontSize: 13.5, fontFamily: 'inherit', outline: 'none', letterSpacing: '0.05em' }}
                    />
                    <button
                      onClick={applyPromo}
                      disabled={promoLoading || !promoCode.trim()}
                      style={{ padding: '9px 18px', background: 'var(--charcoal)', color: 'var(--cream)', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: promoLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: promoLoading || !promoCode.trim() ? 0.6 : 1 }}
                    >
                      {promoLoading ? 'Applying…' : 'Apply'}
                    </button>
                  </div>
                  {promoMsg && (
                    <div style={{ fontSize: 13, marginTop: 10, color: promoMsg.type === 'ok' ? '#16a34a' : '#EF4444' }}>
                      {promoMsg.text}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Active subscription status */}
          {subscriber.subscription_status === 'active' && (
            <div style={{ padding: 24, borderRadius: 14, background: 'var(--bg-surface)', border: '1px solid var(--line)' }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 8 }}>Subscription</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80' }} />
                <span style={{ fontSize: 14, fontWeight: 500 }}>Active</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--muted)', margin: '8px 0 0' }}>To cancel or update billing, contact <a href="mailto:billing@leadcard.app" style={{ color: 'var(--charcoal)' }}>billing@leadcard.app</a>.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Data & privacy ───────────────────────────────────────────────── */}
      {section === 'data' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: 24, borderRadius: 14, background: 'var(--bg-surface)', border: '1px solid var(--line)' }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 8 }}>Your data</div>
            <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: '0 0 16px', lineHeight: 1.6 }}>
              You own all data captured through your card. Your leads are stored securely in South Africa (POPIA-compliant). Download a copy at any time.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={exportLeadsCsv} style={{ padding: '9px 18px', background: 'var(--cream-2)', color: 'var(--charcoal)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                ↓ Export all leads (CSV)
              </button>
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--muted)' }}>
              {leadCount} leads · {cards.length} card{cards.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div style={{ padding: 24, borderRadius: 14, background: 'var(--bg-surface)', border: '1px solid var(--line-danger, #FEE2E2)' }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#EF4444', marginBottom: 8 }}>Danger zone</div>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 14px' }}>
              Deleting your account permanently removes your card, all leads, and cancels your subscription. This cannot be undone.
            </p>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 10px' }}>Type <strong>delete my account</strong> to confirm:</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                placeholder="delete my account"
                style={{ flex: 1, padding: '9px 14px', borderRadius: 8, border: '1px solid var(--line)', fontSize: 13.5, fontFamily: 'inherit', outline: 'none' }}
              />
              <button
                disabled={deleteConfirm !== 'delete my account'}
                onClick={() => alert('Please contact support@leadcard.app to delete your account.')}
                style={{ padding: '9px 18px', background: '#EF4444', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: deleteConfirm === 'delete my account' ? 'pointer' : 'not-allowed', opacity: deleteConfirm === 'delete my account' ? 1 : 0.4, fontFamily: 'inherit' }}
              >
                Delete account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
