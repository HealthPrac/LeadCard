'use client'

import { useState } from 'react'

interface Props {
  cardId: string
  existingUrl: string | null
}

export function ShareDashboardButton({ cardId, existingUrl }: Props) {
  const [url, setUrl] = useState(existingUrl)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showUrl, setShowUrl] = useState(false)

  async function generate() {
    setLoading(true)
    try {
      const res = await fetch('/api/team/generate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_id: cardId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed')
      setUrl(json.url)
      setShowUrl(true)
      await copyToClipboard(json.url)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error generating link')
    } finally {
      setLoading(false)
    }
  }

  async function copyToClipboard(link: string) {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Clipboard API unavailable — show manually
    }
  }

  if (url && !showUrl) {
    return (
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <button
          onClick={async () => { await copyToClipboard(url); setShowUrl(true) }}
          style={{
            padding: '5px 12px', background: 'white', border: '1px solid var(--line)',
            borderRadius: 7, fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit',
            color: 'var(--charcoal)', whiteSpace: 'nowrap',
          }}
        >
          {copied ? '✓ Copied' : '⊡ Share dashboard'}
        </button>
        <button
          onClick={generate}
          disabled={loading}
          style={{
            padding: '5px 10px', background: 'none', border: '1px solid var(--line)',
            borderRadius: 7, fontSize: 11.5, cursor: 'pointer', fontFamily: 'inherit',
            color: 'var(--muted)', whiteSpace: 'nowrap',
          }}
          title="Revoke old link and generate a new one"
        >
          ↺ New link
        </button>
      </div>
    )
  }

  if (showUrl && url) {
    return (
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        <code style={{
          fontSize: 10.5, background: 'var(--cream-2)', padding: '4px 8px',
          borderRadius: 6, color: 'var(--muted)', maxWidth: 220,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block',
        }}>
          {url.replace(/^https?:\/\/[^/]+/, '')}
        </code>
        <button
          onClick={() => copyToClipboard(url)}
          style={{
            padding: '5px 12px', background: 'var(--charcoal)', color: 'var(--cream)',
            border: 'none', borderRadius: 7, fontSize: 12.5, cursor: 'pointer',
            fontFamily: 'inherit', whiteSpace: 'nowrap',
          }}
        >
          {copied ? '✓ Copied!' : 'Copy link'}
        </button>
        <button
          onClick={() => setShowUrl(false)}
          style={{
            padding: '5px 8px', background: 'none', border: 'none',
            fontSize: 13, cursor: 'pointer', color: 'var(--muted)',
          }}
        >
          ×
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={generate}
      disabled={loading}
      style={{
        padding: '5px 12px', background: 'white', border: '1px solid var(--line)',
        borderRadius: 7, fontSize: 12.5, cursor: loading ? 'wait' : 'pointer',
        fontFamily: 'inherit', color: 'var(--charcoal)', whiteSpace: 'nowrap',
      }}
    >
      {loading ? 'Generating…' : '⊡ Share dashboard'}
    </button>
  )
}
