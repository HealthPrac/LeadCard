import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/sign-in', '/sign-up', '/forgot-password', '/reset-password']
const PUBLIC_PREFIXES = ['/c/', '/api/leads', '/api/events', '/api/webhooks', '/auth/confirm', '/api/admin/market-intel', '/my-leads/', '/api/crm/', '/api/ratings', '/api/bookings']
// Note: /api/billing/payfast-url requires auth — intentionally not public

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  const isPublic = PUBLIC_ROUTES.includes(path) ||
    PUBLIC_PREFIXES.some(p => path.startsWith(p))

  // Redirect unauthenticated users away from app routes
  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/sign-in'
    url.searchParams.set('redirectTo', path)
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages
  if (user && (path === '/sign-in' || path === '/sign-up')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
