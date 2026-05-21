// The full Welcome Experience — multi-screen flow.
// Screens: welcome → video → cta-reveal → form → confirmed | share
// In editor mode, `flowScreen` is controlled externally; in live mode it's internal.

const FLOW_SCREENS = ['welcome', 'video', 'cta', 'form', 'confirmed', 'share'];

const CardView = ({ data, flowScreen, setFlowScreen }) => {
  const [internal, setInternal] = React.useState('welcome');
  const screen = flowScreen ?? internal;
  const go = (s) => (setFlowScreen ?? setInternal)(s);

  const t = data.theme || { bg: '#17181C', fg: '#F6F7F3', accent: '#8FAF9D' };
  const displayFF = fontStack(t.fontDisplay, 'serif');
  const bodyFF    = fontStack(t.fontBody, 'sans');
  const sizeBody    = t.fontSizeBody || t.fontSize || 16;
  const sizeDisplay = t.fontSizeDisplay || Math.round(sizeBody * 2.4);

  // Scale tokens
  const ts = {
    hero:   sizeDisplay,                        // welcome-screen name
    h1:     Math.round(sizeDisplay * 0.78),     // form/share/confirm headings
    body:   sizeBody,
    small:  Math.round(sizeBody * 0.82),
    tiny:   Math.round(sizeBody * 0.72),
  };

  // Shared phone-screen wrapper styling
  const screenStyle = {
    height: '100%',
    width: '100%',
    background: t.bg,
    color: t.fg,
    fontFamily: bodyFF,
    fontSize: ts.body,
    overflow: 'hidden',
    position: 'relative',
  };

  return (
    <div style={screenStyle}>
      {screen === 'welcome'   && <ScreenWelcome   data={data} t={t} ts={ts} displayFF={displayFF} go={go} />}
      {screen === 'video'     && <ScreenVideo     data={data} t={t} ts={ts} displayFF={displayFF} go={go} />}
      {screen === 'cta'       && <ScreenCTA       data={data} t={t} ts={ts} displayFF={displayFF} go={go} />}
      {screen === 'form'      && <ScreenForm      data={data} t={t} ts={ts} displayFF={displayFF} go={go} />}
      {screen === 'confirmed' && <ScreenConfirmed data={data} t={t} ts={ts} displayFF={displayFF} go={go} />}
      {screen === 'share'     && <ScreenShare     data={data} t={t} ts={ts} displayFF={displayFF} go={go} />}
    </div>
  );
};

/* ============== Screen 1 · Welcome ============== */
const ScreenWelcome = ({ data, t, ts, displayFF, go }) => {
  const initials = (data.name || 'A').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '56px 26px 28px', position: 'relative' }}>
      {/* Texture */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 80% 0%, ${t.accent}22, transparent 55%), radial-gradient(circle at 20% 100%, ${t.accent}14, transparent 50%)`, pointerEvents: 'none' }}/>
      {/* Top: logo */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: displayFF, fontSize: Math.round(ts.body * 1.3), opacity: 0.9 }}>{data.company || 'Studio'}</div>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: `${t.accent}28`, display: 'grid', placeItems: 'center', fontSize: ts.tiny }}>
          <span style={{ width: 6, height: 6, background: t.accent, borderRadius: 999 }}/>
        </div>
      </div>

      {/* Photo */}
      <div style={{ position: 'relative', marginTop: 32 }}>
        <div style={{
          width: 96, height: 96, borderRadius: 999,
          background: data.photo ? `url(${data.photo}) center/cover` : `${t.accent}28`,
          display: 'grid', placeItems: 'center',
          fontFamily: displayFF, fontSize: 38,
          border: `1px solid ${t.fg}1A`,
        }}>{!data.photo && initials}</div>
      </div>

      {/* Identity */}
      <div style={{ position: 'relative', marginTop: 22 }}>
        <div style={{ fontSize: ts.tiny, opacity: 0.65, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
          {data.welcomeKicker || 'Hello —'}
        </div>
        <div style={{ fontFamily: displayFF, fontSize: ts.hero, lineHeight: 0.98, letterSpacing: '-0.015em', textWrap: 'pretty' }}>
          {data.name || 'Your Name'}
        </div>
        <div style={{ fontSize: ts.body, opacity: 0.78, marginTop: 10 }}>{data.title || 'Role'} · {data.company || 'Company'}</div>
      </div>

      {/* Subheading */}
      <p style={{ position: 'relative', marginTop: 18, fontSize: Math.round(ts.body * 0.9), opacity: 0.7, lineHeight: 1.5, maxWidth: 280 }}>
        {data.welcomeSubheading}
      </p>

      {/* Contact preview row */}
      <div style={{ position: 'relative', marginTop: 'auto', paddingTop: 18 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, opacity: 0.7, fontSize: ts.small }}>
          {data.email && <div style={{ flex: 1, padding: '8px 10px', background: `${t.fg}0D`, borderRadius: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.email}</div>}
          {data.phone && <div style={{ padding: '8px 10px', background: `${t.fg}0D`, borderRadius: 8 }}>{data.phone}</div>}
        </div>

        <button onClick={() => go('video')} style={{
          width: '100%', padding: '14px 18px', borderRadius: 12,
          background: t.accent, color: t.bg,
          fontSize: ts.body, fontWeight: 500, fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          marginBottom: 8,
        }}>
          <Icons.Video size={15} sw={2}/> {data.ctaWatch || 'Watch our intro'}
        </button>
        <button onClick={() => go('share')} style={{
          width: '100%', padding: '14px 18px', borderRadius: 12,
          background: `${t.fg}10`, color: t.fg, border: `1px solid ${t.fg}1A`,
          fontSize: ts.body, fontWeight: 500, fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <Icons.Share size={15} sw={2}/> {data.ctaShare || 'Share my card'}
        </button>
      </div>
    </div>
  );
};

/* ============== Screen 2 · Video (full-bleed) ============== */
const ScreenVideo = ({ data, t, ts, displayFF, go }) => {
  const [progress, setProgress] = React.useState(0);
  React.useEffect(() => {
    if (!data.videoAutoplay) return;
    const len = (data.videoLength || 57) * 1000;
    const t0 = Date.now();
    const id = setInterval(() => {
      const p = Math.min(1, (Date.now() - t0) / len);
      setProgress(p);
      if (p >= 1) { clearInterval(id); go('cta'); }
    }, 100);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000', overflow: 'hidden' }}>
      {/* Simulated video */}
      {data.videoUrl ? (
        <video src={data.videoUrl} autoPlay muted style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
      ) : (
        <FakeVideoCanvas progress={progress} accent={t.accent} name={data.name} title={data.title}/>
      )}

      {/* Frosted controls */}
      <button onClick={() => go('welcome')} style={{
        position: 'absolute', top: 18, left: 18,
        width: 38, height: 38, borderRadius: 999,
        background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
        color: 'white', display: 'grid', placeItems: 'center',
        border: '1px solid rgba(255,255,255,0.16)',
      }}>
        <Icons.ArrowL size={16} sw={2.2}/>
      </button>
      <button onClick={() => go('cta')} style={{
        position: 'absolute', top: 18, right: 18,
        padding: '8px 14px', borderRadius: 999,
        background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
        color: 'white', fontSize: ts.small,
        border: '1px solid rgba(255,255,255,0.16)',
      }}>
        {data.skipLabel || 'Skip →'}
      </button>

      {/* Progress bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.18)' }}>
        <div style={{ width: `${progress * 100}%`, height: '100%', background: t.accent }}/>
      </div>
    </div>
  );
};

// Generative "video" placeholder — animated waves
const FakeVideoCanvas = ({ progress, accent, name, title }) => {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 60%, #1a1f2e 0%, #050708 100%)' }}>
      <svg viewBox="0 0 320 600" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {[0, 1, 2, 3, 4].map(i => (
          <circle key={i} cx="160" cy="300" r={60 + i * 60 + Math.sin(progress * 6 + i) * 12}
            fill="none" stroke={accent} strokeOpacity={0.15 - i * 0.02} strokeWidth="1"/>
        ))}
      </svg>
      <div style={{
        position: 'absolute', bottom: 80, left: 0, right: 0,
        textAlign: 'center', color: 'white',
        opacity: progress > 0.1 && progress < 0.9 ? 1 : 0.4, transition: '500ms',
      }}>
        <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.6 }}>Intro reel</div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, marginTop: 6 }}>{name}</div>
        <div style={{ fontSize: 13, opacity: 0.7, marginTop: 2 }}>{title}</div>
      </div>
    </div>
  );
};

/* ============== Screen 3 · CTA reveal (after video) ============== */
const ScreenCTA = ({ data, t, ts, displayFF, go }) => {
  return (
    <div style={{ height: '100%', position: 'relative', overflow: 'hidden', background: '#000', color: 'white' }}>
      <FakeVideoCanvas progress={1} accent={t.accent} name={data.name} title={data.title}/>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.8) 100%)' }}/>

      <button onClick={() => go('welcome')} style={{
        position: 'absolute', top: 18, left: 18,
        width: 38, height: 38, borderRadius: 999,
        background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
        color: 'white', display: 'grid', placeItems: 'center',
        border: '1px solid rgba(255,255,255,0.16)',
      }}>
        <Icons.ArrowL size={16} sw={2.2}/>
      </button>

      {/* Risen CTAs */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '28px 20px 32px',
        display: 'flex', flexDirection: 'column', gap: 10,
        animation: 'lc-rise 600ms ease-out',
      }}>
        <div style={{ fontFamily: displayFF, fontSize: 22, lineHeight: 1.1, marginBottom: 8 }}>
          Ready to take the next step?
        </div>
        <button style={{
          padding: '14px 18px', borderRadius: 12,
          background: t.accent, color: t.bg,
          fontSize: ts.body, fontWeight: 500,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <Icons.Globe size={15} sw={2}/> {data.ctaPrimaryLabel}
        </button>
        <button onClick={() => go('form')} style={{
          padding: '14px 18px', borderRadius: 12,
          background: 'rgba(255,255,255,0.10)', color: 'white',
          border: '1px solid rgba(255,255,255,0.18)',
          fontSize: ts.body, fontWeight: 500,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <Icons.Phone size={14} sw={2}/> {data.ctaSecondaryLabel}
        </button>
      </div>

      <style>{`@keyframes lc-rise { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </div>
  );
};

/* ============== Screen 4 · Lead capture form ============== */
const ScreenForm = ({ data, t, ts, displayFF, go }) => {
  const [vals, setVals] = React.useState({});
  const [consent, setConsent] = React.useState(false);
  const fields = (data.formFields || []).filter(f => f.enabled);
  const canSubmit = consent && fields.filter(f => f.required).every(f => vals[f.id]?.trim());

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '24px 22px 32px' }}>
      <button onClick={() => go('cta')} style={{ display: 'flex', alignItems: 'center', gap: 6, color: t.fg, opacity: 0.7, fontSize: ts.small, marginBottom: 18 }}>
        <Icons.ArrowL size={14} sw={2}/> Back
      </button>
      <div style={{ fontFamily: displayFF, fontSize: Math.round(ts.h1 * 0.95), lineHeight: 1.05, letterSpacing: '-0.01em' }}>
        {data.formHeading}
      </div>
      <p style={{ fontSize: ts.small, opacity: 0.7, lineHeight: 1.5, marginTop: 10, marginBottom: 22 }}>
        {data.formSubheading}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {fields.map(f => (
          <div key={f.id}>
            <label style={{ fontSize: ts.tiny, opacity: 0.7, display: 'block', marginBottom: 4 }}>
              {f.label}{f.required && <span style={{ color: t.accent, marginLeft: 4 }}>*</span>}
            </label>
            <input
              type={f.type}
              value={vals[f.id] || ''}
              onChange={e => setVals(v => ({ ...v, [f.id]: e.target.value }))}
              style={{
                width: '100%', padding: '10px 12px',
                background: `${t.fg}10`, color: t.fg,
                border: `1px solid ${t.fg}1A`, borderRadius: 8,
                fontSize: ts.body, fontFamily: 'inherit',
                outline: 'none',
              }}
            />
          </div>
        ))}

        <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 6, cursor: 'pointer' }}>
          <span onClick={() => setConsent(c => !c)} style={{
            width: 18, height: 18, borderRadius: 4,
            background: consent ? t.accent : 'transparent',
            border: `1px solid ${consent ? t.accent : t.fg + '40'}`,
            display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: 1,
          }}>{consent && <Icons.Check size={11} sw={2.6} stroke={t.bg}/>}</span>
          <span style={{ fontSize: ts.small, opacity: 0.75, lineHeight: 1.4 }}>{data.consentText}</span>
        </label>

        <button
          disabled={!canSubmit}
          onClick={() => go('confirmed')}
          style={{
            marginTop: 12, padding: '14px 18px', borderRadius: 12,
            background: canSubmit ? t.accent : `${t.fg}1A`,
            color: canSubmit ? t.bg : `${t.fg}60`,
            fontSize: ts.body, fontWeight: 500,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            transition: '160ms',
          }}
        >
          {data.submitLabel}
        </button>
      </div>
    </div>
  );
};

/* ============== Screen 5 · Confirmed ============== */
const ScreenConfirmed = ({ data, t, ts, displayFF, go }) => (
  <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 30px', textAlign: 'center' }}>
    <div style={{
      width: 64, height: 64, borderRadius: 999,
      background: t.accent, color: t.bg,
      display: 'grid', placeItems: 'center', marginBottom: 28,
      animation: 'lc-pop 500ms ease-out',
    }}>
      <Icons.Check size={28} sw={2.6}/>
    </div>
    <div style={{ fontFamily: displayFF, fontSize: ts.h1, lineHeight: 1, letterSpacing: '-0.01em' }}>
      {data.confirmHeading}
    </div>
    <p style={{ fontSize: ts.body, opacity: 0.7, lineHeight: 1.5, marginTop: 14, marginBottom: 32, maxWidth: 240 }}>
      {data.confirmBody}
    </p>
    <button onClick={() => go('welcome')} style={{
      padding: '12px 22px', borderRadius: 999,
      background: 'transparent', color: t.fg,
      border: `1px solid ${t.fg}26`, fontSize: ts.small,
    }}>{data.confirmCTA}</button>
    <style>{`@keyframes lc-pop { from { transform: scale(0.4); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
  </div>
);

/* ============== Screen 6 · Share ============== */
const ScreenShare = ({ data, t, ts, displayFF, go }) => (
  <div style={{ height: '100%', overflowY: 'auto', padding: '24px 22px 32px' }}>
    <button onClick={() => go('welcome')} style={{ display: 'flex', alignItems: 'center', gap: 6, color: t.fg, opacity: 0.7, fontSize: ts.small, marginBottom: 18 }}>
      <Icons.ArrowL size={14} sw={2}/> Back
    </button>
    <div style={{ fontFamily: displayFF, fontSize: Math.round(ts.h1 * 0.95), lineHeight: 1.05, letterSpacing: '-0.01em' }}>
      Share my card
    </div>
    <p style={{ fontSize: ts.small, opacity: 0.7, marginTop: 8, marginBottom: 22 }}>
      Scan, tap, or save my contact.
    </p>

    <div style={{ background: `${t.fg}0D`, borderRadius: 16, padding: 22, marginBottom: 14 }}>
      <div style={{ background: t.fg, borderRadius: 12, padding: 16, display: 'grid', placeItems: 'center' }}>
        <MiniQR fg={t.bg}/>
      </div>
      <div style={{ textAlign: 'center', fontSize: ts.tiny, opacity: 0.6, marginTop: 12, fontFamily: 'monospace' }}>
        leadcard.app/c/{data.slug || 'avery'}
      </div>
    </div>

    <button style={{
      width: '100%', padding: '14px 18px', borderRadius: 12,
      background: t.accent, color: t.bg,
      fontSize: ts.body, fontWeight: 500, marginBottom: 8,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    }}>
      <Icons.Download size={15} sw={2}/> Save contact (.vcf)
    </button>
    <button style={{
      width: '100%', padding: '14px 18px', borderRadius: 12,
      background: `${t.fg}10`, color: t.fg, border: `1px solid ${t.fg}1A`,
      fontSize: ts.body, fontWeight: 500,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    }}>
      <Icons.Share size={15} sw={2}/> Share link
    </button>
  </div>
);

const MiniQR = ({ fg }) => {
  const cells = Array.from({ length: 21 * 21 }, (_, i) => {
    const x = i % 21, y = Math.floor(i / 21);
    const corner = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
    if (corner) {
      const cx = x < 7 ? 3 : 17; const cy = y < 7 ? 3 : 17;
      const dx = Math.abs(x - cx), dy = Math.abs(y - cy);
      const d = Math.max(dx, dy);
      return d === 0 || d === 2 || d === 3;
    }
    return (Math.sin(x * 13.7 + y * 7.3) * 9999) % 1 > 0.5;
  });
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(21, 1fr)', gap: 0, width: 160, height: 160 }}>
      {cells.map((on, i) => <div key={i} style={{ background: on ? fg : 'transparent', aspectRatio: '1/1' }}/>)}
    </div>
  );
};

window.CardView = CardView;
window.FLOW_SCREENS = FLOW_SCREENS;
