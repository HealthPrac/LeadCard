// Shared UI primitives + sample data

const SAMPLE_CARD = {
  // Plan + team
  plan: 'small',  // 'solo' | 'small' | 'enterprise'
  team: [
    {
      id: 't1', firstName: 'Avery', lastName: 'Quinn',
      title: 'Founder & CEO', email: 'avery@northwind.co', phone: '+27 82 555 0144',
      photo: null, slug: 'avery', isOwner: true,
    },
    {
      id: 't2', firstName: 'Lerato', lastName: 'Khumalo',
      title: 'Head of Partnerships', email: 'lerato@northwind.co', phone: '+27 82 555 0188',
      photo: null, slug: 'lerato', isOwner: false,
    },
    {
      id: 't3', firstName: 'Marcus', lastName: 'Webb',
      title: 'Senior Account Director', email: 'marcus@northwind.co', phone: '+27 82 555 0199',
      photo: null, slug: 'marcus', isOwner: false,
    },
  ],
  activePersonId: 't1',   // which team member's card is being edited

  // NFC
  nfc: {
    enabled: false,        // user has opted in to NFC features
    orderedCards: 0,       // # of physical cards ordered
    writeUrl: '',          // URL written to their own NFC tags
  },

  // Identity (mirrors activePerson but kept here for compatibility)
  name: 'Avery Quinn',
  title: 'Founder & CEO',
  company: 'Northwind Studio',
  tagline: 'Brand · strategy · interfaces',
  email: 'avery@northwind.co',
  phone: '+27 82 555 0144',
  website: 'https://northwind.co',
  location: 'Cape Town, ZA',
  bio: 'Building tools that help small teams look big.',
  photo: null,
  slug: 'avery',

  // Welcome screen
  welcomeKicker: 'Hello there —',
  welcomeHeading: "I'm glad we connected.",
  welcomeSubheading: 'Take a moment to learn how we can work together.',
  ctaWatch: 'Watch our intro',
  ctaShare: 'Share my card',

  // Intro video
  videoUrl: '',           // empty = uses placeholder reel
  videoLength: 57,        // seconds
  videoAutoplay: true,
  skipLabel: 'Skip →',

  // After-video CTAs
  ctaPrimaryLabel: 'Visit the website',
  ctaPrimaryUrl:   'https://northwind.co',
  ctaSecondaryLabel: 'Request a call',

  // Lead capture form
  formHeading: 'Request a callback',
  formSubheading: 'Leave your details — we will be in touch within one business day.',
  formFields: [
    { id: 'firstName', label: 'First name',   required: true,  enabled: true,  type: 'text' },
    { id: 'lastName',  label: 'Last name',    required: true,  enabled: true,  type: 'text' },
    { id: 'email',     label: 'Email',        required: true,  enabled: true,  type: 'email' },
    { id: 'org',       label: 'Organisation', required: true,  enabled: true,  type: 'text' },
    { id: 'role',      label: 'Role',         required: false, enabled: true,  type: 'text' },
    { id: 'mobile',    label: 'Mobile',       required: false, enabled: true,  type: 'tel' },
  ],
  consentText: 'I consent to being contacted about my enquiry.',
  submitLabel: 'Send request',

  // Confirmation
  confirmHeading: 'Thank you.',
  confirmBody:    "Your request is in. We'll reach out within one business day.",
  confirmCTA:     'Back to card',

  // Theme
  theme: {
    bg: '#17181C',
    fg: '#F6F7F3',
    accent: '#8FAF9D',
    fontDisplay: 'Instrument Serif',
    fontBody: 'Geist',
    fontSizeDisplay: 38,   // px — for the hero name
    fontSizeBody: 16,      // px — for body copy
  },

  links: [
    { kind: 'linkedin', label: 'LinkedIn', url: 'linkedin.com/in/aquinn' },
    { kind: 'calendar', label: 'Book a call', url: 'cal.com/avery' },
    { kind: 'other',    label: 'Portfolio', url: 'northwind.co/work' },
  ],
};

const PALETTES = [
  { name: 'Charcoal · Sage',  bg: '#17181C', fg: '#F6F7F3', accent: '#8FAF9D' },
  { name: 'Ink · Cream',      bg: '#23262B', fg: '#F6F7F3', accent: '#DCE6DE' },
  { name: 'Sage · Charcoal',  bg: '#8FAF9D', fg: '#17181C', accent: '#17181C' },
  { name: 'Cream · Charcoal', bg: '#F6F7F3', fg: '#17181C', accent: '#8FAF9D' },
  { name: 'Espresso · Gold',  bg: '#2B221C', fg: '#F7EFE5', accent: '#C9A878' },
  { name: 'Midnight · Sky',   bg: '#0F1A2B', fg: '#E8EEF7', accent: '#7AA8D8' },
  { name: 'Rust · Cream',     bg: '#3A1F1A', fg: '#F7E9DF', accent: '#D08562' },
  { name: 'Plum · Lilac',     bg: '#2A1B2E', fg: '#F2E6F4', accent: '#B084BF' },
];

// Font pairings — display + body together for sensible defaults
const FONT_PAIRS = [
  { name: 'Editorial',  display: 'Instrument Serif', body: 'Geist' },
  { name: 'Classic',    display: 'Playfair Display', body: 'Inter' },
  { name: 'Modern',     display: 'Fraunces',         body: 'Geist' },
  { name: 'Bold sans',  display: 'Space Grotesk',    body: 'Space Grotesk' },
  { name: 'Refined',    display: 'Cormorant Garamond', body: 'Geist' },
  { name: 'Tech',       display: 'Geist Mono',       body: 'Geist' },
  { name: 'Warm',       display: 'DM Serif Display', body: 'DM Sans' },
  { name: 'Clinical',   display: 'Manrope',          body: 'Manrope' },
];

const DISPLAY_FONTS = ['Instrument Serif', 'Playfair Display', 'Fraunces', 'Space Grotesk', 'Cormorant Garamond', 'Geist Mono', 'DM Serif Display', 'Manrope', 'Geist'];
const BODY_FONTS    = ['Geist', 'Inter', 'Manrope', 'DM Sans', 'Space Grotesk', 'IBM Plex Sans'];

const Section = ({ title, action, children, style }) => (
  <section style={{ marginBottom: 28, ...style }}>
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
      <h3 style={{ margin: 0, fontSize: 13, fontWeight: 500, letterSpacing: '0.005em' }}>{title}</h3>
      {action}
    </div>
    {children}
  </section>
);

const Field = ({ label, hint, children }) => (
  <div className="field">
    <label>{label}</label>
    {children}
    {hint && <div className="hint">{hint}</div>}
  </div>
);

const Stat = ({ label, value, delta, trend }) => (
  <div className="stat">
    <div className="label">{label}</div>
    <div className="value">{value}</div>
    {delta && (
      <div className={"delta" + (trend === 'down' ? ' neg' : '')}>
        {trend === 'down' ? '↓' : '↑'} {delta}
      </div>
    )}
  </div>
);

const SAMPLE_LEADS = [
  { name: 'Priya Naidoo',     email: 'priya@catalystgroup.za',  company: 'Catalyst Group',     when: '2h ago',  source: 'QR · Conference',  intent: 'Demo' },
  { name: 'Marcus Webb',      email: 'm.webb@brightlane.co',    company: 'Brightlane',         when: '6h ago',  source: 'NFC tap',          intent: 'Partnership' },
  { name: 'Jenna Olofsson',   email: 'jenna@hivework.io',       company: 'Hivework Studio',    when: 'Yesterday', source: 'Email signature', intent: 'Quote' },
  { name: 'David Park',       email: 'david.park@northstar.app',company: 'Northstar',          when: 'Yesterday', source: 'LinkedIn',         intent: 'Coffee' },
  { name: 'Lerato Khumalo',   email: 'lerato@altitude.za',      company: 'Altitude Co.',       when: '2d ago',  source: 'QR · Conference',  intent: 'Demo' },
  { name: 'Sofia Bernal',     email: 'sb@orbit.studio',         company: 'Orbit Studio',       when: '3d ago',  source: 'Direct link',      intent: 'Hiring' },
  { name: 'Tom Achebe',       email: 'tom@reflex.work',         company: 'Reflex',             when: '4d ago',  source: 'NFC tap',          intent: 'Demo' },
  { name: 'Hannah Linder',    email: 'h.linder@flintco.de',     company: 'Flint Co.',          when: '5d ago',  source: 'QR · Conference',  intent: 'Quote' },
];

// Helper: derive font-family stack from display name
const fontStack = (name, kind = 'sans') => {
  if (!name) return kind === 'serif' ? 'Georgia, serif' : 'system-ui, sans-serif';
  if (/serif|fraunces|playfair|cormorant|garamond/i.test(name)) return `"${name}", Georgia, serif`;
  if (/mono/i.test(name)) return `"${name}", ui-monospace, monospace`;
  return `"${name}", system-ui, sans-serif`;
};

window.Section = Section;
window.Field = Field;
window.Stat = Stat;
window.SAMPLE_CARD = SAMPLE_CARD;
window.PALETTES = PALETTES;
window.FONT_PAIRS = FONT_PAIRS;
window.DISPLAY_FONTS = DISPLAY_FONTS;
window.BODY_FONTS = BODY_FONTS;
window.SAMPLE_LEADS = SAMPLE_LEADS;
window.fontStack = fontStack;
