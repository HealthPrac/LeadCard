'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

interface Props {
  plan: string
  cardSlug: string | null
  displayName: string | null
  logoUrl: string | null
}

export function AppSidebar({ plan, cardSlug, displayName, logoUrl }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  const isTeamPlan = plan === 'small' || plan === 'enterprise'
  const planLabel = plan === 'enterprise' ? 'Enterprise' : plan === 'small' ? 'Small Business' : 'Solo'

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/sign-in')
  }

  const navItem = (href: string, label: string, icon: React.ReactNode, badge?: number) => {
    const active = pathname === href || pathname.startsWith(href + '/')
    return (
      <Link key={href} href={href} style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 12px', borderRadius: 4,
        fontSize: 13, fontWeight: active ? 500 : 400,
        background: active ? 'rgba(184,116,62,0.14)' : 'transparent',
        color: active ? 'var(--copper-lt)' : 'rgba(249,247,243,0.48)',
        textDecoration: 'none', transition: '120ms',
        borderLeft: active ? '2px solid var(--copper)' : '2px solid transparent',
      }}>
        <span style={{ fontSize: 13, opacity: active ? 1 : 0.7, flexShrink: 0, width: 16, textAlign: 'center' }}>{icon}</span>
        {label}
        {badge != null && badge > 0 && (
          <span style={{ marginLeft: 'auto', background: 'var(--copper)', color: '#fff', fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 999 }}>{badge}</span>
        )}
      </Link>
    )
  }

  return (
    <aside style={{
      background: '#17171C',
      borderRight: '1px solid rgba(255,255,255,0.07)',
      padding: '0 0 24px',
      display: 'flex', flexDirection: 'column', gap: 2,
      position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
    }}>
      {/* Brand / tenant logo — always white block */}
      <div style={{
        background: '#ffffff',
        padding: '20px 14px 18px',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        marginBottom: 8,
      }}>
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="Logo" height={30} style={{ display: 'block', maxWidth: 160, objectFit: 'contain' }} />
        ) : (
          <div style={{ height: 30, display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="22" height="22" viewBox="0 0 40 40" fill="none" style={{ flexShrink: 0 }}>
              <rect width="40" height="40" rx="8" fill="#F2EDE5"/>
              <path d="M20 8 L28 24 H12 Z" fill="none" stroke="#B8743E" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M14 24 L26 24" stroke="#B8743E" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="20" cy="30" r="2.5" fill="#D4975A" opacity="0.8"/>
            </svg>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 500, color: '#17171C', letterSpacing: '0.03em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
              Avant<span style={{ color: '#B8743E' }}>Card</span>
            </span>
          </div>
        )}
      </div>

      {/* Section label */}
      <div style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(249,247,243,0.28)', padding: '2px 26px 8px', fontWeight: 600 }}>My Card</div>

      <div style={{ padding: '0 14px' }}>
        {navItem('/dashboard', 'Overview', '⊞')}
        {navItem('/editor', 'My experience', '✦')}
        {isTeamPlan && navItem('/team', 'Team', '⊕')}
        {navItem('/analytics', 'Analytics', '↗')}
        {navItem('/leads', 'Leads', '◎')}
        {navItem('/share', 'Share & QR', '⊡')}
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '10px 14px' }} />
      <div style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(249,247,243,0.28)', padding: '2px 26px 8px', fontWeight: 600 }}>Account</div>
      <div style={{ padding: '0 14px' }}>
        {navItem('/settings', 'Settings', '◈')}

        {cardSlug && (
          <a href={`/c/${cardSlug}`} target="_blank" rel="noopener noreferrer" style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 4,
            fontSize: 13, color: 'rgba(249,247,243,0.35)', textDecoration: 'none',
            borderLeft: '2px solid transparent',
          }}>
            <span style={{ fontSize: 13, width: 16, textAlign: 'center' }}>↗</span>
            View live card
          </a>
        )}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.07)', padding: '16px 14px 0' }}>
        <ThemeToggle />
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '6px 0 8px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 12px' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'linear-gradient(135deg, #3A2015, #281810)',
            border: '1px solid rgba(184,116,62,0.3)',
            display: 'grid', placeItems: 'center',
            fontFamily: 'var(--font-serif)', fontSize: 13, fontWeight: 500,
            color: 'var(--copper-lt)', flexShrink: 0,
          }}>
            {(displayName ?? 'U')[0].toUpperCase()}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 500, color: 'rgba(249,247,243,0.82)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
            <div style={{ fontSize: 10.5, color: 'rgba(249,247,243,0.35)' }}>{planLabel}</div>
          </div>
        </div>
        <button onClick={handleSignOut} style={{
          display: 'flex', alignItems: 'center', gap: 9, padding: '6px 12px', borderRadius: 4,
          fontSize: 12.5, color: 'rgba(249,247,243,0.35)',
          background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', width: '100%',
        }}>
          <span style={{ width: 16, textAlign: 'center' }}>⎋</span> Sign out
        </button>
        <div style={{ paddingTop: 10, fontSize: 9.5, color: 'rgba(249,247,243,0.15)', textAlign: 'center', lineHeight: 1.5 }}>
          © 2026 HealthPrac Solutions. All Rights Reserved.
        </div>
      </div>
    </aside>
  )
}
