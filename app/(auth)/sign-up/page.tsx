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
  const [checkInbox, setCheckInbox] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name },
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=/onboarding`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // No session = email confirmation required
    if (!data.session) {
      setCheckInbox(true)
      setLoading(false)
      return
    }

    // Session exists = confirmation disabled, go straight to onboarding
    router.push('/onboarding')
  }

  // Check your inbox screen
  if (checkInbox) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 400, margin: '0 0 10px', letterSpacing: '-0.01em' }}>
          Check your inbox
        </h2>
        <p style={{ fontSize: 15, color: '#444', margin: '0 0 8px', lineHeight: 1.6 }}>
          We sent a confirmation link to
        </p>
        <p style={{ fontSize: 15, fontWeight: 500, margin: '0 0 24px' }}>{email}</p>
        <p style={{ fontSize: 14, color: 'var(--muted)', margin: '0 0 28px', lineHeight: 1.6 }}>
          Click the link in the email to verify your address and activate your account.
          It only takes a second.
        </p>
        <div style={{ padding: '14px 18px', background: 'var(--bg-surface)', borderRadius: 10, border: '1px solid var(--line)', fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>
          Didn&apos;t get it? Check your spam folder or{' '}
          <button
            onClick={() => setCheckInbox(false)}
            style={{ background: 'none', border: 'none', padding: 0, color: 'var(--charcoal)', textDecoration: 'underline', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}
          >
            try a different email
          </button>
          .
        </div>
        <Link href="/sign-in" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'underline' }}>
          Back to sign in
        </Link>
      </div>
    )
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

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12.5, fontWeight: 500, letterSpacing: '0.03em', marginBottom: 7 }
const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 14px', border: '1px solid var(--line)', borderRadius: 4, fontSize: 14, fontFamily: 'inherit', background: 'var(--bg-surface)', outline: 'none', color: 'var(--charcoal)', boxSizing: 'border-box' }
const btnPrimaryStyle: React.CSSProperties = { width: '100%', padding: '14px 20px', background: 'var(--copper)', color: '#fff', borderRadius: 4, fontSize: 13, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'inherit', cursor: 'pointer', border: 'none', marginTop: 6 }
