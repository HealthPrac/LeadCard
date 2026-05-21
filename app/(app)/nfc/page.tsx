import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function NfcPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: subscriber } = await supabase.from('subscribers').select('id').eq('user_id', user.id).single()
  if (!subscriber) redirect('/onboarding')

  const { data: cards } = await supabase.from('cards').select('id, slug').eq('subscriber_id', subscriber.id).order('created_at').limit(1)
  const card = cards?.[0]
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://leadcard.app'

  return (
    <div style={{ maxWidth: 700 }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, margin: '0 0 6px', letterSpacing: '-0.01em' }}>NFC card</h1>
      <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 32px' }}>Tap-to-share physical cards, pre-programmed with your LeadCard URL.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
        {/* Card visual */}
        <div style={{ padding: 28, borderRadius: 16, background: 'var(--charcoal)', color: 'var(--cream)', minHeight: 180, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
          <div style={{ fontSize: 12, opacity: 0.5, fontFamily: 'var(--font-mono)' }}>NFC · LeadCard</div>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, letterSpacing: '-0.01em', marginBottom: 4 }}>Physical card</div>
            {card && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, opacity: 0.6 }}>{appUrl}/c/{card.slug}</div>}
          </div>
          {/* Decorative */}
          <div style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)' }} />
          <div style={{ position: 'absolute', right: -50, top: -50, width: 180, height: 180, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'absolute', right: 18, bottom: 18, opacity: 0.3, fontSize: 28 }}>⬡</div>
        </div>

        {/* Order info */}
        <div style={{ padding: 24, borderRadius: 14, background: 'white', border: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 6 }}>What you get</div>
            <ul style={{ margin: 0, padding: '0 0 0 18px', fontSize: 13.5, lineHeight: 2, color: 'var(--charcoal)' }}>
              <li>PVC or metal card (your choice)</li>
              <li>Pre-programmed NFC chip</li>
              <li>Your card URL printed on reverse</li>
              <li>Ships within 5 business days</li>
            </ul>
          </div>
          <div style={{ marginTop: 'auto' }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 4 }}>Pricing</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, lineHeight: 1 }}>R 349</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>per card, free shipping in SA</div>
          </div>
        </div>
      </div>

      {/* Write your own tag */}
      <div style={{ padding: 24, borderRadius: 14, background: 'var(--sage-tint)', border: '1px solid var(--line)', marginBottom: 16 }}>
        <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 6 }}>Already have an NFC tag or card?</div>
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 12px' }}>
          Use any NFC writer app (NFC Tools, TagWriter) and program it to open your card URL:<br />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, background: 'white', padding: '2px 8px', borderRadius: 4, display: 'inline-block', marginTop: 4 }}>
            {card ? `${appUrl}/c/${card.slug}` : 'Create your card first'}
          </span>
        </p>
      </div>

      {/* CTA */}
      <div style={{ padding: 24, borderRadius: 14, background: 'white', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>Order your NFC card</div>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>NFC card ordering is coming very soon. Join the waitlist to be first.</p>
        </div>
        <button disabled style={{ padding: '10px 20px', background: 'var(--charcoal)', color: 'var(--cream)', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'not-allowed', opacity: 0.5, fontFamily: 'inherit', flexShrink: 0 }}>
          Coming soon
        </button>
      </div>
    </div>
  )
}
