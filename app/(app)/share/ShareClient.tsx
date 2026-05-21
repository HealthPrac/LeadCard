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

export default function ShareClient({ card, appUrl }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  const cardUrl = card ? `${appUrl}/c/${card.slug}` : null

  useEffect(() => {
    if (!cardUrl || !canvasRef.current) return
    QRCode.toCanvas(canvasRef.current, cardUrl, {
      width: 240,
      margin: 2,
      color: { dark: '#17181C', light: '#F6F7F3' },
    })
    QRCode.toDataURL(cardUrl, {
      width: 600,
      margin: 2,
      color: { dark: '#17181C', light: '#F6F7F3' },
    }).then(setQrDataUrl)
  }, [cardUrl])

  async function copy(value: string, key: string) {
    await navigator.clipboard.writeText(value)
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
    if (!card) return ''
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${card.display_name ?? ''}`,
    ]
    if (card.title || card.company) lines.push(`ORG:${card.company ?? ''};${card.title ?? ''}`)
    if (card.email) lines.push(`EMAIL:${card.email}`)
    if (card.mobile) lines.push(`TEL;TYPE=CELL:${card.mobile}`)
    if (cardUrl) lines.push(`URL:${cardUrl}`)
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

  const emailSig = card
    ? `<table cellpadding="0" cellspacing="0" style="font-family:sans-serif;font-size:13px;color:#17181C"><tr><td><strong>${card.display_name ?? ''}</strong></td></tr>${card.title ? `<tr><td style="color:#666">${card.title}${card.company ? ` · ${card.company}` : ''}</td></tr>` : ''}<tr><td style="padding-top:6px"><a href="${cardUrl}" style="color:#8FAF9D;text-decoration:none">View my digital card →</a></td></tr></table>`
    : ''

  if (!card) {
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
        <div style={{ padding: 24, borderRadius: 14, background: 'white', border: '1px solid var(--line)' }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 12 }}>Your card URL</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, background: 'var(--cream-2)', padding: '10px 14px', borderRadius: 8, marginBottom: 14, wordBreak: 'break-all', color: 'var(--charcoal)' }}>
            {cardUrl}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => copy(cardUrl!, 'url')} style={{ flex: 1, padding: '9px 0', background: 'var(--charcoal)', color: 'var(--cream)', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
              {copied === 'url' ? '✓ Copied' : '⊡ Copy link'}
            </button>
            <a href={cardUrl!} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: '9px 0', background: 'var(--cream-2)', color: 'var(--charcoal)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: 'none', textAlign: 'center' }}>
              ↗ Open card
            </a>
          </div>
        </div>

        {/* QR code */}
        <div style={{ padding: 24, borderRadius: 14, background: 'white', border: '1px solid var(--line)' }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 12 }}>QR code</div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <canvas ref={canvasRef} style={{ borderRadius: 8, border: '1px solid var(--line-2)' }} />
          </div>
          <button onClick={downloadQr} style={{ width: '100%', padding: '9px 0', background: 'var(--charcoal)', color: 'var(--cream)', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
            ↓ Download QR (PNG)
          </button>
        </div>
      </div>

      {/* vCard download */}
      <div style={{ padding: 24, borderRadius: 14, background: 'white', border: '1px solid var(--line)', marginBottom: 16 }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 6 }}>Contact file (.vcf)</div>
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 14px' }}>Let people save you to their phone contacts in one tap.</p>
        <button onClick={downloadVcard} style={{ padding: '9px 18px', background: 'var(--cream-2)', color: 'var(--charcoal)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
          ↓ Download .vcf
        </button>
      </div>

      {/* Email signature */}
      <div style={{ padding: 24, borderRadius: 14, background: 'white', border: '1px solid var(--line)' }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 6 }}>Email signature</div>
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 14px' }}>Paste into Gmail, Outlook, or Apple Mail settings.</p>
        <div style={{ background: 'var(--cream-2)', borderRadius: 8, padding: '14px 16px', marginBottom: 12, fontSize: 13 }}>
          <strong>{card.display_name}</strong><br />
          {card.title && <span style={{ color: '#666' }}>{card.title}{card.company ? ` · ${card.company}` : ''}</span>}
          {card.title && <br />}
          <a href={cardUrl!} style={{ color: 'var(--sage)', textDecoration: 'none' }}>View my digital card →</a>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => copy(emailSig, 'sig')} style={{ padding: '9px 18px', background: 'var(--charcoal)', color: 'var(--cream)', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
            {copied === 'sig' ? '✓ Copied HTML' : '⊡ Copy HTML signature'}
          </button>
          <button onClick={() => copy(`${card.display_name ?? ''}\n${card.title ? card.title + (card.company ? ' · ' + card.company : '') + '\n' : ''}${cardUrl}`, 'plain')} style={{ padding: '9px 18px', background: 'var(--cream-2)', color: 'var(--charcoal)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
            {copied === 'plain' ? '✓ Copied' : 'Copy plain text'}
          </button>
        </div>
      </div>
    </div>
  )
}
