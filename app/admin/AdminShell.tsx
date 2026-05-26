'use client'

import { useState } from 'react'
import { AdminSidebar } from './AdminSidebar'

interface Props {
  children: React.ReactNode
  adminEmail: string
  cardSlug: string | null
}

export function AdminShell({ children, adminEmail, cardSlug }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="lc-admin-layout">
      {/* Mobile overlay */}
      <div
        className={`lc-mob-overlay${open ? ' open' : ''}`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <div className={`lc-admin-sidebar-wrap${open ? ' open' : ''}`}>
        <AdminSidebar
          adminEmail={adminEmail}
          cardSlug={cardSlug}
          onClose={() => setOpen(false)}
        />
      </div>

      {/* Main content */}
      <main className="lc-admin-main">
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
