'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(
    searchParams.get('error') === 'invalid_link' ? 'That reset link has expired or is invalid. Request a new one below.' : null
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }

    const redirectTo = searchParams.get('redirectTo') ?? '/dashboard'
    router.push(redirectTo)
    router.refresh()
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 400, margin: '0 0 8px', textAlign: 'center', letterSpacing: '-0.01em' }}>
        Welcome back
      </h1>
      <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--muted)', margin: '0 0 28px' }}>
        Sign in to your AvantCard account
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={labelStyle}>Email</label>
          <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required autoFocus />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
            <label style={labelStyle}>Password</label>
            <Link href="/forgot-password" style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'underline' }}>Forgot password?</Link>
          </div>
          <input style={inputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#B91C1C' }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} style={btnPrimaryStyle}>
          {loading ? 'Signing in…' : 'Sign in →'}
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)', marginTop: 20 }}>
        Don&apos;t have an account?{' '}
        <Link href="/sign-up" style={{ color: 'var(--charcoal)', textDecoration: 'underline' }}>Start free</Link>
      </p>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInForm />
    </Suspense>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12.5, fontWeight: 500, letterSpacing: '0.03em', marginBottom: 7 }
const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 14px', border: '1px solid var(--line)', borderRadius: 4, fontSize: 14, fontFamily: 'inherit', background: 'var(--bg-surface)', outline: 'none', color: 'var(--charcoal)', boxSizing: 'border-box' }
const btnPrimaryStyle: React.CSSProperties = { width: '100%', padding: '14px 20px', background: 'var(--copper)', color: '#fff', borderRadius: 4, fontSize: 13, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'inherit', cursor: 'pointer', border: 'none', marginTop: 6 }
