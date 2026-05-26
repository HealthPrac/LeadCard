'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const FEATURES = [
  { icon: '◈', title: 'Your card, your identity', body: 'Intro video, headline, bio, links — a curated first impression that goes far beyond a name and number.' },
  { icon: '◎', title: 'Lead capture, automatic', body: 'Every visitor who fills your form lands in your private dashboard. No manual logging, no missed follow-ups.' },
  { icon: '⬡', title: 'NFC — tap to share', body: 'Hand someone your physical NFC card. They tap. Your card opens instantly. No app required.' },
  { icon: '⊡', title: 'QR code included', body: 'Print it, project it, add it to your email footer. One scan — your full card and lead form.' },
  { icon: '↗', title: 'Analytics with clarity', body: 'See exactly where leads originate — conference, LinkedIn, email — and invest where it converts.' },
  { icon: '⊕', title: 'Built for teams', body: 'One brand. Multiple cards. Manage your whole team from a single account with shared lead visibility.' },
]

const PLANS_BASE = [
  {
    planKey:     'solo',
    name:        'Solo',
    zarPrice:    'R 69',
    usdPrice:    '$ 4',
    period:      '/mo',
    description: 'For individuals and freelancers',
    features:    ['1 digital card', 'Unlimited leads', 'Analytics dashboard', 'QR code', 'NFC card (add-on)', 'Email signature generator'],
    cta:         'Start free trial',
    href:        '/sign-up',
    featured:    false,
  },
  {
    planKey:     'small_business',
    name:        'Small Business',
    zarPrice:    'R 199',
    usdPrice:    '$ 12',
    period:      '/mo',
    description: 'For teams up to 5 people',
    features:    ['Up to 5 cards', 'Team management', 'Everything in Solo', 'Shared lead inbox', 'Priority support', 'Custom domain (soon)'],
    cta:         'Start free trial',
    href:        '/sign-up',
    featured:    true,
  },
  {
    planKey:     'enterprise',
    name:        'Enterprise',
    zarPrice:    'Custom',
    usdPrice:    'Custom',
    period:      '',
    description: 'For large organisations',
    features:    ['Unlimited cards', 'SSO / SAML', 'Dedicated account manager', 'SLA & uptime guarantee', 'API access', 'Custom integrations'],
    cta:         'Contact us',
    href:        '#enterprise-inquiry',
    featured:    false,
  },
]

const DARK_BG  = '#17171C'
const DARK_TEXT = '#F9F7F3'

interface Props {
  priceMap?: Record<string, string>
}

type InquiryState = 'idle' | 'submitting' | 'success' | 'error'

export default function HomepageClient({ priceMap }: Props) {
  const [currency, setCurrency] = useState<'ZAR' | 'USD'>('ZAR')
  const [showInquiry, setShowInquiry] = useState(false)
  const [inquiryState, setInquiryState] = useState<InquiryState>('idle')
  const [inquiryError, setInquiryError] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleEnterpriseInquiry(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setInquiryState('submitting')
    setInquiryError(null)
    const fd = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/enterprise/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(fd.entries())),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setInquiryState('error')
        setInquiryError(data.error ?? 'Something went wrong. Please try again.')
      } else {
        setInquiryState('success')
        formRef.current?.reset()
      }
    } catch {
      setInquiryState('error')
      setInquiryError('Could not reach the server. Please try again.')
    }
  }

  function openInquiry(e: React.MouseEvent) {
    e.preventDefault()
    setShowInquiry(true)
    setInquiryState('idle')
    setInquiryError(null)
  }

  const PLANS = PLANS_BASE.map(p => ({
    ...p,
    zarPrice: priceMap?.[`${p.planKey}:ZAR`] ?? p.zarPrice,
    usdPrice: priceMap?.[`${p.planKey}:USD`] ?? p.usdPrice,
  }))

  const startingZar = PLANS[0].zarPrice
  const startingUsd = PLANS[0].usdPrice

  return (
    <div style={{ fontFamily: 'var(--font-sans)', color: 'var(--charcoal)', background: 'var(--cream)', minHeight: '100vh' }}>

      {/* ─── NAV ────────────────────────────────────────────── */}
      <header className="lc-nav" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 68,
        background: 'var(--nav-glass)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--line)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="8" fill="#17171C"/>
            <path d="M20 8 L28 24 H12 Z" fill="none" stroke="#B8743E" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M14 24 L26 24" stroke="#B8743E" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="20" cy="30" r="2.5" fill="#D4975A" opacity="0.6"/>
          </svg>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 19, fontWeight: 500, letterSpacing: '0.02em', color: 'var(--charcoal)' }}>
            Avant<span style={{ color: 'var(--copper)' }}>Card</span>
          </span>
        </div>

        {/* Desktop nav */}
        <nav className="lc-nav-links">
          <a href="#features" style={{ fontSize: 12.5, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none' }}>Features</a>
          <a href="#pricing" style={{ fontSize: 12.5, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none' }}>Pricing</a>
          <Link href="/sign-in" style={{ fontSize: 12.5, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none', fontWeight: 500 }}>
            Log In
          </Link>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ThemeToggle compact />
          </div>
          <Link href="/sign-up" style={{
            padding: '9px 20px', background: 'var(--copper)', color: '#fff',
            fontSize: 12, fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase',
            textDecoration: 'none',
          }}>
            Sign Up
          </Link>
        </nav>

        {/* Mobile: sign up + hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="lc-mob-ham">
          <Link href="/sign-up" style={{
            padding: '8px 16px', background: 'var(--copper)', color: '#fff',
            fontSize: 12, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase',
            textDecoration: 'none',
          }}>
            Sign Up
          </Link>
          <button
            onClick={() => setMenuOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: 'var(--charcoal)', padding: '4px', lineHeight: 1 }}
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>
      </header>

      {/* ─── MOBILE MENU ────────────────────────────────────── */}
      <div className={`lc-mob-menu${menuOpen ? ' open' : ''}`} style={{ background: 'var(--cream)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 20, borderBottom: '1px solid var(--line)', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="26" height="26" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="8" fill="#17171C"/>
              <path d="M20 8 L28 24 H12 Z" fill="none" stroke="#B8743E" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M14 24 L26 24" stroke="#B8743E" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="20" cy="30" r="2.5" fill="#D4975A" opacity="0.6"/>
            </svg>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 500, color: 'var(--charcoal)' }}>
              Avant<span style={{ color: 'var(--copper)' }}>Card</span>
            </span>
          </div>
          <button
            onClick={() => setMenuOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: 'var(--charcoal)', padding: '4px', lineHeight: 1 }}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {[
            { label: 'Features', href: '#features' },
            { label: 'Pricing', href: '#pricing' },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={() => setMenuOpen(false)}
              style={{ fontSize: 18, fontWeight: 400, color: 'var(--charcoal)', textDecoration: 'none', padding: '12px 0', borderBottom: '1px solid var(--line)' }}
            >
              {label}
            </a>
          ))}
          <Link href="/sign-in" onClick={() => setMenuOpen(false)} style={{ fontSize: 18, fontWeight: 400, color: 'var(--charcoal)', textDecoration: 'none', padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
            Log In
          </Link>
        </div>
        <div style={{ paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Link
            href="/sign-up"
            onClick={() => setMenuOpen(false)}
            style={{ display: 'block', textAlign: 'center', padding: '14px', background: 'var(--copper)', color: '#fff', fontSize: 13, fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', textDecoration: 'none' }}
          >
            Create Your Card — Free
          </Link>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ThemeToggle compact />
          </div>
        </div>
      </div>

      {/* ─── HERO — always dark ─────────────────────────────── */}
      <section className="lc-hero" style={{
        background: DARK_BG,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-60px', width: 600, height: 600, background: 'radial-gradient(ellipse, rgba(184,116,62,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="lc-hero-grid">
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#B8743E', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ display: 'block', width: 32, height: 1, background: '#B8743E' }} />
              Premium Digital Identity
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(38px,5vw,66px)', fontWeight: 300, lineHeight: 1.1, letterSpacing: '-0.01em', color: DARK_TEXT, margin: '0 0 28px' }}>
              Your business card<br />is <em style={{ fontStyle: 'italic', color: '#D4975A' }}>an experience.</em>
            </h1>
            <p style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.75, color: 'rgba(249,247,243,0.58)', marginBottom: 44, maxWidth: 440 }}>
              AvantCard blends premium digital identity, intro video, QR access, and lead
              intelligence into one elegant card layer — built for professionals who leave
              a lasting impression.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
              <Link href="/sign-up" style={{ padding: '15px 36px', background: '#B8743E', color: '#fff', fontSize: 13, fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', textDecoration: 'none', display: 'inline-block' }}>
                Create Your Card
              </Link>
              <a href="#features" style={{ padding: '14px 28px', border: '1px solid rgba(249,247,243,0.22)', color: 'rgba(249,247,243,0.75)', fontSize: 13, fontWeight: 400, letterSpacing: '0.07em', textTransform: 'uppercase', textDecoration: 'none' }}>
                See How It Works
              </a>
            </div>
            <div style={{ marginTop: 48, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {['Premium presentation', 'Intro video & QR', 'Lead intelligence'].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(249,247,243,0.40)', letterSpacing: '0.04em' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#B8743E', display: 'inline-block', flexShrink: 0 }} />
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Card mockup — hidden on mobile via .lc-hero-mock */}
          <div className="lc-hero-mock">
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 420, height: 420, background: 'radial-gradient(ellipse, rgba(184,116,62,0.18) 0%, transparent 68%)', pointerEvents: 'none' }} />
            <div style={{
              width: 310, borderRadius: 44, background: '#0E0E12',
              border: '1px solid rgba(255,255,255,0.09)',
              boxShadow: '0 48px 120px rgba(0,0,0,0.75), 0 0 0 1px rgba(184,116,62,0.12), inset 0 0 0 9px #18181F',
              overflow: 'hidden', position: 'relative', flexShrink: 0,
            }}>
              <div style={{ position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', width: 100, height: 28, background: '#0E0E12', borderRadius: 14, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#222228' }} />
                <div style={{ width: 38, height: 10, borderRadius: 5, background: '#1C1C22' }} />
              </div>
              <div style={{ background: '#17171C', minHeight: 640, display: 'flex', flexDirection: 'column', color: '#F9F7F3', fontFamily: 'var(--font-sans)', paddingTop: 46 }}>
                <div style={{ height: 108, background: 'linear-gradient(135deg, rgba(184,116,62,0.18) 0%, rgba(184,116,62,0.06) 100%)', borderBottom: '1px solid rgba(249,247,243,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 13, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#D4975A', fontWeight: 300, opacity: 0.8 }}>Meridian Advisory</span>
                </div>
                <div style={{ padding: '0 22px', marginTop: -42, flexShrink: 0 }}>
                  <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(184,116,62,0.3) 0%, rgba(184,116,62,0.12) 100%)', border: '3px solid #17171C', boxShadow: '0 2px 14px rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-serif)', fontSize: 30, color: '#D4975A' }}>AV</div>
                </div>
                <div style={{ padding: '0 22px', marginTop: 12 }}>
                  <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#F9F7F3', opacity: 0.5, marginBottom: 6 }}>Hello —</div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 36, lineHeight: 0.98, letterSpacing: '-0.015em', color: '#F9F7F3' }}>Alexandra Voss</div>
                  <div style={{ fontSize: 13, marginTop: 9, color: '#F9F7F3', opacity: 0.68 }}>Principal Strategist · Meridian Advisory</div>
                  <div style={{ marginTop: 9, display: 'inline-block', padding: '4px 11px', background: 'rgba(184,116,62,0.18)', color: '#D4975A', borderRadius: 999, fontSize: 11, fontWeight: 500 }}>Management Consulting</div>
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 7, color: '#F9F7F3', opacity: 0.62 }}><span style={{ opacity: 0.55, fontSize: 11 }}>✉</span><span>a.voss@meridian.co</span></div>
                    <div style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 7, color: '#F9F7F3', opacity: 0.62 }}><span style={{ opacity: 0.55, fontSize: 11 }}>✆</span><span>+27 82 450 9210</span></div>
                  </div>
                </div>
                <p style={{ padding: '0 22px', margin: '14px 0 0', fontSize: 12.5, lineHeight: 1.55, color: '#F9F7F3', opacity: 0.58 }}>
                  15 years of executive strategy consulting, specialising in African market entry and organisational transformation.
                </p>
                <div style={{ padding: '14px 22px 0', display: 'flex', gap: 8 }}>
                  {['in', 'tw', 'gh'].map(s => (
                    <div key={s} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(184,116,62,0.14)', border: '1px solid rgba(184,116,62,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#D4975A', letterSpacing: '0.04em' }}>{s}</div>
                  ))}
                </div>
                <div style={{ marginTop: 'auto', padding: '18px 22px 0' }}>
                  <div style={{ background: '#B8743E', color: '#fff', padding: '13px 18px', borderRadius: 2, fontSize: 12, fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginBottom: 8 }}>
                    <svg width="10" height="11" viewBox="0 0 10 11" fill="none"><path d="M2 2l7 3.5L2 9V2z" fill="white"/></svg>
                    Watch my intro
                  </div>
                  <div style={{ border: '1px solid rgba(249,247,243,0.18)', color: 'rgba(249,247,243,0.72)', padding: '12px 18px', borderRadius: 2, fontSize: 12, fontWeight: 400, letterSpacing: '0.07em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                    ↗ Share my card
                  </div>
                </div>
                <div style={{ padding: '12px 22px 24px', display: 'flex', justifyContent: 'center', gap: 14, marginTop: 8 }}>
                  {['Terms', 'Privacy', 'Disclaimer'].map(l => (
                    <span key={l} style={{ fontSize: 9.5, color: '#F9F7F3', opacity: 0.28, letterSpacing: '0.02em' }}>{l}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3-PANEL STRIP ──────────────────────────────────── */}
      <section className="lc-strip-pad" style={{ background: 'var(--cream-2)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="lc-3col-g20">
            {[
              { label: 'Welcome', desc: 'Your face, name, and a warm introduction — before they even say hello.', step: '01' },
              { label: 'Your video', desc: '45 seconds. An unstoppable first impression that static cards cannot match.', step: '02' },
              { label: 'Lead capture', desc: 'They share their details. You receive a notification. Every time.', step: '03' },
            ].map(({ label, desc, step }) => (
              <div key={label} style={{ padding: '32px 28px', background: 'var(--bg-surface)', borderRadius: 2, position: 'relative' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 300, color: 'var(--copper)', opacity: 0.5, marginBottom: 14, lineHeight: 1 }}>{step}</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--charcoal)', marginBottom: 10, fontWeight: 400 }}>{label}</div>
                <div style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.65 }}>{desc}</div>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, var(--copper), transparent)' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ───────────────────────────────────────── */}
      <section id="features" className="lc-sec-pad" style={{ background: 'var(--cream-2)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 60, maxWidth: 520 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--copper)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ display: 'block', width: 24, height: 1, background: 'var(--copper)' }} />
              Features
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(30px,4vw,44px)', fontWeight: 300, lineHeight: 1.18, margin: '0 0 16px', letterSpacing: '-0.01em', color: 'var(--charcoal)' }}>
              Everything you need to make a <em style={{ fontStyle: 'italic', color: 'var(--copper)' }}>lasting impression.</em>
            </h2>
            <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.75, margin: 0 }}>
              Built for professionals who understand that relationships drive revenue.
            </p>
          </div>
          <div className="lc-3col">
            {FEATURES.map(f => (
              <div key={f.title} style={{ padding: '28px 24px', background: 'var(--bg-surface)', border: '1px solid var(--line)', position: 'relative' }}>
                <div style={{ width: 36, height: 36, border: '1px solid rgba(184,116,62,0.25)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--copper)', fontSize: 16, marginBottom: 16 }}>
                  {f.icon}
                </div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 19, fontWeight: 400, marginBottom: 8, color: 'var(--charcoal)' }}>{f.title}</div>
                <div style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.65 }}>{f.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ────────────────────────────────────────── */}
      <section id="pricing" className="lc-sec-pad" style={{ background: 'var(--cream-2)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--copper)', marginBottom: 14 }}>Pricing</div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(30px,4vw,44px)', fontWeight: 300, margin: '0 0 14px', letterSpacing: '-0.01em', color: 'var(--charcoal)' }}>Simple, honest pricing</h2>
            <p style={{ fontSize: 15, color: 'var(--muted)', margin: '0 0 28px' }}>7-day free trial on all plans. No credit card to start.</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 0, border: '1px solid var(--line)', borderRadius: 4, overflow: 'hidden', background: 'var(--bg-surface)' }}>
              {(['ZAR', 'USD'] as const).map(c => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  style={{
                    padding: '8px 22px', fontSize: 12, fontWeight: 500, letterSpacing: '0.07em',
                    background: currency === c ? 'var(--copper)' : 'transparent',
                    color: currency === c ? '#fff' : 'var(--muted)',
                    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'background 150ms, color 150ms',
                  }}
                >
                  {c === 'ZAR' ? '🇿🇦 ZAR' : '🌍 USD'}
                </button>
              ))}
            </div>
          </div>
          <div className="lc-3col-start">
            {PLANS.map(p => (
              <div key={p.name} className={p.featured ? 'lc-pricing-featured' : ''} style={{
                padding: 32,
                background: p.featured ? DARK_BG : 'var(--bg-surface)',
                color: p.featured ? DARK_TEXT : 'var(--charcoal)',
                border: p.featured ? 'none' : '1px solid var(--line)',
                position: 'relative',
              }}>
                {p.featured && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: '#B8743E' }} />}
                <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.55, marginBottom: 10 }}>{p.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: 44, fontWeight: 300 }}>{currency === 'ZAR' ? p.zarPrice : p.usdPrice}</span>
                  <span style={{ fontSize: 13, opacity: 0.55 }}>{p.period}</span>
                </div>
                <div style={{ fontSize: 13, opacity: 0.55, marginBottom: 28 }}>{p.description}</div>
                <ul style={{ margin: '0 0 32px', padding: 0, listStyle: 'none', fontSize: 13.5, lineHeight: 2.1, opacity: 0.85 }}>
                  {p.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: p.featured ? '#D4975A' : '#B8743E', display: 'inline-block', flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
                {p.planKey === 'enterprise' ? (
                  <button
                    onClick={openInquiry}
                    style={{
                      display: 'block', width: '100%', textAlign: 'center', padding: '13px 0',
                      background: DARK_BG, color: '#fff', border: 'none', cursor: 'pointer',
                      fontSize: 12.5, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase',
                      fontFamily: 'inherit',
                    }}
                  >
                    {p.cta}
                  </button>
                ) : (
                  <Link href={p.href} style={{
                    display: 'block', textAlign: 'center', padding: '13px 0',
                    background: p.featured ? '#B8743E' : DARK_BG, color: '#fff',
                    fontSize: 12.5, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase',
                    textDecoration: 'none',
                  }}>
                    {p.cta}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ──────────────────────────────────────── */}
      <section className="lc-cta-pad" style={{ textAlign: 'center', background: DARK_BG, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 350, background: 'radial-gradient(ellipse, rgba(184,116,62,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(184,116,62,0.35), transparent)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#B8743E', marginBottom: 16 }}>Get Started</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(30px,4vw,52px)', fontWeight: 300, color: DARK_TEXT, margin: '0 auto 18px', lineHeight: 1.18, maxWidth: 600 }}>
            Turn every introduction into a <em style={{ fontStyle: 'italic', color: '#D4975A' }}>trackable opportunity.</em>
          </h2>
          <p style={{ fontSize: 15, fontWeight: 300, color: 'rgba(249,247,243,0.52)', margin: '0 auto 44px', maxWidth: 440, lineHeight: 1.75 }}>
            Create your digital card in under 5 minutes. Your next client is one introduction away.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/sign-up" style={{ padding: '15px 40px', background: '#B8743E', color: '#fff', fontSize: 13, fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', textDecoration: 'none' }}>
              Create Your Card — Free
            </Link>
            <Link href="/sign-in" style={{ padding: '14px 28px', border: '1px solid rgba(249,247,243,0.22)', color: 'rgba(249,247,243,0.7)', fontSize: 13, fontWeight: 400, letterSpacing: '0.07em', textTransform: 'uppercase', textDecoration: 'none' }}>
              Log In
            </Link>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(249,247,243,0.3)', marginTop: 20 }}>
            From {currency === 'ZAR' ? startingZar : startingUsd}/month after trial · Cancel anytime
          </p>
        </div>
      </section>

      {/* ─── ENTERPRISE INQUIRY MODAL ──────────────────────── */}
      {showInquiry && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) { setShowInquiry(false); setInquiryState('idle') } }}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.72)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: '20px',
          }}
        >
          <div style={{
            background: 'var(--bg-surface)', maxWidth: 500, width: '100%',
            padding: '36px 36px 32px', position: 'relative',
            borderTop: '3px solid #B8743E',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          }}>
            <button
              onClick={() => { setShowInquiry(false); setInquiryState('idle') }}
              style={{
                position: 'absolute', top: 16, right: 16,
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 18, color: 'var(--muted)', lineHeight: 1, padding: 4,
              }}
              aria-label="Close"
            >×</button>

            <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#B8743E' }}>Enterprise</p>
            <h2 style={{ margin: '0 0 6px', fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 400, color: 'var(--charcoal)' }}>
              Request a call back
            </h2>
            <p style={{ margin: '0 0 24px', fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.6 }}>
              Tell us about your organisation. We'll be in touch within one business day.
            </p>

            {inquiryState === 'success' ? (
              <div style={{ textAlign: 'center', padding: '28px 0' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 400, margin: '0 0 8px', color: 'var(--charcoal)' }}>Inquiry received</h3>
                <p style={{ fontSize: 14, color: 'var(--muted)' }}>We'll be in touch within one business day.</p>
                <button
                  onClick={() => { setShowInquiry(false); setInquiryState('idle') }}
                  style={{ marginTop: 20, padding: '10px 24px', background: DARK_BG, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}
                >
                  Close
                </button>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleEnterpriseInquiry}>
                <div className="lc-2col-form" style={{ marginBottom: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>
                      Your name <span style={{ color: '#B8743E' }}>*</span>
                    </label>
                    <input
                      name="contact_name" required
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line)', background: 'var(--cream)', color: 'var(--charcoal)', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>
                      Company <span style={{ color: '#B8743E' }}>*</span>
                    </label>
                    <input
                      name="company_name" required
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line)', background: 'var(--cream)', color: 'var(--charcoal)', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>
                    Work email <span style={{ color: '#B8743E' }}>*</span>
                  </label>
                  <input
                    name="contact_email" type="email" required
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line)', background: 'var(--cream)', color: 'var(--charcoal)', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }}
                  />
                </div>

                <div className="lc-2col-form" style={{ marginBottom: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>Phone</label>
                    <input
                      name="contact_phone" type="tel"
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line)', background: 'var(--cream)', color: 'var(--charcoal)', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>Estimated team size</label>
                    <select
                      name="estimated_seats"
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line)', background: 'var(--cream)', color: 'var(--charcoal)', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }}
                    >
                      <option value="">Select…</option>
                      <option value="6">6 – 15</option>
                      <option value="16">16 – 50</option>
                      <option value="51">51 – 200</option>
                      <option value="201">201+</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>Message</label>
                  <textarea
                    name="message" rows={3}
                    placeholder="Tell us about your use case, timeline, or any specific requirements…"
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line)', background: 'var(--cream)', color: 'var(--charcoal)', fontSize: 14, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
                  />
                </div>

                {inquiryError && (
                  <p style={{ margin: '0 0 14px', fontSize: 13, color: '#C0392B', background: 'rgba(192,57,43,0.08)', padding: '10px 14px', borderLeft: '3px solid #C0392B' }}>
                    {inquiryError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={inquiryState === 'submitting'}
                  style={{
                    width: '100%', padding: '13px', background: inquiryState === 'submitting' ? 'rgba(23,24,28,0.5)' : DARK_BG,
                    color: '#fff', border: 'none', cursor: inquiryState === 'submitting' ? 'not-allowed' : 'pointer',
                    fontSize: 13, fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'inherit',
                  }}
                >
                  {inquiryState === 'submitting' ? 'Sending…' : 'Send inquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ─── FOOTER ─────────────────────────────────────────── */}
      <footer className="lc-footer-pad" style={{ background: '#111115', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, paddingBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="8" fill="#27272f"/>
                <path d="M20 8 L28 24 H12 Z" fill="none" stroke="#B8743E" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M14 24 L26 24" stroke="#B8743E" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="20" cy="30" r="2.5" fill="#D4975A" opacity="0.6"/>
              </svg>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 17, color: 'rgba(249,247,243,0.75)', letterSpacing: '0.03em' }}>
                Avant<span style={{ color: '#B8743E' }}>Card</span>
              </span>
            </div>
            <div className="lc-footer-links">
              {[
                { label: 'Sign In', href: '/sign-in' },
                { label: 'Sign Up', href: '/sign-up' },
                { label: 'Terms', href: '/terms' },
                { label: 'Privacy', href: '/privacy' },
              ].map(({ label, href }) => (
                <Link key={label} href={href} style={{ fontSize: 12.5, color: 'rgba(249,247,243,0.35)', textDecoration: 'none' }}>{label}</Link>
              ))}
            </div>
          </div>
          <div className="lc-footer-bottom">
            <span style={{ color: 'rgba(249,247,243,0.22)' }}>© {new Date().getFullYear()} Tech-Tok. All Rights Reserved.</span>
            <span style={{ color: 'rgba(249,247,243,0.18)' }}>Powered by <span style={{ color: 'rgba(184,116,62,0.45)' }}>Tech-Tok</span></span>
          </div>
        </div>
      </footer>

    </div>
  )
}
