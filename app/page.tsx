import Link from 'next/link'

const FEATURES = [
  { icon: '✦', title: 'Your card, your story', body: 'Intro video, headline, bio, links — a full first impression, not just a name and number.' },
  { icon: '◎', title: 'Leads, automatically', body: 'Every visitor who fills your form lands in your inbox and dashboard. No manual follow-up required.' },
  { icon: '⬡', title: 'Tap to share (NFC)', body: 'Hand someone your physical NFC card. They tap. Your digital card opens. No app needed.' },
  { icon: '⊡', title: 'QR code included', body: 'Print it, project it, put it anywhere. One scan = your full card + lead capture form.' },
  { icon: '↗', title: 'Analytics that matter', body: 'See where leads come from — conference, LinkedIn, email signature — and double down.' },
  { icon: '◈', title: 'Works for teams too', body: 'Manage cards for your whole team from one account. One brand, many faces.' },
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
    name: 'Small business',
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
    href: 'mailto:hello@leadcard.app',
    featured: false,
  },
]

export default function HomePage() {
  return (
    <div style={{ fontFamily: 'var(--font-sans)', color: 'var(--charcoal)', background: 'var(--cream)', minHeight: '100vh' }}>

      {/* Nav */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid var(--line)', background: 'var(--cream)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--charcoal)', display: 'grid', placeItems: 'center', color: 'var(--sage)', fontFamily: 'var(--font-serif)', fontSize: 20, lineHeight: 1 }}>L</div>
          <span style={{ fontSize: 17, fontWeight: 500, letterSpacing: '-0.01em' }}>LeadCard</span>
        </div>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 24, fontSize: 14 }}>
          <a href="#features" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Features</a>
          <a href="#pricing" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Pricing</a>
          <Link href="/sign-in" style={{ color: 'var(--charcoal)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
          <Link href="/sign-up" style={{ padding: '8px 18px', background: 'var(--charcoal)', color: 'var(--cream)', borderRadius: 8, fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
            Get started free →
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '96px 40px 80px', maxWidth: 860, margin: '0 auto' }}>
        <div style={{ display: 'inline-block', padding: '5px 14px', background: 'var(--sage-tint)', borderRadius: 99, fontSize: 12.5, fontWeight: 500, color: 'var(--charcoal)', marginBottom: 28, border: '1px solid rgba(143,175,157,0.3)' }}>
          7-day free trial · No credit card required
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 68, lineHeight: 1.05, margin: '0 0 24px', letterSpacing: '-0.02em', color: 'var(--charcoal)' }}>
          The digital business<br />card that captures leads.
        </h1>
        <p style={{ fontSize: 19, color: 'var(--muted)', margin: '0 0 40px', lineHeight: 1.6, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
          Share a link, tap an NFC card, or scan a QR — visitors watch your intro, then drop their details. Leads straight to your inbox.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/sign-up" style={{ padding: '14px 32px', background: 'var(--charcoal)', color: 'var(--cream)', borderRadius: 10, fontSize: 16, fontWeight: 500, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            ✦ Create your card — free
          </Link>
          <a href="#features" style={{ padding: '14px 28px', background: 'white', color: 'var(--charcoal)', borderRadius: 10, fontSize: 16, fontWeight: 400, textDecoration: 'none', border: '1px solid var(--line)' }}>
            See how it works
          </a>
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 18 }}>
          From R 69/month after trial. Cancel anytime.
        </p>
      </section>

      {/* Card mockup strip */}
      <section style={{ padding: '0 40px 96px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ background: 'var(--charcoal)', borderRadius: 20, padding: '48px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
          {[
            { screen: 'Welcome', desc: 'Your face, name, and a warm intro.', icon: '☺' },
            { screen: 'Your video', desc: '30 seconds. Unstoppable first impression.', icon: '▶' },
            { screen: 'Lead form', desc: 'They share details. You get a ping.', icon: '◎' },
          ].map(({ screen, desc, icon }) => (
            <div key={screen} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: '28px 24px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--cream)', marginBottom: 6 }}>{screen}</div>
              <div style={{ fontSize: 13, color: 'rgba(246,247,243,0.55)', lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '0 40px 96px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 42, margin: '0 0 14px', letterSpacing: '-0.02em' }}>Everything you need to make a lasting impression</h2>
          <p style={{ fontSize: 17, color: 'var(--muted)', maxWidth: 520, margin: '0 auto' }}>Built for South African professionals who know that relationships drive revenue.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ padding: '28px 24px', background: 'white', borderRadius: 14, border: '1px solid var(--line)' }}>
              <div style={{ fontSize: 22, marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.65 }}>{f.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '0 40px 96px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 42, margin: '0 0 14px', letterSpacing: '-0.02em' }}>Simple pricing</h2>
          <p style={{ fontSize: 17, color: 'var(--muted)', margin: 0 }}>7-day free trial on all plans. No credit card to start.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, alignItems: 'start' }}>
          {PLANS.map(p => (
            <div key={p.name} style={{
              padding: 28, borderRadius: 16,
              background: p.featured ? 'var(--charcoal)' : 'white',
              color: p.featured ? 'var(--cream)' : 'var(--charcoal)',
              border: p.featured ? 'none' : '1px solid var(--line)',
              transform: p.featured ? 'scale(1.03)' : 'none',
            }}>
              <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.6, marginBottom: 8 }}>{p.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 4 }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: 40 }}>{p.price}</span>
                <span style={{ fontSize: 13, opacity: 0.6 }}>{p.period}</span>
              </div>
              <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 24 }}>{p.description}</div>
              <ul style={{ margin: '0 0 28px', padding: '0 0 0 16px', fontSize: 13.5, lineHeight: 2.1, opacity: 0.9 }}>
                {p.features.map(f => <li key={f}>{f}</li>)}
              </ul>
              <Link href={p.href} style={{
                display: 'block', textAlign: 'center', padding: '11px 0',
                background: p.featured ? 'var(--sage)' : 'var(--charcoal)',
                color: p.featured ? 'var(--charcoal)' : 'var(--cream)',
                borderRadius: 9, fontSize: 14, fontWeight: 500, textDecoration: 'none',
              }}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: '80px 40px 96px', textAlign: 'center', background: 'var(--sage-tint)', borderTop: '1px solid var(--line)' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 44, margin: '0 0 16px', letterSpacing: '-0.02em' }}>Ready to make your introduction count?</h2>
        <p style={{ fontSize: 17, color: 'var(--muted)', margin: '0 0 36px' }}>Create your digital card in under 5 minutes.</p>
        <Link href="/sign-up" style={{ padding: '16px 40px', background: 'var(--charcoal)', color: 'var(--cream)', borderRadius: 10, fontSize: 16, fontWeight: 500, textDecoration: 'none', display: 'inline-block' }}>
          ✦ Get started — it&apos;s free
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ padding: '28px 40px', borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--charcoal)', display: 'grid', placeItems: 'center', color: 'var(--sage)', fontFamily: 'var(--font-serif)', fontSize: 15 }}>L</div>
          <span style={{ fontWeight: 500, color: 'var(--charcoal)' }}>LeadCard</span>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          <a href="mailto:hello@leadcard.app" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Contact</a>
          <Link href="/sign-in" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Sign in</Link>
          <Link href="/sign-up" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Sign up</Link>
        </div>
        <div>© {new Date().getFullYear()} LeadCard</div>
      </footer>
    </div>
  )
}
