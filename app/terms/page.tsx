import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Terms of Service — AvantCard' }

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', padding: '60px 24px 80px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <Link href="/" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 40 }}>
          ← Back
        </Link>

        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 42, fontWeight: 400, letterSpacing: '-0.01em', margin: '0 0 8px' }}>
          Terms of Service
        </h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 48px' }}>AvantCard · Last updated 2026</p>

        <Section title="1. Introduction">
          These Terms of Service govern access to and use of the AvantCard platform, including its digital business cards, digital business experience features, contact exchange functionality, lead capture, lead tracking, analytics, and related tools and services.
        </Section>

        <Section title="2. Contract Formation">
          A subscription to the AvantCard platform constitutes acceptance of these Terms of Service when the customer completes the relevant online sign-up, checkout, activation, or acceptance process made available by AvantCard. That acceptance creates a legally binding agreement between the subscriber and AvantCard for the provision of hosted software services on a subscription basis, rather than a transfer of ownership in software.
        </Section>

        <Section title="3. Scope of Services">
          AvantCard provides a hosted software platform that may include:
          <ul>
            <li>digital business cards and digital profile experiences;</li>
            <li>sharing and exchange of personal or business contact information;</li>
            <li>lead capture and lead tracking tools;</li>
            <li>dashboard reporting, analytics, and engagement insights; and</li>
            <li>related platform, support, and administrative functionality.</li>
          </ul>
          Access to the platform is provided for the subscription term selected by the customer and remains subject to payment of applicable fees and compliance with these Terms of Service.
        </Section>

        <Section title="4. Acceptance of Platform Terms">
          By subscribing, the customer confirms that it has read, understood, and accepted these Terms of Service, including any incorporated policies, notices, or acceptable use rules published by AvantCard from time to time. The customer further acknowledges that use of the AvantCard platform, including its digital cards, digital business experience tools, and lead tracking features, is subject to these Terms of Service as the default contractual framework for all non-Enterprise subscriptions.
        </Section>

        <Section title="5. Data Processing and Privacy">
          Where personal information is processed through the AvantCard platform, the customer acknowledges that such processing is governed by AvantCard&apos;s applicable privacy documentation and any required data processing terms under POPIA. For standard subscriptions, the customer agrees that any applicable data processing terms may be incorporated into these Terms of Service or published as a standard data processing addendum forming part of the subscription contract with AvantCard.
        </Section>

        <Section title="6. Enterprise Customers">
          Only customers subscribing to an Enterprise plan may receive individually negotiated agreements in addition to or in replacement of all or part of these Terms of Service. Those Enterprise-specific documents may include a separate Master Services Agreement, a negotiated Data Processing Agreement, a Service Level Agreement, and any approved order form or commercial schedule. Unless AvantCard expressly signs or accepts a separate Enterprise agreement in writing, the customer&apos;s subscription remains governed solely by these Terms of Service.
        </Section>

        <Section title="7. No Separate DPA for Standard Plans">
          Subscribers on standard, self-service, or non-Enterprise plans do not receive individual negotiated DPAs, SLAs, or bespoke service contracts unless AvantCard expressly agrees otherwise in writing. For those subscribers, acceptance of these Terms of Service forms the contractual basis of the relationship with AvantCard, and any standard privacy or data processing terms made available by AvantCard apply on a uniform basis across those plans.
        </Section>

        <Section title="8. Customer Responsibilities">
          The customer is responsible for ensuring that:
          <ul>
            <li>the person accepting these Terms has authority to bind the customer, where the subscription is for a business or organisation;</li>
            <li>information submitted to AvantCard is accurate and lawful;</li>
            <li>use of the platform complies with all applicable laws, including data protection and privacy requirements; and</li>
            <li>any personal information uploaded, shared, or collected through the platform is processed with the necessary permissions or lawful basis.</li>
          </ul>
        </Section>

        <Section title="9. Changes to Terms">
          AvantCard may update these Terms of Service from time to time. Continued use of the platform after updated terms become effective constitutes acceptance of the revised terms, to the extent permitted by applicable law.
        </Section>

        <Section title="10. Governing Law">
          These Terms of Service are governed by the laws of South Africa, including principles applicable to electronic contracting and, where relevant, POPIA obligations relating to the processing of personal information.
        </Section>

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--line)', display: 'flex', gap: 20, fontSize: 13 }}>
          <Link href="/privacy" style={{ color: 'var(--muted)', textDecoration: 'underline' }}>Privacy Policy</Link>
          <Link href="/disclaimer" style={{ color: 'var(--muted)', textDecoration: 'underline' }}>Disclaimer</Link>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em', margin: '0 0 10px' }}>{title}</h2>
      <div style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(23,24,28,0.78)' }}>{children}</div>
    </div>
  )
}
