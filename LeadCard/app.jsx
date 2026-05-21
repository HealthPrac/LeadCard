// Main app shell — handles routing between landing, onboarding, dashboard, editor, etc.
const { useState, useEffect } = React;

const AppShell = () => {
  // route: 'landing' | 'onboarding' | 'app' (dashboard/editor/etc) | 'public' (the actual card)
  const [route, setRoute] = useState('landing');
  const [appView, setAppView] = useState('dashboard');
  const [card, setCard] = useState(SAMPLE_CARD);

  // Tweaks
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "view": "landing",
    "previewSlug": "avery",
    "palettePreset": 0,
    "publicScreen": "welcome",
    "plan": "small",
    "showSecurityBanner": true
  }/*EDITMODE-END*/;
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Sync tweak view → route
  useEffect(() => {
    const map = {
      'landing':    () => setRoute('landing'),
      'onboarding': () => setRoute('onboarding'),
      'dashboard':  () => { setRoute('app'); setAppView('dashboard'); },
      'editor':     () => { setRoute('app'); setAppView('editor'); },
      'team':       () => { setRoute('app'); setAppView('team'); },
      'analytics':  () => { setRoute('app'); setAppView('analytics'); },
      'leads':      () => { setRoute('app'); setAppView('leads'); },
      'share':      () => { setRoute('app'); setAppView('share'); },
      'nfc':        () => { setRoute('app'); setAppView('nfc'); },
      'settings':   () => { setRoute('app'); setAppView('settings'); },
      'public-card':() => setRoute('public'),
    };
    (map[t.view] || map.landing)();
  }, [t.view]);

  // Sync tweak plan → card
  useEffect(() => {
    if (t.plan) setCard(c => c.plan === t.plan ? c : ({ ...c, plan: t.plan }));
  }, [t.plan]);

  // Apply tweak palette
  useEffect(() => {
    if (typeof t.palettePreset === 'number' && PALETTES[t.palettePreset]) {
      const p = PALETTES[t.palettePreset];
      setCard(c => ({ ...c, theme: { bg: p.bg, fg: p.fg, accent: p.accent } }));
    }
  }, [t.palettePreset]);

  const goto = (view) => setTweak('view', view);

  if (route === 'landing') {
    return <>
      <Landing onStart={() => goto('onboarding')} onSignIn={() => goto('dashboard')} />
      <Tweaks t={t} setTweak={setTweak} />
    </>;
  }

  if (route === 'onboarding') {
    return <>
      <Onboarding
        onBack={() => goto('landing')}
        onComplete={(data) => {
          setCard(c => {
            const themePatch = (data.palette >= 0 && PALETTES[data.palette]) ? PALETTES[data.palette] : {};
            return { ...c, ...data, theme: { ...c.theme, ...themePatch } };
          });
          goto('editor');
        }}
      />
      <Tweaks t={t} setTweak={setTweak} />
    </>;
  }

  if (route === 'public') {
    return <>
      <PublicCardView card={card} screen={t.publicScreen} setScreen={(s) => setTweak('publicScreen', s)} />
      <Tweaks t={t} setTweak={setTweak} />
    </>;
  }

  // App shell
  return (
    <div className="app">
      <Sidebar appView={appView} goto={goto} card={card} />
      <div className="main">
        <Topbar appView={appView} card={card} goto={goto} />
        {appView === 'dashboard' && <Dashboard card={card} goto={goto} />}
        {appView === 'editor'    && <Editor    card={card} setCard={setCard} />}
        {appView === 'team'      && <Team      card={card} setCard={setCard} />}
        {appView === 'analytics' && <Analytics />}
        {appView === 'leads'     && <Leads />}
        {appView === 'share'     && <Share     card={card} />}
        {appView === 'nfc'       && <NFC       card={card} setCard={setCard} />}
        {appView === 'settings'  && <Settings  card={card} setCard={setCard} />}
      </div>
      <Tweaks t={t} setTweak={setTweak} />
    </div>
  );
};

const Sidebar = ({ appView, goto, card }) => {
  const initials = (card.name || 'A').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const isTeamPlan = card.plan === 'small' || card.plan === 'enterprise';
  const planLabel = card.plan === 'enterprise' ? 'Enterprise' : card.plan === 'small' ? 'Small business · $12/mo' : 'Solo · $4/mo';
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">L</div>
        <div className="brand-name">LeadCard</div>
      </div>

      <button className={"nav-item " + (appView === 'dashboard' ? 'active' : '')} onClick={() => goto('dashboard')}>
        <Icons.Home size={15} className="ico"/> Overview
      </button>
      <button className={"nav-item " + (appView === 'editor' ? 'active' : '')} onClick={() => goto('editor')}>
        <Icons.Card size={15} className="ico"/> My experience
      </button>
      {isTeamPlan && (
        <button className={"nav-item " + (appView === 'team' ? 'active' : '')} onClick={() => goto('team')}>
          <Icons.Linkedin size={15} className="ico"/> Team <span className="badge">{(card.team || []).length}</span>
        </button>
      )}
      <button className={"nav-item " + (appView === 'analytics' ? 'active' : '')} onClick={() => goto('analytics')}>
        <Icons.Chart size={15} className="ico"/> Analytics
      </button>
      <button className={"nav-item " + (appView === 'leads' ? 'active' : '')} onClick={() => goto('leads')}>
        <Icons.Inbox size={15} className="ico"/> Leads <span className="badge">12</span>
      </button>
      <button className={"nav-item " + (appView === 'share' ? 'active' : '')} onClick={() => goto('share')}>
        <Icons.Qr size={15} className="ico"/> Share
      </button>
      <button className={"nav-item " + (appView === 'nfc' ? 'active' : '')} onClick={() => goto('nfc')}>
        <Icons.Tap size={15} className="ico"/> NFC {card.nfc?.enabled && <span className="badge" style={{ background: 'var(--sage)' }}>on</span>}
      </button>

      <div className="nav-section-title">Account</div>
      <button className={"nav-item " + (appView === 'settings' ? 'active' : '')} onClick={() => goto('settings')}>
        <Icons.Settings size={15} className="ico"/> Settings
      </button>
      <button className="nav-item" onClick={() => goto('public-card')}>
        <Icons.Eye size={15} className="ico"/> View live experience
      </button>

      <div className="sidebar-footer">
        <div className="avatar">{initials}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 12.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{card.name}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{planLabel}</div>
        </div>
      </div>
    </aside>
  );
};

const Topbar = ({ appView, card, goto }) => {
  const titles = {
    dashboard: 'Overview',
    editor: 'My experience',
    team: 'Team',
    analytics: 'Analytics',
    leads: 'Leads',
    share: 'Share & QR',
    nfc: 'NFC',
    settings: 'Settings',
  };
  return (
    <header className="topbar">
      <div>
        <div className="crumbs">
          <span>LeadCard</span> · <strong>{titles[appView]}</strong>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className="chip dot" style={{ background: 'transparent', border: '1px solid var(--line)' }}>
          <span className="mono" style={{ fontSize: 11 }}>leadcard.app/c/{card.slug || 'avery'}</span>
        </span>
        <button className="btn btn-outline btn-sm" onClick={() => goto('public-card')}>
          <Icons.Eye size={13}/> View live
        </button>
        <button className="btn btn-primary btn-sm" onClick={() => goto('share')}>
          <Icons.Share size={13}/> Share
        </button>
      </div>
    </header>
  );
};

// The actual public Welcome Experience (what visitors see)
const PublicCardView = ({ card, screen, setScreen }) => {
  const SCREENS = [
    ['welcome', 'Welcome'], ['video', 'Video'], ['cta', 'CTAs'],
    ['form', 'Form'], ['confirmed', 'Confirmed'], ['share', 'Share'],
  ];
  return (
    <div data-screen-label="02 Welcome Experience" style={{ minHeight: '100vh', background: 'var(--cream-2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--muted)' }}>
        <Icons.Lock size={12}/>
        <span className="mono">https://leadcard.app/c/{card.slug || 'avery'}</span>
      </div>
      <div style={{ display: 'flex', gap: 3, padding: 3, background: 'white', borderRadius: 999, border: '1px solid var(--line)' }}>
        {SCREENS.map(([k, l]) => (
          <button key={k} onClick={() => setScreen(k)} style={{
            padding: '6px 12px', borderRadius: 999,
            background: screen === k ? 'var(--charcoal)' : 'transparent',
            color: screen === k ? 'var(--cream)' : 'var(--charcoal)',
            fontSize: 11.5,
          }}>{l}</button>
        ))}
      </div>
      <div className="phone">
        <div className="phone-screen">
          <CardView data={card} flowScreen={screen} setFlowScreen={setScreen}/>
        </div>
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--muted-2)' }}>The card flows by itself — tap inside the phone to walk through it</div>
    </div>
  );
};

// Tweaks panel
const Tweaks = ({ t, setTweak }) => (
  <TweaksPanel title="Tweaks">
    <TweakSection label="Navigate">
      <TweakSelect
        label="Screen"
        value={t.view}
        onChange={v => setTweak('view', v)}
        options={[
          { value: 'landing',     label: 'Marketing landing' },
          { value: 'onboarding',  label: 'Onboarding wizard' },
          { value: 'dashboard',   label: 'Dashboard' },
          { value: 'editor',      label: 'Card editor' },
          { value: 'team',        label: 'Team (small biz / enterprise)' },
          { value: 'analytics',   label: 'Analytics' },
          { value: 'leads',       label: 'Leads inbox' },
          { value: 'share',       label: 'Share & QR' },
          { value: 'nfc',         label: 'NFC' },
          { value: 'settings',    label: 'Settings & billing' },
          { value: 'public-card', label: 'Public card (what visitors see)' },
        ]}
      />
    </TweakSection>

    <TweakSection label="Card theme">
      <TweakSelect
        label="Palette preset"
        value={t.palettePreset}
        onChange={v => setTweak('palettePreset', parseInt(v))}
        options={PALETTES.map((p, i) => ({ value: i, label: p.name }))}
      />
    </TweakSection>

    <TweakSection label="Plan">
      <TweakRadio
        label="Active plan"
        value={t.plan || 'small'}
        onChange={v => setTweak('plan', v)}
        options={['solo', 'small', 'enterprise']}
      />
    </TweakSection>
  </TweaksPanel>
);

ReactDOM.createRoot(document.getElementById('root')).render(<AppShell />);
