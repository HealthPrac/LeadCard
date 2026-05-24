import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Privacy Policy — AvantCard' }

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', padding: '60px 24px 80px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <Link href="/" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 40 }}>
          ← Back
        </Link>

        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 42, fontWeight: 400, letterSpacing: '-0.01em', margin: '0 0 8px' }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 48px' }}>AvantCard · POPIA-aligned · Last updated 2025</p>

        <Section title="1. Purpose of this Policy">
          This Privacy Policy explains how personal information is collected, used, stored, and shared through the AvantCard digital business card application in accordance with the Protection of Personal Information Act, 4 of 2013 (POPIA). This application enables users to share their personal and business information with other people through a digital business card. In doing so, the platform processes personal information on its backend systems for defined business and service-delivery purposes.
        </Section>

        <Section title="2. Roles under POPIA">
          The app operator is the responsible party where it determines the purpose and means of processing personal information, while HealthPrac Solutions acts as the designated third-party service provider only to the extent that it processes personal information on instruction or under mandate. Under POPIA, a responsible party must ensure compliance with the conditions for lawful processing and must ensure that any operator processes information under appropriate security and confidentiality obligations in terms of a written contract.
        </Section>

        <Section title="3. Personal Information Collected">
          The platform may process the following categories of personal information:
          <ul>
            <li>Profile and business card information voluntarily uploaded or shared by users, such as names, job titles, organisation names, contact numbers, email addresses, websites, and related professional details.</li>
            <li>Interaction data generated when a person views, taps, scans, submits information through, or otherwise interacts with a digital business card.</li>
            <li>Enquiry or contact information voluntarily submitted by a person engaging with a card.</li>
          </ul>
          Personal information is collected directly from the user or from the individual who voluntarily chooses to engage with a digital business card and submit information through the platform.
        </Section>

        <Section title="4. Purpose of Processing">
          Personal information is processed only for specific, explicit, and lawful purposes, including:
          <ul>
            <li>Enabling the creation, hosting, and sharing of digital business cards.</li>
            <li>Allowing users to exchange contact or enquiry information with others.</li>
            <li>Recording card activity and engagement analytics for dashboard reporting and service insights.</li>
            <li>Maintaining backend records required for platform administration, support, service improvement, and security.</li>
            <li>Facilitating limited operational sharing with HealthPrac Solutions as the sole third-party service provider involved in the delivery or support of the service.</li>
          </ul>
          Personal information is not processed for resale, is not sold to data brokers, and is not used for unrelated direct marketing without the relevant data subject&apos;s consent, unless processing is otherwise permitted or required by law.
        </Section>

        <Section title="5. Lawful Basis for Processing">
          Processing takes place on one or more lawful grounds recognised under POPIA, including where:
          <ul>
            <li>the data subject has consented to the processing;</li>
            <li>processing is necessary to conclude or perform a service involving the data subject;</li>
            <li>processing is necessary to pursue the legitimate interests of the platform or the user, in a manner that does not unreasonably prejudice the data subject; or</li>
            <li>processing is required or authorised by law.</li>
          </ul>
          Where consent is relied upon, it is voluntary, specific, and informed.
        </Section>

        <Section title="6. Sharing of Personal Information">
          Personal information may be shared in the following ways:
          <ul>
            <li>Between users and other persons where the user intentionally shares information through a digital business card.</li>
            <li>On the backend systems of the platform for storage, administration, analytics, service delivery, and support.</li>
            <li>With HealthPrac Solutions, which is the only third-party service provider authorised to receive or process personal information for purposes connected to the operation, support, or delivery of the app&apos;s services.</li>
          </ul>
          No personal information is shared for resale purposes. No additional third parties may receive personal information for unrelated commercial exploitation unless the data subject has consented or disclosure is required by law.
        </Section>

        <Section title="7. Operator and Third-Party Safeguards">
          Where HealthPrac Solutions processes personal information on behalf of the platform, that processing takes place subject to a written agreement requiring confidentiality, appropriate technical and organisational security measures, and prompt notification if unauthorised access or acquisition is suspected. Any person processing personal information on behalf of the responsible party must do so only with the responsible party&apos;s knowledge or authorisation and must treat that information as confidential unless disclosure is required by law or necessary for the proper performance of duties.
        </Section>

        <Section title="8. Security Measures">
          Reasonable technical and organisational safeguards are implemented to protect personal information against loss, misuse, unauthorised access, disclosure, alteration, or destruction, as required by POPIA. These safeguards may include access controls, authentication measures, secure storage practices, system monitoring, contractual confidentiality obligations, and internal restrictions on who may access personal information.
        </Section>

        <Section title="9. Retention and Deletion">
          Personal information is retained only for as long as reasonably necessary to fulfil the purpose for which it was collected, to provide the service, to maintain lawful business records, or to comply with legal obligations. When personal information is no longer required, it is deleted, destroyed, or de-identified in accordance with applicable legal and operational requirements.
        </Section>

        <Section title="10. Data Subject Rights">
          Subject to POPIA, data subjects have the right to:
          <ul>
            <li>be notified that personal information is being collected;</li>
            <li>access their personal information;</li>
            <li>request correction, deletion, or destruction of personal information where appropriate;</li>
            <li>object to certain forms of processing on reasonable grounds;</li>
            <li>object to direct marketing; and</li>
            <li>be notified where unauthorised access to personal information has occurred, where required by law.</li>
          </ul>
          Requests relating to personal information should be submitted through the contact channel or Information Officer details made available by the platform.
        </Section>

        <Section title="11. Cross-Border Transfers">
          If personal information is stored or processed outside South Africa, this will occur only where permitted by POPIA, including where the recipient is subject to laws, binding agreements, or safeguards that provide an adequate level of protection, or where another lawful ground for transfer applies.
        </Section>

        <Section title="12. Complaints">
          A data subject who believes that personal information has been processed contrary to POPIA may lodge a complaint with the Information Regulator of South Africa.
        </Section>

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--line)', display: 'flex', gap: 20, fontSize: 13 }}>
          <Link href="/terms" style={{ color: 'var(--muted)', textDecoration: 'underline' }}>Terms of Service</Link>
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
