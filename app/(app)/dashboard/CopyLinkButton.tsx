'use client'

import { useState } from 'react'

export function CopyLinkButton({ url, fg }: { url: string; fg: string }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    })
  }

  return (
    <button
      onClick={copy}
      style={{
        padding: '9px 18px',
        background: 'rgba(255,255,255,0.08)',
        color: fg,
        border: '1px solid rgba(255,255,255,0.14)',
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: '120ms',
      }}
    >
      {copied ? '✓ Copied!' : '⎘ Copy link'}
    </button>
  )
}
