'use client'

import { useEffect, useState } from 'react'

export function ThemeToggle() {
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
