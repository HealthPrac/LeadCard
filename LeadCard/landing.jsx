// Marketing landing page
const Landing = ({ onStart, onSignIn }) => {
  return (
    <div className="landing" data-screen-label="00 Landing">
      <nav className="landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="brand-mark" style={{
            width: 32, height: 32, borderRadius: 9, background: 'var(--charcoal)',
            display: 'grid', placeItems: 'center', color: 'var(--sage)',
            fontFamily: 'var(--font-serif)', fontSize: 22, lineHeight: 1, paddingBottom: 3,
          }}>L</div>
          <div style={{ fontSize: 17, fontWeight: 500, letterSpacing: '-0.01em' }}>LeadCard</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, fontSize: 14 }}>
          <a style={{ color: 'var(--muted)' }}>Examples</a>
          <a style={{ color: 'var(--muted)' }}>Pricing</a>
          <a style={{ color: 'var(--muted)' }}>How it works</a>
          <button className="btn btn-ghost" onClick={onSignIn}>Sign in</button>
          <button className="btn btn-primary" onClick={onStart}>Start free</button>
        </div>
      </nav>

      <section className="landing-hero">
        <div>
          <div className="chip dot" style={{ marginBottom: 20 }}>
            New · Quarterly lead reports for every plan
          </div>
          <h1>
            Your business<br/>
            isn't a card.<br/>
            It's an <em>experience.</em>
          </h1>
          <p>
            Build a full welcome experience — branded hero, intro video, lead capture form — in under ten minutes.
            Share it by tap, scan, or link. Every interaction is yours; we send you a clean lead report every quarter.
          </p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button className="btn btn-primary btn-lg" onClick={onStart}>
              Build your experience <Icons.Arrow size={16} sw={2}/>
            </button>
            <button className="btn btn-ghost btn-lg">See a live one</button>
          </div>
          <div style={{ marginTop: 28, display: 'flex', gap: 24, fontSize: 12.5, color: 'var(--muted)' }}>
            <span>✓ No app to install</span>
            <span>✓ Works on iPhone & Android</span>
            <span>✓ Cancel anytime</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 30, left: '8%', transform: 'rotate(-6deg)' }}>
            <MiniCard data={{ name: 'Lerato K.', title: 'Founder, Altitude', bg: '#8FAF9D', fg: '#17181C' }} />
          </div>
          <div className="phone" style={{ transform: 'rotate(2deg)', zIndex: 2 }}>
            <div className="phone-screen">
              <CardView data={SAMPLE_CARD} />
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 60, right: '4%', transform: 'rotate(8deg)' }}>
            <MiniCard data={{ name: 'M. Webb', title: 'CFO, Brightlane', bg: '#2B221C', fg: '#F7EFE5' }} />
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
          <FeatureCard
            icon={<Icons.Video size={22}/>}
            title="Your face, your voice, your video"
            body="Upload a 30-second intro reel. It plays full-bleed when someone taps your card — no app, no buffering."
          />
          <FeatureCard
            icon={<Icons.Palette size={22}/>}
            title="Brand it down to the hex code"
            body="Pick a palette or paste your own hex. Pick a font pairing or any Google font. Set the type size. Done."
          />
          <FeatureCard
            icon={<Icons.Inbox size={22}/>}
            title="Every lead, captured"
            body="Built-in form drops contacts into your private inbox. We email you a clean PDF + CSV every quarter."
          />
        </div>
      </section>

      <section className="landing-section" style={{ background: 'var(--charcoal)', color: 'var(--cream)', maxWidth: '100%', margin: 0, padding: '80px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px' }}>
          <div className="eyebrow" style={{ color: 'var(--sage)' }}>Pricing</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, marginTop: 24, alignItems: 'center' }}>
            <h2 className="display" style={{ fontSize: 64, margin: 0, color: 'var(--cream)' }}>
              Three sizes. <em style={{ fontStyle: 'italic', color: 'var(--sage)' }}>One promise.</em>
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.5, color: 'rgba(246,247,243,0.65)', margin: 0 }}>
              Whether you're one person or a thousand, every subscriber gets their own isolated workspace, their own private leads, and a quarterly report mailed straight to them.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr 1fr', gap: 18, marginTop: 56 }}>
            <PlanCard
              name="Solo"
              price="$4"
              suffix="/ month"
              tag="For one person"
              features={[
                '1 welcome experience',
                'Custom colours, fonts & hex codes',
                'Welcome video up to 60 seconds',
                'Lead capture form',
                'Private lead inbox',
                'Quarterly lead report (PDF + CSV)',
                'Custom slug · leadcard.app/c/you',
              ]}
            />
            <PlanCard
              name="Small business"
              price="$12"
              suffix="/ month"
              highlight
              tag="Most popular · up to 5 people"
              features={[
                'Everything in Solo',
                'Up to 5 team experiences',
                'Shared brand kit (logo, palette, fonts)',
                'Shared lead inbox + per-person filtering',
                'Team analytics dashboard',
                'Custom domain (card.yourbrand.com)',
                'Centralised billing',
              ]}
            />
            <PlanCard
              name="Enterprise"
              price="Custom"
              tag="20+ people"
              features={[
                'Everything in Small business',
                'Unlimited experiences',
                'SSO (SAML / Okta / Google)',
                'Dedicated subscriber namespace',
                'Audit logs + data residency options',
                'API + webhook delivery to your CRM',
                'Onboarding + named contact',
              ]}
            />
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="eyebrow">How it works</div>
          <h2 className="display" style={{ fontSize: 56, margin: '12px 0 0' }}>Four minutes to live.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
          {[
            ['Pick a look',     'Choose colours and fonts. Paste your own hex codes. Set the type size.'],
            ['Add your details','Name, role, links, photo. Write your welcome copy.'],
            ['Upload your video','Drop in a 30-second intro reel. Or use our generated animation.'],
            ['Publish & share', 'Get your QR code, custom link, NFC card option.'],
          ].map(([t, b], i) => (
            <div key={i} className="card">
              <div className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>0{i+1}</div>
              <h4 style={{ margin: '12px 0 8px', fontSize: 17, fontWeight: 500 }}>{t}</h4>
              <p style={{ margin: 0, fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.5 }}>{b}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section" style={{ paddingTop: 0, paddingBottom: 100 }}>
        <div className="card" style={{ padding: 60, textAlign: 'center', background: 'var(--sage-tint)', border: 'none' }}>
          <h2 className="display" style={{ fontSize: 56, margin: 0 }}>Ready when you are.</h2>
          <p style={{ fontSize: 16, color: 'var(--muted)', margin: '16px 0 28px', maxWidth: 540, marginLeft: 'auto', marginRight: 'auto' }}>
            Your first card is free for 7 days. No credit card to start.
          </p>
          <button className="btn btn-primary btn-lg" onClick={onStart}>
            Build your card <Icons.Arrow size={16} sw={2}/>
          </button>
        </div>
        <div style={{ marginTop: 60, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5, color: 'var(--muted)' }}>
          <div>© 2026 LeadCard · Made for people who meet people.</div>
          <div style={{ display: 'flex', gap: 20 }}>
            <a>Privacy</a><a>Terms</a><a>Contact</a>
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, body }) => (
  <div className="card" style={{ padding: 28 }}>
    <div style={{
      width: 44, height: 44, borderRadius: 12,
      background: 'var(--sage-tint)',
      display: 'grid', placeItems: 'center',
      marginBottom: 18,
    }}>{icon}</div>
    <h4 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 500, letterSpacing: '-0.005em' }}>{title}</h4>
    <p style={{ margin: 0, fontSize: 14, color: 'var(--muted)', lineHeight: 1.55 }}>{body}</p>
  </div>
);

const PlanCard = ({ name, price, suffix, tag, features, highlight }) => (
  <div style={{
    background: highlight ? 'var(--cream)' : 'transparent',
    color: highlight ? 'var(--charcoal)' : 'var(--cream)',
    border: '1px solid ' + (highlight ? 'transparent' : 'rgba(246,247,243,0.12)'),
    borderRadius: 18,
    padding: 28,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  }}>
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
      <div style={{ fontSize: 14, fontWeight: 500 }}>{name}</div>
      <div className="mono" style={{ fontSize: 11, color: highlight ? 'var(--muted)' : 'rgba(246,247,243,0.5)' }}>{tag}</div>
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
      <span className="display" style={{ fontSize: 56 }}>{price}</span>
      {suffix && <span style={{ fontSize: 14, color: highlight ? 'var(--muted)' : 'rgba(246,247,243,0.5)' }}>{suffix}</span>}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8, borderTop: highlight ? '1px solid var(--line)' : '1px solid rgba(246,247,243,0.10)' }}>
      {features.map((f, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5 }}>
          <Icons.Check size={14} sw={2.2} stroke={highlight ? 'var(--sage)' : 'var(--sage)'} />
          {f}
        </div>
      ))}
    </div>
    <button className={"btn " + (highlight ? "btn-primary" : "btn-outline")} style={{
      marginTop: 'auto',
      ...(highlight ? {} : { boxShadow: 'inset 0 0 0 1px rgba(246,247,243,0.20)', color: 'var(--cream)' }),
    }}>
      Start with {name}
    </button>
  </div>
);

// Tiny floating card preview for hero
const MiniCard = ({ data }) => (
  <div style={{
    width: 190, height: 240,
    background: data.bg,
    color: data.fg,
    borderRadius: 18,
    padding: '20px 18px',
    boxShadow: '0 20px 40px -20px rgba(23,24,28,0.4)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  }}>
    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, opacity: 0.8 }}>LeadCard</div>
    <div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, lineHeight: 1 }}>{data.name}</div>
      <div style={{ fontSize: 11, opacity: 0.7, marginTop: 6 }}>{data.title}</div>
    </div>
  </div>
);

window.Landing = Landing;
