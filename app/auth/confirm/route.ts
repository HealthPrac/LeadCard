import { createClient } from '@/lib/supabase/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  // Always use the configured app URL — never trust request.url origin
  // in Amplify SSR (Lambda proxy can report localhost internally)
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://main.d2idx6kv8dvjyf.amplifyapp.com'

  const supabase = await createClient()

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) {
      return NextResponse.redirect(new URL(next, base))
    }
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(new URL(next, base))
    }
  }

  return NextResponse.redirect(new URL('/sign-in?error=invalid_link', base))
}
