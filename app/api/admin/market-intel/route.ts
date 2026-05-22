import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Server-to-server only. Protected by shared secret — no Supabase session needed.
// Returns aggregate, PII-free market intelligence for HPS internal research.
// POPIA/GDPR posture: aggregate counts only, no personal data in response.

export async function GET(req: Request) {
  const secret = req.headers.get('x-admin-secret')
  if (!secret || secret !== process.env.LEADCARD_ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const service = createServiceClient()

    const [subscribersRes, cardsRes, leadsRes] = await Promise.all([
      service.from('subscribers').select('id, subscription_status, plan, country, created_at'),
      service.from('cards').select('id, subscriber_id, industry, is_owner_card'),
      service.from('leads').select('subscriber_id, source, created_at'),
    ])

    const subscribers = subscribersRes.data ?? []
    const cards = cardsRes.data ?? []
    const leads = leadsRes.data ?? []

    // ── Summary ──────────────────────────────────────────────────────────────
    const totalSubscribers = subscribers.length
    const activeSubscribers = subscribers.filter(s => s.subscription_status === 'active').length
    const trialingSubscribers = subscribers.filter(s => s.subscription_status === 'trialing').length
    const totalLeads = leads.length
    const totalCards = cards.length

    // ── Plans ─────────────────────────────────────────────────────────────────
    const plans = {
      solo: subscribers.filter(s => s.plan === 'solo').length,
      small: subscribers.filter(s => s.plan === 'small').length,
      enterprise: subscribers.filter(s => s.plan === 'enterprise').length,
    }

    // ── Industries ────────────────────────────────────────────────────────────
    // One industry per subscriber, derived from owner card
    const subToIndustry = new Map<string, string>()
    for (const c of cards) {
      if (c.is_owner_card && c.industry) {
        subToIndustry.set(c.subscriber_id, c.industry)
      }
    }

    const industrySubs = new Map<string, number>()
    const industryLeads = new Map<string, number>()

    for (const [subId, ind] of subToIndustry) {
      industrySubs.set(ind, (industrySubs.get(ind) ?? 0) + 1)
      void subId
    }
    for (const lead of leads) {
      if (lead.subscriber_id) {
        const ind = subToIndustry.get(lead.subscriber_id)
        if (ind) industryLeads.set(ind, (industryLeads.get(ind) ?? 0) + 1)
      }
    }

    const industries = Array.from(industrySubs.entries())
      .map(([industry, subs]) => ({
        industry,
        subscribers: subs,
        leads: industryLeads.get(industry) ?? 0,
      }))
      .sort((a, b) => b.subscribers - a.subscribers)

    // ── Countries ─────────────────────────────────────────────────────────────
    const countryMap = new Map<string, number>()
    for (const s of subscribers) {
      const c = (s.country ?? '').trim() || 'Not specified'
      countryMap.set(c, (countryMap.get(c) ?? 0) + 1)
    }
    const countries = Array.from(countryMap.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)

    // ── Monthly signups (last 12 months) ──────────────────────────────────────
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth() - 11, 1)

    const monthMap = new Map<string, number>()
    for (const s of subscribers) {
      const d = new Date(s.created_at)
      if (d >= start) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        monthMap.set(key, (monthMap.get(key) ?? 0) + 1)
      }
    }

    const monthlySignups: { month: string; count: number }[] = []
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      monthlySignups.push({ month: key, count: monthMap.get(key) ?? 0 })
    }

    // ── Lead sources ──────────────────────────────────────────────────────────
    const sourceMap = new Map<string, number>()
    for (const l of leads) {
      const src = l.source ?? 'unknown'
      sourceMap.set(src, (sourceMap.get(src) ?? 0) + 1)
    }
    const leadSources = Array.from(sourceMap.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      summary: { totalSubscribers, activeSubscribers, trialingSubscribers, totalLeads, totalCards },
      plans,
      industries,
      countries,
      monthlySignups,
      leadSources,
    })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
