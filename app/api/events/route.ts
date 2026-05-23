import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ALLOWED_EVENTS = new Set([
  'card_view_started',
  'cta_clicked',
  'lead_form_started',
  'lead_form_submitted',
  'video_play_started',
  'video_completed',
])

const BOT_PATTERN = /bot|crawl|spider|headless|prerender|phantom|puppeteer/i

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
      shareSource, shareLinkToken, ctaLabel, ctaType,
      deviceType, referrerDomain, payload,
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

    // Resolve share_link_id from token and increment counters atomically
    let shareLinkId: string | null = null
    if (shareLinkToken) {
      const { data: link } = await service
        .from('share_links')
        .select('id')
        .eq('share_token', shareLinkToken)
        .single()
      if (link) {
        shareLinkId = link.id
        if (eventName === 'card_view_started') {
          await service.rpc('increment_share_link_view', { p_token: shareLinkToken })
        } else if (eventName === 'lead_form_submitted') {
          await service.rpc('increment_share_link_lead', { p_token: shareLinkToken })
        }
      }
    }

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
      payload_json:    payload        ?? null,
    })
  } catch {
    // Swallow — tracking must never block or break the card experience
  }

  return NextResponse.json({ ok: true })
}
