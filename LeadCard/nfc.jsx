// NFC functionality — order physical cards OR use your own NFC tags

const NFC = ({ card, setCard }) => {
  const [tab, setTab] = React.useState('order');
  const [writeOpen, setWriteOpen] = React.useState(false);

  const team = card.team || [];
  const isTeam = card.plan === 'small' || card.plan === 'enterprise';
  const people = isTeam ? team : [{
    id: 'me', firstName: card.name?.split(' ')[0] || 'You', lastName: card.name?.split(' ').slice(1).join(' ') || '',
    title: card.title, email: card.email, photo: card.photo, slug: card.slug,
  }];

  const updateNfc = (patch) => setCard(c => ({ ...c, nfc: { ...c.nfc, ...patch } }));

  return (
    <div className="page" data-screen-label="07 NFC" style={{ maxWidth: 1280 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <div>
          <div className="eyebrow">Optional add-on</div>
          <h2 className="display" style={{ fontSize: 32, margin: '6px 0 0' }}>NFC — tap to share</h2>
          <p style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 6, maxWidth: 620 }}>
            Order printed NFC cards we mail to you, or write your card URL to any blank NFC tag you already own.
            Either way — one tap opens the welcome experience on any phone.
          </p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13 }}>{card.nfc?.enabled ? 'NFC enabled' : 'NFC disabled'}</span>
          <div className={"toggle " + (card.nfc?.enabled ? 'on' : '')} onClick={() => updateNfc({ enabled: !card.nfc?.enabled })}/>
        </div>
      </div>

      {!card.nfc?.enabled ? (
        <div className="card" style={{ padding: 60, textAlign: 'center', background: 'var(--cream-2)', border: 'none' }}>
          <div style={{ width: 64, height: 64, borderRadius: 999, background: 'var(--sage-tint)', display: 'grid', placeItems: 'center', margin: '0 auto 18px' }}>
            <Icons.Tap size={28}/>
          </div>
          <h3 className="display" style={{ fontSize: 28, margin: '0 0 10px' }}>Turn on NFC for your team</h3>
          <p style={{ fontSize: 14, color: 'var(--muted)', maxWidth: 480, margin: '0 auto 24px' }}>
            Once enabled, every person's card URL becomes NFC-writable, and you can order printed cards from this page.
          </p>
          <button className="btn btn-primary" onClick={() => updateNfc({ enabled: true })}>
            <Icons.Sparkle size={14} sw={2}/> Enable NFC
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--cream-2)', borderRadius: 999, marginBottom: 20, width: 'fit-content' }}>
            {[['order', 'Order printed cards'], ['write', 'Write to my own tags'], ['settings', 'Settings']].map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} className="btn btn-sm" style={{
                background: tab === k ? 'white' : 'transparent',
                boxShadow: tab === k ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              }}>{l}</button>
            ))}
          </div>

          {tab === 'order' && <OrderTab card={card} people={people}/>}
          {tab === 'write' && <WriteTab card={card} people={people} onWrite={() => setWriteOpen(true)}/>}
          {tab === 'settings' && <NfcSettingsTab card={card} updateNfc={updateNfc}/>}

          {writeOpen && <NFCWriteModal onClose={() => setWriteOpen(false)}/>}
        </>
      )}

      <div style={{ marginTop: 24, padding: 18, background: 'var(--cream-2)', borderRadius: 12, fontSize: 12.5, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icons.Lock size={14} stroke="var(--charcoal)"/>
        <span><strong style={{ color: 'var(--charcoal)' }}>Each tag is scoped.</strong> A tag written for one person opens only their card URL — no other team member's data is reachable from that tap.</span>
      </div>
    </div>
  );
};

const OrderTab = ({ card, people }) => {
  const [counts, setCounts] = React.useState(() => Object.fromEntries(people.map(p => [p.id, 0])));
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const unitPrice = 250; // R / £ / $ — just a number for the prototype
  const setCount = (id, n) => setCounts(c => ({ ...c, [id]: Math.max(0, Math.min(99, n)) }));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 18 }}>
      <div>
        <Section title="Order quantities">
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: -4, marginBottom: 14 }}>
            Premium PVC card with embedded NFC chip + printed QR. Pre-encoded with each person's URL. Ships in 5–7 business days.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {people.map(p => (
              <div key={p.id} className="card-flat" style={{ padding: 14, display: 'grid', gridTemplateColumns: '40px 1fr auto', gap: 14, alignItems: 'center' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 999,
                  background: p.photo ? `url(${p.photo}) center/cover` : 'var(--sage-tint)',
                  display: 'grid', placeItems: 'center',
                  fontSize: 13, fontWeight: 500,
                }}>{!p.photo && `${p.firstName?.[0] || ''}${p.lastName?.[0] || ''}`}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{p.firstName} {p.lastName}</div>
                  <div className="mono" style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>leadcard.app/c/{p.slug}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button className="icon-btn" onClick={() => setCount(p.id, counts[p.id] - 1)} style={{ background: 'white', border: '1px solid var(--line)' }}>−</button>
                  <span className="mono" style={{ minWidth: 28, textAlign: 'center', fontSize: 14 }}>{counts[p.id]}</span>
                  <button className="icon-btn" onClick={() => setCount(p.id, counts[p.id] + 1)} style={{ background: 'white', border: '1px solid var(--line)' }}>+</button>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <div>
        <div className="card" style={{ position: 'sticky', top: 84 }}>
          <Section title="Your order">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, marginBottom: 6 }}>
              <span>NFC cards</span><span className="mono">{total} × R{unitPrice}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, marginBottom: 6, color: 'var(--muted)' }}>
              <span>Shipping</span><span className="mono">R{total > 0 ? 95 : 0}</span>
            </div>
            <hr className="hr"/>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>Total</span>
              <span className="display" style={{ fontSize: 32 }}>R{total * unitPrice + (total > 0 ? 95 : 0)}</span>
            </div>
            <button className="btn btn-primary" disabled={total === 0} style={{ width: '100%', justifyContent: 'center', marginTop: 14, opacity: total === 0 ? 0.4 : 1 }}>
              <Icons.Card size={14} sw={2}/> Place order
            </button>
            <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 10, textAlign: 'center' }}>
              Billed once · ships from JHB
            </div>
          </Section>

          <div style={{ marginTop: 16, padding: 14, background: 'var(--cream-2)', borderRadius: 10 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Preview</div>
            <NFCCardArt card={card} person={people[0]}/>
          </div>
        </div>
      </div>
    </div>
  );
};

const WriteTab = ({ card, people, onWrite }) => (
  <div>
    <Section title="Use your own NFC tags">
      <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: -4, marginBottom: 14, maxWidth: 620 }}>
        Already have NFC stickers, rings, or wristbands? Pick a person below and tap "Write" — your phone will program the chip with their card URL.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {people.map(p => (
          <div key={p.id} className="card-flat" style={{ padding: 14, display: 'grid', gridTemplateColumns: '40px 1fr auto auto', gap: 14, alignItems: 'center' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 999,
              background: p.photo ? `url(${p.photo}) center/cover` : 'var(--sage-tint)',
              display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 500,
            }}>{!p.photo && `${p.firstName?.[0] || ''}${p.lastName?.[0] || ''}`}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{p.firstName} {p.lastName}</div>
              <div className="mono" style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>leadcard.app/c/{p.slug}</div>
            </div>
            <button className="btn btn-sm btn-outline"><Icons.Copy size={12}/> Copy URL</button>
            <button className="btn btn-sm btn-primary" onClick={onWrite}><Icons.Tap size={12} sw={2}/> Write to tag</button>
          </div>
        ))}
      </div>
    </Section>

    <Section title="Compatibility">
      <div className="card-flat" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          ['NTAG213', '144 bytes · fine for short URLs · ~R3 each'],
          ['NTAG215', '504 bytes · most popular · ~R8 each'],
          ['NTAG216', '888 bytes · future-proof · ~R12 each'],
        ].map(([k, l]) => (
          <div key={k} style={{ padding: 14, background: 'white', borderRadius: 10, border: '1px solid var(--line)' }}>
            <div className="mono" style={{ fontSize: 13, fontWeight: 500 }}>{k}</div>
            <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 4, lineHeight: 1.4 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 12 }}>
        Writing uses the Web NFC API — works on Chrome for Android. iPhone users can use a free app like NFC Tools to write the same URL.
      </div>
    </Section>
  </div>
);

const NfcSettingsTab = ({ card, updateNfc }) => (
  <>
    <Section title="NFC behaviour">
      <div className="card-flat">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Open card directly on tap</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>The welcome experience opens in the user's default browser — no app required.</div>
          </div>
          <div className="toggle on"/>
        </div>
        <hr className="hr"/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Track taps as a source</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Adds <code className="mono" style={{ fontSize: 11.5 }}>?src=nfc</code> so analytics separate taps from QR scans.</div>
          </div>
          <div className="toggle on"/>
        </div>
        <hr className="hr"/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Lock tags after writing</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Prevents anyone with a phone from overwriting the chip. Cannot be reversed.</div>
          </div>
          <div className="toggle"/>
        </div>
      </div>
    </Section>
  </>
);

// The physical NFC card art preview
const NFCCardArt = ({ card, person }) => {
  const t = card.theme;
  return (
    <div style={{
      width: '100%', aspectRatio: '1.586 / 1',
      background: t.bg, color: t.fg,
      borderRadius: 12,
      padding: 16,
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 12px 32px -16px rgba(23,24,28,0.4)',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 90% 0%, ${t.accent}22, transparent 50%)` }}/>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 14, opacity: 0.85 }}>{card.company}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, opacity: 0.6 }}>
            <Icons.Tap size={11}/> NFC
          </div>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, lineHeight: 1, letterSpacing: '-0.01em' }}>
            {person?.firstName} {person?.lastName}
          </div>
          <div style={{ fontSize: 9.5, opacity: 0.7, marginTop: 4 }}>{person?.title}</div>
          <div className="mono" style={{ fontSize: 8, opacity: 0.6, marginTop: 8 }}>leadcard.app/c/{person?.slug}</div>
        </div>
      </div>
    </div>
  );
};

const NFCWriteModal = ({ onClose }) => {
  const [phase, setPhase] = React.useState('waiting'); // waiting | writing | success
  React.useEffect(() => {
    const t1 = setTimeout(() => setPhase('writing'), 1800);
    const t2 = setTimeout(() => setPhase('success'), 3400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(23,24,28,0.7)', zIndex: 60, display: 'grid', placeItems: 'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 380, background: 'var(--cream)', borderRadius: 18, padding: 32, textAlign: 'center' }}>
        <div style={{
          width: 100, height: 100, borderRadius: 999,
          background: phase === 'success' ? 'var(--sage)' : 'var(--cream-2)',
          margin: '0 auto 22px',
          display: 'grid', placeItems: 'center',
          position: 'relative', transition: '300ms',
        }}>
          {phase !== 'success' && (
            <>
              <div style={{ position: 'absolute', inset: -8, borderRadius: 999, border: '2px solid var(--sage)', opacity: 0.5, animation: 'lc-pulse 1.4s ease-out infinite' }}/>
              <div style={{ position: 'absolute', inset: -18, borderRadius: 999, border: '2px solid var(--sage)', opacity: 0.3, animation: 'lc-pulse 1.4s ease-out infinite 0.3s' }}/>
            </>
          )}
          {phase === 'success' ? <Icons.Check size={36} sw={2.6} stroke="var(--charcoal)"/> : <Icons.Tap size={36} stroke="var(--charcoal)"/>}
        </div>
        {phase === 'waiting' && (
          <>
            <h3 className="display" style={{ fontSize: 24, margin: '0 0 8px' }}>Hold your phone near the tag</h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>Place a blank NFC sticker or card against the back of your phone.</p>
          </>
        )}
        {phase === 'writing' && (
          <>
            <h3 className="display" style={{ fontSize: 24, margin: '0 0 8px' }}>Writing…</h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>Don't move the tag. This takes about a second.</p>
          </>
        )}
        {phase === 'success' && (
          <>
            <h3 className="display" style={{ fontSize: 24, margin: '0 0 8px' }}>All set.</h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 18px' }}>Tap the tag against any phone to open the card.</p>
            <button className="btn btn-primary" onClick={onClose}>Done</button>
          </>
        )}
        <style>{`@keyframes lc-pulse { 0% { transform: scale(0.95); opacity: 0.5; } 100% { transform: scale(1.15); opacity: 0; } }`}</style>
      </div>
    </div>
  );
};

window.NFC = NFC;
