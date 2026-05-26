'use client'

import { useState } from 'react'
import { AppSidebar } from '@/components/ui/AppSidebar'

interface Props {
  children: React.ReactNode
  plan: string
  cardSlug: string | null
  displayName: string | null
  logoUrl: string | null
  isAdmin: boolean
}

export function AppShell({ children, plan, cardSlug, displayName, logoUrl, isAdmin }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="lc-app-layout">
      {/* Mobile overlay */}
      <div
        className={`lc-mob-overlay${open ? ' open' : ''}`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <div className={`lc-app-sidebar-wrap${open ? ' open' : ''}`}>
        <AppSidebar
          plan={plan}
          cardSlug={cardSlug}
          displayName={displayName}
          logoUrl={logoUrl}
          isAdmin={isAdmin}
          onClose={() => setOpen(false)}
        />
      </div>

      {/* Main content */}
      <main className="lc-app-main">
        <button
          className="lc-main-ham"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
        >
          ☰ <span style={{ fontSize: 13 }}>Menu</span>
        </button>
        {children}
      </main>
    </div>
  )
}
