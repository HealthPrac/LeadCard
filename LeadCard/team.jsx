// Team management — small business / enterprise plans
// Each person has their own card (their info + shared brand) and their own callback email.

const Team = ({ card, setCard }) => {
  const [editing, setEditing] = React.useState(null); // person id or 'new' or null
  const [showInvite, setShowInvite] = React.useState(false);

  const team = card.team || [];
  const cap = card.plan === 'enterprise' ? Infinity : 5;
  const isAtCap = team.length >= cap;

  const addPerson = () => setEditing('new');
  const removePerson = (id) => setCard(c => ({ ...c, team: c.team.filter(p => p.id !== id) }));
  const setActive = (id) => setCard(c => {
    const p = c.team.find(p => p.id === id);
    if (!p) return c;
    return {
      ...c,
      activePersonId: id,
      name: `${p.firstName} ${p.lastName}`,
      title: p.title,
      email: p.email,
      phone: p.phone,
      photo: p.photo,
      slug: p.slug,
    };
  });

  return (
    <div className="page" data-screen-label="06 Team" style={{ maxWidth: 1280 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <div>
          <div className="eyebrow">{card.plan === 'enterprise' ? 'Enterprise' : 'Small business'} · {team.length} {team.length === 1 ? 'person' : 'people'}</div>
          <h2 className="display" style={{ fontSize: 32, margin: '6px 0 0' }}>Your team's cards</h2>
          <p style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 6, maxWidth: 620 }}>
            Each person gets their own card URL and their own private callback email. Submissions to their card go to <strong style={{ color: 'var(--charcoal)' }}>them</strong> — and to the shared lead inbox.
          </p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={() => setShowInvite(true)}>
            <Icons.Mail size={13}/> Invite via email
          </button>
          <button className="btn btn-primary btn-sm" onClick={addPerson} disabled={isAtCap}>
            <Icons.Plus size={13} sw={2}/> Add person
          </button>
        </div>
      </div>

      {isAtCap && (
        <div className="card" style={{ background: 'var(--sage-tint)', border: 'none', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
          <Icons.Sparkle size={18}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>You've hit your plan's {cap}-person cap.</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Upgrade to Enterprise to add more.</div>
          </div>
          <button className="btn btn-primary btn-sm">Upgrade</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {team.map(p => (
          <PersonCard
            key={p.id}
            person={p}
            card={card}
            isActive={card.activePersonId === p.id}
            onEdit={() => setEditing(p.id)}
            onSetActive={() => setActive(p.id)}
            onRemove={() => removePerson(p.id)}
          />
        ))}

        {!isAtCap && (
          <button
            onClick={addPerson}
            style={{
              minHeight: 260,
              border: '2px dashed var(--line)',
              borderRadius: 14,
              background: 'transparent',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 10, color: 'var(--muted)',
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 999, background: 'var(--cream-2)', display: 'grid', placeItems: 'center' }}>
              <Icons.Plus size={20}/>
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--charcoal)' }}>Add a person</div>
            <div style={{ fontSize: 11.5 }}>Up to {cap === Infinity ? 'unlimited' : cap} on {card.plan === 'enterprise' ? 'Enterprise' : 'Small business'}</div>
          </button>
        )}
      </div>

      <div style={{ marginTop: 24, padding: 18, background: 'var(--cream-2)', borderRadius: 12, fontSize: 12.5, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icons.Lock size={14} stroke="var(--charcoal)"/>
        <span><strong style={{ color: 'var(--charcoal)' }}>Per-person isolation.</strong> Each person's leads are tagged to their card ID — no cross-team leakage, and they can only see their own submissions unless you grant inbox access.</span>
      </div>

      {editing && (
        <PersonEditor
          person={editing === 'new' ? null : team.find(p => p.id === editing)}
          existing={team}
          companyDomain={(card.email || '').split('@')[1] || 'company.com'}
          onClose={() => setEditing(null)}
          onSave={(person) => {
            setCard(c => {
              if (editing === 'new') {
                return { ...c, team: [...c.team, { ...person, id: 't' + Date.now(), isOwner: false }] };
              }
              return { ...c, team: c.team.map(p => p.id === editing ? { ...p, ...person } : p) };
            });
            setEditing(null);
          }}
        />
      )}

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
    </div>
  );
};

const PersonCard = ({ person, card, isActive, onEdit, onSetActive, onRemove }) => {
  const t = card.theme;
  const initials = `${person.firstName[0] || ''}${person.lastName[0] || ''}`.toUpperCase();
  return (
    <div style={{
      border: '1px solid ' + (isActive ? 'var(--charcoal)' : 'var(--line)'),
      borderRadius: 14, overflow: 'hidden',
      background: 'white',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ background: t.bg, color: t.fg, padding: 22, position: 'relative', minHeight: 130 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{
            width: 54, height: 54, borderRadius: 999,
            background: person.photo ? `url(${person.photo}) center/cover` : `${t.accent}33`,
            display: 'grid', placeItems: 'center',
            fontFamily: 'var(--font-serif)', fontSize: 20,
            border: `1px solid ${t.fg}1A`,
            flexShrink: 0,
          }}>{!person.photo && initials}</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, lineHeight: 1.1, letterSpacing: '-0.01em' }}>
              {person.firstName} {person.lastName}
            </div>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>{person.title}</div>
            {person.isOwner && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 10, padding: '2px 7px', borderRadius: 999, background: `${t.accent}22`, color: t.accent }}>
                <Icons.Star size={10} fill={t.accent} sw={0}/> Owner
              </div>
            )}
          </div>
        </div>
        {isActive && (
          <div style={{ position: 'absolute', top: 14, right: 14, fontSize: 10, padding: '3px 8px', borderRadius: 999, background: t.fg, color: t.bg, fontWeight: 500 }}>
            EDITING
          </div>
        )}
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--muted)' }}>
          <Icons.Mail size={12}/>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{person.email}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--muted)' }}>
          <Icons.Phone size={12}/>
          <span>{person.phone}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--muted)' }}>
          <Icons.Globe size={12}/>
          <span className="mono" style={{ fontSize: 11 }}>leadcard.app/c/{person.slug}</span>
        </div>

        <div style={{ display: 'flex', gap: 6, marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--line-2)' }}>
          <button className="btn btn-sm btn-outline" onClick={onSetActive} style={{ flex: 1, justifyContent: 'center' }}>
            <Icons.Eye size={12}/> Preview
          </button>
          <button className="btn btn-sm btn-outline" onClick={onEdit} style={{ flex: 1, justifyContent: 'center' }}>
            <Icons.Pencil size={12}/> Edit
          </button>
          {!person.isOwner && (
            <button className="icon-btn" onClick={onRemove} title="Remove"><Icons.Trash size={13}/></button>
          )}
        </div>
      </div>
    </div>
  );
};

const PersonEditor = ({ person, existing, companyDomain, onClose, onSave }) => {
  const [form, setForm] = React.useState(person || {
    firstName: '', lastName: '', title: '',
    email: '', phone: '', photo: null, slug: '',
  });
  const update = (k, v) => setForm(f => {
    const next = { ...f, [k]: v };
    if (k === 'firstName' || k === 'lastName') {
      if (!person) {
        next.slug = `${next.firstName}-${next.lastName}`.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '');
      }
    }
    return next;
  });
  const fileRef = React.useRef();
  const onPhoto = (file) => {
    if (!file) return;
    update('photo', URL.createObjectURL(file));
  };

  const slugTaken = existing.some(p => p.slug === form.slug && p.id !== (person?.id));
  const canSave = form.firstName && form.lastName && form.email && form.slug && !slugTaken;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(23,24,28,0.5)', zIndex: 50, display: 'flex', justifyContent: 'flex-end' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 520, background: 'var(--cream)', height: '100%', overflow: 'auto', padding: 28 }}>
        <button className="icon-btn" onClick={onClose} style={{ float: 'right' }}>✕</button>
        <div className="eyebrow">{person ? 'Edit person' : 'Add person'}</div>
        <h2 className="display" style={{ fontSize: 32, margin: '6px 0 24px' }}>
          {person ? `${person.firstName} ${person.lastName}` : 'New team member'}
        </h2>

        <Section title="Headshot">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 80, height: 80, borderRadius: 999,
              background: form.photo ? `url(${form.photo}) center/cover` : 'var(--sage-tint)',
              display: 'grid', placeItems: 'center',
              fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--charcoal)',
              flexShrink: 0, border: '1px solid var(--line)',
            }}>{!form.photo && `${form.firstName[0] || '?'}${form.lastName[0] || ''}`}</div>
            <div style={{ flex: 1 }}>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => onPhoto(e.target.files[0])}/>
              <button className="btn btn-outline btn-sm" onClick={() => fileRef.current.click()}>
                <Icons.Upload size={13}/> {form.photo ? 'Replace photo' : 'Upload headshot'}
              </button>
              <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 8 }}>
                Square crop · 400px or larger · stored in this person's private folder.
              </div>
            </div>
            {form.photo && (
              <button className="icon-btn" onClick={() => update('photo', null)} title="Remove"><Icons.Trash size={13}/></button>
            )}
          </div>
        </Section>

        <Section title="Personal details">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="First name">
              <input className="input" value={form.firstName} onChange={e => update('firstName', e.target.value)} autoFocus/>
            </Field>
            <Field label="Surname">
              <input className="input" value={form.lastName} onChange={e => update('lastName', e.target.value)}/>
            </Field>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Job title">
                <input className="input" value={form.title} onChange={e => update('title', e.target.value)} placeholder="Head of Partnerships"/>
              </Field>
            </div>
          </div>
        </Section>

        <Section title="Callback contact" action={<span className="chip dot" style={{ background: 'var(--sage-tint)' }}>Routes leads here</span>}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Email" hint="Lead emails go to this address.">
              <input className="input" type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder={`firstname@${companyDomain}`}/>
            </Field>
            <Field label="Phone" hint="Shown on the card.">
              <input className="input" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+27 82 555 0144"/>
            </Field>
          </div>
        </Section>

        <Section title="Card URL">
          <Field label="Slug" hint={slugTaken ? <span style={{ color: '#B85C5C' }}>That slug is already taken by another team member.</span> : 'Letters, numbers, dashes.'}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid ' + (slugTaken ? '#B85C5C' : 'var(--line)'), borderRadius: 10, background: 'white' }}>
              <span style={{ padding: '10px 0 10px 12px', fontSize: 13.5, color: 'var(--muted)' }}>leadcard.app/c/</span>
              <input className="input" style={{ border: 'none', background: 'transparent' }}
                value={form.slug}
                onChange={e => update('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}/>
            </div>
          </Field>
        </Section>

        <div style={{ marginTop: 24, padding: 16, background: 'var(--sage-tint)', borderRadius: 10, fontSize: 12.5, display: 'flex', gap: 10 }}>
          <Icons.Mail size={14} style={{ flexShrink: 0, marginTop: 2 }}/>
          <span>
            When someone fills the lead form on <strong>{form.firstName || 'this person'}'s</strong> card, we email <strong>{form.email || 'their address'}</strong> directly and tag the submission with their card ID.
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
          <button className="btn btn-ghost" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(form)} disabled={!canSave} style={{ flex: 1, justifyContent: 'center', opacity: canSave ? 1 : 0.4 }}>
            <Icons.Check size={14} sw={2}/> {person ? 'Save changes' : 'Add to team'}
          </button>
        </div>
      </div>
    </div>
  );
};

const InviteModal = ({ onClose }) => {
  const [emails, setEmails] = React.useState('');
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(23,24,28,0.5)', zIndex: 50, display: 'grid', placeItems: 'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 460, background: 'var(--cream)', borderRadius: 16, padding: 28 }}>
        <div className="eyebrow">Invite via email</div>
        <h2 className="display" style={{ fontSize: 28, margin: '6px 0 16px' }}>Send onboarding links</h2>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
          Your team-mates will get an email with a link to set up their own card under your brand. They fill in their own info — you stay in control of the look.
        </p>
        <Field label="Email addresses" hint="Separate with commas.">
          <textarea className="textarea" rows={3} value={emails} onChange={e => setEmails(e.target.value)} placeholder="lerato@northwind.co, marcus@northwind.co"/>
        </Field>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button className="btn btn-ghost" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
          <button className="btn btn-primary" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>
            <Icons.Mail size={13} sw={2}/> Send invites
          </button>
        </div>
      </div>
    </div>
  );
};

window.Team = Team;
