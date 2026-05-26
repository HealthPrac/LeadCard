'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

interface Props {
  adminEmail: string
  cardSlug?: string | null
}

export function AdminSidebar({ adminEmail, cardSlug }: Props) {
  const pathname = usePathname()
  const router   = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/sign-in')
  }

  const initials = (adminEmail[0] ?? 'A').toUpperCase()

  function navItem(href: string, label: string, icon: string) {
    const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
    return (
      <Link
        key={href}
        href={href}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '9px 12px', borderRadius: 8,
          fontSize: 13.5, fontWeight: active ? 600 : 400,
          background: active ? 'rgba(184,116,62,0.14)' : 'transparent',
          color: active ? '#F6F7F3' : 'rgba(246,247,243,0.55)',
          textDecoration: 'none', transition: '120ms',
        }}
      >
        <span style={{ fontSize: 15, opacity: active ? 1 : 0.7 }}>{icon}</span>
        {label}
      </Link>
    )
  }

  return (
    <aside style={{
      background: '#17181C',
      borderRight: '1px solid rgba(255,255,255,0.07)',
      padding: '22px 14px',
      display: 'flex', flexDirection: 'column', gap: 2,
      position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
      width: 220, flexShrink: 0,
    }}>
      {/* Brand */}
      <div style={{ padding: '6px 12px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none" style={{ flexShrink: 0 }}>
            <rect width="40" height="40" rx="8" fill="#111114"/>
            <path d="M20 8 L28 24 H12 Z" fill="none" stroke="#B8743E" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M14 24 L26 24" stroke="#B8743E" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="20" cy="30" r="2.5" fill="#D4975A" opacity="0.85"/>
          </svg>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 500, letterSpacing: '0.03em', lineHeight: 1 }}>
            <span style={{ color: '#F6F7F3' }}>Avant</span><span style={{ color: '#C07B40' }}>Card</span>
          </span>
        </div>
        <span style={{
          display: 'inline-block', fontSize: 9.5, fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          background: 'rgba(184,116,62,0.85)', color: '#fff',
          padding: '2px 8px', borderRadius: 4,
        }}>
          Admin Console
        </span>
      </div>

      {navItem('/admin',               'Overview',    '⊞')}
      {navItem('/admin/subscribers',  'Subscribers', '◎')}
      {navItem('/admin/analytics',    'Analytics',   '↯')}
      {navItem('/admin/leads',        'Leads',       '↗')}
      {navItem('/admin/enterprise',   'Enterprise',  '⬡')}
      {navItem('/admin/team',         'Admin team',  '⊕')}
      {navItem('/admin/promo-codes',  'Promo codes', '◈')}
      {navItem('/admin/pricing',      'Pricing',     '◎')}

      {/* Divider */}
      <div style={{ margin: '10px 12px', height: 1, background: 'rgba(255,255,255,0.07)' }} />

      {cardSlug ? (
        <Link
          href="/dashboard"
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 8, fontSize: 13,
            color: 'rgba(246,247,243,0.45)', textDecoration: 'none',
          }}
        >
          <span style={{ fontSize: 13 }}>←</span> Back to my card
        </Link>
      ) : (
        <Link
          href="/onboarding"
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 8, fontSize: 13,
            color: 'rgba(184,116,62,0.8)', textDecoration: 'none',
          }}
        >
          <span style={{ fontSize: 13 }}>✦</span> Set up AvantCard account
        </Link>
      )}

      {/* Footer */}
      <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 12px', marginBottom: 4 }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: '#B8743E', color: '#17181C',
            display: 'grid', placeItems: 'center',
            fontSize: 13, fontWeight: 700, flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12, color: 'rgba(246,247,243,0.9)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {adminEmail}
            </div>
            <div style={{ fontSize: 10.5, color: 'rgba(246,247,243,0.4)', marginTop: 1 }}>Administrator</div>
          </div>
        </div>
        <ThemeToggle />
        <button
          onClick={handleSignOut}
          style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '6px 12px', borderRadius: 8, fontSize: 12.5,
            color: 'rgba(246,247,243,0.4)', background: 'none',
            border: 'none', cursor: 'pointer', fontFamily: 'inherit', width: '100%',
          }}
        >
          <span>⎋</span> Sign out
        </button>
        <div style={{ paddingTop: 10, fontSize: 10, color: 'rgba(246,247,243,0.2)', textAlign: 'center', lineHeight: 1.5 }}>
          © 2026 HealthPrac Solutions.<br />All Rights Reserved.
        </div>
      </div>
    </aside>
  )
}
