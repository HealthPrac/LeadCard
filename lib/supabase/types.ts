export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      subscribers: {
        Row: Subscriber
        Insert: Omit<Subscriber, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Subscriber, 'id'>>
        Relationships: []
      }
      cards: {
        Row: Card
        Insert: Omit<Card, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Card, 'id'>>
        Relationships: []
      }
      leads: {
        Row: Lead
        Insert: Omit<Lead, 'id' | 'created_at'>
        Update: Partial<Omit<Lead, 'id'>>
        Relationships: []
      }
      card_events: {
        Row: CardEvent
        Insert: Omit<CardEvent, 'id' | 'occurred_at'>
        Update: never
        Relationships: []
      }
      share_links: {
        Row: ShareLink
        Insert: Omit<ShareLink, 'id' | 'view_count' | 'lead_count' | 'created_at'>
        Update: Partial<Omit<ShareLink, 'id' | 'created_at'>>
        Relationships: []
      }
      card_holder_tokens: {
        Row: CardHolderToken
        Insert: Omit<CardHolderToken, 'id' | 'token' | 'created_at'>
        Update: Partial<Omit<CardHolderToken, 'id'>>
        Relationships: []
      }
      lead_crm: {
        Row: LeadCrm
        Insert: Omit<LeadCrm, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<LeadCrm, 'id'>>
        Relationships: []
      }
      service_ratings: {
        Row: ServiceRating
        Insert: Omit<ServiceRating, 'id' | 'created_at'>
        Update: never
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

export interface Subscriber {
  id: string
  user_id: string
  email: string
  plan: 'solo' | 'small' | 'enterprise'
  payfast_customer_id: string | null
  payfast_subscription_id: string | null
  subscription_status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete'
  trial_ends_at: string | null
  created_at: string
  updated_at: string
}

export interface FormField {
  id: string
  label: string
  required: boolean
  type: 'text' | 'email' | 'tel' | 'textarea'
}

export interface CardLink {
  id: string
  type: string
  label: string
  url: string
}

export interface Card {
  id: string
  subscriber_id: string
  slug: string
  display_name: string | null
  title: string | null
  company: string | null
  email: string | null
  mobile: string | null
  website: string | null
  industry: string | null
  welcome_headline: string | null
  welcome_body: string | null
  cta_primary_label: string | null
  cta_primary_url: string | null
  cta_secondary_label: string | null
  cta_secondary_url: string | null
  form_fields: FormField[]
  lead_destination_email: string | null
  links: CardLink[]
  theme_bg: string
  theme_fg: string
  theme_accent: string
  theme_banner_bg: string | null
  theme_heading: string | null
  theme_subtext: string | null
  theme_font: string
  theme_font_size: string
  photo_path: string | null
  logo_path: string | null
  video_path: string | null
  footer_note: string | null
  google_review_url: string | null
  is_published: boolean
  is_owner_card: boolean
  created_at: string
  updated_at: string
}

export interface ShareLink {
  id: string
  share_token: string
  card_id: string
  subscriber_id: string
  parent_link_id: string | null
  root_link_id: string | null
  channel_type: string
  source_context: string
  forward_depth: number
  view_count: number
  lead_count: number
  created_at: string
  expires_at: string | null
}

export interface CardEvent {
  id: string
  event_name: string
  card_id: string | null
  subscriber_id: string | null
  session_id: string | null
  share_link_id: string | null
  share_source: string | null
  cta_label: string | null
  cta_type: string | null
  device_type: string | null
  referrer_domain: string | null
  country: string | null
  country_code: string | null
  city: string | null
  duration_s: number | null
  payload_json: Json | null
  occurred_at: string
}

export interface Lead {
  id: string
  card_id: string
  subscriber_id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  org: string | null
  role: string | null
  mobile: string | null
  message: string | null
  source: string | null
  consented_at: string
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface CardHolderToken {
  id: string
  card_id: string
  subscriber_id: string
  token: string
  is_active: boolean
  created_at: string
  last_accessed_at: string | null
}

export interface ServiceRating {
  id: string
  card_id: string
  subscriber_id: string
  session_id: string | null
  rating: number
  comment: string | null
  created_at: string
}

export type CrmStatus = 'new' | 'engaged' | 'prospect' | 'client' | 'lost'

export interface LeadCrm {
  id: string
  lead_id: string
  card_id: string
  subscriber_id: string
  status: CrmStatus
  first_engaged_at: string | null
  converted_to_prospect_at: string | null
  converted_to_client_at: string | null
  estimated_income_cents: number | null
  actual_income_cents: number | null
  satisfaction_score: number | null
  industry: string | null
  private_notes: string | null
  experience_notes: string | null
  created_at: string
  updated_at: string
}
