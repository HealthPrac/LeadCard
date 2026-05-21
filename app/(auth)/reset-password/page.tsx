'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error: updateErr } = await supabase.auth.updateUser({ password })
    if (updateErr) {
      setError(updateErr.message)
      setLoading(false)
      return
    }
    setDone(true)
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  if (done) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16, color: '#8FAF9D' }}>✓</div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 400, margin: '0 0 8px' }}>Password updated</h2>
        <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0 }}>Taking you to your dashboard…</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ marginBottom: 6 }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 400, margin: '0 0 6px', letterSpacing: '-0.01em' }}>
          New password
        </h2>
        <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: 0 }}>
          Choose a strong password for your account.
        </p>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: '#FEE2E2', borderRadius: 8, fontSize: 13, color: '#DC2626' }}>
          {error}
        </div>
      )}

      <div>
        <label style={labelStyle}>
          New password <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(8+ characters)</span>
        </label>
        <input
          value={password}
          onChange={e => setPassword(e.target.value)}
          type="password"
          minLength={8}
          required
          autoFocus
          placeholder="••••••••"
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>Confirm password</label>
        <input
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          type="password"
          minLength={8}
          required
          placeholder="••••••••"
          style={inputStyle}
        />
      </div>

      <button type="submit" disabled={loading} style={btnStyle}>
        {loading ? 'Updating…' : 'Update password →'}
      </button>
    </form>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }
const btnStyle: React.CSSProperties = { padding: '11px 0', background: 'var(--charcoal)', color: 'var(--cream)', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }
