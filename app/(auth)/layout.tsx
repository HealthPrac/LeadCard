export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--charcoal)', display: 'grid', placeItems: 'center', color: 'var(--sage)', fontFamily: 'var(--font-serif)', fontSize: 22, lineHeight: 1, paddingBottom: 2 }}>L</div>
            <span style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em' }}>LeadCard</span>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
