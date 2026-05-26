'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { Card } from '@/lib/supabase/types'

export async function getCardsBySubscriber(subscriberId: string): Promise<Card[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('cards')
    .select('*')
    .eq('subscriber_id', subscriberId)
    .order('created_at', { ascending: true })

  return data ?? []
}

export async function getPublicCard(slug: string): Promise<Card | null> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('cards')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  return data
}

/**
 * Fetches a card by slug regardless of published status, and checks whether
 * the subscriber has deactivated (cancellation/deletion effective date passed).
 * Used by the public card page to decide between: render card | inactive screen | 404.
 */
export async function getPublicCardWithStatus(slug: string): Promise<{
  card: Card | null
  isDeactivated: boolean
}> {
  const supabase = createServiceClient()

  // Get card (no is_published filter — we need to know if it exists at all)
  const { data: card } = await supabase
    .from('cards')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!card) return { card: null, isDeactivated: false }

  // Check subscriber deactivation status
  const { data: subscriber } = await supabase
    .from('subscribers')
    .select('subscription_status, effective_end_date')
    .eq('id', (card as Card).subscriber_id)
    .single()

  if (!subscriber) {
    return { card: (card as Card).is_published ? (card as Card) : null, isDeactivated: false }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const effectiveEnd = (subscriber as any).effective_end_date
    ? new Date((subscriber as any).effective_end_date)
    : null

  const deactivatedStatuses = ['canceling', 'pending_deletion', 'canceled']
  const isDeactivated =
    deactivatedStatuses.includes((subscriber as any).subscription_status ?? '') &&
    effectiveEnd !== null &&
    today >= effectiveEnd

  if (isDeactivated) {
    // Return the card for metadata purposes even if unpublished
    return { card: card as Card, isDeactivated: true }
  }

  return {
    card: (card as Card).is_published ? (card as Card) : null,
    isDeactivated: false,
  }
}

export async function createCard(subscriberId: string, data: {
  slug: string
  display_name: string
  title?: string
  company?: string
  email?: string
  phone?: string
  website?: string
  theme_bg: string
  theme_fg: string
  theme_accent: string
  lead_destination_email?: string
}): Promise<Card> {
  const supabase = createServiceClient()
  const { data: card, error } = await supabase
    .from('cards')
    .insert({ subscriber_id: subscriberId, is_published: true, ...data })
    .select()
    .single()

  if (error) throw error
  return card
}

export async function updateCard(cardId: string, updates: Partial<Card>): Promise<Card> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('cards')
    .update(updates)
    .eq('id', cardId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function isSlugAvailable(slug: string): Promise<boolean> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('cards')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  return !data
}

export async function getSignedUploadUrl(subscriberId: string, bucket: 'card-assets' | 'card-videos', filename: string) {
  const supabase = await createClient()
  const path = `${subscriberId}/${Date.now()}-${filename}`
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(path)

  if (error) throw error
  return { signedUrl: data.signedUrl, path }
}

export async function getSignedReadUrl(bucket: 'card-assets' | 'card-videos', path: string, expiresIn = 3600) {
  const supabase = createServiceClient()
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)

  if (error) return null
  return data.signedUrl
}
