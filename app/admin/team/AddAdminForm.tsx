'use client'

import { useState, useRef } from 'react'
import { addAdmin } from '@/lib/admin/actions'

export function AddAdminForm() {
  const [pending, setPending] = useState(false)
  const [result, setResult]   = useState<{ error?: string; success?: boolean } | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setResult(null)
    const formData = new FormData(e.currentTarget)
    const res = await addAdmin(formData)
    setResult(res)
    setPending(false)
    if (res?.success) formRef.current?.reset()
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <input
          name="email"
          type="email"
          required
          placeholder="admin@example.com"
          style={{
            flex: 1, minWidth: 220, padding: '10px 14px', border: '1px solid var(--line)',
            borderRadius: 10, fontSize: 13.5, fontFamily: 'inherit',
            background: 'var(--bg-surface)', outline: 'none', color: 'var(--charcoal)',
          }}
        />
        <button
          type="submit"
          disabled={pending}
          style={{
            padding: '10px 20px', background: 'var(--charcoal)', color: 'var(--cream)',
            border: 'none', borderRadius: 10, fontSize: 13.5, fontWeight: 500,
            cursor: pending ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            opacity: pending ? 0.6 : 1, whiteSpace: 'nowrap',
          }}
        >
          {pending ? 'Adding…' : 'Add admin'}
        </button>
      </div>
      {result?.error && (
        <p style={{ marginTop: 8, fontSize: 12.5, color: '#dc2626' }}>{result.error}</p>
      )}
      {result?.success && (
        <p style={{ marginTop: 8, fontSize: 12.5, color: '#16a34a' }}>✓ Admin added. They can now access /admin when signed in.</p>
      )}
      <p style={{ marginTop: 8, fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.5 }}>
        The person must already have an AvantCard account. Once added, they access the admin console at{' '}
        <code style={{ fontSize: 11, background: 'var(--cream-2)', padding: '1px 5px', borderRadius: 4 }}>
          leadcard.app/admin
        </code>
      </p>
    </form>
  )
}
