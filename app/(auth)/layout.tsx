import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/AvantCard_logo.svg" alt="AvantCard" height={36} style={{ display: 'block', margin: '0 auto' }} />
        </div>
        {children}
      </div>
      <div style={{ marginTop: 32, display: 'flex', gap: 20, fontSize: 12, color: 'var(--muted)' }}>
        <Link href="/terms" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Terms</Link>
        <Link href="/privacy" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Privacy</Link>
        <Link href="/disclaimer" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Disclaimer</Link>
      </div>
    </div>
  )
}
