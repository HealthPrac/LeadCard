// Onboarding wizard — 4 steps. New subscriber → their own card instance.
const Onboarding = ({ onComplete, onBack }) => {
  const [step, setStep] = React.useState(0);
  const [data, setData] = React.useState({
    plan: 'small',
    name: '',
    title: '',
    company: '',
    email: '',
    phone: '',
    website: '',
    slug: '',
    palette: 0,
  });

  const update = (k, v) => setData(d => ({ ...d, [k]: v, ...(k === 'name' && !d.slug ? { slug: v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') } : {}) }));

  const steps = ['Plan', 'Account', 'Identity', 'Style', 'Publish'];
  const next = () => setStep(s => Math.min(s + 1, steps.length - 1));
  const prev = () => step === 0 ? onBack?.() : setStep(s => s - 1);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }} data-screen-label="01 Onboarding">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 40px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="brand-mark" style={{
            width: 28, height: 28, borderRadius: 8, background: 'var(--charcoal)',
            display: 'grid', placeItems: 'center', color: 'var(--sage)',
            fontFamily: 'var(--font-serif)', fontSize: 20, lineHeight: 1, paddingBottom: 2,
          }}>L</div>
          <div style={{ fontSize: 15, fontWeight: 500 }}>LeadCard</div>
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
          Already a subscriber? <a style={{ color: 'var(--charcoal)', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => onComplete?.(data)}>Sign in</a>
        </div>
      </div>

      <div style={{ maxWidth: 920, margin: '0 auto', padding: '40px 32px' }}>
        <div className="steps" style={{ marginBottom: 40 }}>
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div className={"step " + (i === step ? 'active' : i < step ? 'done' : '')}>
                <span className="num">{i < step ? <Icons.Check size={12} sw={2.4}/> : i + 1}</span>
                <span>{s}</span>
              </div>
              {i < steps.length - 1 && <div className="step-bar-line" />}
            </React.Fragment>
          ))}
        </div>

        <div className="card" style={{ padding: 40, minHeight: 480 }}>
          {step === 0 && <StepPlan data={data} update={update} />}
          {step === 1 && <Step0 data={data} update={update} />}
          {step === 2 && <Step1 data={data} update={update} />}
          {step === 3 && <Step2 data={data} update={update} />}
          {step === 4 && <Step3 data={data} update={update} />}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
          <button className="btn btn-ghost" onClick={prev}>
            <Icons.ArrowL size={14} sw={2}/> Back
          </button>
          {step < steps.length - 1 ? (
            <button className="btn btn-primary" onClick={next}>
              Continue <Icons.Arrow size={14} sw={2}/>
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => onComplete?.(data)}>
              Publish my experience <Icons.Sparkle size={14} sw={2}/>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const PLAN_OPTIONS = [
  {
    id: 'solo',
    name: 'Solo',
    price: '$4',
    suffix: '/ month',
    tag: 'For one person',
    bullets: ['1 welcome experience', 'Custom branding & video', 'Private lead inbox', 'Quarterly lead report'],
  },
  {
    id: 'small',
    name: 'Small business',
    price: '$12',
    suffix: '/ month',
    tag: 'Up to 5 people · Most popular',
    bullets: ['Up to 5 team experiences', 'Shared brand kit', 'Team analytics', 'Custom domain'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    tag: '20+ people',
    bullets: ['Unlimited experiences', 'SSO + audit logs', 'API + webhook', 'Named contact'],
  },
];

const StepPlan = ({ data, update }) => (
  <div>
    <div className="eyebrow">Step 1 of 5</div>
    <h2 className="display" style={{ fontSize: 40, margin: '8px 0 8px' }}>What size are you?</h2>
    <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 0, marginBottom: 28, maxWidth: 520 }}>
      Pick the plan that fits today — you can change this any time. Every plan starts with a 7-day free trial.
    </p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
      {PLAN_OPTIONS.map(p => {
        const active = data.plan === p.id;
        const isEnterprise = p.id === 'enterprise';
        return (
          <button key={p.id} onClick={() => update('plan', p.id)} style={{
            padding: 22, borderRadius: 14, textAlign: 'left',
            background: active ? 'var(--charcoal)' : 'white',
            color: active ? 'var(--cream)' : 'var(--charcoal)',
            border: '1px solid ' + (active ? 'var(--charcoal)' : 'var(--line)'),
            position: 'relative',
            transition: '120ms',
          }}>
            {active && (
              <div style={{ position: 'absolute', top: 14, right: 14, width: 22, height: 22, borderRadius: 999, background: 'var(--sage)', color: 'var(--charcoal)', display: 'grid', placeItems: 'center' }}>
                <Icons.Check size={12} sw={2.6}/>
              </div>
            )}
            <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</div>
            <div style={{ fontSize: 11, opacity: 0.65, marginTop: 4 }}>{p.tag}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '20px 0 16px' }}>
              <span className="display" style={{ fontSize: 36 }}>{p.price}</span>
              {p.suffix && <span style={{ fontSize: 12, opacity: 0.65 }}>{p.suffix}</span>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 12, opacity: active ? 0.85 : 0.75 }}>
              {p.bullets.map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
                  <Icons.Check size={12} sw={2.4} stroke={active ? 'var(--sage)' : 'var(--charcoal)'}/>
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </button>
        );
      })}
    </div>
    <div style={{ marginTop: 24, fontSize: 12, color: 'var(--muted)', display: 'flex', gap: 8, alignItems: 'center' }}>
      <Icons.Lock size={12}/> Your data is isolated from day one. Pick a plan, change it later — your card and leads come with you.
    </div>
  </div>
);

const Step0 = ({ data, update }) => (
  <div>
    <div className="eyebrow">Step 2 of 5</div>
    <h2 className="display" style={{ fontSize: 40, margin: '8px 0 8px' }}>Create your account.</h2>
    <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 0, marginBottom: 28, maxWidth: 480 }}>
      We'll spin up a dedicated card workspace just for you. Your assets and your leads live in their own space — nothing is ever shared.
    </p>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 560 }}>
      <Field label="Your name">
        <input className="input" value={data.name} onChange={e => update('name', e.target.value)} placeholder="Avery Quinn" autoFocus />
      </Field>
      <Field label="Work email">
        <input className="input" value={data.email} onChange={e => update('email', e.target.value)} placeholder="you@company.com" />
      </Field>
      <Field label="Password" hint="At least 8 characters">
        <input className="input" type="password" placeholder="••••••••" />
      </Field>
      <Field label="Company" hint="Optional — you can change this later">
        <input className="input" value={data.company} onChange={e => update('company', e.target.value)} placeholder="Northwind Studio" />
      </Field>
    </div>
    <div style={{ marginTop: 24, fontSize: 12, color: 'var(--muted)', display: 'flex', gap: 8, alignItems: 'center' }}>
      <Icons.Lock size={12}/> Your data is isolated. We send you a quarterly report. That's it.
    </div>
  </div>
);

const Step1 = ({ data, update }) => (
  <div>
    <div className="eyebrow">Step 3 of 5</div>
    <h2 className="display" style={{ fontSize: 40, margin: '8px 0 8px' }}>Who's on the card?</h2>
    <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 0, marginBottom: 28, maxWidth: 480 }}>
      The basics that go on every card. You can add links, a photo, a video, and a bio in the editor next.
    </p>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 560 }}>
      <Field label="Display name">
        <input className="input" value={data.name} onChange={e => update('name', e.target.value)} placeholder="Avery Quinn" />
      </Field>
      <Field label="Role / title">
        <input className="input" value={data.title} onChange={e => update('title', e.target.value)} placeholder="Founder & CEO" />
      </Field>
      <Field label="Phone" hint="Tap-to-call on the card">
        <input className="input" value={data.phone} onChange={e => update('phone', e.target.value)} placeholder="+27 82 555 0144" />
      </Field>
      <Field label="Website">
        <input className="input" value={data.website} onChange={e => update('website', e.target.value)} placeholder="https://northwind.co" />
      </Field>
    </div>
  </div>
);

const Step2 = ({ data, update }) => (
  <div>
    <div className="eyebrow">Step 4 of 5</div>
    <h2 className="display" style={{ fontSize: 40, margin: '8px 0 8px' }}>Pick your colours.</h2>
    <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 0, marginBottom: 28, maxWidth: 540 }}>
      Start with a preset or skip — you'll have full hex-code control (and fonts, sizes, video) in the editor next.
    </p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, maxWidth: 760 }}>
      {PALETTES.map((p, i) => (
        <button key={i} onClick={() => update('palette', i)} style={{
          padding: 0, borderRadius: 14, overflow: 'hidden',
          border: '2px solid ' + (data.palette === i ? 'var(--charcoal)' : 'transparent'),
          background: 'transparent', textAlign: 'left',
        }}>
          <div style={{ height: 96, background: p.bg, color: p.fg, padding: 14, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16 }}>Aa</div>
            <div style={{ display: 'flex', gap: 4 }}>
              <span style={{ width: 14, height: 14, borderRadius: 999, background: p.fg }}/>
              <span style={{ width: 14, height: 14, borderRadius: 999, background: p.accent }}/>
            </div>
          </div>
          <div style={{ padding: '10px 12px', background: 'var(--cream)', fontSize: 12 }}>{p.name}</div>
        </button>
      ))}

      {/* "None of these match" tile */}
      <button onClick={() => update('palette', -1)} style={{
        padding: 0, borderRadius: 14, overflow: 'hidden',
        border: '2px solid ' + (data.palette === -1 ? 'var(--charcoal)' : 'transparent'),
        background: 'transparent', textAlign: 'left',
      }}>
        <div style={{
          height: 96, padding: 14,
          background: `repeating-linear-gradient(45deg, var(--cream) 0 8px, var(--cream-2) 8px 16px)`,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          color: 'var(--charcoal)',
        }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16 }}>Aa</div>
          <div style={{ display: 'flex', gap: 4 }}>
            <span style={{ width: 14, height: 14, borderRadius: 999, background: 'white', border: '1px dashed var(--muted-2)' }}/>
            <span style={{ width: 14, height: 14, borderRadius: 999, background: 'white', border: '1px dashed var(--muted-2)' }}/>
          </div>
        </div>
        <div style={{ padding: '10px 12px', background: 'var(--cream)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icons.Plus size={12} sw={2}/> I'll set my own
        </div>
      </button>
    </div>

    {data.palette === -1 && (
      <div style={{ marginTop: 20, padding: 16, background: 'var(--sage-tint)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, maxWidth: 760 }}>
        <Icons.Sparkle size={18}/>
        <div style={{ fontSize: 13, color: 'var(--charcoal)' }}>
          Cool — we'll skip this step. In the editor you can paste exact hex codes, upload your logo, and pick from any Google font.
        </div>
      </div>
    )}
  </div>
);

const Step3 = ({ data, update }) => {
  const url = `leadcard.app/c/${data.slug || 'your-slug'}`;
  const plan = PLAN_OPTIONS.find(p => p.id === data.plan) || PLAN_OPTIONS[1];
  return (
    <div>
      <div className="eyebrow">Step 5 of 5</div>
      <h2 className="display" style={{ fontSize: 40, margin: '8px 0 8px' }}>Claim your URL.</h2>
      <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 0, marginBottom: 28, maxWidth: 480 }}>
        This is where your card lives. Print it, paste it in your email signature, generate a QR.
      </p>
      <div style={{ maxWidth: 520 }}>
        <Field label="Your card URL" hint="Letters, numbers, and dashes. You can change this later.">
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid var(--line)', borderRadius: 10, background: 'var(--cream)' }}>
            <span style={{ padding: '10px 0 10px 12px', fontSize: 13.5, color: 'var(--muted)' }}>leadcard.app/c/</span>
            <input
              className="input"
              style={{ border: 'none', background: 'transparent' }}
              value={data.slug}
              onChange={e => update('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="your-slug"
            />
            <span className="chip" style={{ marginRight: 10, background: 'var(--sage)', color: 'var(--charcoal)' }}>
              <Icons.Check size={11} sw={2.4}/> Available
            </span>
          </div>
        </Field>
        <div style={{ marginTop: 24, padding: 20, background: 'var(--cream)', borderRadius: 12, border: '1px solid var(--line)' }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Your dedicated card lives at</div>
          <div className="mono" style={{ fontSize: 16, fontWeight: 500 }}>{url}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icons.Lock size={11}/> Isolated workspace. Nothing leaks to other subscribers.
          </div>
        </div>
        <div style={{ marginTop: 20, padding: 20, background: 'var(--sage-tint)', borderRadius: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icons.Sparkle size={20}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>
                {plan.name} · {plan.price}{plan.suffix || ''}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                7-day free trial · no card required to start · cancel anytime — your data is yours.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

window.Onboarding = Onboarding;
