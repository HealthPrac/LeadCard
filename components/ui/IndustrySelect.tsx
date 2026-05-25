'use client'

import { useState, useRef, useEffect } from 'react'

export const INDUSTRIES = [
  'Accounting & Finance',
  'Advertising & Marketing',
  'Agriculture & Farming',
  'Architecture & Design',
  'Automotive',
  'Aviation & Transport',
  'Banking & Financial Services',
  'Business Consulting',
  'Construction',
  'Education & Training',
  'Energy & Utilities',
  'Engineering',
  'Entertainment & Media',
  'Environmental Services',
  'Fashion & Apparel',
  'Food & Beverage',
  'Government & Public Sector',
  'Healthcare & Medical',
  'Hospitality & Tourism',
  'Human Resources & Recruitment',
  'Information Technology',
  'Insurance',
  'Legal Services',
  'Logistics & Supply Chain',
  'Manufacturing',
  'Mining & Resources',
  'Non-Profit & NGO',
  'Pharmaceuticals',
  'Property & Real Estate',
  'Retail & E-commerce',
  'Security Services',
  'Sports & Fitness',
  'Technology & Software',
  'Telecommunications',
  'Other',
]

export function IndustrySelect({ selection, otherText, onSelection, onOther }: {
  selection: string
  otherText: string
  onSelection: (v: string) => void
  onOther: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const filtered = search
    ? INDUSTRIES.filter(i => i.toLowerCase().includes(search.toLowerCase()))
    : INDUSTRIES

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  useEffect(() => {
    if (open) searchRef.current?.focus()
  }, [open])

  function pick(v: string) {
    onSelection(v)
    setOpen(false)
    setSearch('')
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', padding: '10px 14px', border: '1px solid var(--line)',
          borderRadius: 10, fontSize: 14, fontFamily: 'inherit', background: 'var(--bg-surface)',
          outline: 'none', boxSizing: 'border-box' as const,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', textAlign: 'left' as const,
          color: selection ? 'var(--charcoal)' : '#9CA3AF',
        }}
      >
        <span>{selection || 'Select industry…'}</span>
        <span style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 8, flexShrink: 0 }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.10)', zIndex: 200, overflow: 'hidden',
        }}>
          <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-2)' }}>
            <input
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search industries…"
              style={{ width: '100%', border: 'none', outline: 'none', fontSize: 13.5, fontFamily: 'inherit', background: 'transparent', color: 'var(--charcoal)', boxSizing: 'border-box' as const }}
            />
          </div>
          <div style={{ maxHeight: 220, overflowY: 'auto' as const }}>
            {filtered.length === 0
              ? <div style={{ padding: '12px 14px', fontSize: 13, color: 'var(--muted)' }}>No results</div>
              : filtered.map((ind, i) => (
                <button
                  key={ind}
                  type="button"
                  onClick={() => pick(ind)}
                  style={{
                    display: 'block', width: '100%', padding: '10px 14px',
                    textAlign: 'left' as const, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5,
                    border: 'none',
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--line-2)' : 'none',
                    background: selection === ind ? 'var(--cream-2)' : 'transparent',
                    color: 'var(--charcoal)',
                    fontWeight: ind === 'Other' ? 500 : 400,
                  }}
                >
                  {ind}
                </button>
              ))
            }
          </div>
        </div>
      )}

      {selection === 'Other' && (
        <div style={{ marginTop: 8 }}>
          <input
            autoFocus
            style={{
              width: '100%', padding: '10px 14px', border: '1px solid var(--line)',
              borderRadius: 10, fontSize: 14, fontFamily: 'inherit', background: 'var(--bg-surface)',
              outline: 'none', color: 'var(--charcoal)', boxSizing: 'border-box' as const,
            }}
            value={otherText}
            onChange={e => onOther(e.target.value)}
            placeholder="Please specify your industry…"
          />
        </div>
      )}
    </div>
  )
}
