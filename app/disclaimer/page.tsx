import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Disclaimer — AvantCard' }

export default function DisclaimerPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', padding: '60px 24px 80px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <Link href="/" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 40 }}>
          ← Back
        </Link>

        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 42, fontWeight: 400, letterSpacing: '-0.01em', margin: '0 0 8px' }}>
          Disclaimer
        </h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 48px' }}>AvantCard · Last updated 2025</p>

        <div style={{ fontSize: 15, lineHeight: 1.75, color: 'rgba(23,24,28,0.82)' }}>
          <p style={{ marginTop: 0 }}>
            This digital business card platform does not send unsolicited marketing communications or spam to individuals who interact with a card.
          </p>
          <p>
            When a person views, taps, scans, or otherwise interacts with a digital business card, only card activity and movement-related interaction data are transmitted to and recorded on the platform for reporting, analytics, and dashboard insights.
          </p>
          <p>
            Any personal information voluntarily submitted by a user, including contact details or enquiry information, is stored securely on the card owner&apos;s dashboard and is handled in accordance with applicable data protection and privacy requirements.
          </p>
          <p>
            Personal information is not sold, unlawfully shared, or used for unrelated marketing purposes without the individual&apos;s consent, unless required by law.
          </p>
          <p style={{ marginBottom: 0 }}>
            Reasonable technical and organisational safeguards are applied to help protect stored information against loss, misuse, unauthorised access, disclosure, alteration, or destruction.
          </p>
        </div>

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--line)', display: 'flex', gap: 20, fontSize: 13 }}>
          <Link href="/terms" style={{ color: 'var(--muted)', textDecoration: 'underline' }}>Terms of Service</Link>
          <Link href="/privacy" style={{ color: 'var(--muted)', textDecoration: 'underline' }}>Privacy Policy</Link>
        </div>
      </div>
    </div>
  )
}
