// Welcome Experience editor — split-pane with multi-screen phone preview
const Editor = ({ card, setCard }) => {
  const [tab, setTab] = React.useState('welcome');
  const [previewScreen, setPreviewScreen] = React.useState('welcome');

  const updateField = (k, v) => setCard(c => ({ ...c, [k]: v }));
  const setTheme = (patch) => setCard(c => ({ ...c, theme: { ...c.theme, ...patch } }));
  const applyPalette = (p) => setTheme({ bg: p.bg, fg: p.fg, accent: p.accent });
  const applyFontPair = (fp) => setTheme({ fontDisplay: fp.display, fontBody: fp.body });

  const updateLink = (i, k, v) => setCard(c => {
    const links = [...c.links];
    links[i] = { ...links[i], [k]: v };
    return { ...c, links };
  });
  const addLink = () => setCard(c => ({ ...c, links: [...c.links, { kind: 'other', label: 'New link', url: 'example.com' }] }));
  const removeLink = (i) => setCard(c => ({ ...c, links: c.links.filter((_, idx) => idx !== i) }));

  const updateFormField = (i, k, v) => setCard(c => {
    const formFields = [...c.formFields];
    formFields[i] = { ...formFields[i], [k]: v };
    return { ...c, formFields };
  });

  // Auto-jump preview to relevant screen when switching tabs
  const switchTab = (newTab) => {
    setTab(newTab);
    const map = {
      welcome: 'welcome',
      video: 'video',
      cta: 'cta',
      capture: 'form',
      confirm: 'confirmed',
      share: 'share',
    };
    if (map[newTab]) setPreviewScreen(map[newTab]);
  };

  const TABS = [
    ['design', 'Design',   <Icons.Palette size={13}/>],
    ['welcome','Welcome',  <Icons.Home size={13}/>],
    ['video',  'Video',    <Icons.Video size={13}/>],
    ['cta',    'CTAs',     <Icons.Tap size={13}/>],
    ['capture','Capture',  <Icons.Inbox size={13}/>],
    ['confirm','Confirm',  <Icons.Check size={13}/>],
    ['share',  'Share',    <Icons.Share size={13}/>],
  ];

  return (
    <div data-screen-label="04 Editor" style={{ display: 'grid', gridTemplateColumns: '1fr 440px', gap: 0, alignItems: 'start' }}>
      <div className="page" style={{ paddingRight: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 2, padding: 4, background: 'var(--cream-2)', borderRadius: 999 }}>
            {TABS.map(([k, l, ico]) => (
              <button key={k} onClick={() => switchTab(k)} className="btn btn-sm" style={{
                background: tab === k ? 'white' : 'transparent',
                boxShadow: tab === k ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                gap: 6,
              }}>{ico} {l}</button>
            ))}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm"><Icons.Eye size={13}/> Preview live</button>
            <button className="btn btn-primary btn-sm"><Icons.Check size={13} sw={2}/> Publish</button>
          </div>
        </div>

        {tab === 'design'  && <DesignTab card={card} setTheme={setTheme} applyPalette={applyPalette} applyFontPair={applyFontPair} updateField={updateField}/>}
        {tab === 'welcome' && <WelcomeTab card={card} updateField={updateField}/>}
        {tab === 'video'   && <VideoTab card={card} updateField={updateField}/>}
        {tab === 'cta'     && <CTATab card={card} updateField={updateField}/>}
        {tab === 'capture' && <CaptureTab card={card} updateField={updateField} updateFormField={updateFormField}/>}
        {tab === 'confirm' && <ConfirmTab card={card} updateField={updateField}/>}
        {tab === 'share'   && <ShareTab card={card} updateField={updateField} updateLink={updateLink} addLink={addLink} removeLink={removeLink}/>}
      </div>

      <PreviewPane card={card} previewScreen={previewScreen} setPreviewScreen={setPreviewScreen}/>
    </div>
  );
};

/* =================== DESIGN TAB =================== */
const DesignTab = ({ card, setTheme, applyPalette, applyFontPair, updateField }) => {
  const [bgInput, setBgInput] = React.useState(card.theme.bg);
  const [fgInput, setFgInput] = React.useState(card.theme.fg);
  const [acInput, setAcInput] = React.useState(card.theme.accent);

  return (
    <>
      <Section title="Profile photo & logo">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <UploadTile
            label="Profile photo"
            hint="JPG/PNG, square crop"
            current={card.photo}
            onUpload={(url) => updateField('photo', url)}
            shape="circle"
            placeholder={(card.name || 'A').split(' ').map(n => n[0]).slice(0, 2).join('')}
          />
          <UploadTile
            label="Logo or wordmark"
            hint="SVG or PNG, transparent"
            current={card.logo}
            onUpload={(url) => updateField('logo', url)}
            shape="square"
            placeholder={<Icons.Image size={22}/>}
          />
        </div>
      </Section>

      <Section title="Palette" action={<button className="btn btn-ghost btn-sm"><Icons.Sparkle size={12} sw={2}/> Surprise me</button>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
          {PALETTES.map((p, i) => {
            const active = card.theme.bg === p.bg && card.theme.fg === p.fg;
            return (
              <button key={i} onClick={() => { applyPalette(p); setBgInput(p.bg); setFgInput(p.fg); setAcInput(p.accent); }} style={{
                padding: 0, borderRadius: 12, overflow: 'hidden',
                border: '2px solid ' + (active ? 'var(--charcoal)' : 'transparent'),
                background: 'transparent', textAlign: 'left',
              }}>
                <div style={{ height: 70, background: p.bg, color: p.fg, padding: 12, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: 14 }}>Aa</span>
                  <div style={{ display: 'flex', gap: 3 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 999, background: p.fg }}/>
                    <span style={{ width: 10, height: 10, borderRadius: 999, background: p.accent }}/>
                  </div>
                </div>
                <div style={{ padding: '8px 10px', background: 'var(--cream)', fontSize: 11 }}>{p.name}</div>
              </button>
            );
          })}
        </div>

        <div className="card-flat">
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>Or enter your own hex codes</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <ColorField label="Background" value={card.theme.bg}     onChange={v => { setBgInput(v); setTheme({ bg: v }); }} input={bgInput} setInput={setBgInput}/>
            <ColorField label="Foreground" value={card.theme.fg}     onChange={v => { setFgInput(v); setTheme({ fg: v }); }} input={fgInput} setInput={setFgInput}/>
            <ColorField label="Accent"     value={card.theme.accent} onChange={v => { setAcInput(v); setTheme({ accent: v }); }} input={acInput} setInput={setAcInput}/>
          </div>
        </div>
      </Section>

      <Section title="Typography">
        <div style={{ marginBottom: 14 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Font pairings</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {FONT_PAIRS.map((fp, i) => {
              const active = card.theme.fontDisplay === fp.display && card.theme.fontBody === fp.body;
              return (
                <button key={i} onClick={() => applyFontPair(fp)} style={{
                  padding: 14, borderRadius: 12, textAlign: 'left',
                  background: active ? 'var(--charcoal)' : 'white',
                  color: active ? 'var(--cream)' : 'var(--charcoal)',
                  border: '1px solid ' + (active ? 'var(--charcoal)' : 'var(--line)'),
                }}>
                  <div style={{ fontFamily: fontStack(fp.display, 'serif'), fontSize: 22, lineHeight: 1, marginBottom: 6 }}>Aa</div>
                  <div style={{ fontSize: 11, opacity: 0.75 }}>{fp.name}</div>
                  <div style={{ fontSize: 10, opacity: 0.5, marginTop: 4, fontFamily: fontStack(fp.body) }}>{fp.display} · {fp.body}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="card-flat">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Display font" hint="Headings and the name on your card.">
              <select className="select" value={card.theme.fontDisplay} onChange={e => setTheme({ fontDisplay: e.target.value })}>
                {DISPLAY_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </Field>
            <Field label="Body font" hint="Everything else.">
              <select className="select" value={card.theme.fontBody} onChange={e => setTheme({ fontBody: e.target.value })}>
                {BODY_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FontSizeField
                label="Display size"
                hint="Your name on the welcome screen."
                value={card.theme.fontSizeDisplay}
                options={[28, 32, 36, 40, 44, 48, 56, 64, 72]}
                min={18} max={96}
                onChange={v => setTheme({ fontSizeDisplay: v })}
              />
              <FontSizeField
                label="Body size"
                hint="Buttons, contact info, form labels."
                value={card.theme.fontSizeBody}
                options={[13, 14, 15, 16, 17, 18, 20]}
                min={11} max={28}
                onChange={v => setTheme({ fontSizeBody: v })}
              />
            </div>
          </div>
          <div style={{ marginTop: 16, padding: 16, background: 'white', borderRadius: 10, border: '1px solid var(--line)' }}>
            <div style={{ fontFamily: fontStack(card.theme.fontDisplay, 'serif'), fontSize: card.theme.fontSizeDisplay, lineHeight: 1, letterSpacing: '-0.01em' }}>
              {card.name}
            </div>
            <div style={{ fontFamily: fontStack(card.theme.fontBody), fontSize: card.theme.fontSizeBody, color: 'var(--muted)', marginTop: 10 }}>
              {card.title} · {card.company}
            </div>
          </div>
        </div>
      </Section>
    </>
  );
};

const UploadTile = ({ label, hint, current, onUpload, shape, placeholder }) => {
  const ref = React.useRef();
  const onFile = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    onUpload(url);
  };
  return (
    <div className="card-flat" style={{ padding: 16 }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <div style={{
          width: 56, height: 56,
          borderRadius: shape === 'circle' ? 999 : 10,
          background: current ? `url(${current}) center/cover` : 'var(--sage-tint)',
          display: 'grid', placeItems: 'center',
          fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--charcoal)',
        }}>{!current && placeholder}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 500 }}>{label}</div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>{hint}</div>
        </div>
      </div>
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => onFile(e.target.files[0])}/>
      <button className="btn btn-outline btn-sm" style={{ marginTop: 12, width: '100%', justifyContent: 'center' }} onClick={() => ref.current.click()}>
        <Icons.Upload size={12}/> {current ? 'Replace' : 'Upload'}
      </button>
    </div>
  );
};

const FontSizeField = ({ label, hint, value, options, min, max, onChange }) => {
  const [custom, setCustom] = React.useState(value);
  React.useEffect(() => { setCustom(value); }, [value]);
  const inList = options.includes(value);

  const commit = (v) => {
    const n = parseInt(v, 10);
    if (!isNaN(n) && n >= min && n <= max) onChange(n);
    else setCustom(value); // revert
  };

  return (
    <div className="field">
      <label>{label}</label>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', border: '1px solid var(--line)', borderRadius: 10, padding: 4, background: 'white' }}>
        <select
          value={inList ? value : '__custom'}
          onChange={e => {
            if (e.target.value === '__custom') return;
            const n = parseInt(e.target.value, 10);
            onChange(n);
            setCustom(n);
          }}
          style={{ border: 'none', background: 'transparent', padding: '4px 6px', fontSize: 12.5, outline: 'none', flex: 1 }}
        >
          {options.map(o => <option key={o} value={o}>{o}px</option>)}
          {!inList && <option value="__custom">{value}px (custom)</option>}
        </select>
        <div style={{ width: 1, height: 18, background: 'var(--line)' }}/>
        <input
          type="number"
          min={min}
          max={max}
          value={custom}
          onChange={e => setCustom(e.target.value)}
          onBlur={e => commit(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') commit(e.target.value); }}
          className="mono"
          style={{ border: 'none', background: 'transparent', padding: '0 6px', fontSize: 12.5, width: 56, outline: 'none', textAlign: 'right' }}
        />
        <span style={{ fontSize: 11, color: 'var(--muted)', paddingRight: 6 }}>px</span>
      </div>
      {hint && <div className="hint">{hint}</div>}
    </div>
  );
};

const ColorField = ({ label, value, onChange, input, setInput }) => {
  const commitHex = (h) => {
    let v = h.startsWith('#') ? h : '#' + h;
    if (/^#[0-9A-Fa-f]{6}$/.test(v)) onChange(v);
  };
  return (
    <div className="field">
      <label>{label}</label>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', border: '1px solid var(--line)', borderRadius: 10, padding: 4, background: 'white' }}>
        <label style={{ position: 'relative', width: 36, height: 30, borderRadius: 7, background: value, cursor: 'pointer', overflow: 'hidden', flexShrink: 0 }}>
          <input type="color" value={value} onChange={e => { setInput(e.target.value); onChange(e.target.value); }}
            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}/>
        </label>
        <input
          className="mono"
          value={input}
          onChange={e => setInput(e.target.value)}
          onBlur={e => commitHex(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') commitHex(e.target.value); }}
          style={{ border: 'none', background: 'transparent', padding: '0 6px', fontSize: 12, width: '100%', outline: 'none' }}
        />
      </div>
    </div>
  );
};

/* =================== WELCOME TAB =================== */
const WelcomeTab = ({ card, updateField }) => (
  <>
    <Section title="Identity">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label="Display name">
          <input className="input" value={card.name} onChange={e => updateField('name', e.target.value)}/>
        </Field>
        <Field label="Role / title">
          <input className="input" value={card.title} onChange={e => updateField('title', e.target.value)}/>
        </Field>
        <Field label="Company / studio">
          <input className="input" value={card.company} onChange={e => updateField('company', e.target.value)}/>
        </Field>
        <Field label="Tagline" hint="Appears under your name.">
          <input className="input" value={card.tagline} onChange={e => updateField('tagline', e.target.value)}/>
        </Field>
      </div>
    </Section>

    <Section title="Welcome copy">
      <div style={{ display: 'grid', gap: 14 }}>
        <Field label="Kicker line" hint="A small line above your name.">
          <input className="input" value={card.welcomeKicker} onChange={e => updateField('welcomeKicker', e.target.value)}/>
        </Field>
        <Field label="Subheading" hint="One sentence under your title.">
          <input className="input" value={card.welcomeSubheading} onChange={e => updateField('welcomeSubheading', e.target.value)}/>
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Primary button label">
            <input className="input" value={card.ctaWatch} onChange={e => updateField('ctaWatch', e.target.value)}/>
          </Field>
          <Field label="Secondary button label">
            <input className="input" value={card.ctaShare} onChange={e => updateField('ctaShare', e.target.value)}/>
          </Field>
        </div>
      </div>
    </Section>

    <Section title="Contact details">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label="Email">  <input className="input" value={card.email}   onChange={e => updateField('email', e.target.value)}/></Field>
        <Field label="Phone">  <input className="input" value={card.phone}   onChange={e => updateField('phone', e.target.value)}/></Field>
        <Field label="Website"><input className="input" value={card.website} onChange={e => updateField('website', e.target.value)}/></Field>
        <Field label="Location"><input className="input" value={card.location} onChange={e => updateField('location', e.target.value)}/></Field>
      </div>
    </Section>
  </>
);

/* =================== VIDEO TAB =================== */
const VideoTab = ({ card, updateField }) => {
  const ref = React.useRef();
  const onFile = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateField('videoUrl', url);
    // Try to read duration once metadata loads
    const v = document.createElement('video');
    v.src = url;
    v.onloadedmetadata = () => updateField('videoLength', Math.round(v.duration));
  };

  return (
    <>
      <Section title="Welcome video">
        <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: -4, marginBottom: 14, maxWidth: 540 }}>
          Plays full-bleed when someone taps your primary button. Keep it short — under a minute is ideal.
        </p>

        {card.videoUrl ? (
          <div className="card-flat" style={{ padding: 16 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 100, height: 60, borderRadius: 8, background: '#000', display: 'grid', placeItems: 'center', color: 'white', overflow: 'hidden' }}>
                <video src={card.videoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>Custom intro video</div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>~{card.videoLength}s · stored in your private bucket</div>
              </div>
              <button className="icon-btn" onClick={() => updateField('videoUrl', '')} title="Remove"><Icons.Trash size={14}/></button>
            </div>
          </div>
        ) : (
          <div style={{
            border: '2px dashed var(--line)', borderRadius: 14, padding: 36, textAlign: 'center',
            background: 'var(--cream)', cursor: 'pointer',
          }} onClick={() => ref.current.click()}>
            <div style={{ width: 52, height: 52, borderRadius: 999, background: 'var(--sage-tint)', display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}>
              <Icons.Video size={22}/>
            </div>
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>Upload your welcome video</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 14 }}>MP4 / MOV · up to 50MB · 1080p recommended</div>
            <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); ref.current.click(); }}>
              <Icons.Upload size={13}/> Choose file
            </button>
            <input ref={ref} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => onFile(e.target.files[0])}/>
            <div style={{ fontSize: 11, color: 'var(--muted-2)', marginTop: 14 }}>
              No video? We'll show a generated animated intro using your colours.
            </div>
          </div>
        )}
      </Section>

      <Section title="Playback">
        <div className="card-flat">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Auto-play with sound off</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Starts playing as soon as the video screen opens.</div>
            </div>
            <div className={"toggle " + (card.videoAutoplay ? 'on' : '')} onClick={() => updateField('videoAutoplay', !card.videoAutoplay)}/>
          </div>
          <hr className="hr"/>
          <Field label="Skip button label" hint="Visible top-right during the video.">
            <input className="input" value={card.skipLabel} onChange={e => updateField('skipLabel', e.target.value)}/>
          </Field>
        </div>
      </Section>
    </>
  );
};

/* =================== CTA TAB =================== */
const CTATab = ({ card, updateField }) => (
  <>
    <Section title="After-video CTAs">
      <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: -4, marginBottom: 14, maxWidth: 540 }}>
        Two buttons slide up when the video ends. The primary sends them to your website, the secondary captures a lead.
      </p>
      <div className="card-flat">
        <div className="eyebrow" style={{ marginBottom: 12 }}>Primary CTA</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
          <Field label="Button label">
            <input className="input" value={card.ctaPrimaryLabel} onChange={e => updateField('ctaPrimaryLabel', e.target.value)}/>
          </Field>
          <Field label="Destination URL">
            <input className="input mono" style={{ fontSize: 12.5 }} value={card.ctaPrimaryUrl} onChange={e => updateField('ctaPrimaryUrl', e.target.value)}/>
          </Field>
        </div>
        <hr className="hr"/>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Secondary CTA · opens lead form</div>
        <Field label="Button label">
          <input className="input" value={card.ctaSecondaryLabel} onChange={e => updateField('ctaSecondaryLabel', e.target.value)}/>
        </Field>
      </div>
    </Section>
  </>
);

/* =================== CAPTURE TAB =================== */
const CaptureTab = ({ card, updateField, updateFormField }) => (
  <>
    <Section title="Form copy">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label="Heading">
          <input className="input" value={card.formHeading} onChange={e => updateField('formHeading', e.target.value)}/>
        </Field>
        <Field label="Submit button label">
          <input className="input" value={card.submitLabel} onChange={e => updateField('submitLabel', e.target.value)}/>
        </Field>
        <div style={{ gridColumn: '1 / -1' }}>
          <Field label="Subheading">
            <textarea className="textarea" rows={2} value={card.formSubheading} onChange={e => updateField('formSubheading', e.target.value)}/>
          </Field>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <Field label="Consent text" hint="Shown next to the consent checkbox.">
            <textarea className="textarea" rows={2} value={card.consentText} onChange={e => updateField('consentText', e.target.value)}/>
          </Field>
        </div>
      </div>
    </Section>

    <Section title="Fields">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {card.formFields.map((f, i) => (
          <div key={f.id} className="card-flat" style={{ padding: 12, display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 12, alignItems: 'center' }}>
            <input className="input" value={f.label} onChange={e => updateFormField(i, 'label', e.target.value)}/>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>Required</span>
            <div className={"toggle " + (f.required ? 'on' : '')} onClick={() => updateFormField(i, 'required', !f.required)}/>
            <div className={"toggle " + (f.enabled ? 'on' : '')} onClick={() => updateFormField(i, 'enabled', !f.enabled)} title="Show on form"/>
          </div>
        ))}
      </div>
    </Section>

    <Section title="Where leads go">
      <div className="card-flat" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--sage-tint)', display: 'grid', placeItems: 'center' }}>
          <Icons.Mail size={18}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>{card.email}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Every submission lands in your inbox + your private dashboard.</div>
        </div>
        <button className="btn btn-outline btn-sm">Change</button>
      </div>
    </Section>
  </>
);

/* =================== CONFIRM TAB =================== */
const ConfirmTab = ({ card, updateField }) => (
  <Section title="Confirmation screen">
    <div style={{ display: 'grid', gap: 14, maxWidth: 560 }}>
      <Field label="Heading">
        <input className="input" value={card.confirmHeading} onChange={e => updateField('confirmHeading', e.target.value)}/>
      </Field>
      <Field label="Body message">
        <textarea className="textarea" rows={3} value={card.confirmBody} onChange={e => updateField('confirmBody', e.target.value)}/>
      </Field>
      <Field label="Back-button label">
        <input className="input" value={card.confirmCTA} onChange={e => updateField('confirmCTA', e.target.value)}/>
      </Field>
    </div>
  </Section>
);

/* =================== SHARE TAB =================== */
const ShareTab = ({ card, updateField, updateLink, addLink, removeLink }) => (
  <>
    <Section title="Share screen URL">
      <div className="card-flat">
        <Field label="Card slug" hint="The public URL where your card lives.">
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--line)', borderRadius: 10, background: 'white' }}>
            <span style={{ padding: '10px 0 10px 12px', fontSize: 13.5, color: 'var(--muted)' }}>leadcard.app/c/</span>
            <input className="input" style={{ border: 'none', background: 'transparent' }} value={card.slug} onChange={e => updateField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}/>
          </div>
        </Field>
      </div>
    </Section>

    <Section title="Extra links" action={<button className="btn btn-outline btn-sm" onClick={addLink}><Icons.Plus size={13}/> Add link</button>}>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: -4, marginBottom: 14 }}>
        Optional buttons that appear on the share screen — LinkedIn, Calendly, portfolio, etc.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {card.links.map((lnk, i) => (
          <div key={i} className="card-flat" style={{ padding: 12, display: 'grid', gridTemplateColumns: '32px 1fr 1.4fr auto', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'white', display: 'grid', placeItems: 'center', border: '1px solid var(--line)' }}>
              {lnk.kind === 'linkedin' ? <Icons.Linkedin size={13}/> :
               lnk.kind === 'calendar' ? <Icons.Calendar size={13}/> :
               <Icons.Globe size={13}/>}
            </div>
            <input className="input" value={lnk.label} onChange={e => updateLink(i, 'label', e.target.value)}/>
            <input className="input mono" value={lnk.url} onChange={e => updateLink(i, 'url', e.target.value)} style={{ fontSize: 12 }}/>
            <button className="icon-btn" onClick={() => removeLink(i)}><Icons.Trash size={14}/></button>
          </div>
        ))}
      </div>
    </Section>
  </>
);

/* =================== PREVIEW PANE =================== */
const PreviewPane = ({ card, previewScreen, setPreviewScreen }) => {
  const SCREENS = [
    ['welcome',   'Welcome',  <Icons.Home size={11}/>],
    ['video',     'Video',    <Icons.Video size={11}/>],
    ['cta',       'CTAs',     <Icons.Tap size={11}/>],
    ['form',      'Form',     <Icons.Inbox size={11}/>],
    ['confirmed', 'Confirmed',<Icons.Check size={11}/>],
    ['share',     'Share',    <Icons.Share size={11}/>],
  ];
  return (
    <div style={{
      position: 'sticky', top: 70,
      height: 'calc(100vh - 70px)',
      background: 'var(--cream-2)',
      borderLeft: '1px solid var(--line)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'flex-start',
      padding: '20px 18px',
      gap: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: 'var(--muted)' }}>
        <span className="chip dot" style={{ background: 'white', border: '1px solid var(--line)' }}>Live preview</span>
        <span className="mono">leadcard.app/c/{card.slug || 'avery'}</span>
      </div>

      {/* Screen picker */}
      <div style={{ display: 'flex', gap: 3, padding: 3, background: 'white', borderRadius: 999, border: '1px solid var(--line)', flexWrap: 'wrap', justifyContent: 'center' }}>
        {SCREENS.map(([k, l, ico]) => (
          <button key={k} onClick={() => setPreviewScreen(k)} style={{
            padding: '5px 10px', borderRadius: 999,
            background: previewScreen === k ? 'var(--charcoal)' : 'transparent',
            color: previewScreen === k ? 'var(--cream)' : 'var(--charcoal)',
            fontSize: 11, display: 'flex', alignItems: 'center', gap: 4,
            transition: '120ms',
          }}>{ico} {l}</button>
        ))}
      </div>

      <div className="phone">
        <div className="phone-screen">
          <CardView data={card} flowScreen={previewScreen} setFlowScreen={setPreviewScreen}/>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-outline btn-sm"><Icons.Qr size={13}/> QR</button>
        <button className="btn btn-outline btn-sm"><Icons.Copy size={13}/> Link</button>
        <button className="btn btn-outline btn-sm"><Icons.Share size={13}/> Share</button>
      </div>
    </div>
  );
};

window.Editor = Editor;
