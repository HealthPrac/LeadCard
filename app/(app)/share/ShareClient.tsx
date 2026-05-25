'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

interface Card {
  id: string
  slug: string
  display_name: string | null
  title: string | null
  company: string | null
  email: string | null
  mobile: string | null
}

interface Props {
  card: Card | null
  appUrl: string
}

async function createShareToken(cardId: string, channelType: string): Promise<string | null> {
  try {
    const res = await fetch('/api/share/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId, channelType }),
    })
    if (!res.ok) return null
    const { token } = await res.json()
    return token ?? null
  } catch { return null }
}

export default function ShareClient({ card, appUrl }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  // Tracked tokens per channel — created lazily or on mount (QR)
  const [qrToken, setQrToken] = useState<string | null>(null)
  const [copyToken, setCopyToken] = useState<string | null>(null)
  const [sigToken, setSigToken] = useState<string | null>(null)

  const baseUrl = card ? `${appUrl}/c/${card.slug}` : null
  const qrUrl   = baseUrl ? (qrToken   ? `${baseUrl}?lc=${qrToken}`   : baseUrl) : null

  // Create QR share_link on mount so the rendered QR already has attribution
  useEffect(() => {
    if (!card) return
    createShareToken(card.id, 'qr').then(t => { if (t) setQrToken(t) })
  }, [card?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Render QR — regenerates when qrUrl becomes tracked
  useEffect(() => {
    if (!qrUrl || !canvasRef.current) return
    QRCode.toCanvas(canvasRef.current, qrUrl, {
      width: 240,
      margin: 2,
      color: { dark: '#17181C', light: '#F6F7F3' },
    })
    QRCode.toDataURL(qrUrl, {
      width: 600,
      margin: 2,
      color: { dark: '#17181C', light: '#F6F7F3' },
    }).then(setQrDataUrl)
  }, [qrUrl])

  async function getTrackedUrl(channel: 'copy_link' | 'email_sig'): Promise<string> {
    if (!card || !baseUrl) return baseUrl ?? ''
    // Reuse existing token for the session — don't create a new link per click
    if (channel === 'copy_link' && copyToken) return `${baseUrl}?lc=${copyToken}`
    if (channel === 'email_sig'  && sigToken)  return `${baseUrl}?lc=${sigToken}`

    const token = await createShareToken(card.id, channel)
    if (!token) return baseUrl

    if (channel === 'copy_link') setCopyToken(token)
    if (channel === 'email_sig')  setSigToken(token)
    return `${baseUrl}?lc=${token}`
  }

  async function copy(value: string, key: string) {
    let text = value
    if (key === 'url' && card) {
      text = await getTrackedUrl('copy_link')
    }
    if ((key === 'sig' || key === 'plain') && card) {
      const trackedUrl = await getTrackedUrl('email_sig')
      if (key === 'sig') {
        text = buildEmailSig(card, trackedUrl)
      } else {
        text = `${card.display_name ?? ''}\n${card.title ? card.title + (card.company ? ' · ' + card.company : '') + '\n' : ''}${trackedUrl}`
      }
    }
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  function downloadQr() {
    if (!qrDataUrl || !card) return
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = `leadcard-qr-${card.slug}.png`
    a.click()
  }

  function buildVCard() {
    if (!card || !baseUrl) return ''
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${card.display_name ?? ''}`,
    ]
    if (card.title || card.company) lines.push(`ORG:${card.company ?? ''};${card.title ?? ''}`)
    if (card.email)  lines.push(`EMAIL:${card.email}`)
    if (card.mobile) lines.push(`TEL;TYPE=CELL:${card.mobile}`)
    lines.push(`URL:${baseUrl}`)
    lines.push('END:VCARD')
    return lines.join('\r\n')
  }

  function downloadVcard() {
    const vcf = buildVCard()
    const blob = new Blob([vcf], { type: 'text/vcard' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${card?.slug ?? 'contact'}.vcf`
    a.click()
  }

  if (!card || !baseUrl) {
    return (
      <div style={{ maxWidth: 600, paddingTop: 40, textAlign: 'center' }}>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>No card yet. <a href="/onboarding" style={{ color: 'var(--charcoal)', textDecoration: 'underline' }}>Create your card →</a></p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 800 }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, margin: '0 0 6px', letterSpacing: '-0.01em' }}>Share & QR</h1>
      <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 28px' }}>Share your card link, download a QR code, or add a signature to your emails.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Card URL */}
        <div style={{ padding: 24, borderRadius: 14, background: 'var(--bg-surface)', border: '1px solid var(--line)' }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 12 }}>Your card URL</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, background: 'var(--cream-2)', padding: '10px 14px', borderRadius: 8, marginBottom: 14, wordBreak: 'break-all', color: 'var(--charcoal)' }}>
            {baseUrl}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => copy(baseUrl, 'url')} style={{ flex: 1, padding: '9px 0', background: 'var(--charcoal)', color: 'var(--cream)', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
              {copied === 'url' ? '✓ Copied' : '⊡ Copy link'}
            </button>
            <a href={baseUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: '9px 0', background: 'var(--cream-2)', color: 'var(--charcoal)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: 'none', textAlign: 'center' }}>
              ↗ Open card
            </a>
          </div>
        </div>

        {/* QR code — encodes tracked URL once qrToken resolves */}
        <div style={{ padding: 24, borderRadius: 14, background: 'var(--bg-surface)', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)' }}>QR code</div>
            {qrToken && <div style={{ fontSize: 10, color: 'var(--sage)', letterSpacing: '0.05em' }}>✓ Tracked</div>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <canvas ref={canvasRef} style={{ borderRadius: 8, border: '1px solid var(--line-2)' }} />
          </div>
          <button onClick={downloadQr} style={{ width: '100%', padding: '9px 0', background: 'var(--charcoal)', color: 'var(--cream)', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
            ↓ Download QR (PNG)
          </button>
        </div>
      </div>

      {/* vCard download */}
      <div style={{ padding: 24, borderRadius: 14, background: 'var(--bg-surface)', border: '1px solid var(--line)', marginBottom: 16 }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 6 }}>Contact file (.vcf)</div>
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 14px' }}>Let people save you to their phone contacts in one tap.</p>
        <button onClick={downloadVcard} style={{ padding: '9px 18px', background: 'var(--cream-2)', color: 'var(--charcoal)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
          ↓ Download .vcf
        </button>
      </div>

      {/* Email signature */}
      <div style={{ padding: 24, borderRadius: 14, background: 'var(--bg-surface)', border: '1px solid var(--line)' }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 6 }}>Email signature</div>
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 14px' }}>Paste into Gmail, Outlook, or Apple Mail settings.</p>
        <div style={{ background: 'var(--cream-2)', borderRadius: 8, padding: '14px 16px', marginBottom: 12, fontSize: 13 }}>
          <strong>{card.display_name}</strong><br />
          {card.title && <span style={{ color: '#666' }}>{card.title}{card.company ? ` · ${card.company}` : ''}</span>}
          {card.title && <br />}
          <a href={baseUrl} style={{ color: 'var(--sage)', textDecoration: 'none' }}>View my digital card →</a>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => copy('', 'sig')} style={{ padding: '9px 18px', background: 'var(--charcoal)', color: 'var(--cream)', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
            {copied === 'sig' ? '✓ Copied HTML' : '⊡ Copy HTML signature'}
          </button>
          <button onClick={() => copy('', 'plain')} style={{ padding: '9px 18px', background: 'var(--cream-2)', color: 'var(--charcoal)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
            {copied === 'plain' ? '✓ Copied' : 'Copy plain text'}
          </button>
        </div>
      </div>
    </div>
  )
}

function buildEmailSig(card: Card, url: string): string {
  return `<table cellpadding="0" cellspacing="0" style="font-family:sans-serif;font-size:13px;color:#17181C"><tr><td><strong>${card.display_name ?? ''}</strong></td></tr>${card.title ? `<tr><td style="color:#666">${card.title}${card.company ? ` · ${card.company}` : ''}</td></tr>` : ''}<tr><td style="padding-top:6px"><a href="${url}" style="color:#8FAF9D;text-decoration:none">View my digital card →</a></td></tr></table>`
}
