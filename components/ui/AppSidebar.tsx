'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  plan: string
  cardSlug: string | null
  displayName: string | null
}

export function AppSidebar({ plan, cardSlug, displayName }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  const isTeamPlan = plan === 'small' || plan === 'enterprise'
  const planLabel = plan === 'enterprise' ? 'Enterprise' : plan === 'small' ? 'Small business' : 'Solo · $4/mo'

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/sign-in')
  }

  const navItem = (href: string, label: string, icon: string, badge?: number) => {
    const active = pathname === href || pathname.startsWith(href + '/')
    return (
      <Link key={href} href={href} style={{
        display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 8, fontSize: 13.5, fontWeight: active ? 500 : 400,
        background: active ? 'var(--cream-2)' : 'transparent', color: active ? 'var(--charcoal)' : 'var(--muted)',
        textDecoration: 'none', transition: '120ms',
      }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        {label}
        {badge != null && badge > 0 && (
          <span style={{ marginLeft: 'auto', background: 'var(--sage)', color: 'var(--charcoal)', fontSize: 11, fontWeight: 600, padding: '1px 7px', borderRadius: 999 }}>{badge}</span>
        )}
      </Link>
    )
  }

  return (
    <aside style={{ background: 'var(--cream)', borderRight: '1px solid var(--line)', padding: '22px 14px', display: 'flex', flexDirection: 'column', gap: 2, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '6px 10px 22px' }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--charcoal)', display: 'grid', placeItems: 'center', color: 'var(--sage)', fontFamily: 'var(--font-serif)', fontSize: 18, lineHeight: 1, paddingBottom: 2 }}>L</div>
        <span style={{ fontSize: 15.5, fontWeight: 500, letterSpacing: '-0.01em' }}>LeadCard</span>
      </div>

      {navItem('/dashboard', 'Overview', '⊞')}
      {navItem('/editor', 'My experience', '✦')}
      {isTeamPlan && navItem('/team', 'Team', '⊕')}
      {navItem('/analytics', 'Analytics', '↗')}
      {navItem('/leads', 'Leads', '◎')}
      {navItem('/share', 'Share & QR', '⊡')}
      {navItem('/nfc', 'NFC', '⬡')}

      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-2)', padding: '14px 10px 6px', marginTop: 8 }}>Account</div>
      {navItem('/settings', 'Settings', '◈')}

      {cardSlug && (
        <a href={`/c/${cardSlug}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 8, fontSize: 13.5, color: 'var(--muted)', textDecoration: 'none' }}>
          <span style={{ fontSize: 14 }}>↗</span> View live card
        </a>
      )}

      {/* Footer */}
      <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--line-2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--sage-tint)', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
            {(displayName ?? 'U')[0].toUpperCase()}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{planLabel}</div>
          </div>
        </div>
        <button onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '6px 10px', borderRadius: 8, fontSize: 12.5, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}>
          <span>⎋</span> Sign out
        </button>
      </div>
    </aside>
  )
}
