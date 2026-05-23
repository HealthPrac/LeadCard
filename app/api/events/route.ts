import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ALLOWED_EVENTS = new Set([
  'card_view_started',
  'card_view_ended',
  'cta_clicked',
  'lead_form_started',
  'lead_form_submitted',
  'video_play_started',
  'video_completed',
])

const BOT_PATTERN = /bot|crawl|spider|headless|prerender|phantom|puppeteer/i

interface GeoResult {
  country:     string | null
  countryCode: string | null
  city:        string | null
}

async function geoFromRequest(req: Request): Promise<GeoResult> {
  const empty: GeoResult = { country: null, countryCode: null, city: null }
  try {
    // CloudFront headers — populated when Amplify/CF geo forwarding is enabled
    const cfCode = req.headers.get('cloudfront-viewer-country')
    const cfName = req.headers.get('cloudfront-viewer-country-name')
    const cfCity = req.headers.get('cloudfront-viewer-city')
    if (cfCode) {
      return { country: cfName ?? cfCode, countryCode: cfCode, city: cfCity ?? null }
    }

    // IP-based fallback via ipapi.co (free tier, 30k/month, HTTPS)
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : null
    if (!ip || ip === '127.0.0.1' || ip.startsWith('::') || ip.startsWith('10.') || ip.startsWith('192.168.')) {
      return empty
    }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 2000)
    const res = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: { 'User-Agent': 'LeadCard-Analytics/1.0' },
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (!res.ok) return empty
    const data = await res.json()
    return {
      country:     data.country_name ?? null,
      countryCode: data.country_code ?? null,
      city:        data.city         ?? null,
    }
  } catch {
    return empty
  }
}

// Always returns 200 — fire-and-forget for the client card experience.
// Errors are swallowed so tracking never degrades the card UX.
export async function POST(req: Request) {
  try {
    const ua = req.headers.get('user-agent') ?? ''
    if (BOT_PATTERN.test(ua)) return NextResponse.json({ ok: true })

    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ ok: true })

    const {
      eventName, cardId, sessionId,
      shareSource, shareLinkToken,
      ctaLabel, ctaType,
      deviceType, referrerDomain,
      durationSeconds, payload,
    } = body

    if (!ALLOWED_EVENTS.has(eventName) || !cardId) {
      return NextResponse.json({ ok: true })
    }

    const service = createServiceClient()

    const { data: card } = await service
      .from('cards')
      .select('subscriber_id')
      .eq('id', cardId)
      .single()

    if (!card) return NextResponse.json({ ok: true })

    // Geo — only for card_view_started to limit external API calls
    let country:     string | null = null
    let countryCode: string | null = null
    let city:        string | null = null
    if (eventName === 'card_view_started') {
      ;({ country, countryCode, city } = await geoFromRequest(req))
    }

    // Share link — resolve and increment counters for view + lead events only
    let shareLinkId: string | null = null
    if (shareLinkToken && (eventName === 'card_view_started' || eventName === 'lead_form_submitted')) {
      const { data: link } = await service
        .from('share_links')
        .select('id')
        .eq('share_token', shareLinkToken)
        .single()
      if (link) {
        shareLinkId = link.id
        if (eventName === 'card_view_started') {
          await service.rpc('increment_share_link_view', { p_token: shareLinkToken })
        } else {
          await service.rpc('increment_share_link_lead', { p_token: shareLinkToken })
        }
      }
    }

    // Duration — only from card_view_ended, capped at 2 hours
    const durationS: number | null =
      eventName === 'card_view_ended' && typeof durationSeconds === 'number' && durationSeconds > 0
        ? Math.min(Math.round(durationSeconds), 7200)
        : null

    await service.from('card_events').insert({
      event_name:      eventName,
      card_id:         cardId,
      subscriber_id:   card.subscriber_id,
      session_id:      sessionId      ?? null,
      share_source:    shareSource    ?? null,
      share_link_id:   shareLinkId,
      cta_label:       ctaLabel       ?? null,
      cta_type:        ctaType        ?? null,
      device_type:     deviceType     ?? null,
      referrer_domain: referrerDomain ?? null,
      country,
      country_code:    countryCode,
      city,
      duration_s:      durationS,
      payload_json:    payload        ?? null,
    })
  } catch {
    // Swallow — tracking must never block or break the card experience
  }

  return NextResponse.json({ ok: true })
}
