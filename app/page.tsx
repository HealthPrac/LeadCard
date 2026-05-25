'use client'

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

const PLANS = [
  {
    name: 'Solo',
    price: 'R 69',
    period: '/mo',
    description: 'For individuals and freelancers',
    features: ['1 digital card', 'Unlimited leads', 'Analytics dashboard', 'QR code', 'NFC card (add-on)', 'Email signature generator'],
    cta: 'Start free trial',
    href: '/sign-up',
    featured: false,
  },
  {
    name: 'Small Business',
    price: 'R 199',
    period: '/mo',
    description: 'For teams up to 5 people',
    features: ['Up to 5 cards', 'Team management', 'Everything in Solo', 'Shared lead inbox', 'Priority support', 'Custom domain (soon)'],
    cta: 'Start free trial',
    href: '/sign-up',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organisations',
    features: ['Unlimited cards', 'SSO / SAML', 'Dedicated account manager', 'SLA & uptime guarantee', 'API access', 'Custom integrations'],
    cta: 'Contact us',
    href: 'mailto:hello@avantcard.app',
    featured: false,
  },
]

// Sections that are intentionally always dark use hardcoded values so they
// don't invert when the user switches to dark mode (--charcoal flips to near-white).
const DARK_BG  = '#17171C'
const DARK_TEXT = '#F9F7F3'

export default function HomePage() {
  return (
    <div style={{ fontFamily: 'var(--font-sans)', color: 'var(--charcoal)', background: 'var(--cream)', minHeight: '100vh' }}>

      {/* ─── NAV ────────────────────────────────────────────── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', height: 68,
        background: 'var(--nav-glass)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--line)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        {/* Logo */}
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

        <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <a href="#features" style={{ fontSize: 12.5, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none' }}>Features</a>
          <a href="#pricing" style={{ fontSize: 12.5, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none' }}>Pricing</a>
          <Link href="/sign-in" style={{ fontSize: 12.5, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none', fontWeight: 500 }}>
            Log In
          </Link>
          {/* Theme toggle — inline in nav */}
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
      </header>

      {/* ─── HERO — always dark ─────────────────────────────── */}
      <section style={{
        background: DARK_BG, minHeight: '92vh',
        display: 'flex', alignItems: 'center',
        padding: '100px 48px 80px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-60px', width: 600, height: 600, background: 'radial-gradient(ellipse, rgba(184,116,62,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#B8743E', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ display: 'block', width: 32, height: 1, background: '#B8743E' }} />
              Premium Digital Identity
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(42px,5vw,66px)', fontWeight: 300, lineHeight: 1.1, letterSpacing: '-0.01em', color: DARK_TEXT, margin: '0 0 28px' }}>
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

          {/* Card mockup — hardcoded dark, unaffected by theme */}
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 340, height: 340, background: 'radial-gradient(ellipse, rgba(184,116,62,0.14) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ width: 260, borderRadius: 36, background: '#111115', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(184,116,62,0.14), inset 0 0 0 8px #1a1a22', overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', width: 88, height: 6, background: '#111115', borderRadius: 3, zIndex: 10 }} />
              <div style={{ height: 110, background: 'linear-gradient(135deg, #2A1810 0%, #1A1210 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: 18, letterSpacing: '0.1em', color: '#F0DCC9', fontWeight: 300 }}>AVANT CARD</span>
              </div>
              <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'linear-gradient(135deg, #3A2015, #281810)', border: '2.5px solid #111115', margin: '-34px auto 0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-serif)', fontSize: 22, color: '#D4975A', position: 'relative', zIndex: 2, boxShadow: '0 4px 16px rgba(0,0,0,0.5)' }}>A</div>
              <div style={{ padding: '12px 20px 0', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontWeight: 500, color: DARK_TEXT, marginBottom: 2 }}>Alexandra Voss</div>
                <div style={{ fontSize: 10.5, color: 'rgba(249,247,243,0.48)', marginBottom: 2, letterSpacing: '0.04em' }}>Principal Strategist</div>
                <div style={{ fontSize: 10, color: '#D4975A', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>Meridian Advisory</div>
              </div>
              <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                {['a.voss@meridian.co', '+27 82 450 9210'].map(c => (
                  <div key={c} style={{ fontSize: 10, color: 'rgba(249,247,243,0.48)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ opacity: 0.5 }}>•</span>{c}
                  </div>
                ))}
              </div>
              <div style={{ margin: '14px 16px 0', background: '#1e1e28', borderRadius: 8, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#B8743E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="10" height="11" viewBox="0 0 10 11" fill="none"><path d="M2 2l7 3.5L2 9V2z" fill="white"/></svg>
                </div>
                <span style={{ fontSize: 10, color: 'rgba(249,247,243,0.45)', letterSpacing: '0.04em' }}>Watch Introduction</span>
              </div>
              <div style={{ display: 'flex', gap: 8, padding: '12px 16px 20px' }}>
                {['Save Contact', 'Connect', 'Website'].map(a => (
                  <div key={a} style={{ flex: 1, padding: '8px 4px', background: 'rgba(184,116,62,0.1)', border: '1px solid rgba(184,116,62,0.18)', borderRadius: 4, fontSize: 9, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#D4975A', textAlign: 'center' }}>{a}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3-PANEL STRIP — panels always dark ─────────────── */}
      <section style={{ padding: '80px 48px', background: 'var(--cream-2)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {[
              { label: 'Welcome', desc: 'Your face, name, and a warm introduction — before they even say hello.', step: '01' },
              { label: 'Your video', desc: '45 seconds. An unstoppable first impression that static cards cannot match.', step: '02' },
              { label: 'Lead capture', desc: 'They share their details. You receive a notification. Every time.', step: '03' },
            ].map(({ label, desc, step }) => (
              <div key={label} style={{ padding: '32px 28px', background: DARK_BG, borderRadius: 2, position: 'relative' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 300, color: 'rgba(184,116,62,0.22)', marginBottom: 14, lineHeight: 1 }}>{step}</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: DARK_TEXT, marginBottom: 10, fontWeight: 400 }}>{label}</div>
                <div style={{ fontSize: 13.5, color: 'rgba(249,247,243,0.5)', lineHeight: 1.65 }}>{desc}</div>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, #B8743E, transparent)' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES — theme-aware ─────────────────────────── */}
      <section id="features" style={{ padding: '100px 48px', background: 'var(--cream)' }}>
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
              Built for South African professionals who understand that relationships drive revenue.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
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

      {/* ─── PRICING — theme-aware ──────────────────────────── */}
      <section id="pricing" style={{ padding: '100px 48px', background: 'var(--cream-2)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--copper)', marginBottom: 14 }}>Pricing</div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(30px,4vw,44px)', fontWeight: 300, margin: '0 0 14px', letterSpacing: '-0.01em', color: 'var(--charcoal)' }}>Simple, honest pricing</h2>
            <p style={{ fontSize: 15, color: 'var(--muted)', margin: 0 }}>7-day free trial on all plans. No credit card to start.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, alignItems: 'start' }}>
            {PLANS.map(p => (
              <div key={p.name} style={{
                padding: 32,
                background: p.featured ? DARK_BG : 'var(--bg-surface)',
                color: p.featured ? DARK_TEXT : 'var(--charcoal)',
                border: p.featured ? 'none' : '1px solid var(--line)',
                transform: p.featured ? 'scale(1.03)' : 'none',
                position: 'relative',
              }}>
                {p.featured && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: '#B8743E' }} />}
                <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.55, marginBottom: 10 }}>{p.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: 44, fontWeight: 300 }}>{p.price}</span>
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
                <Link href={p.href} style={{
                  display: 'block', textAlign: 'center', padding: '13px 0',
                  background: p.featured ? '#B8743E' : DARK_BG,
                  color: '#fff',
                  fontSize: 12.5, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase',
                  textDecoration: 'none',
                }}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA — always dark ────────────────────────── */}
      <section style={{ padding: '110px 48px', textAlign: 'center', background: DARK_BG, position: 'relative', overflow: 'hidden' }}>
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
            From R 69/month after trial · Cancel anytime
          </p>
        </div>
      </section>

      {/* ─── FOOTER — always dark ───────────────────────────── */}
      <footer style={{ padding: '40px 48px 28px', background: '#111115', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
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
            <div style={{ display: 'flex', gap: 28 }}>
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11.5 }}>
            <span style={{ color: 'rgba(249,247,243,0.22)' }}>© {new Date().getFullYear()} Tech-Tok. All Rights Reserved.</span>
            <span style={{ color: 'rgba(249,247,243,0.18)' }}>Powered by <span style={{ color: 'rgba(184,116,62,0.45)' }}>Tech-Tok</span></span>
          </div>
        </div>
      </footer>

    </div>
  )
}
