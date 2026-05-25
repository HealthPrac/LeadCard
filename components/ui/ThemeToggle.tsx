'use client'

import { useEffect, useState } from 'react'

interface Props {
  compact?: boolean  // icon-only mode for nav bar
}

export function ThemeToggle({ compact }: Props) {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const isDark = saved === 'dark'
    setDark(isDark)
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  if (compact) {
    return (
      <button
        onClick={toggle}
        title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        style={{
          width: 32, height: 32, borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'transparent', border: '1px solid var(--line)',
          cursor: 'pointer', fontSize: 15, color: 'var(--muted)',
          transition: '120ms',
        }}
      >
        {dark ? '☀' : '◑'}
      </button>
    )
  }

  return (
    <button
      onClick={toggle}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '6px 12px', borderRadius: 4, width: '100%',
        fontSize: 12.5, color: 'rgba(249,247,243,0.35)',
        background: 'none', border: 'none', cursor: 'pointer',
        fontFamily: 'inherit', transition: '120ms',
      }}
    >
      <span style={{ width: 16, textAlign: 'center', fontSize: 13 }}>
        {dark ? '☀' : '◑'}
      </span>
      {dark ? 'Light mode' : 'Dark mode'}
    </button>
  )
}
