import { getPublicCardWithStatus, getSignedReadUrl } from '@/lib/cards/actions'
import { CardExperience } from '@/components/card/CardExperience'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params
  const { card, isDeactivated } = await getPublicCardWithStatus(slug)

  if (!card || isDeactivated) {
    return { title: 'AvantCard — Card no longer active' }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://leadcard.app'

  return {
    title: `${card.display_name ?? 'AvantCard'} — ${card.company ?? 'AvantCard'}`,
    description: card.welcome_headline ?? `Connect with ${card.display_name}`,
    openGraph: { title: `${card.display_name}`, description: card.welcome_headline ?? '' },
    manifest: `${appUrl}/api/card-manifest/${slug}`,
    icons: {
      icon: `${appUrl}/api/card-icon/${slug}`,
      apple: `${appUrl}/api/card-icon/${slug}`,
    },
  }
}

export default async function PublicCardPage({ params }: Props) {
  const { slug } = params
  const { card, isDeactivated } = await getPublicCardWithStatus(slug)

  if (isDeactivated) return <CardDeactivatedScreen />
  if (!card) notFound()

  // Resolve signed URLs server-side — never expose storage paths to the browser
  const photoUrl = card.photo_path
    ? await getSignedReadUrl('card-assets', card.photo_path, 3600)
    : null

  const videoUrl = card.video_path
    ? await getSignedReadUrl('card-videos', card.video_path, 3600)
    : null

  const logoUrl = card.logo_path
    ? await getSignedReadUrl('card-assets', card.logo_path, 3600)
    : null

  return (
    <div className="card-page-outer">
      <div className="card-page-inner">
        <CardExperience
          card={card}
          resolvedPhotoUrl={photoUrl}
          resolvedVideoUrl={videoUrl}
          resolvedLogoUrl={logoUrl}
        />
      </div>
    </div>
  )
}

// ── Deactivated card screen ───────────────────────────────────────────────────
function CardDeactivatedScreen() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://leadcard.app'

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#17181C',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 320 }}>

        {/* Diamond mark */}
        <div style={{
          fontSize: 36,
          color: '#8FAF9D',
          marginBottom: 28,
          letterSpacing: '-0.02em',
        }}>
          ◈
        </div>

        {/* Brand */}
        <div style={{
          fontFamily: 'Georgia, serif',
          fontSize: 20,
          color: '#F6F7F3',
          letterSpacing: '-0.01em',
          marginBottom: 4,
        }}>
          AvantCard
        </div>

        {/* Divider */}
        <div style={{
          width: 28,
          height: 1,
          background: 'rgba(246,247,243,0.12)',
          margin: '18px auto',
        }} />

        {/* Message */}
        <p style={{
          fontSize: 15,
          color: 'rgba(246,247,243,0.45)',
          lineHeight: 1.65,
          margin: '0 0 10px',
        }}>
          This card is no longer in use.
        </p>
        <p style={{
          fontSize: 13,
          color: 'rgba(246,247,243,0.25)',
          lineHeight: 1.6,
          margin: '0 0 36px',
        }}>
          The cardholder has ended their subscription.
        </p>

        {/* CTA */}
        <a
          href={appUrl}
          style={{
            display: 'inline-block',
            padding: '11px 22px',
            background: 'rgba(246,247,243,0.06)',
            border: '1px solid rgba(246,247,243,0.12)',
            borderRadius: 9,
            color: 'rgba(246,247,243,0.65)',
            textDecoration: 'none',
            fontSize: 13.5,
            letterSpacing: '0.01em',
          }}
        >
          Create your own AvantCard →
        </a>

      </div>
    </div>
  )
}
