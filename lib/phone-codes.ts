export const COUNTRY_CODES = [
  { code: '+27',  label: '🇿🇦 +27' },
  { code: '+1',   label: '🇺🇸 +1' },
  { code: '+44',  label: '🇬🇧 +44' },
  { code: '+61',  label: '🇦🇺 +61' },
  { code: '+64',  label: '🇳🇿 +64' },
  { code: '+33',  label: '🇫🇷 +33' },
  { code: '+49',  label: '🇩🇪 +49' },
  { code: '+31',  label: '🇳🇱 +31' },
  { code: '+32',  label: '🇧🇪 +32' },
  { code: '+353', label: '🇮🇪 +353' },
  { code: '+34',  label: '🇪🇸 +34' },
  { code: '+39',  label: '🇮🇹 +39' },
  { code: '+41',  label: '🇨🇭 +41' },
  { code: '+46',  label: '🇸🇪 +46' },
  { code: '+47',  label: '🇳🇴 +47' },
  { code: '+45',  label: '🇩🇰 +45' },
  { code: '+358', label: '🇫🇮 +358' },
  { code: '+55',  label: '🇧🇷 +55' },
  { code: '+52',  label: '🇲🇽 +52' },
  { code: '+54',  label: '🇦🇷 +54' },
  { code: '+91',  label: '🇮🇳 +91' },
  { code: '+86',  label: '🇨🇳 +86' },
  { code: '+81',  label: '🇯🇵 +81' },
  { code: '+82',  label: '🇰🇷 +82' },
  { code: '+65',  label: '🇸🇬 +65' },
  { code: '+971', label: '🇦🇪 +971' },
  { code: '+966', label: '🇸🇦 +966' },
  { code: '+234', label: '🇳🇬 +234' },
  { code: '+254', label: '🇰🇪 +254' },
  { code: '+260', label: '🇿🇲 +260' },
  { code: '+263', label: '🇿🇼 +263' },
  { code: '+267', label: '🇧🇼 +267' },
]

/** Split a stored mobile string (e.g. "+27 82 555 0100") into [code, number]. */
export function splitPhone(mobile: string | null | undefined): [string, string] {
  if (!mobile) return ['+27', '']
  // Try longest codes first to avoid e.g. "+1" matching "+1 (353...)"
  const sorted = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length)
  for (const { code } of sorted) {
    if (mobile.startsWith(code + ' ') || mobile === code) {
      return [code, mobile.slice(code.length).trim()]
    }
  }
  // Fallback: unknown country code already in string
  const match = mobile.match(/^(\+\d{1,4})\s(.*)$/)
  if (match) return [match[1], match[2]]
  return ['+27', mobile]
}

/** Combine code + number into a single stored value. */
export function joinPhone(code: string, number: string): string {
  const n = number.trim()
  return n ? `${code} ${n}` : ''
}
