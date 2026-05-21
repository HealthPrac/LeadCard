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
