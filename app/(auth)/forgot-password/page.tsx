'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm?next=/reset-password`,
    })
    if (error) { setErr(error.message); return }
    setSent(true)
  }

  if (sent) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>✉️</div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, margin: '0 0 8px' }}>Check your inbox</h2>
        <p style={{ fontSize: 14, color: 'var(--muted)', margin: '0 0 20px' }}>We sent a reset link to <strong>{email}</strong>.</p>
        <Link href="/sign-in" style={{ fontSize: 13, color: 'var(--charcoal)', textDecoration: 'underline' }}>Back to sign in</Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ marginBottom: 6 }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, margin: '0 0 6px', letterSpacing: '-0.01em' }}>Reset password</h2>
        <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: 0 }}>We&apos;ll email you a secure reset link.</p>
      </div>
      {err && <div style={{ padding: '10px 14px', background: '#FEE2E2', borderRadius: 8, fontSize: 13, color: '#DC2626' }}>{err}</div>}
      <div>
        <label style={{ fontSize: 12.5, fontWeight: 500, display: 'block', marginBottom: 6 }}>Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} type="email" required autoFocus
          style={{ width: '100%', padding: '12px 14px', borderRadius: 4, border: '1px solid var(--line)', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
      </div>
      <button type="submit" style={{ padding: '13px 0', background: 'var(--copper)', color: '#fff', border: 'none', borderRadius: 4, fontSize: 13, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}>
        Send reset link
      </button>
      <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>
        <Link href="/sign-in" style={{ color: 'var(--charcoal)', textDecoration: 'underline' }}>Back to sign in</Link>
      </div>
    </form>
  )
}

export default function ForgotPasswordPage() {
  return <Suspense><ForgotPasswordForm /></Suspense>
}
