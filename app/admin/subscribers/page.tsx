import { getSubscriberList } from '@/lib/admin/queries'
import SubscribersClient from './SubscribersClient'

export default async function SubscribersPage() {
  const subscribers = await getSubscriberList()

  const total    = subscribers.length
  const active   = subscribers.filter(s => s.subscription_status === 'active').length
  const trialing = subscribers.filter(s => s.subscription_status === 'trialing').length

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--sage)', marginBottom: 6 }}>
          Admin Console
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 34, fontWeight: 400, margin: 0, letterSpacing: '-0.01em' }}>
            Subscribers
          </h1>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>
            {total} total · {active} active · {trialing} trialing
          </span>
        </div>
      </div>

      <SubscribersClient subscribers={subscribers} />

      <p style={{ fontSize: 11, color: 'var(--muted-2)', marginTop: 14, lineHeight: 1.6 }}>
        ⚠️ This data is visible to platform administrators only. Handle in accordance with POPIA §21 — do not export, screenshot, or share outside of authorised HPS personnel.
      </p>
    </div>
  )
}
