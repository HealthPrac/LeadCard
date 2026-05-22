import { getPublicCard, getSignedReadUrl } from '@/lib/cards/actions'
import { CardExperience } from '@/components/card/CardExperience'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params
  const card = await getPublicCard(slug)
  if (!card) return { title: 'LeadCard' }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://leadcard.app'

  return {
    title: `${card.display_name ?? 'LeadCard'} — ${card.company ?? 'LeadCard'}`,
    description: card.welcome_headline ?? `Connect with ${card.display_name}`,
    openGraph: { title: `${card.display_name}`, description: card.welcome_headline ?? '' },
    manifest: `${appUrl}/api/card-manifest/${slug}`,
    icons: {
      apple: `${appUrl}/api/card-icon/${slug}`,
    },
  }
}

export default async function PublicCardPage({ params }: Props) {
  const { slug } = params
  const card = await getPublicCard(slug)
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
    <CardExperience
      card={card}
      resolvedPhotoUrl={photoUrl}
      resolvedVideoUrl={videoUrl}
      resolvedLogoUrl={logoUrl}
    />
  )
}
