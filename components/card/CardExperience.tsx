'use client'

import { useState, useEffect, CSSProperties } from 'react'
import QRCode from 'qrcode'
import type { Card, FormField } from '@/lib/supabase/types'

type Screen = 'welcome' | 'video' | 'cta' | 'form' | 'confirmed' | 'share'

interface Props {
  card: Card
  resolvedPhotoUrl: string | null
  resolvedVideoUrl: string | null
  resolvedLogoUrl: string | null
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
          onEnded={() => setScreen('cta')}
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
    </div>
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

      {/* CTA buttons */}
      <div style={{ position: 'relative', marginTop: 'auto', padding: '18px 26px 32px' }}>
        <button onClick={() => go('video')} style={{ ...btnAccent(t), width: '100%', padding: '14px 18px', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          ▶ Watch my intro
        </button>
        <button onClick={() => go('share')} style={{ ...btnGhost(t), width: '100%', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          ↗ Share my card
        </button>
      </div>
    </div>
  )
}

// ── Video background (shared between Screen 2 and Screen 3) ─────────────────
// Rendered at the same JSX position for both screens so React never unmounts it.
// The video keeps playing / stays on last frame when CTA overlay appears.
function VideoBackground({ videoUrl, blobUrl, isHtml, progress, accent, name, title, onEnded }: {
  videoUrl: string | null
  blobUrl: string | null
  isHtml: boolean
  progress: number
  accent: string
  name: string | null
  title: string | null
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
          <a href={card.cta_primary_url} target="_blank" rel="noopener noreferrer" style={{ ...btnAccent(t), padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none' }}>
            🌐 {card.cta_primary_label ?? 'Visit the website'}
          </a>
        )}
        <button onClick={() => go('form')} style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(255,255,255,0.10)', color: 'white', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 12, fontSize: 16, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer' }}>
          📞 {card.cta_secondary_label ?? 'Request a call'}
        </button>
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
      go('confirmed')
    } catch {
      setSubmitError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div style={{ minHeight: 'var(--card-screen-h, 100dvh)', overflowY: 'auto', padding: '24px 22px 40px' }}>
      <button onClick={() => go('cta')} style={{ display: 'flex', alignItems: 'center', gap: 6, color: t.fg, opacity: 0.7, fontSize: 13, marginBottom: 18, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>← Back</button>
      <div style={{ fontFamily: t.headingFont, fontSize: 30, lineHeight: 1.05, letterSpacing: '-0.01em' }}>Request a callback</div>
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
        <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 6, cursor: 'pointer' }}>
          <span onClick={() => setConsent(c => !c)} style={{ width: 18, height: 18, borderRadius: 4, background: consent ? t.accent : 'transparent', border: `1px solid ${consent ? t.accent : t.fg + '40'}`, display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: 1 }}>
            {consent && <span style={{ color: t.bg, fontSize: 11, fontWeight: 700 }}>✓</span>}
          </span>
          <span style={{ fontSize: 13, opacity: 0.75, lineHeight: 1.4 }}>I consent to being contacted about my enquiry.</span>
        </label>
        {submitError && <div style={{ fontSize: 13, color: '#ff6b6b', marginTop: 4 }}>{submitError}</div>}
        <button disabled={!canSubmit} onClick={handleSubmit} style={{ marginTop: 12, padding: '14px 18px', borderRadius: 12, background: canSubmit ? t.accent : `${t.fg}1A`, color: canSubmit ? t.bg : `${t.fg}60`, fontSize: 15, fontWeight: 500, fontFamily: 'inherit', cursor: canSubmit ? 'pointer' : 'not-allowed', border: 'none', transition: '160ms' }}>
          {submitting ? 'Sending…' : 'Send request'}
        </button>
      </div>
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
