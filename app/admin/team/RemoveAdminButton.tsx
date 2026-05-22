'use client'

import { useState } from 'react'
import { removeAdmin } from '@/lib/admin/actions'

export function RemoveAdminButton({ adminId, email }: { adminId: string; email: string }) {
  const [confirming, setConfirming] = useState(false)
  const [pending, setPending]       = useState(false)
  const [error, setError]           = useState<string | null>(null)

  async function handleRemove() {
    setPending(true)
    setError(null)
    const res = await removeAdmin(adminId)
    if (res?.error) { setError(res.error); setPending(false) }
    // On success the page revalidates — no need to update state
  }

  if (confirming) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Remove {email}?</span>
        <button
          onClick={handleRemove}
          disabled={pending}
          style={{ fontSize: 12, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}
        >
          {pending ? 'Removing…' : 'Confirm'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          style={{ fontSize: 12, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Cancel
        </button>
        {error && <span style={{ fontSize: 12, color: '#dc2626' }}>{error}</span>}
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      style={{ fontSize: 12, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
    >
      Remove
    </button>
  )
}
