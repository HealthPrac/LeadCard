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
  theme_font: string
  theme_font_size: string
  photo_path: string | null
  logo_path: string | null
  video_path: string | null
  is_published: boolean
  is_owner_card: boolean
  created_at: string
  updated_at: string
}

export interface Lead {
  id: string
  card_id: string
  subscriber_id: string
  first_name: string | null
  last_name: string | null
  email: string
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
