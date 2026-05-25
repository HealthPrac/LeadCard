'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  cardId: string
  isAdmin: boolean
}

export function ToggleAdminButton({ cardId, isAdmin: initialIsAdmin }: Props) {
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function toggle() {
    setLoading(true)
    const next = !isAdmin
    const res = await fetch('/api/team/set-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId, isAdmin: next }),
    })
    if (res.ok) {
      setIsAdmin(next)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={isAdmin ? 'Remove admin access' : 'Grant admin access'}
      style={{
        fontSize: 11.5, fontWeight: 500, padding: '5px 10px',
        border: `1px solid ${isAdmin ? 'rgba(184,116,62,0.4)' : 'var(--line)'}`,
        borderRadius: 7, cursor: loading ? 'wait' : 'pointer',
        background: isAdmin ? 'rgba(184,116,62,0.10)' : 'transparent',
        color: isAdmin ? 'var(--copper)' : 'var(--muted)',
        fontFamily: 'inherit', whiteSpace: 'nowrap' as const,
        opacity: loading ? 0.6 : 1, transition: '120ms',
      }}
    >
      {loading ? '…' : isAdmin ? 'Admin ✓' : 'Make admin'}
    </button>
  )
}
