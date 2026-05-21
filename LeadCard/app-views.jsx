// Dashboard, Analytics, Leads inbox, Settings/Billing

const Dashboard = ({ card, goto }) => {
  const cardUrl = `leadcard.app/c/${card.slug || 'avery'}`;
  return (
    <div className="page" data-screen-label="03 Dashboard">
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18, marginBottom: 24 }}>
        <div className="card" style={{ padding: 28, background: card.theme.bg, color: card.theme.fg, position: 'relative', overflow: 'hidden' }}>
          <div className="eyebrow" style={{ color: card.theme.accent }}>Your card</div>
          <h2 className="display" style={{ fontSize: 44, margin: '8px 0 4px', color: card.theme.fg }}>{card.name}</h2>
          <div style={{ fontSize: 14, opacity: 0.7 }}>{card.title} · {card.company}</div>
          <div className="mono" style={{ marginTop: 24, fontSize: 13, opacity: 0.85 }}>{cardUrl}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            <button className="btn btn-sm" style={{ background: card.theme.fg, color: card.theme.bg }} onClick={() => goto('editor')}>
              <Icons.Pencil size={12} sw={2}/> Edit card
            </button>
            <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.10)', color: card.theme.fg, border: '1px solid rgba(255,255,255,0.18)' }}>
              <Icons.Qr size={12} sw={2}/> QR code
            </button>
            <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.10)', color: card.theme.fg, border: '1px solid rgba(255,255,255,0.18)' }}>
              <Icons.Share size={12} sw={2}/> Share
            </button>
          </div>
          <div style={{ position: 'absolute', right: -30, top: -30, width: 220, height: 220, borderRadius: '50%', border: '1px solid ' + card.theme.accent + '40' }}/>
          <div style={{ position: 'absolute', right: -60, top: -60, width: 280, height: 280, borderRadius: '50%', border: '1px solid ' + card.theme.accent + '20' }}/>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div className="eyebrow">This quarter so far</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
            <span className="display" style={{ fontSize: 56 }}>247</span>
            <span style={{ fontSize: 14, color: 'var(--muted)' }}>card opens</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>Leads captured</div>
              <div className="display" style={{ fontSize: 24, marginTop: 2 }}>34</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>Save-to-contact</div>
              <div className="display" style={{ fontSize: 24, marginTop: 2 }}>58</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 16 }} onClick={() => goto('analytics')}>
            See full report <Icons.Arrow size={12} sw={2}/>
          </button>
        </div>
      </div>

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <Stat label="Card opens · 30d"  value="612" delta="18%" />
        <Stat label="Leads · 30d"        value="71"  delta="9%" />
        <Stat label="Save-to-contact"    value="143" delta="22%" />
        <Stat label="Avg. time on card"  value="0:48" delta="6%" trend="down" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
        <div className="card">
          <Section title="Last 14 days" action={
            <div style={{ display: 'flex', gap: 6 }}>
              <span className="chip dot">Opens</span>
              <span className="chip" style={{ background: 'transparent', border: '1px solid var(--line)' }}><span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--charcoal)' }}/> Leads</span>
            </div>
          }>
            <BarChart />
          </Section>
        </div>

        <div className="card">
          <Section title="Recent leads" action={<button className="btn btn-ghost btn-sm" onClick={() => goto('leads')}>View all</button>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {SAMPLE_LEADS.slice(0, 5).map((l, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 4 ? '1px solid var(--line-2)' : 'none' }}>
                  <div className="avatar" style={{ width: 32, height: 32, background: 'var(--sage-tint)' }}>
                    {l.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{l.company} · {l.source}</div>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{l.when}</div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>

      <div style={{ marginTop: 24, padding: 24, background: 'var(--sage-tint)', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--charcoal)', color: 'var(--sage)', display: 'grid', placeItems: 'center' }}>
          <Icons.Mail size={20}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 500 }}>Your Q2 lead report ships 30 June</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
            A clean PDF + CSV of every lead, mailed to {card.email || 'your inbox'}. You don't have to do anything.
          </div>
        </div>
        <button className="btn btn-outline btn-sm">Configure</button>
      </div>
    </div>
  );
};

const BarChart = () => {
  const opens = [12, 18, 24, 14, 28, 36, 30, 42, 38, 45, 52, 48, 56, 62];
  const leads = [2, 4, 3, 1, 5, 6, 4, 7, 6, 8, 9, 7, 10, 11];
  const maxV = Math.max(...opens);
  return (
    <div className="bars">
      {opens.map((v, i) => (
        <div key={i} className="bar" style={{ height: (v / maxV * 180) + 'px' }} title={`${v} opens`}>
          <div className="top" style={{ height: (leads[i] / v * 100) + '%' }}/>
        </div>
      ))}
    </div>
  );
};

const Analytics = () => (
  <div className="page" data-screen-label="05 Analytics">
    <div className="stat-grid" style={{ marginBottom: 24 }}>
      <Stat label="Total opens"        value="2,418" delta="12%" />
      <Stat label="Unique visitors"    value="1,684" delta="9%" />
      <Stat label="Lead conversion"    value="11.6%" delta="2.1pp" />
      <Stat label="Avg. session"       value="0:52" delta="4%" />
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18, marginBottom: 18 }}>
      <div className="card">
        <Section title="Opens over time" action={
          <div style={{ display: 'flex', gap: 4, padding: 3, background: 'var(--cream-2)', borderRadius: 999 }}>
            {['7d', '30d', '90d', 'All'].map((r, i) => (
              <button key={r} className="btn btn-sm" style={{ background: i === 1 ? 'white' : 'transparent', padding: '4px 10px', fontSize: 12 }}>{r}</button>
            ))}
          </div>
        }>
          <LineChart />
        </Section>
      </div>
      <div className="card">
        <Section title="Where opens come from">
          {[
            ['QR · Conference badge', 38, 'var(--sage)'],
            ['NFC tap',               28, 'var(--charcoal)'],
            ['Direct link',           18, '#C9A878'],
            ['Email signature',       10, '#7AA8D8'],
            ['Other',                  6, 'var(--muted-2)'],
          ].map(([label, pct, color]) => (
            <div key={label} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span>{label}</span>
                <span className="mono" style={{ color: 'var(--muted)' }}>{pct}%</span>
              </div>
              <div style={{ height: 6, background: 'var(--cream-2)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ width: pct + '%', height: '100%', background: color, borderRadius: 999 }}/>
              </div>
            </div>
          ))}
        </Section>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
      <div className="card">
        <Section title="What they tapped">
          {[
            ['Save contact (.vcf)',   '143'],
            ['Email · avery@...',     '112'],
            ['Phone · +27 82...',     '87'],
            ['LinkedIn',              '74'],
            ['Website',               '69'],
            ['Book a call',           '38'],
          ].map(([label, n]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--line-2)' }}>
              <span style={{ fontSize: 13.5 }}>{label}</span>
              <span className="mono" style={{ fontSize: 13 }}>{n}</span>
            </div>
          ))}
        </Section>
      </div>

      <div className="card">
        <Section title="Top countries">
          {[
            ['🇿🇦 South Africa', 62],
            ['🇬🇧 United Kingdom', 14],
            ['🇺🇸 United States', 11],
            ['🇳🇱 Netherlands', 6],
            ['🇩🇪 Germany', 4],
            ['Other', 3],
          ].map(([label, pct]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--line-2)' }}>
              <span style={{ fontSize: 13.5, flex: 1 }}>{label}</span>
              <div style={{ width: 80, height: 4, background: 'var(--cream-2)', borderRadius: 999 }}>
                <div style={{ width: pct + '%', height: '100%', background: 'var(--sage)', borderRadius: 999 }}/>
              </div>
              <span className="mono" style={{ fontSize: 12, color: 'var(--muted)', width: 30, textAlign: 'right' }}>{pct}%</span>
            </div>
          ))}
        </Section>
      </div>
    </div>
  </div>
);

const LineChart = () => {
  const points = [12, 18, 14, 22, 28, 24, 30, 36, 32, 42, 38, 46, 52, 48, 56, 60, 54, 62, 68, 64, 72, 78, 70, 82, 76, 84, 90, 86, 94, 100];
  const w = 600, h = 200, max = Math.max(...points);
  const xs = points.map((_, i) => (i / (points.length - 1)) * w);
  const ys = points.map(v => h - (v / max) * h * 0.9 - 10);
  const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x} ${ys[i]}`).join(' ');
  const area = path + ` L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 200 }}>
      <defs>
        <linearGradient id="ga" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#8FAF9D" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="#8FAF9D" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill="url(#ga)" />
      <path d={path} stroke="#23262B" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      {xs.map((x, i) => i % 3 === 0 && <circle key={i} cx={x} cy={ys[i]} r="2.5" fill="#23262B"/>)}
    </svg>
  );
};

const Leads = () => {
  const [selected, setSelected] = React.useState(null);
  const [filter, setFilter] = React.useState('all');
  return (
    <div className="page" data-screen-label="06 Leads" style={{ maxWidth: 1280 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--cream-2)', borderRadius: 999 }}>
          {[['all', 'All', 71], ['new', 'New', 12], ['demo', 'Demo', 18], ['quote', 'Quote', 9]].map(([k, l, n]) => (
            <button key={k} onClick={() => setFilter(k)} className="btn btn-sm" style={{
              background: filter === k ? 'white' : 'transparent',
              boxShadow: filter === k ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
            }}>{l} <span style={{ color: 'var(--muted)', marginLeft: 4 }}>{n}</span></button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm"><Icons.Download size={13}/> CSV</button>
          <button className="btn btn-primary btn-sm"><Icons.Mail size={13} sw={2}/> Send report now</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Person</th>
              <th>Company</th>
              <th>Intent</th>
              <th>Source</th>
              <th style={{ textAlign: 'right' }}>When</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {SAMPLE_LEADS.map((l, i) => (
              <tr key={i} onClick={() => setSelected(l)} style={{ cursor: 'pointer' }}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
                      {l.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{l.name}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{l.email}</div>
                    </div>
                  </div>
                </td>
                <td>{l.company}</td>
                <td><span className="chip" style={{ background: 'var(--sage-tint)' }}>{l.intent}</span></td>
                <td style={{ color: 'var(--muted)' }}>{l.source}</td>
                <td style={{ textAlign: 'right', color: 'var(--muted)' }}>{l.when}</td>
                <td><Icons.Arrow size={14} stroke="var(--muted-2)"/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 16, padding: 16, background: 'var(--cream-2)', borderRadius: 12, fontSize: 12.5, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icons.Lock size={13}/> These leads belong to your card only. No one else on LeadCard can see them.
      </div>

      {selected && <LeadDrawer lead={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

const LeadDrawer = ({ lead, onClose }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(23,24,28,0.4)', zIndex: 50, display: 'flex', justifyContent: 'flex-end' }} onClick={onClose}>
    <div onClick={e => e.stopPropagation()} style={{ width: 460, background: 'var(--cream)', height: '100%', overflow: 'auto', padding: 28 }}>
      <button className="icon-btn" onClick={onClose} style={{ float: 'right' }}>✕</button>
      <div className="avatar" style={{ width: 56, height: 56, fontSize: 20, marginBottom: 16 }}>
        {lead.name.split(' ').map(n => n[0]).join('')}
      </div>
      <h2 className="display" style={{ fontSize: 32, margin: 0 }}>{lead.name}</h2>
      <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>{lead.company}</div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button className="btn btn-primary btn-sm"><Icons.Mail size={13} sw={2}/> Email</button>
        <button className="btn btn-outline btn-sm"><Icons.Phone size={13} sw={2}/> Call</button>
        <button className="btn btn-outline btn-sm"><Icons.Calendar size={13} sw={2}/> Schedule</button>
      </div>
      <hr className="hr" style={{ margin: '24px 0' }}/>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '12px 16px', fontSize: 13 }}>
        <span style={{ color: 'var(--muted)' }}>Email</span><span>{lead.email}</span>
        <span style={{ color: 'var(--muted)' }}>Phone</span><span>+27 82 123 4567</span>
        <span style={{ color: 'var(--muted)' }}>Intent</span><span><span className="chip" style={{ background: 'var(--sage-tint)' }}>{lead.intent}</span></span>
        <span style={{ color: 'var(--muted)' }}>Source</span><span>{lead.source}</span>
        <span style={{ color: 'var(--muted)' }}>Captured</span><span>{lead.when}</span>
        <span style={{ color: 'var(--muted)' }}>Card ID</span><span className="mono" style={{ fontSize: 12 }}>card_avery_01</span>
      </div>
      <hr className="hr" style={{ margin: '24px 0' }}/>
      <div className="eyebrow" style={{ marginBottom: 8 }}>Message</div>
      <p style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--charcoal)' }}>
        Hi Avery, met you at the Cape Town design summit. Would love to chat about a possible engagement for our Q3 rebrand. Available next week mornings if you have a slot.
      </p>
    </div>
  </div>
);

const Settings = ({ card, setCard }) => (
  <div className="page-narrow" data-screen-label="07 Settings">
    <Section title="Subscription">
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ width: 56, height: 56, borderRadius: 12, background: 'var(--charcoal)', color: 'var(--sage)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-serif)', fontSize: 24 }}>
          ★
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16, fontWeight: 500 }}>Pro</span>
            <span className="chip dot">Active</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>$4 / month · renews 21 June 2026 · Visa •••• 4242</div>
        </div>
        <button className="btn btn-outline btn-sm">Manage billing</button>
      </div>
    </Section>

    <Section title="Your card URL">
      <div className="card">
        <Field label="Slug" hint="The public URL where your card lives.">
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--line)', borderRadius: 10, background: 'var(--cream)' }}>
            <span style={{ padding: '10px 0 10px 12px', fontSize: 13.5, color: 'var(--muted)' }}>leadcard.app/c/</span>
            <input className="input" style={{ border: 'none', background: 'transparent' }} value={card.slug || 'avery'} onChange={e => setCard({ ...card, slug: e.target.value })}/>
          </div>
        </Field>
        <div style={{ marginTop: 16 }}>
          <Field label="Custom domain (Pro)" hint="Point your own domain — we'll handle the SSL.">
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input mono" placeholder="card.yourdomain.com" style={{ fontSize: 13 }}/>
              <button className="btn btn-outline btn-sm">Connect</button>
            </div>
          </Field>
        </div>
      </div>
    </Section>

    <Section title="Quarterly report">
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--sage-tint)', display: 'grid', placeItems: 'center' }}>
            <Icons.Mail size={18}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Auto-mail every quarter</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>PDF + CSV to {card.email || 'avery@northwind.co'} · Next: 30 June 2026</div>
          </div>
          <div className="toggle on"/>
        </div>
        <hr className="hr"/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--sage-tint)', display: 'grid', placeItems: 'center' }}>
            <Icons.Inbox size={18}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Email me on every new lead</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Real-time alerts when someone submits</div>
          </div>
          <div className="toggle on"/>
        </div>
      </div>
    </Section>

    <Section title="Your data">
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Export everything</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Your card content, leads, and assets in one ZIP. Yours forever.</div>
          </div>
          <button className="btn btn-outline btn-sm"><Icons.Download size={13}/> Download</button>
        </div>
        <hr className="hr"/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#B85C5C' }}>Delete account</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Wipes your card, your leads, your assets. Cannot be undone.</div>
          </div>
          <button className="btn btn-outline btn-sm" style={{ color: '#B85C5C', boxShadow: 'inset 0 0 0 1px rgba(184, 92, 92, 0.3)' }}>Delete</button>
        </div>
      </div>
    </Section>

    <div style={{ marginTop: 24, padding: 20, background: 'var(--cream-2)', borderRadius: 12, fontSize: 12.5, color: 'var(--muted)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <Icons.Lock size={14} stroke="var(--charcoal)"/>
      <div>
        <strong style={{ color: 'var(--charcoal)' }}>Your data lives in its own isolated bucket.</strong> Cards, assets, and leads are scoped to your subscriber ID — nothing is queryable by anyone else on LeadCard. <a style={{ textDecoration: 'underline', cursor: 'pointer' }}>Read the security note →</a>
      </div>
    </div>
  </div>
);

const Share = ({ card }) => (
  <div className="page" data-screen-label="08 Share" style={{ maxWidth: 980 }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
      <div className="card">
        <Section title="QR code">
          <div style={{ background: 'var(--cream)', borderRadius: 12, padding: 32, display: 'grid', placeItems: 'center' }}>
            <FakeQR />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button className="btn btn-outline btn-sm" style={{ flex: 1 }}><Icons.Download size={13}/> PNG</button>
            <button className="btn btn-outline btn-sm" style={{ flex: 1 }}><Icons.Download size={13}/> SVG</button>
            <button className="btn btn-outline btn-sm" style={{ flex: 1 }}><Icons.Download size={13}/> PDF</button>
          </div>
        </Section>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div className="card">
          <Section title="Share link">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--cream)', borderRadius: 10, border: '1px solid var(--line)' }}>
              <span className="mono" style={{ fontSize: 13, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                leadcard.app/c/{card.slug || 'avery'}
              </span>
              <button className="btn btn-sm btn-ghost"><Icons.Copy size={13}/></button>
            </div>
          </Section>
        </div>

        <div className="card">
          <Section title="Email signature">
            <div style={{ padding: 16, background: 'var(--cream)', borderRadius: 10, fontFamily: 'Georgia, serif', fontSize: 13, lineHeight: 1.4, color: 'var(--charcoal)' }}>
              <strong>{card.name}</strong><br/>
              <span style={{ color: 'var(--muted)' }}>{card.title} · {card.company}</span><br/>
              <a style={{ color: 'var(--charcoal)', textDecoration: 'underline' }}>leadcard.app/c/{card.slug || 'avery'}</a>
            </div>
            <button className="btn btn-outline btn-sm" style={{ marginTop: 12 }}><Icons.Copy size={13}/> Copy HTML</button>
          </Section>
        </div>

        <div className="card" style={{ background: 'var(--sage-tint)', border: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Icons.Sparkle size={20}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Order an NFC card</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>R250 once-off · ships in 5 days</div>
            </div>
            <button className="btn btn-primary btn-sm">Order</button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const FakeQR = () => {
  // Generative QR-ish pattern
  const cells = Array.from({ length: 21 * 21 }, (_, i) => {
    const x = i % 21, y = Math.floor(i / 21);
    // Position markers (corners)
    const corner = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
    if (corner) {
      const cx = x < 7 ? 3 : x > 13 ? 17 : 3;
      const cy = y < 7 ? 3 : 17;
      const dx = Math.abs(x - cx), dy = Math.abs(y - cy);
      const d = Math.max(dx, dy);
      return d === 0 || d === 2 || d === 3;
    }
    // Pseudo-random based on position
    return (Math.sin(x * 13.7 + y * 7.3) * 9999) % 1 > 0.5;
  });
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(21, 1fr)', gap: 0, width: 220, height: 220 }}>
      {cells.map((on, i) => (
        <div key={i} style={{ background: on ? 'var(--charcoal)' : 'transparent', aspectRatio: '1/1' }}/>
      ))}
    </div>
  );
};

window.Dashboard = Dashboard;
window.Analytics = Analytics;
window.Leads = Leads;
window.Settings = Settings;
window.Share = Share;
