'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name },
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Subscriber record + first card created in /onboarding
    router.push('/onboarding')
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 400, margin: '0 0 8px', textAlign: 'center', letterSpacing: '-0.01em' }}>
        Start for free
      </h1>
      <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--muted)', margin: '0 0 28px' }}>
        7-day trial · no card required · cancel anytime
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={labelStyle}>Your name</label>
          <input style={inputStyle} type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Avery Quinn" required autoFocus />
        </div>
        <div>
          <label style={labelStyle}>Work email</label>
          <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required />
        </div>
        <div>
          <label style={labelStyle}>Password <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(8+ characters)</span></label>
          <input style={inputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" minLength={8} required />
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#B91C1C' }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} style={btnPrimaryStyle}>
          {loading ? 'Creating account…' : 'Create account →'}
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)', marginTop: 20 }}>
        Already a subscriber?{' '}
        <Link href="/sign-in" style={{ color: 'var(--charcoal)', textDecoration: 'underline' }}>Sign in</Link>
      </p>
    </div>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }
const inputStyle: React.CSSProperties = { width: '100%', padding: '11px 14px', border: '1px solid var(--line)', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', background: 'white', outline: 'none', color: 'var(--charcoal)', boxSizing: 'border-box' }
const btnPrimaryStyle: React.CSSProperties = { width: '100%', padding: '13px 20px', background: 'var(--charcoal)', color: 'var(--cream)', borderRadius: 10, fontSize: 15, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', border: 'none', marginTop: 4 }
