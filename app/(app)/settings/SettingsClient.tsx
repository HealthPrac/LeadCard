'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const PLANS = {
  solo: { label: 'Solo', price: 'R 69/mo', priceMonthly: 6900, description: '1 card · Unlimited leads · Analytics · QR + NFC' },
  small: { label: 'Small business', price: 'R 199/mo', priceMonthly: 19900, description: 'Up to 5 cards · Team management · Priority support' },
  enterprise: { label: 'Enterprise', price: 'Custom', priceMonthly: 0, description: 'Unlimited cards · SSO · Dedicated account manager' },
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
}

interface Props {
  email: string
  subscriber: Subscriber
  cards: Card[]
  leadCount: number
  payfastMerchantId: string
}

export default function SettingsClient({ email, subscriber, cards, leadCount, payfastMerchantId }: Props) {
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

  const plan = PLANS[subscriber.plan as keyof typeof PLANS] ?? PLANS.solo
  const isTrialing = subscriber.subscription_status === 'trialing'
  const trialDaysLeft = subscriber.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(subscriber.trial_ends_at).getTime() - Date.now()) / 86400000))
    : null

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
    // Get a signed PayFast payment URL from the server (includes MD5 signature)
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

  return (
    <div style={{ maxWidth: 680 }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, margin: '0 0 24px', letterSpacing: '-0.01em' }}>Settings</h1>

      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--cream-2)', padding: 4, borderRadius: 10, width: 'fit-content' }}>
        {tab('account', 'Account')}
        {tab('billing', 'Billing')}
        {tab('data', 'Data & privacy')}
      </div>

      {section === 'account' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: 24, borderRadius: 14, background: 'white', border: '1px solid var(--line)' }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 14 }}>Email address</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <input value={newEmail} onChange={e => setNewEmail(e.target.value)} type="email"
                style={{ flex: 1, padding: '9px 14px', borderRadius: 8, border: '1px solid var(--line)', fontSize: 13.5, fontFamily: 'inherit', outline: 'none' }} />
              <button onClick={updateEmail} style={{ padding: '9px 18px', background: 'var(--charcoal)', color: 'var(--cream)', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Update</button>
            </div>
            {emailMsg && <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 8 }}>{emailMsg}</div>}
          </div>

          <div style={{ padding: 24, borderRadius: 14, background: 'white', border: '1px solid var(--line)' }}>
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

      {section === 'billing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Current plan */}
          <div style={{ padding: 24, borderRadius: 14, background: 'white', border: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 8 }}>Current plan</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, marginBottom: 2 }}>{plan.label}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>{plan.description}</div>
                {isTrialing && trialDaysLeft !== null && (
                  <div style={{ marginTop: 10, padding: '6px 12px', background: '#FEF9C3', border: '1px solid #FDE047', borderRadius: 8, fontSize: 13, display: 'inline-block' }}>
                    ⚠️ Trial ends in <strong>{trialDaysLeft} {trialDaysLeft === 1 ? 'day' : 'days'}</strong>
                  </div>
                )}
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22 }}>{plan.price}</div>
            </div>
          </div>

          {/* Activate / upgrade */}
          {(isTrialing || subscriber.subscription_status === 'inactive') && (
            <div style={{ padding: 24, borderRadius: 14, background: 'var(--sage-tint)', border: '1px solid var(--line)' }}>
              <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 6 }}>Activate your subscription</div>
              <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 16px' }}>Add a payment method to keep your card live and leads flowing after the trial ends.</p>
              <button onClick={initPayfast} style={{ padding: '10px 22px', background: 'var(--charcoal)', color: 'var(--cream)', border: 'none', borderRadius: 8, fontSize: 13.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                ◈ Add payment method — R 69/mo
              </button>
              <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 10 }}>Powered by PayFast · Secure · Cancel anytime</div>
            </div>
          )}

          {/* Promo code */}
          {!subscriber.promo_code_id && (
            <div style={{ padding: 24, borderRadius: 14, background: 'white', border: '1px solid var(--line)' }}>
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

          {/* Active */}
          {subscriber.subscription_status === 'active' && (
            <div style={{ padding: 24, borderRadius: 14, background: 'white', border: '1px solid var(--line)' }}>
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

      {section === 'data' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: 24, borderRadius: 14, background: 'white', border: '1px solid var(--line)' }}>
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

          <div style={{ padding: 24, borderRadius: 14, background: 'white', border: '1px solid var(--line-danger, #FEE2E2)' }}>
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
