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
  const [error, setError] = useState<string | null>(null)

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
        Sign in to your LeadCard account
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={labelStyle}>Email</label>
          <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required autoFocus />
        </div>
        <div>
          <label style={labelStyle}>Password</label>
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
    <Suspense>
      <SignInForm />
    </Suspense>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }
const inputStyle: React.CSSProperties = { width: '100%', padding: '11px 14px', border: '1px solid var(--line)', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', background: 'white', outline: 'none', color: 'var(--charcoal)', boxSizing: 'border-box' }
const btnPrimaryStyle: React.CSSProperties = { width: '100%', padding: '13px 20px', background: 'var(--charcoal)', color: 'var(--cream)', borderRadius: 10, fontSize: 15, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', border: 'none', marginTop: 4 }
