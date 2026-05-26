import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

      {/* ── Left panel — dark brand ── */}
      <div style={{
        background: '#17171C',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px 52px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Copper glow */}
        <div style={{
          position: 'absolute', bottom: '-80px', left: '-60px',
          width: 480, height: 480,
          background: 'radial-gradient(ellipse, rgba(184,116,62,0.14) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'absolute', top: 0, right: 0, width: 1, bottom: 0, background: 'linear-gradient(180deg, transparent, rgba(184,116,62,0.2), transparent)' }} />

        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1 }}>
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="8" fill="#27272f"/>
            <path d="M20 8 L28 24 H12 Z" fill="none" stroke="#B8743E" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M14 24 L26 24" stroke="#B8743E" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="20" cy="30" r="2.5" fill="#D4975A" opacity="0.6"/>
          </svg>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 19, fontWeight: 500, letterSpacing: '0.03em', color: 'rgba(249,247,243,0.85)' }}>
            Avant<span style={{ color: 'var(--copper)' }}>Card</span>
          </span>
        </Link>

        {/* Tagline block */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--copper)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ display: 'block', width: 24, height: 1, background: 'var(--copper)' }} />
            Premium Digital Identity
          </div>
          <blockquote style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(24px,3vw,34px)', fontWeight: 300, lineHeight: 1.2, color: 'rgba(249,247,243,0.88)', margin: '0 0 20px', fontStyle: 'italic' }}>
            &ldquo;Your business card<br />is an experience.&rdquo;
          </blockquote>
          <p style={{ fontSize: 13.5, fontWeight: 300, color: 'rgba(249,247,243,0.42)', lineHeight: 1.7, margin: 0, maxWidth: 320 }}>
            Premium digital cards with intro video, QR access, and built-in lead intelligence — for professionals who leave a lasting impression.
          </p>
        </div>

        {/* Footer legal */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 20, fontSize: 11, color: 'rgba(249,247,243,0.22)' }}>
          <Link href="/terms" style={{ color: 'rgba(249,247,243,0.22)', textDecoration: 'none' }}>Terms</Link>
          <Link href="/privacy" style={{ color: 'rgba(249,247,243,0.22)', textDecoration: 'none' }}>Privacy</Link>
          <Link href="/disclaimer" style={{ color: 'rgba(249,247,243,0.22)', textDecoration: 'none' }}>Disclaimer</Link>
          <span style={{ marginLeft: 'auto' }}>Powered by Tech-Tok</span>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div style={{
        background: '#F9F7F3',
        color: '#17171C',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '60px 52px',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          {children}
        </div>
      </div>

    </div>
  )
}
