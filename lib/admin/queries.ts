// All admin queries. Uses service client — bypasses RLS.
// Returns aggregate/business data only; email surfaces only in subscriber list
// (legitimate internal use by platform owner/data controller).

import { createServiceClient } from '@/lib/supabase/server'

// ── Overview ─────────────────────────────────────────────────────────────────

export async function getAdminOverview() {
  const service = createServiceClient()

  const [subscribersRes, cardsRes, leadsRes, eventsRes] = await Promise.all([
    service.from('subscribers').select('id, subscription_status, plan, country, created_at'),
    service.from('cards').select('id, subscriber_id, industry, is_owner_card'),
    service.from('leads').select('subscriber_id, source, created_at'),
    service.from('card_events').select('id, event_name, subscriber_id, occurred_at').limit(50000),
  ])

  const subscribers = subscribersRes.data ?? []
  const cards = cardsRes.data ?? []
  const leads = leadsRes.data ?? []
  const events = eventsRes.data ?? []

  // Platform-wide event totals
  const totalViews = events.filter(e => e.event_name === 'card_view_started').length
  const totalFormSubmits = events.filter(e => e.event_name === 'lead_form_submitted').length
  const platformConvRate = totalViews > 0 ? Number(((totalFormSubmits / totalViews) * 100).toFixed(1)) : 0

  // Summary
  const byStatus = (s: string) => subscribers.filter(x => x.subscription_status === s).length
  const summary = {
    total:           subscribers.length,
    active:          byStatus('active'),
    trialing:        byStatus('trialing'),
    churned:         byStatus('canceled') + byStatus('past_due'),
    totalLeads:      leads.length,
    totalCards:      cards.length,
    totalViews,
    platformConvRate,
  }

  // Plans
  const plans = {
    solo:       subscribers.filter(s => s.plan === 'solo').length,
    small:      subscribers.filter(s => s.plan === 'small').length,
    enterprise: subscribers.filter(s => s.plan === 'enterprise').length,
  }

  // Industry → subscriber count + lead count
  const subToIndustry = new Map<string, string>()
  for (const c of cards) {
    if (c.is_owner_card && c.industry) subToIndustry.set(c.subscriber_id, c.industry)
  }
  const industrySubs  = new Map<string, number>()
  const industryLeads = new Map<string, number>()
  for (const [sid, ind] of subToIndustry) {
    industrySubs.set(ind, (industrySubs.get(ind) ?? 0) + 1); void sid
  }
  for (const l of leads) {
    const ind = l.subscriber_id ? subToIndustry.get(l.subscriber_id) : undefined
    if (ind) industryLeads.set(ind, (industryLeads.get(ind) ?? 0) + 1)
  }
  const industries = Array.from(industrySubs.entries())
    .map(([industry, subs]) => ({ industry, subscribers: subs, leads: industryLeads.get(industry) ?? 0 }))
    .sort((a, b) => b.subscribers - a.subscribers)

  // Countries
  const countryMap = new Map<string, number>()
  for (const s of subscribers) {
    const c = (s.country ?? '').trim() || 'Not specified'
    countryMap.set(c, (countryMap.get(c) ?? 0) + 1)
  }
  const countries = Array.from(countryMap.entries())
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)

  // Monthly signups — last 12 months
  const now   = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - 11, 1)
  const monthMap = new Map<string, number>()
  for (const s of subscribers) {
    const d = new Date(s.created_at)
    if (d >= start) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      monthMap.set(key, (monthMap.get(key) ?? 0) + 1)
    }
  }
  const monthlySignups = Array.from({ length: 12 }, (_, i) => {
    const d   = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    return { month: key, label: d.toLocaleDateString('en-ZA', { month: 'short', year: '2-digit' }), count: monthMap.get(key) ?? 0 }
  })

  // Lead sources
  const srcMap = new Map<string, number>()
  for (const l of leads) srcMap.set(l.source ?? 'unknown', (srcMap.get(l.source ?? 'unknown') ?? 0) + 1)
  const leadSources = Array.from(srcMap.entries())
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)

  return { summary, plans, industries, countries, monthlySignups, leadSources }
}

// ── Subscriber list ────────────────────────────────────────────────────────────

export async function getSubscriberList() {
  const service = createServiceClient()

  const [subsRes, ownerCardsRes, allCardsRes, leadsRes] = await Promise.all([
    service.from('subscribers').select('id, email, plan, subscription_status, country, city, created_at').order('created_at', { ascending: false }),
    service.from('cards').select('subscriber_id, company, industry').eq('is_owner_card', true),
    service.from('cards').select('subscriber_id, id'),
    service.from('leads').select('subscriber_id, id'),
  ])

  const ownerCardMap  = new Map((ownerCardsRes.data ?? []).map(c => [c.subscriber_id, c]))
  const cardCounts    = new Map<string, number>()
  const leadCounts    = new Map<string, number>()

  for (const c of allCardsRes.data ?? []) {
    cardCounts.set(c.subscriber_id, (cardCounts.get(c.subscriber_id) ?? 0) + 1)
  }
  for (const l of leadsRes.data ?? []) {
    if (l.subscriber_id) leadCounts.set(l.subscriber_id, (leadCounts.get(l.subscriber_id) ?? 0) + 1)
  }

  return (subsRes.data ?? []).map(s => ({
    ...s,
    company:   ownerCardMap.get(s.id)?.company   ?? null,
    industry:  ownerCardMap.get(s.id)?.industry  ?? null,
    cardCount: cardCounts.get(s.id) ?? 0,
    leadCount: leadCounts.get(s.id) ?? 0,
  }))
}

export type SubscriberRow = Awaited<ReturnType<typeof getSubscriberList>>[number]

// ── Lead intelligence ─────────────────────────────────────────────────────────

export async function getLeadIntel() {
  const service = createServiceClient()

  const [leadsRes, cardsRes, subscribersRes] = await Promise.all([
    service.from('leads').select('id, subscriber_id, source, created_at').order('created_at', { ascending: false }),
    service.from('cards').select('subscriber_id, industry, is_owner_card'),
    service.from('subscribers').select('id, country'),
  ])

  const leads       = leadsRes.data ?? []
  const cards       = cardsRes.data ?? []
  const subscribers = subscribersRes.data ?? []

  const subToIndustry = new Map<string, string>()
  for (const c of cards) {
    if (c.is_owner_card && c.industry) subToIndustry.set(c.subscriber_id, c.industry)
  }
  const subToCountry = new Map<string, string>()
  for (const s of subscribers) {
    if (s.country) subToCountry.set(s.id, s.country)
  }

  // By industry
  const byIndustry = new Map<string, number>()
  for (const l of leads) {
    const ind = l.subscriber_id ? subToIndustry.get(l.subscriber_id) : undefined
    if (ind) byIndustry.set(ind, (byIndustry.get(ind) ?? 0) + 1)
  }

  // By source
  const bySource = new Map<string, number>()
  for (const l of leads) bySource.set(l.source ?? 'unknown', (bySource.get(l.source ?? 'unknown') ?? 0) + 1)

  // By country (via subscriber)
  const byCountry = new Map<string, number>()
  for (const l of leads) {
    const country = l.subscriber_id ? (subToCountry.get(l.subscriber_id) ?? 'Not specified') : 'Not specified'
    byCountry.set(country, (byCountry.get(country) ?? 0) + 1)
  }

  // Monthly — last 12 months
  const now   = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - 11, 1)
  const monthMap = new Map<string, number>()
  for (const l of leads) {
    const d = new Date(l.created_at)
    if (d >= start) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      monthMap.set(key, (monthMap.get(key) ?? 0) + 1)
    }
  }
  const monthly = Array.from({ length: 12 }, (_, i) => {
    const d   = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    return { month: key, label: d.toLocaleDateString('en-ZA', { month: 'short', year: '2-digit' }), count: monthMap.get(key) ?? 0 }
  })

  const now2   = new Date()
  const thisMonth = leads.filter(l => {
    const d = new Date(l.created_at)
    return d.getFullYear() === now2.getFullYear() && d.getMonth() === now2.getMonth()
  }).length

  return {
    total: leads.length,
    thisMonth,
    byIndustry: Array.from(byIndustry.entries()).map(([industry, count]) => ({ industry, count })).sort((a, b) => b.count - a.count),
    bySource:   Array.from(bySource.entries()).map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count),
    byCountry:  Array.from(byCountry.entries()).map(([country, count]) => ({ country, count })).sort((a, b) => b.count - a.count),
    monthly,
  }
}

// ── Platform analytics (30-day engagement + share channels) ──────────────────

export async function getAdminAnalytics() {
  const service = createServiceClient()

  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [eventsRes, shareLinksRes, cardsRes] = await Promise.all([
    service
      .from('card_events')
      .select('id, event_name, card_id, device_type, country, country_code, city, duration_s, occurred_at')
      .gte('occurred_at', since30)
      .limit(100000),
    service
      .from('share_links')
      .select('id, card_id, channel_type, view_count, lead_count'),
    service
      .from('cards')
      .select('id, slug, display_name, industry'),
  ])

  const events     = eventsRes.data     ?? []
  const shareLinks = shareLinksRes.data ?? []
  const cards      = cardsRes.data      ?? []

  // Daily views — last 30 days
  const dailyMap = new Map<string, number>()
  for (const e of events) {
    if (e.event_name === 'card_view_started') {
      const day = (e.occurred_at as string).slice(0, 10)
      dailyMap.set(day, (dailyMap.get(day) ?? 0) + 1)
    }
  }
  const now = new Date()
  const dailyViews = Array.from({ length: 30 }, (_, i) => {
    const d   = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000)
    const key = d.toISOString().slice(0, 10)
    return {
      date:  key,
      label: d.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' }),
      views: dailyMap.get(key) ?? 0,
    }
  })

  // Engagement funnel
  const countEv = (name: string) => events.filter(e => e.event_name === name).length
  const funnel = {
    views30:     countEv('card_view_started'),
    videoStarts: countEv('video_play_started'),
    ctaClicks:   countEv('cta_clicked'),
    formStarts:  countEv('lead_form_started'),
    formSubmits: countEv('lead_form_submitted'),
  }

  // Avg time on card (from card_view_ended duration_s, ignore outliers > 2hrs)
  const durations = events
    .filter(e => e.event_name === 'card_view_ended' && typeof e.duration_s === 'number' && e.duration_s > 0)
    .map(e => e.duration_s as number)
  const avgDurationSeconds = durations.length > 0
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : null

  // Device split (view_started only)
  const deviceMap = new Map<string, number>()
  for (const e of events) {
    if (e.event_name === 'card_view_started' && e.device_type) {
      deviceMap.set(e.device_type, (deviceMap.get(e.device_type) ?? 0) + 1)
    }
  }
  const deviceSplit = Array.from(deviceMap.entries())
    .map(([device, count]) => ({ device, count }))
    .sort((a, b) => b.count - a.count)

  // Geographic breakdown (view_started only, top 20)
  const geoMap = new Map<string, { country: string; views: number; leads: number }>()
  for (const e of events) {
    const code = e.country_code
    if (!code) continue
    const cur = geoMap.get(code) ?? { country: e.country ?? code, views: 0, leads: 0 }
    if (e.event_name === 'card_view_started')    geoMap.set(code, { ...cur, views: cur.views + 1 })
    if (e.event_name === 'lead_form_submitted')  geoMap.set(code, { ...cur, leads: cur.leads + 1 })
  }
  const geoBreakdown = Array.from(geoMap.entries())
    .map(([countryCode, { country, views, leads }]) => ({ countryCode, country, views, leads }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 20)

  // Industry breakdown (card_id → industry via cards table)
  const cardIndustry = new Map(cards.filter(c => c.industry).map(c => [c.id, c.industry!]))
  const industryMap = new Map<string, { views: number; leads: number }>()
  for (const e of events) {
    const industry = e.card_id ? cardIndustry.get(e.card_id) : undefined
    if (!industry) continue
    const cur = industryMap.get(industry) ?? { views: 0, leads: 0 }
    if (e.event_name === 'card_view_started')    industryMap.set(industry, { ...cur, views: cur.views + 1 })
    if (e.event_name === 'lead_form_submitted')  industryMap.set(industry, { ...cur, leads: cur.leads + 1 })
  }
  const industryBreakdown = Array.from(industryMap.entries())
    .map(([industry, { views, leads }]) => ({ industry, views, leads }))
    .sort((a, b) => b.views - a.views)

  // Time of day — 24-bucket histogram (UTC hours, view_started only)
  const hourMap = new Map<number, number>()
  for (let h = 0; h < 24; h++) hourMap.set(h, 0)
  for (const e of events) {
    if (e.event_name === 'card_view_started') {
      const h = new Date(e.occurred_at as string).getUTCHours()
      hourMap.set(h, (hourMap.get(h) ?? 0) + 1)
    }
  }
  const timeOfDay = Array.from({ length: 24 }, (_, h) => ({
    hour:  h,
    label: `${String(h).padStart(2, '0')}:00`,
    views: hourMap.get(h) ?? 0,
  }))

  // Share channel breakdown (from share_links counters)
  const channelMap = new Map<string, { views: number; leads: number }>()
  for (const l of shareLinks) {
    const cur = channelMap.get(l.channel_type) ?? { views: 0, leads: 0 }
    channelMap.set(l.channel_type, { views: cur.views + l.view_count, leads: cur.leads + l.lead_count })
  }
  const shareChannels = Array.from(channelMap.entries())
    .map(([channel, { views, leads }]) => ({ channel, views, leads }))
    .sort((a, b) => b.views - a.views)

  // Top 10 cards by total tracked views
  const cardViewMap = new Map<string, number>()
  for (const l of shareLinks) {
    cardViewMap.set(l.card_id, (cardViewMap.get(l.card_id) ?? 0) + l.view_count)
  }
  const cardMap  = new Map(cards.map(c => [c.id, c]))
  const topCards = Array.from(cardViewMap.entries())
    .map(([cardId, views]) => {
      const c = cardMap.get(cardId)
      return { cardId, views, displayName: c?.display_name ?? null, slug: c?.slug ?? null }
    })
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)

  return {
    dailyViews,
    funnel,
    avgDurationSeconds,
    deviceSplit,
    geoBreakdown,
    industryBreakdown,
    timeOfDay,
    shareChannels,
    topCards,
  }
}

export type AdminAnalytics = Awaited<ReturnType<typeof getAdminAnalytics>>

// ── Admin team ────────────────────────────────────────────────────────────────

export async function getAdminTeam() {
  const service = createServiceClient()
  const { data, error } = await service.rpc('list_admins')
  if (error) return []
  return (data ?? []) as { id: string; user_id: string; email: string; added_by: string | null; note: string | null; created_at: string }[]
}
