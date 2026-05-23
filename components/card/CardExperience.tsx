'use client'

import { useState, useEffect, useRef, CSSProperties } from 'react'
import QRCode from 'qrcode'
import type { Card, FormField } from '@/lib/supabase/types'

type Screen = 'welcome' | 'video' | 'cta' | 'form' | 'confirmed' | 'share' | 'rating'

interface Props {
  card: Card
  resolvedPhotoUrl: string | null
  resolvedVideoUrl: string | null
  resolvedLogoUrl: string | null
}

// ── Tracking helpers ────────────────────────────────────────────────────────
// All tracking is fire-and-forget. Errors are swallowed so tracking never
// degrades the card experience. Session ID persists within the browser tab.

function getOrCreateSessionId(cardId: string): string {
  try {
    const key = `lc_sid_${cardId}`
    let sid = sessionStorage.getItem(key)
    if (!sid) {
      sid = typeof crypto !== 'undefined'
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2)
      sessionStorage.setItem(key, sid)
    }
    return sid
  } catch { return '' }
}

function detectDevice(): string {
  try {
    const ua = navigator.userAgent
    if (/tablet|ipad/i.test(ua)) return 'tablet'
    if (/mobile|iphone|android/i.test(ua)) return 'mobile'
    return 'desktop'
  } catch { return 'unknown' }
}

function trackViewEnded(cardId: string, durationSeconds: number) {
  if (typeof window === 'undefined') return
  try {
    const params = new URLSearchParams(window.location.search)
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName:      'card_view_ended',
        cardId,
        sessionId:      getOrCreateSessionId(cardId),
        shareSource:    params.get('src') ?? 'direct',
        shareLinkToken: params.get('lc')  ?? undefined,
        deviceType:     detectDevice(),
        durationSeconds,
      }),
    }).catch(() => {})
  } catch {}
}

function trackEvent(cardId: string, eventName: string, extra?: Record<string, string>) {
  if (typeof window === 'undefined') return
  try {
    const params = new URLSearchParams(window.location.search)
    const shareSource     = params.get('src') ?? 'direct'
    const shareLinkToken  = params.get('lc')  ?? undefined
    let referrerDomain: string | undefined
    try { if (document.referrer) referrerDomain = new URL(document.referrer).hostname } catch {}
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName,
        cardId,
        sessionId: getOrCreateSessionId(cardId),
        shareSource,
        shareLinkToken,
        deviceType: detectDevice(),
        referrerDomain,
        ...extra,
      }),
    }).catch(() => {})
  } catch {}
}

const FONT_FAMILIES: Record<string, string> = {
  serif:    '"Instrument Serif", Georgia, serif',
  playfair: '"Playfair Display", Georgia, serif',
  cormorant:'"Cormorant Garamond", Georgia, serif',
  'dm-serif':'"DM Serif Display", Georgia, serif',
  sans:     '"Geist", system-ui, sans-serif',
  inter:    '"Inter", system-ui, sans-serif',
}

const FONT_SCALES: Record<string, number> = {
  compact: 0.82,
  default: 1,
  large:   1.22,
}

export function CardExperience({ card, resolvedPhotoUrl, resolvedVideoUrl, resolvedLogoUrl }: Props) {
  const [screen, setScreen] = useState<Screen>('welcome')
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const isHtml = card.video_path?.endsWith('.html') ?? false

  // Fire card_view_started once per mount
  useEffect(() => {
    trackEvent(card.id, 'card_view_started')
  }, [card.id])

  // Fire card_view_ended with duration when the tab hides or component unmounts
  const mountTime = useRef(Date.now())
  const viewEndedFired = useRef(false)
  useEffect(() => {
    mountTime.current = Date.now()
    viewEndedFired.current = false
    function fire() {
      if (viewEndedFired.current) return
      viewEndedFired.current = true
      trackViewEnded(card.id, Math.round((Date.now() - mountTime.current) / 1000))
    }
    const onHide = () => { if (document.visibilityState === 'hidden') fire() }
    document.addEventListener('visibilitychange', onHide)
    return () => { document.removeEventListener('visibilitychange', onHide); fire() }
  }, [card.id])

  const t = {
    bg: card.theme_bg,
    fg: card.theme_fg,
    accent: card.theme_accent,
    bannerBg: card.theme_banner_bg ?? null,
    heading: card.theme_heading ?? null,
    subtext: card.theme_subtext ?? null,
    headingFont: FONT_FAMILIES[card.theme_font ?? 'serif'] ?? FONT_FAMILIES.serif,
    scale: FONT_SCALES[card.theme_font_size ?? 'default'] ?? 1,
  }

  // HTML files: Supabase serves with Content-Disposition: attachment — fetch and create
  // a blob URL that browsers will always render inline inside an iframe.
  useEffect(() => {
    if (!isHtml || !resolvedVideoUrl) return
    let objectUrl: string | null = null
    fetch(resolvedVideoUrl)
      .then(r => r.text())
      .then(html => {
        const blob = new Blob([html], { type: 'text/html' })
        objectUrl = URL.createObjectURL(blob)
        setBlobUrl(objectUrl)
      })
      .catch(() => {})
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [isHtml, resolvedVideoUrl])

  // Animated-placeholder progress timer (only when no video uploaded)
  useEffect(() => {
    if (screen !== 'video' || resolvedVideoUrl) return
    const len = 57000
    const t0 = Date.now()
    const id = setInterval(() => {
      const p = Math.min(1, (Date.now() - t0) / len)
      setProgress(p)
      if (p >= 1) { clearInterval(id); setScreen('cta') }
    }, 100)
    return () => clearInterval(id)
  }, [screen, resolvedVideoUrl])

  return (
    <div style={{ minHeight: 'var(--card-screen-h, 100dvh)', width: '100%', background: t.bg, color: t.fg, fontFamily: 'var(--font-sans)', position: 'relative', overflow: 'hidden' }}>
      {screen === 'welcome' && <ScreenWelcome card={card} t={t} photoUrl={resolvedPhotoUrl} logoUrl={resolvedLogoUrl} go={setScreen} />}

      {/* VideoBackground stays at the same JSX position for both video + cta screens.
          React keeps the same DOM node → video/iframe plays on behind the CTA overlay. */}
      {(screen === 'video' || screen === 'cta') && (
        <VideoBackground
          videoUrl={resolvedVideoUrl}
          blobUrl={blobUrl}
          isHtml={isHtml}
          progress={progress}
          accent={t.accent}
          name={card.display_name}
          title={card.title}
          onPlay={() => trackEvent(card.id, 'video_play_started')}
          onEnded={() => { trackEvent(card.id, 'video_completed'); setScreen('cta') }}
        />
      )}

      {/* Screen 2: controls only (back / skip / progress bar) */}
      {screen === 'video' && (
        <VideoControls
          isHtml={isHtml}
          progress={progress}
          accent={t.accent}
          onBack={() => setScreen('welcome')}
          onSkip={() => setScreen('cta')}
        />
      )}

      {/* Screen 3: CTA overlay — sits on top of the still-live VideoBackground */}
      {screen === 'cta'       && <ScreenCTA       card={card} t={t} go={setScreen} />}
      {screen === 'form'      && <ScreenForm      card={card} t={t} go={setScreen} />}
      {screen === 'confirmed' && <ScreenConfirmed card={card} t={t} go={setScreen} />}
      {screen === 'share'     && <ScreenShare     card={card} t={t} go={setScreen} />}
      {screen === 'rating'    && <ScreenRating    card={card} t={t} go={setScreen} />}
    </div>
  )
}

// ── Social icon SVGs (24×24 viewBox) ────────────────────────────────────────
function SocialIcon({ type, size = 18 }: { type: string; size?: number }) {
  const s: CSSProperties = { width: size, height: size, display: 'block', flexShrink: 0 }
  if (type === 'instagram') return (
    <svg viewBox="0 0 24 24" fill="currentColor" style={s}>
      <path d="M12 2c-2.716 0-3.056.012-4.122.06-1.065.049-1.792.218-2.428.465a4.902 4.902 0 00-1.772 1.153A4.902 4.902 0 002.525 5.45c-.247.636-.416 1.363-.465 2.427C2.011 8.944 2 9.284 2 12s.011 3.056.06 4.122c.049 1.065.218 1.792.465 2.428a4.902 4.902 0 001.153 1.772 4.902 4.902 0 001.772 1.153c.636.247 1.363.416 2.428.465C8.944 21.989 9.284 22 12 22s3.056-.011 4.122-.06c1.065-.049 1.792-.218 2.428-.465a4.902 4.902 0 001.772-1.153 4.902 4.902 0 001.153-1.772c.247-.636.416-1.363.465-2.428C21.989 15.056 22 14.716 22 12s-.011-3.056-.06-4.122c-.049-1.065-.218-1.792-.465-2.428a4.902 4.902 0 00-1.153-1.772A4.902 4.902 0 0018.55 2.525c-.636-.247-1.363-.416-2.427-.465C15.056 2.011 14.716 2 12 2zm0 1.802c2.67 0 2.986.01 4.04.059.977.045 1.505.207 1.858.344.466.181.8.398 1.15.748.35.35.566.683.748 1.15.136.352.3.882.344 1.857.048 1.055.058 1.37.058 4.041 0 2.67-.01 2.986-.058 4.04-.045.976-.208 1.505-.344 1.858a3.1 3.1 0 01-.748 1.15 3.1 3.1 0 01-1.15.748c-.353.137-.882.3-1.857.344-1.054.048-1.37.058-4.041.058-2.67 0-2.987-.01-4.04-.058-.976-.045-1.505-.208-1.858-.344a3.1 3.1 0 01-1.15-.748 3.1 3.1 0 01-.748-1.15c-.136-.353-.3-.882-.344-1.857-.048-1.055-.058-1.37-.058-4.041 0-2.67.01-2.986.058-4.04.045-.976.208-1.505.344-1.858.181-.467.398-.8.748-1.15.35-.35.683-.567 1.15-.748.352-.136.882-.3 1.857-.344 1.055-.048 1.37-.058 4.041-.058zm0 3.063a5.135 5.135 0 100 10.27 5.135 5.135 0 000-10.27zm0 8.468a3.333 3.333 0 110-6.666 3.333 3.333 0 010 6.666zm6.538-8.67a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z"/>
    </svg>
  )
  if (type === 'facebook') return (
    <svg viewBox="0 0 24 24" fill="currentColor" style={s}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
  if (type === 'linkedin') return (
    <svg viewBox="0 0 24 24" fill="currentColor" style={s}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )
  if (type === 'twitter' || type === 'x') return (
    <svg viewBox="0 0 24 24" fill="currentColor" style={s}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.254 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )
  if (type === 'whatsapp') return (
    <svg viewBox="0 0 24 24" fill="currentColor" style={s}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
  if (type === 'tiktok') return (
    <svg viewBox="0 0 24 24" fill="currentColor" style={s}>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
    </svg>
  )
  if (type === 'youtube') return (
    <svg viewBox="0 0 24 24" fill="currentColor" style={s}>
      <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
    </svg>
  )
  if (type === 'github') return (
    <svg viewBox="0 0 24 24" fill="currentColor" style={s}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
    </svg>
  )
  if (type === 'website') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={s}>
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
    </svg>
  )
  if (type === 'calendly' || type === 'calendar') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={s}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={s}>
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
      <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  )
}

// ── Screen 1: Welcome ───────────────────────────────────────────────────────
function ScreenWelcome({ card, t, photoUrl, logoUrl, go }: SP & { photoUrl: string | null; logoUrl: string | null }) {
  const initials = (card.display_name ?? 'A').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div style={{ minHeight: 'var(--card-screen-h, 100dvh)', display: 'flex', flexDirection: 'column', position: 'relative' }}>

      {/* ── Logo banner — full width, prominent ── */}
      <div style={{
        position: 'relative',
        height: 124,
        background: t.bannerBg ?? `linear-gradient(135deg, ${t.accent}1E 0%, ${t.accent}08 100%)`,
        borderBottom: `1px solid ${t.fg}0C`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 28px',
        flexShrink: 0,
      }}>
        {logoUrl
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={logoUrl} alt={card.company ?? 'Logo'} style={{ maxHeight: 66, maxWidth: '82%', objectFit: 'contain', display: 'block' }} />
          : card.company
            ? <span style={{ fontSize: 16, opacity: 0.72, fontWeight: 500, letterSpacing: '0.01em' }}>{card.company}</span>
            : <span style={{ fontSize: 28, opacity: 0.1 }}>✦</span>
        }
      </div>

      {/* ── Photo — overlaps banner bottom edge ── */}
      <div style={{ position: 'relative', padding: '0 26px', marginTop: -46, flexShrink: 0 }}>
        <div style={{
          width: 92, height: 92, borderRadius: '50%',
          background: photoUrl ? `url(${photoUrl}) center/cover` : `${t.accent}28`,
          backgroundSize: 'cover',
          display: 'grid', placeItems: 'center',
          fontFamily: t.headingFont, fontSize: 36,
          border: `3px solid ${t.bg}`,
          boxShadow: `0 2px 14px ${t.fg}1A`,
        }}>{!photoUrl && initials}</div>
      </div>

      {/* ── Identity ── */}
      <div style={{ position: 'relative', padding: '0 26px', marginTop: 14 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 8, color: t.subtext ?? t.fg, opacity: t.subtext ? 0.85 : 0.65 }}>
          {card.welcome_headline ?? 'Hello —'}
        </div>
        <div style={{ fontFamily: t.headingFont, fontSize: Math.round(44 * t.scale), lineHeight: 0.98, letterSpacing: '-0.015em', color: t.heading ?? t.fg }}>
          {card.display_name ?? 'Your Name'}
        </div>
        <div style={{ fontSize: 15, marginTop: 10, color: t.subtext ?? t.fg, opacity: t.subtext ? 1 : 0.78 }}>
          {[card.title, card.company].filter(Boolean).join(' · ')}
        </div>
        {card.industry && (
          <div style={{ marginTop: 10, display: 'inline-block', padding: '4px 11px', background: `${t.accent}22`, color: t.accent, borderRadius: 999, fontSize: 12, fontWeight: 500, letterSpacing: '0.03em' }}>
            {card.industry}
          </div>
        )}
        {/* Email + phone stacked under industry pill */}
        {(card.email || card.mobile) && (
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 7 }}>
            {card.email && (
              <div style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden', color: t.subtext ?? t.fg, opacity: t.subtext ? 1 : 0.72 }}>
                <span style={{ opacity: 0.55, fontSize: 12, flexShrink: 0 }}>✉</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.email}</span>
              </div>
            )}
            {card.mobile && (
              <div style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, color: t.subtext ?? t.fg, opacity: t.subtext ? 1 : 0.72 }}>
                <span style={{ opacity: 0.55, fontSize: 12, flexShrink: 0 }}>✆</span>
                <span>{card.mobile}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {card.welcome_body && (
        <p style={{ position: 'relative', padding: '0 26px', margin: '16px 0 0', fontSize: 14, lineHeight: 1.5, maxWidth: 300, color: t.subtext ?? t.fg, opacity: t.subtext ? 1 : 0.7 }}>
          {card.welcome_body}
        </p>
      )}

      {/* Social / contact links */}
      {card.links && card.links.length > 0 && (
        <div style={{ position: 'relative', padding: '18px 26px 0', display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {card.links.filter(l => l.url).map(l => (
            <a
              key={l.id}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent(card.id, 'link_clicked', { ctaLabel: l.label, ctaType: l.type })}
              title={l.label}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 40, height: 40, borderRadius: '50%',
                background: `${t.accent}1E`, color: t.accent,
                border: `1px solid ${t.accent}30`,
                textDecoration: 'none', transition: '160ms',
              }}
            >
              <SocialIcon type={l.type} size={18} />
            </a>
          ))}
        </div>
      )}

      {/* CTA buttons */}
      <div style={{ position: 'relative', marginTop: 'auto', padding: '18px 26px 0' }}>
        <button onClick={() => go('video')} style={{ ...btnAccent(t), width: '100%', padding: '14px 18px', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          ▶ Watch my intro
        </button>
        <button onClick={() => go('share')} style={{ ...btnGhost(t), width: '100%', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          ↗ Share my card
        </button>
        <button onClick={() => go('rating')} style={{ width: '100%', padding: '10px 18px', marginTop: 8, background: 'none', border: 'none', color: t.fg, opacity: 0.45, fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          ★ Rate my service
        </button>
      </div>

      {/* Footer note — professional registration, credentials, etc. */}
      {card.footer_note && (
        <div style={{ position: 'relative', padding: '10px 26px 24px', textAlign: 'center' as const, fontSize: 10.5, opacity: 0.45, lineHeight: 1.4, letterSpacing: '0.02em', color: t.fg }}>
          {card.footer_note}
        </div>
      )}
      {!card.footer_note && <div style={{ height: 24 }} />}
    </div>
  )
}

// ── Video background (shared between Screen 2 and Screen 3) ─────────────────
// Rendered at the same JSX position for both screens so React never unmounts it.
// The video keeps playing / stays on last frame when CTA overlay appears.
function VideoBackground({ videoUrl, blobUrl, isHtml, progress, accent, name, title, onPlay, onEnded }: {
  videoUrl: string | null
  blobUrl: string | null
  isHtml: boolean
  progress: number
  accent: string
  name: string | null
  title: string | null
  onPlay?: () => void
  onEnded: () => void
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', overflow: 'hidden' }}>
      {videoUrl ? (
        isHtml ? (
          blobUrl
            ? <iframe src={blobUrl} sandbox="allow-scripts" style={{ width: '100%', height: '100%', border: 'none' }} />
            : <AnimatedPlaceholder progress={0} accent={accent} name={name} title={title} />
        ) : (
          <video src={videoUrl} autoPlay playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onPlay={onPlay}
            onEnded={onEnded} />
        )
      ) : (
        <AnimatedPlaceholder progress={progress} accent={accent} name={name} title={title} />
      )}
    </div>
  )
}

// ── Screen 2: controls only (back / skip / progress bar) ────────────────────
function VideoControls({ isHtml, progress, accent, onBack, onSkip }: {
  isHtml: boolean
  progress: number
  accent: string
  onBack: () => void
  onSkip: () => void
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
      <button onClick={onBack} style={{ ...frostedBtn(18, 18), pointerEvents: 'auto' }}>←</button>
      <button onClick={onSkip} style={{ ...frostedBtn(18, undefined, 18), padding: '8px 16px', borderRadius: 999, width: 'auto', pointerEvents: 'auto' }}>
        Skip →
      </button>
      {!isHtml && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.18)' }}>
          <div style={{ width: `${progress * 100}%`, height: '100%', background: accent, transition: '100ms linear' }} />
        </div>
      )}
    </div>
  )
}

function AnimatedPlaceholder({ progress, accent, name, title }: { progress: number; accent: string; name: string | null; title: string | null }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 60%, #1a1f2e 0%, #050708 100%)' }}>
      <svg viewBox="0 0 320 600" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {[0,1,2,3,4].map(i => (
          <circle key={i} cx="160" cy="300" r={60 + i * 60 + Math.sin(progress * 6 + i) * 12}
            fill="none" stroke={accent} strokeOpacity={0.15 - i * 0.02} strokeWidth="1"/>
        ))}
      </svg>
      <div style={{ position: 'absolute', bottom: 80, left: 0, right: 0, textAlign: 'center', color: 'white', opacity: progress > 0.1 && progress < 0.9 ? 1 : 0.4, transition: '500ms' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.6 }}>Intro reel</div>
        <div style={{ fontSize: 28, marginTop: 6 }}>{name}</div>
        <div style={{ fontSize: 13, opacity: 0.7, marginTop: 2 }}>{title}</div>
      </div>
    </div>
  )
}

// ── Screen 3: CTA overlay (video background is provided by VideoBackground above) ──
function ScreenCTA({ card, t, go }: SP) {
  return (
    <div style={{ position: 'fixed', inset: 0, color: 'white', pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.85) 100%)' }} />
      <button onClick={() => go('welcome')} style={{ ...frostedBtn(18, 18), pointerEvents: 'auto' }}>←</button>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px 20px 40px', display: 'flex', flexDirection: 'column', gap: 10, animation: 'lc-rise 600ms ease-out', pointerEvents: 'auto' }}>
        <div style={{ fontFamily: t.headingFont, fontSize: 22, lineHeight: 1.1, marginBottom: 8 }}>Ready to take the next step?</div>
        {card.cta_primary_url && (
          <a href={card.cta_primary_url} target="_blank" rel="noopener noreferrer"
            onClick={() => trackEvent(card.id, 'cta_clicked', { ctaLabel: card.cta_primary_label ?? 'Visit the website', ctaType: 'primary' })}
            style={{ ...btnAccent(t), padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none' }}>
            🌐 {card.cta_primary_label ?? 'Visit the website'}
          </a>
        )}
        {/* Secondary CTA: if no form fields, link directly to booking URL; otherwise open form */}
        {(card.form_fields as FormField[]).length === 0 && card.cta_secondary_url ? (
          <a
            href={card.cta_secondary_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent(card.id, 'cta_clicked', { ctaLabel: card.cta_secondary_label ?? 'Make a booking', ctaType: 'secondary' })}
            style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(255,255,255,0.10)', color: 'white', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 12, fontSize: 16, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', textDecoration: 'none' }}>
            📅 {card.cta_secondary_label ?? 'Make a booking'}
          </a>
        ) : (card.form_fields as FormField[]).length > 0 ? (
          <button
            onClick={() => { trackEvent(card.id, 'cta_clicked', { ctaLabel: card.cta_secondary_label ?? 'Request a call', ctaType: 'secondary' }); go('form') }}
            style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(255,255,255,0.10)', color: 'white', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 12, fontSize: 16, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer' }}>
            📞 {card.cta_secondary_label ?? 'Request a call'}
          </button>
        ) : null}
      </div>
    </div>
  )
}

// ── Screen 4: Lead form ──────────────────────────────────────────────────────
function ScreenForm({ card, t, go }: SP) {
  const [vals, setVals] = useState<Record<string, string>>({})
  const [consent, setConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showDisclaimer, setShowDisclaimer] = useState(false)

  useEffect(() => {
    trackEvent(card.id, 'lead_form_started')
  }, [card.id])

  const fields = (card.form_fields as FormField[])
  const canSubmit = consent && !submitting && fields.filter(f => f.required).every(f => vals[f.id]?.trim())

  async function handleSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: card.id, ...vals, source: getSource() }),
      })
      if (!res.ok) throw new Error('Submission failed')
      trackEvent(card.id, 'lead_form_submitted')
      go('confirmed')
    } catch {
      setSubmitError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div style={{ minHeight: 'var(--card-screen-h, 100dvh)', overflowY: 'auto', padding: '24px 22px 40px' }}>
      <button onClick={() => go('cta')} style={{ display: 'flex', alignItems: 'center', gap: 6, color: t.fg, opacity: 0.7, fontSize: 13, marginBottom: 18, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>← Back</button>
      <div style={{ fontFamily: t.headingFont, fontSize: 30, lineHeight: 1.05, letterSpacing: '-0.01em' }}>{card.cta_secondary_label ?? 'Request a callback'}</div>
      <p style={{ fontSize: 13, opacity: 0.7, lineHeight: 1.5, marginTop: 10, marginBottom: 22 }}>Leave your details — we&apos;ll be in touch within one business day.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {fields.map(f => (
          <div key={f.id}>
            <label style={{ fontSize: 11, opacity: 0.7, display: 'block', marginBottom: 4 }}>
              {f.label}{f.required && <span style={{ color: t.accent, marginLeft: 4 }}>*</span>}
            </label>
            <input
              type={f.type} value={vals[f.id] ?? ''}
              onChange={e => setVals(v => ({ ...v, [f.id]: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', background: `${t.fg}10`, color: t.fg, border: `1px solid ${t.fg}1A`, borderRadius: 8, fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        ))}
        <div>
          <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 6, cursor: 'pointer' }}>
            <span onClick={() => setConsent(c => !c)} style={{ width: 18, height: 18, borderRadius: 4, background: consent ? t.accent : 'transparent', border: `1px solid ${consent ? t.accent : t.fg + '40'}`, display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: 1 }}>
              {consent && <span style={{ color: t.bg, fontSize: 11, fontWeight: 700 }}>✓</span>}
            </span>
            <span style={{ fontSize: 13, opacity: 0.75, lineHeight: 1.4 }}>I consent to being contacted about my enquiry.</span>
          </label>
          <button
            onClick={() => setShowDisclaimer(true)}
            style={{ marginTop: 6, marginLeft: 28, background: 'none', border: 'none', padding: 0, fontSize: 11, color: t.accent, opacity: 0.8, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline', textUnderlineOffset: 2 }}
          >
            Disclaimer — we don&apos;t spam.
          </button>
        </div>
        {submitError && <div style={{ fontSize: 13, color: '#ff6b6b', marginTop: 4 }}>{submitError}</div>}
        <button disabled={!canSubmit} onClick={handleSubmit} style={{ marginTop: 12, padding: '14px 18px', borderRadius: 12, background: canSubmit ? t.accent : `${t.fg}1A`, color: canSubmit ? t.bg : `${t.fg}60`, fontSize: 15, fontWeight: 500, fontFamily: 'inherit', cursor: canSubmit ? 'pointer' : 'not-allowed', border: 'none', transition: '160ms' }}>
          {submitting ? 'Sending…' : 'Send request'}
        </button>
      </div>

      {/* Disclaimer modal */}
      {showDisclaimer && (
        <div
          onClick={() => setShowDisclaimer(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'flex-end', zIndex: 100 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ width: '100%', background: t.bg, color: t.fg, borderRadius: '20px 20px 0 0', padding: '28px 24px 40px', boxShadow: '0 -8px 40px rgba(0,0,0,0.25)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ fontFamily: t.headingFont, fontSize: 22, lineHeight: 1.1 }}>Privacy disclaimer</div>
              <button onClick={() => setShowDisclaimer(false)} style={{ background: `${t.fg}14`, border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 16, color: t.fg, fontFamily: 'inherit' }}>×</button>
            </div>
            <p style={{ fontSize: 13.5, lineHeight: 1.65, opacity: 0.8, margin: '0 0 12px' }}>
              This platform does not spam people who interact with a digital business card.
            </p>
            <p style={{ fontSize: 13.5, lineHeight: 1.65, opacity: 0.8, margin: '0 0 12px' }}>
              Only card activity data is sent to the platform for analytics and dashboard reporting.
            </p>
            <p style={{ fontSize: 13.5, lineHeight: 1.65, opacity: 0.8, margin: 0 }}>
              Any personal information you choose to share is securely stored on the card owner&apos;s dashboard and kept safe.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Screen 5: Confirmed ──────────────────────────────────────────────────────
function ScreenConfirmed({ card, t, go }: SP) {
  return (
    <div style={{ minHeight: 'var(--card-screen-h, 100dvh)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 30px', textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: t.accent, color: t.bg, display: 'grid', placeItems: 'center', marginBottom: 28, animation: 'lc-pop 500ms ease-out', fontSize: 28 }}>✓</div>
      <div style={{ fontFamily: t.headingFont, fontSize: 36, lineHeight: 1, letterSpacing: '-0.01em' }}>Thank you.</div>
      <p style={{ fontSize: 15, opacity: 0.7, lineHeight: 1.5, marginTop: 14, marginBottom: 32, maxWidth: 240 }}>
        Your request is in. We&apos;ll reach out within one business day.
      </p>
      <button
        onClick={() => go('rating')}
        style={{ ...btnAccent(t), padding: '13px 28px', marginBottom: 12, fontSize: 14 }}
      >
        ★ Rate my service
      </button>
      <button onClick={() => go('welcome')} style={{ padding: '12px 22px', borderRadius: 999, background: 'transparent', color: t.fg, border: `1px solid ${t.fg}26`, fontSize: 13, fontFamily: 'inherit', cursor: 'pointer' }}>
        ← Back to card
      </button>
    </div>
  )
}

// ── Screen 6: Share ──────────────────────────────────────────────────────────
function ScreenShare({ card, t, go }: SP) {
  const [copied, setCopied] = useState(false)
  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://leadcard.app'}/c/${card.slug}`

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  return (
    <div style={{ minHeight: 'var(--card-screen-h, 100dvh)', overflowY: 'auto', padding: '24px 22px 40px' }}>
      <button onClick={() => go('welcome')} style={{ display: 'flex', alignItems: 'center', gap: 6, color: t.fg, opacity: 0.7, fontSize: 13, marginBottom: 18, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>← Back</button>
      <div style={{ fontFamily: t.headingFont, fontSize: 34, lineHeight: 1.05, letterSpacing: '-0.01em' }}>Share my card</div>
      <p style={{ fontSize: 13, opacity: 0.7, marginTop: 8, marginBottom: 22 }}>Scan, tap, or save my contact.</p>
      <div style={{ background: `${t.fg}0D`, borderRadius: 16, padding: 22, marginBottom: 14 }}>
        <div style={{ background: '#ffffff', borderRadius: 12, padding: 12, display: 'grid', placeItems: 'center' }}>
          <RealQR url={url} size={140} />
        </div>
        <div style={{ textAlign: 'center', fontSize: 11, opacity: 0.6, marginTop: 12, fontFamily: 'monospace' }}>
          leadcard.app/c/{card.slug}
        </div>
      </div>
      <button onClick={copyLink} style={{ ...btnAccent(t), width: '100%', padding: '14px 18px', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        {copied ? '✓ Copied!' : '⎘ Copy link'}
      </button>
      <a href={`data:text/vcard;charset=utf-8,${encodeURIComponent(buildVCard(card))}`} download={`${card.slug}.vcf`} style={{ ...btnGhost(t), width: '100%', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none' }}>
        ↓ Save contact (.vcf)
      </a>
    </div>
  )
}

// ── Screen 7: Rate my service ────────────────────────────────────────────────
function ScreenRating({ card, t, go }: SP) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function submit() {
    if (!rating || submitting) return
    setSubmitting(true)
    setErr(null)
    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: card.id,
          rating,
          comment: comment.trim() || null,
          sessionId: getOrCreateSessionId(card.id),
        }),
      })
      if (!res.ok) throw new Error('Failed')
      trackEvent(card.id, 'service_rated', { ratingValue: String(rating) })
      setDone(true)
    } catch {
      setErr('Something went wrong. Please try again.')
    }
    setSubmitting(false)
  }

  if (done) {
    return (
      <div style={{ minHeight: 'var(--card-screen-h, 100dvh)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 30px', textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 20 }}>{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</div>
        <div style={{ fontFamily: t.headingFont, fontSize: 32, lineHeight: 1.1 }}>Thank you!</div>
        <p style={{ fontSize: 14, opacity: 0.7, lineHeight: 1.5, marginTop: 12, marginBottom: 32, maxWidth: 220 }}>
          Your feedback helps us improve.
        </p>
        <button onClick={() => go('welcome')} style={{ padding: '12px 22px', borderRadius: 999, background: 'transparent', color: t.fg, border: `1px solid ${t.fg}26`, fontSize: 13, fontFamily: 'inherit', cursor: 'pointer' }}>
          ← Back to card
        </button>
      </div>
    )
  }

  const active = hovered || rating

  return (
    <div style={{ minHeight: 'var(--card-screen-h, 100dvh)', overflowY: 'auto', padding: '24px 22px 40px' }}>
      <button onClick={() => go('welcome')} style={{ display: 'flex', alignItems: 'center', gap: 6, color: t.fg, opacity: 0.7, fontSize: 13, marginBottom: 18, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>← Back</button>
      <div style={{ fontFamily: t.headingFont, fontSize: 30, lineHeight: 1.05, letterSpacing: '-0.01em' }}>Rate my service</div>
      <p style={{ fontSize: 13, opacity: 0.7, lineHeight: 1.5, marginTop: 10, marginBottom: 28 }}>
        How would you rate your experience?
      </p>

      {/* Stars */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 10, justifyContent: 'center' }}>
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(n)}
            style={{
              fontSize: 40,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: n <= active ? t.accent : `${t.fg}28`,
              transition: '120ms',
              padding: '4px 2px',
              lineHeight: 1,
            }}
          >
            ★
          </button>
        ))}
      </div>
      <div style={{ textAlign: 'center', fontSize: 12, opacity: 0.5, marginBottom: 28, minHeight: 18 }}>
        {active === 1 && 'Poor'}
        {active === 2 && 'Below average'}
        {active === 3 && 'Good'}
        {active === 4 && 'Very good'}
        {active === 5 && 'Excellent!'}
      </div>

      {/* Optional comment */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 11, opacity: 0.65, display: 'block', marginBottom: 6 }}>
          Leave a comment (optional)
        </label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value.slice(0, 200))}
          placeholder="Tell us more about your experience…"
          rows={3}
          style={{ width: '100%', padding: '10px 12px', background: `${t.fg}0E`, color: t.fg, border: `1px solid ${t.fg}1A`, borderRadius: 8, fontSize: 14, fontFamily: 'inherit', resize: 'none', outline: 'none', boxSizing: 'border-box' as const }}
        />
        <div style={{ fontSize: 11, opacity: 0.35, textAlign: 'right' as const, marginTop: 4 }}>{comment.length}/200</div>
      </div>

      {err && <div style={{ fontSize: 13, color: '#ff6b6b', marginBottom: 10 }}>{err}</div>}

      <button
        disabled={!rating || submitting}
        onClick={submit}
        style={{ width: '100%', padding: '14px 18px', borderRadius: 12, background: rating ? t.accent : `${t.fg}1A`, color: rating ? t.bg : `${t.fg}50`, fontSize: 15, fontWeight: 500, fontFamily: 'inherit', cursor: rating && !submitting ? 'pointer' : 'not-allowed', border: 'none', transition: '160ms' }}
      >
        {submitting ? 'Submitting…' : 'Submit rating'}
      </button>
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function buildVCard(card: Card) {
  const lines = [
    'BEGIN:VCARD', 'VERSION:3.0',
    `FN:${card.display_name ?? ''}`,
    card.title   ? `TITLE:${card.title}`   : '',
    card.company ? `ORG:${card.company}`   : '',
    card.email   ? `EMAIL:${card.email}`   : '',
    card.mobile  ? `TEL:${card.mobile}`    : '',
    card.website ? `URL:${card.website}`   : '',
    'END:VCARD',
  ]
  return lines.filter(Boolean).join('\n')
}

function getSource(): string {
  if (typeof window === 'undefined') return 'direct'
  return new URLSearchParams(window.location.search).get('src') ?? 'direct'
}

function btnAccent(t: { accent: string; bg: string }): CSSProperties {
  return { background: t.accent, color: t.bg, border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer' }
}
function btnGhost(t: { fg: string }): CSSProperties {
  return { background: `${t.fg}10`, color: t.fg, border: `1px solid ${t.fg}1A`, borderRadius: 12, fontSize: 16, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer' }
}
function frostedBtn(top: number, left?: number, right?: number): CSSProperties {
  return { position: 'absolute', top, left, right, width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', color: 'white', display: 'grid', placeItems: 'center', border: '1px solid rgba(255,255,255,0.16)', fontSize: 16, cursor: 'pointer', fontFamily: 'inherit' }
}

function RealQR({ url, size }: { url: string; size: number }) {
  const [dataUrl, setDataUrl] = useState('')
  useEffect(() => {
    QRCode.toDataURL(url, { width: size, margin: 1, color: { dark: '#17181C', light: '#ffffff' } })
      .then(setDataUrl)
      .catch(() => {})
  }, [url, size])
  if (!dataUrl) return <div style={{ width: size, height: size, background: '#f0f0f0', borderRadius: 4 }} />
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={dataUrl} alt="QR code" width={size} height={size} style={{ display: 'block' }} />
}

interface SP {
  card: Card
  t: { bg: string; fg: string; accent: string; bannerBg: string | null; heading: string | null; subtext: string | null; headingFont: string; scale: number }
  go: (s: Screen) => void
}
