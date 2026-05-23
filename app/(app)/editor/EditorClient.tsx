'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { COUNTRY_CODES, splitPhone, joinPhone } from '@/lib/phone-codes'
import { INDUSTRIES, IndustrySelect } from '@/components/ui/IndustrySelect'

const PALETTES = [
  { label: 'Midnight', bg: '#17181C', fg: '#F6F7F3', accent: '#8FAF9D' },
  { label: 'Sage',     bg: '#2C3E2D', fg: '#F0F4F0', accent: '#A3C2A8' },
  { label: 'Linen',    bg: '#F5F0E8', fg: '#2A2118', accent: '#C4956A' },
  { label: 'Slate',    bg: '#1E2A38', fg: '#E8EDF2', accent: '#7BAED4' },
  { label: 'Blush',    bg: '#3D1C2E', fg: '#F9EFF5', accent: '#D4889A' },
  { label: 'Cream',    bg: '#FAF8F3', fg: '#1A1A18', accent: '#9E9E7C' },
  { label: 'Ocean',    bg: '#0D2137', fg: '#E5F0FA', accent: '#5BA3C9' },
  { label: 'Forest',   bg: '#1A2F1E', fg: '#EDF4EE', accent: '#6FAF7F' },
]

const FONT_OPTIONS = [
  { value: 'serif',    label: 'Instrument Serif',    fontFamily: '"Instrument Serif", Georgia, serif' },
  { value: 'playfair', label: 'Playfair Display',    fontFamily: '"Playfair Display", Georgia, serif' },
  { value: 'cormorant',label: 'Cormorant Garamond',  fontFamily: '"Cormorant Garamond", Georgia, serif' },
  { value: 'dm-serif', label: 'DM Serif Display',    fontFamily: '"DM Serif Display", Georgia, serif' },
  { value: 'sans',     label: 'Geist Sans',           fontFamily: '"Geist", system-ui, sans-serif' },
  { value: 'inter',    label: 'Inter',                fontFamily: '"Inter", system-ui, sans-serif' },
]

const FONT_SIZE_OPTIONS = [
  { value: 'compact', label: 'Compact', nameSize: 36 },
  { value: 'default', label: 'Default', nameSize: 44 },
  { value: 'large',   label: 'Large',   nameSize: 54 },
]

const LINK_ICONS: Record<string, string> = {
  instagram: '📸', facebook: '👤', linkedin: '🔗', twitter: '🐦',
  whatsapp: '💬', tiktok: '🎵', youtube: '▶️', website: '🌐',
  calendly: '📅', github: '🐙', other: '🔗',
}

interface FormField { id: string; label: string; type: string; required: boolean }
interface CardLink { id: string; type: string; label: string; url: string }

const DEFAULT_FORM_FIELDS: FormField[] = [
  { id: 'firstName', label: 'First name', required: true,  type: 'text' },
  { id: 'lastName',  label: 'Last name',  required: true,  type: 'text' },
  { id: 'email',     label: 'Email',      required: true,  type: 'email' },
  { id: 'org',       label: 'Company',    required: false, type: 'text' },
  { id: 'role',      label: 'Role',       required: false, type: 'text' },
  { id: 'mobile',    label: 'Mobile',     required: false, type: 'tel' },
]

interface Card {
  id: string
  slug: string
  display_name: string | null
  title: string | null
  company: string | null
  email: string | null
  mobile: string | null
  website: string | null
  industry: string | null
  welcome_headline: string | null
  welcome_body: string | null
  cta_primary_label: string | null
  cta_primary_url: string | null
  cta_secondary_label: string | null
  cta_secondary_url: string | null
  form_fields: FormField[]
  lead_destination_email: string | null
  links: CardLink[]
  theme_bg: string
  theme_fg: string
  theme_accent: string
  theme_banner_bg: string | null
  theme_heading: string | null
  theme_subtext: string | null
  theme_font: string
  theme_font_size: string
  photo_path: string | null
  logo_path: string | null
  video_path: string | null
  footer_note: string | null
  google_review_url: string | null
  is_published: boolean
}

interface Props {
  card: Card
  photoUrl: string | null
  logoUrl: string | null
  videoUrl: string | null
  appUrl: string
}

export default function EditorClient({ card, photoUrl, logoUrl, videoUrl, appUrl }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<'identity' | 'welcome' | 'video' | 'cta' | 'form' | 'links' | 'theme'>('identity')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState('')

  // Form state
  const [displayName, setDisplayName] = useState(card.display_name ?? '')
  const [title, setTitle] = useState(card.title ?? '')
  const [company, setCompany] = useState(card.company ?? '')
  const [email, setEmail] = useState(card.email ?? '')

  const [mobileParsed] = useState(() => splitPhone(card.mobile))
  const [mobileCode, setMobileCode] = useState(mobileParsed[0])
  const [mobileNumber, setMobileNumber] = useState(mobileParsed[1])

  const [website, setWebsite] = useState(card.website ?? '')
  const [footerNote, setFooterNote] = useState(card.footer_note ?? '')
  const [googleReviewUrl, setGoogleReviewUrl] = useState(card.google_review_url ?? '')

  const storedIndustry = card.industry ?? ''
  const isStoredCustom = storedIndustry !== '' && !INDUSTRIES.includes(storedIndustry)
  const [industrySelection, setIndustrySelection] = useState(isStoredCustom ? 'Other' : storedIndustry)
  const [industryOther, setIndustryOther] = useState(isStoredCustom ? storedIndustry : '')
  const industry = industrySelection === 'Other' ? industryOther.trim() : industrySelection

  const [headline, setHeadline] = useState(card.welcome_headline ?? '')
  const [body, setBody] = useState(card.welcome_body ?? '')
  const [ctaPrimaryLabel, setCtaPrimaryLabel] = useState(card.cta_primary_label ?? '')
  const [ctaPrimaryUrl, setCtaPrimaryUrl] = useState(card.cta_primary_url ?? '')
  const [ctaSecondaryLabel, setCtaSecondaryLabel] = useState(card.cta_secondary_label ?? '')
  const [ctaSecondaryUrl, setCtaSecondaryUrl] = useState(card.cta_secondary_url ?? '')
  const [formFields, setFormFields] = useState<FormField[]>(card.form_fields ?? [])
  const [leadFormEnabled, setLeadFormEnabled] = useState((card.form_fields ?? []).length > 0)
  const [leadEmail, setLeadEmail] = useState(card.lead_destination_email ?? '')
  const [links, setLinks] = useState<CardLink[]>(card.links ?? [])

  const [themeBg, setThemeBg] = useState(card.theme_bg)
  const [themeFg, setThemeFg] = useState(card.theme_fg)
  const [themeAccent, setThemeAccent] = useState(card.theme_accent)
  const [themeBannerBg, setThemeBannerBg] = useState(card.theme_banner_bg ?? '')
  const [themeHeading, setThemeHeading] = useState(card.theme_heading ?? '')
  const [themeSubtext, setThemeSubtext] = useState(card.theme_subtext ?? '')
  const [themeFont, setThemeFont] = useState(card.theme_font ?? 'serif')
  const [themeFontSize, setThemeFontSize] = useState(card.theme_font_size ?? 'default')

  // File upload state
  const [photoPreview, setPhotoPreview] = useState(photoUrl)
  const [logoPreview, setLogoPreview] = useState(logoUrl)
  const [videoPreview, setVideoPreview] = useState(videoUrl)
  const [videoIsHtml, setVideoIsHtml] = useState(() => card.video_path?.endsWith('.html') ?? false)
  const [uploading, setUploading] = useState<string | null>(null)

  const photoRef = useRef<HTMLInputElement>(null)
  const logoRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)

  async function uploadFile(file: File, type: 'photo' | 'logo' | 'video') {
    setUploading(type)
    try {
      const res = await fetch(`/api/upload-url?type=${type}&cardId=${card.id}&filename=${encodeURIComponent(file.name)}`)
      if (!res.ok) throw new Error('Failed to get upload URL')
      const { uploadUrl, path } = await res.json()
      await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
      await fetch('/api/cards/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: card.id, [`${type}_path`]: path }),
      })
      const preview = URL.createObjectURL(file)
      if (type === 'photo') setPhotoPreview(preview)
      if (type === 'video') {
        setVideoPreview(preview)
        setVideoIsHtml(file.type === 'text/html')
      }
      if (type === 'logo') {
        setLogoPreview(preview)
        router.refresh()  // re-runs server layout so sidebar logo updates immediately
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Upload failed')
    }
    setUploading(null)
  }

  async function deleteLogo() {
    try {
      await fetch('/api/cards/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: card.id, logo_path: null }),
      })
      setLogoPreview(null)
      router.refresh()
    } catch {
      setErr('Delete failed')
    }
  }

  async function save() {
    setSaving(true)
    setErr('')
    try {
      const res = await fetch('/api/cards/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: card.id,
          display_name: displayName,
          title,
          company,
          email,
          mobile: joinPhone(mobileCode, mobileNumber),
          website,
          industry,
          welcome_headline: headline,
          welcome_body: body,
          cta_primary_label: ctaPrimaryLabel,
          cta_primary_url: ctaPrimaryUrl,
          cta_secondary_label: ctaSecondaryLabel,
          cta_secondary_url: ctaSecondaryUrl,
          form_fields: formFields,
          lead_destination_email: leadEmail,
          links,
          footer_note: footerNote.trim() || null,
          google_review_url: googleReviewUrl.trim() || null,
          theme_bg: themeBg,
          theme_fg: themeFg,
          theme_accent: themeAccent,
          theme_banner_bg: themeBannerBg || null,
          theme_heading: themeHeading || null,
          theme_subtext: themeSubtext || null,
          theme_font: themeFont,
          theme_font_size: themeFontSize,
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Save failed')
    }
    setSaving(false)
  }

  const tabButton = (key: typeof tab, label: string) => (
    <button
      key={key}
      onClick={() => setTab(key)}
      style={{
        padding: '7px 14px', borderRadius: 7, fontSize: 13, fontWeight: tab === key ? 500 : 400,
        background: tab === key ? 'var(--charcoal)' : 'transparent',
        color: tab === key ? 'var(--cream)' : 'var(--muted)',
        border: 'none', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )

  const field = (label: string, value: string, onChange: (v: string) => void, placeholder?: string, type?: string) => (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6, color: 'var(--charcoal)' }}>{label}</label>
      {type === 'textarea' ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          rows={3}
          style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', fontSize: 13.5, fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type ?? 'text'}
          style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', fontSize: 13.5, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
      )}
    </div>
  )

  const fileUploader = (type: 'photo' | 'logo' | 'video', label: string, accept: string, preview: string | null, ref: React.RefObject<HTMLInputElement>, isHtml?: boolean) => (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6, color: 'var(--charcoal)' }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {preview && (
          type === 'video'
            ? isHtml
              ? <div style={{ width: 80, height: 54, borderRadius: 6, border: '1px solid var(--line)', background: 'var(--cream-2)', display: 'grid', placeItems: 'center', fontSize: 22 }}>🌐</div>
              : <video src={preview} style={{ width: 80, height: 54, borderRadius: 6, objectFit: 'cover', border: '1px solid var(--line)' }} muted />
            : <img src={preview} alt={label} style={{ width: 52, height: 52, borderRadius: type === 'photo' ? '50%' : 6, objectFit: 'cover', border: '1px solid var(--line)' }} />
        )}
        <input ref={ref} type="file" accept={accept} style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f, type) }} />
        <button onClick={() => ref.current?.click()}
          disabled={uploading === type}
          style={{ padding: '8px 16px', background: 'var(--cream-2)', color: 'var(--charcoal)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 13, cursor: uploading === type ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
          {uploading === type ? 'Uploading…' : preview ? 'Replace' : 'Upload'}
        </button>
      </div>
    </div>
  )

  const activeFontFamily = FONT_OPTIONS.find(f => f.value === themeFont)?.fontFamily ?? FONT_OPTIONS[0].fontFamily
  const activeFontSize = FONT_SIZE_OPTIONS.find(s => s.value === themeFontSize)?.nameSize ?? 44

  return (
    <div style={{ maxWidth: 780 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, margin: 0, letterSpacing: '-0.01em' }}>Edit card</h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <a href={`${appUrl}/c/${card.slug}`} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none' }}>↗ Preview live</a>
          <button onClick={save} disabled={saving}
            style={{ padding: '9px 22px', background: 'var(--charcoal)', color: 'var(--cream)', border: 'none', borderRadius: 8, fontSize: 13.5, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save changes'}
          </button>
        </div>
      </div>

      {err && <div style={{ padding: '10px 14px', background: '#FEE2E2', borderRadius: 8, fontSize: 13, color: '#DC2626', marginBottom: 16 }}>{err}</div>}

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--cream-2)', padding: 4, borderRadius: 10, overflowX: 'auto' }}>
        {tabButton('theme', 'Theme')}
        {tabButton('identity', 'Identity')}
        {tabButton('welcome', 'Welcome')}
        {tabButton('video', 'Video')}
        {tabButton('cta', 'CTA')}
        {tabButton('form', 'Lead form')}
        {tabButton('links', 'Links')}
      </div>

      <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', padding: 28 }}>

        {tab === 'identity' && (
          <div>
            {field('Display name', displayName, setDisplayName, 'Your full name')}
            {field('Job title', title, setTitle, 'e.g. Head of Sales')}
            {field('Company', company, setCompany, 'e.g. Acme Corp')}
            {field('Email', email, setEmail, 'you@company.com', 'email')}

            {/* Mobile with country code */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6, color: 'var(--charcoal)' }}>Mobile / WhatsApp</label>
              <div style={{ display: 'flex', border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden', background: 'white' }}>
                <select
                  value={mobileCode}
                  onChange={e => setMobileCode(e.target.value)}
                  style={{ padding: '10px 8px', border: 'none', borderRight: '1px solid var(--line)', fontSize: 13, fontFamily: 'inherit', outline: 'none', background: 'var(--cream-2)', cursor: 'pointer', flexShrink: 0 }}
                >
                  {COUNTRY_CODES.map(cc => (
                    <option key={cc.code} value={cc.code}>{cc.label}</option>
                  ))}
                </select>
                <input
                  value={mobileNumber}
                  onChange={e => setMobileNumber(e.target.value)}
                  placeholder="82 000 0000"
                  style={{ flex: 1, padding: '10px 12px', border: 'none', fontSize: 13.5, fontFamily: 'inherit', outline: 'none', minWidth: 0 }}
                />
              </div>
            </div>

            {field('Website', website, setWebsite, 'https://yourwebsite.com', 'url')}

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6, color: 'var(--charcoal)' }}>Industry</label>
              <IndustrySelect
                selection={industrySelection}
                otherText={industryOther}
                onSelection={setIndustrySelection}
                onOther={setIndustryOther}
              />
            </div>

            <div style={{ borderTop: '1px solid var(--line-2)', paddingTop: 18, marginTop: 4 }}>
              {fileUploader('photo', 'Profile photo', 'image/jpeg,image/png,image/webp', photoPreview, photoRef as React.RefObject<HTMLInputElement>)}
            </div>

            <div style={{ borderTop: '1px solid var(--line-2)', paddingTop: 18, marginTop: 4 }}>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 4, color: 'var(--charcoal)' }}>
                  Footer note
                </label>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 8px', lineHeight: 1.5 }}>
                  Tiny compliance line at the bottom of your card — e.g. &quot;PPRA registered · Member #12345&quot;, &quot;HPCSA registered&quot;, &quot;FPI Certified Financial Planner&quot;.
                </p>
                <input
                  value={footerNote}
                  onChange={e => setFooterNote(e.target.value)}
                  placeholder="e.g. PPRA registered · Member #12345"
                  maxLength={120}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', fontSize: 13.5, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const }}
                />
                <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'right' as const, marginTop: 4 }}>{footerNote.length}/120</div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 4, color: 'var(--charcoal)' }}>
                  Google Reviews link
                </label>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 8px', lineHeight: 1.5 }}>
                  Paste your Google Business Profile review URL. Happy visitors (4–5 stars) will be invited to leave a Google review after rating your service.
                </p>
                <input
                  value={googleReviewUrl}
                  onChange={e => setGoogleReviewUrl(e.target.value)}
                  placeholder="https://g.page/r/your-review-link"
                  type="url"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', fontSize: 13.5, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const }}
                />
              </div>
            </div>
          </div>
        )}

        {tab === 'welcome' && (
          <div>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 20px', lineHeight: 1.6 }}>
              The welcome screen is the first thing visitors see. A strong headline and a short personal note make them feel like they know you already.
            </p>
            {field('Headline', headline, setHeadline, 'e.g. Nice to meet you!')}
            {field('Body copy', body, setBody, 'A short personal introduction or tagline…', 'textarea')}
          </div>
        )}

        {tab === 'video' && (
          <div>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 20px', lineHeight: 1.6 }}>
              Upload a short intro video (MP4) or an animated HTML file. It plays after the welcome screen. If nothing is uploaded, an animated placeholder is shown instead.
            </p>
            {fileUploader('video', 'Intro video — MP4 or HTML (max 100 MB)', 'video/mp4,video/webm,video/quicktime,text/html,.html', videoPreview, videoRef as React.RefObject<HTMLInputElement>, videoIsHtml)}
            {videoPreview && (
              videoIsHtml
                ? <iframe src={videoPreview} sandbox="allow-scripts allow-same-origin" style={{ width: '100%', height: 280, borderRadius: 10, marginTop: 8, border: '1px solid var(--line)', background: '#000' }} />
                : <video src={videoPreview} controls style={{ width: '100%', borderRadius: 10, marginTop: 8, maxHeight: 280, background: '#000' }} />
            )}
          </div>
        )}

        {tab === 'cta' && (
          <div>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 20px', lineHeight: 1.6 }}>
              CTAs appear after the video. Use the primary CTA to drive a specific action (book a call, visit your site). Leave secondary blank if you only want one button. If you add a URL but no lead form fields, the secondary button links directly to that URL (e.g. a booking page).
            </p>
            <div style={{ background: 'var(--cream-2)', borderRadius: 10, padding: '16px 18px', marginBottom: 22 }}>
              <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>Primary CTA</div>
              {field('Button label', ctaPrimaryLabel, setCtaPrimaryLabel, 'e.g. Book a call')}
              {field('URL', ctaPrimaryUrl, setCtaPrimaryUrl, 'https://calendly.com/you', 'url')}
            </div>
            <div style={{ background: 'var(--cream-2)', borderRadius: 10, padding: '16px 18px' }}>
              <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>Secondary CTA</div>
              {field('Button label', ctaSecondaryLabel, setCtaSecondaryLabel, 'e.g. View our work')}
              {field('URL', ctaSecondaryUrl, setCtaSecondaryUrl, 'https://yourportfolio.com', 'url')}
            </div>
          </div>
        )}

        {tab === 'form' && (
          <div>
            {/* Lead form toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--cream-2)', borderRadius: 10, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>Enable lead capture form</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                  {leadFormEnabled
                    ? 'Secondary CTA opens this form to collect visitor details.'
                    : 'Secondary CTA links directly to your booking URL (Calendly, PickTime, etc.).'}
                </div>
              </div>
              <button
                onClick={() => {
                  const next = !leadFormEnabled
                  setLeadFormEnabled(next)
                  if (next && formFields.length === 0) setFormFields(DEFAULT_FORM_FIELDS)
                  if (!next) setFormFields([])
                }}
                style={{
                  width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', flexShrink: 0,
                  background: leadFormEnabled ? 'var(--charcoal)' : '#CBD5E1',
                  position: 'relative', transition: 'background 200ms',
                }}
              >
                <span style={{
                  position: 'absolute', top: 3, width: 18, height: 18, borderRadius: '50%', background: 'white',
                  left: leadFormEnabled ? 23 : 3, transition: 'left 200ms', display: 'block',
                }} />
              </button>
            </div>

            {leadFormEnabled && (
              <>
                <div style={{ marginBottom: 20 }}>
                  {formFields.map((f, i) => (
                    <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--cream-2)', borderRadius: 8, marginBottom: 8 }}>
                      <span style={{ flex: 1, fontSize: 13.5 }}>{f.label}</span>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, cursor: f.id === 'email' ? 'not-allowed' : 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={f.required}
                          disabled={f.id === 'email'}
                          onChange={e => setFormFields(formFields.map((ff, j) => j === i ? { ...ff, required: e.target.checked } : ff))}
                        />
                        Required
                      </label>
                      {f.id !== 'email' && (
                        <button onClick={() => setFormFields(formFields.filter((_, j) => j !== i))}
                          style={{ fontSize: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', lineHeight: 1 }}>×</button>
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid var(--line-2)', paddingTop: 18 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 10 }}>Lead notification email</div>
                  {field('Send new leads to', leadEmail, setLeadEmail, 'you@company.com (leave blank to use account email)', 'email')}
                </div>
              </>
            )}

            {!leadFormEnabled && ctaSecondaryUrl && (
              <div style={{ padding: '12px 16px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, fontSize: 13, color: '#1E40AF' }}>
                Visitors clicking your secondary CTA will go directly to: <strong>{ctaSecondaryUrl}</strong>
              </div>
            )}
            {!leadFormEnabled && !ctaSecondaryUrl && (
              <div style={{ padding: '12px 16px', background: '#FEF9C3', border: '1px solid #FDE047', borderRadius: 8, fontSize: 13, color: '#854D0E' }}>
                Set a secondary CTA URL in the <button onClick={() => setTab('cta')} style={{ background: 'none', border: 'none', padding: 0, fontFamily: 'inherit', fontSize: 13, color: '#854D0E', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>CTA tab</button> so visitors know where to book.
              </div>
            )}
          </div>
        )}

        {tab === 'links' && (
          <div>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 20px', lineHeight: 1.6 }}>
              Social and contact links shown on your welcome screen.
            </p>
            {links.map((l, i) => (
              <div key={l.id} style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
                <select value={l.type} onChange={e => setLinks(links.map((ll, j) => j === i ? { ...ll, type: e.target.value } : ll))}
                  style={{ padding: '9px 10px', borderRadius: 8, border: '1px solid var(--line)', fontSize: 13, fontFamily: 'inherit', outline: 'none' }}>
                  {Object.keys(LINK_ICONS).map(k => <option key={k} value={k}>{k}</option>)}
                </select>
                <input value={l.label} onChange={e => setLinks(links.map((ll, j) => j === i ? { ...ll, label: e.target.value } : ll))}
                  placeholder="Label" style={{ width: 130, padding: '9px 12px', borderRadius: 8, border: '1px solid var(--line)', fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
                <input value={l.url} onChange={e => setLinks(links.map((ll, j) => j === i ? { ...ll, url: e.target.value } : ll))}
                  placeholder="https://…" style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: '1px solid var(--line)', fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
                <button onClick={() => setLinks(links.filter((_, j) => j !== i))}
                  style={{ fontSize: 18, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', lineHeight: 1, flexShrink: 0 }}>×</button>
              </div>
            ))}
            <button
              onClick={() => setLinks([...links, { id: crypto.randomUUID(), type: 'linkedin', label: 'LinkedIn', url: '' }])}
              style={{ padding: '8px 16px', background: 'var(--cream-2)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
              + Add link
            </button>
          </div>
        )}

        {tab === 'theme' && (
          <div>
            {/* ── Colour presets ── */}
            <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>Presets</div>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 12px', lineHeight: 1.5 }}>
              Pick a starting palette, then fine-tune each colour below.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 28 }}>
              {PALETTES.map(p => (
                <button
                  key={p.label}
                  onClick={() => {
                    setThemeBg(p.bg); setThemeFg(p.fg); setThemeAccent(p.accent)
                    setThemeBannerBg(''); setThemeHeading(''); setThemeSubtext('')
                  }}
                  style={{
                    padding: '14px 12px', borderRadius: 10, background: p.bg, color: p.fg,
                    border: `2px solid ${themeBg === p.bg && !themeBannerBg ? p.accent : 'transparent'}`,
                    cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 500,
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* ── 6 colour pickers ── */}
            <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>Colours</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>

              {/* Card background */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>Card background</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="color" value={themeBg} onChange={e => setThemeBg(e.target.value)}
                    style={{ width: 38, height: 38, borderRadius: 8, border: '1px solid var(--line)', cursor: 'pointer', padding: 2, flexShrink: 0 }} />
                  <input value={themeBg} onChange={e => setThemeBg(e.target.value)}
                    style={{ flex: 1, padding: '8px 8px', borderRadius: 8, border: '1px solid var(--line)', fontSize: 12, fontFamily: 'var(--font-mono)', outline: 'none', minWidth: 0 }} />
                </div>
              </div>

              {/* Banner background */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Banner background</span>
                  {themeBannerBg
                    ? <button onClick={() => setThemeBannerBg('')} style={{ fontSize: 10, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>reset</button>
                    : <span style={{ fontSize: 10, color: 'var(--muted)', background: 'var(--cream-2)', padding: '1px 5px', borderRadius: 3 }}>auto</span>
                  }
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="color" value={themeBannerBg || themeAccent} onChange={e => setThemeBannerBg(e.target.value)}
                    style={{ width: 38, height: 38, borderRadius: 8, border: '1px solid var(--line)', cursor: 'pointer', padding: 2, flexShrink: 0, opacity: themeBannerBg ? 1 : 0.4 }} />
                  <input value={themeBannerBg} onChange={e => setThemeBannerBg(e.target.value)} placeholder="auto"
                    style={{ flex: 1, padding: '8px 8px', borderRadius: 8, border: '1px solid var(--line)', fontSize: 12, fontFamily: 'var(--font-mono)', outline: 'none', minWidth: 0 }} />
                </div>
              </div>

              {/* Name / heading colour */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Name colour</span>
                  {themeHeading
                    ? <button onClick={() => setThemeHeading('')} style={{ fontSize: 10, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>reset</button>
                    : <span style={{ fontSize: 10, color: 'var(--muted)', background: 'var(--cream-2)', padding: '1px 5px', borderRadius: 3 }}>auto</span>
                  }
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="color" value={themeHeading || themeFg} onChange={e => setThemeHeading(e.target.value)}
                    style={{ width: 38, height: 38, borderRadius: 8, border: '1px solid var(--line)', cursor: 'pointer', padding: 2, flexShrink: 0, opacity: themeHeading ? 1 : 0.4 }} />
                  <input value={themeHeading} onChange={e => setThemeHeading(e.target.value)} placeholder="auto"
                    style={{ flex: 1, padding: '8px 8px', borderRadius: 8, border: '1px solid var(--line)', fontSize: 12, fontFamily: 'var(--font-mono)', outline: 'none', minWidth: 0 }} />
                </div>
              </div>

              {/* Body text */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>Body text</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="color" value={themeFg} onChange={e => setThemeFg(e.target.value)}
                    style={{ width: 38, height: 38, borderRadius: 8, border: '1px solid var(--line)', cursor: 'pointer', padding: 2, flexShrink: 0 }} />
                  <input value={themeFg} onChange={e => setThemeFg(e.target.value)}
                    style={{ flex: 1, padding: '8px 8px', borderRadius: 8, border: '1px solid var(--line)', fontSize: 12, fontFamily: 'var(--font-mono)', outline: 'none', minWidth: 0 }} />
                </div>
              </div>

              {/* Accent / CTA */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>Accent / CTA</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="color" value={themeAccent} onChange={e => setThemeAccent(e.target.value)}
                    style={{ width: 38, height: 38, borderRadius: 8, border: '1px solid var(--line)', cursor: 'pointer', padding: 2, flexShrink: 0 }} />
                  <input value={themeAccent} onChange={e => setThemeAccent(e.target.value)}
                    style={{ flex: 1, padding: '8px 8px', borderRadius: 8, border: '1px solid var(--line)', fontSize: 12, fontFamily: 'var(--font-mono)', outline: 'none', minWidth: 0 }} />
                </div>
              </div>

              {/* Secondary text (role, email, phone) */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Secondary text</span>
                  {themeSubtext
                    ? <button onClick={() => setThemeSubtext('')} style={{ fontSize: 10, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>reset</button>
                    : <span style={{ fontSize: 10, color: 'var(--muted)', background: 'var(--cream-2)', padding: '1px 5px', borderRadius: 3 }}>auto</span>
                  }
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="color" value={themeSubtext || themeFg} onChange={e => setThemeSubtext(e.target.value)}
                    style={{ width: 38, height: 38, borderRadius: 8, border: '1px solid var(--line)', cursor: 'pointer', padding: 2, flexShrink: 0, opacity: themeSubtext ? 1 : 0.4 }} />
                  <input value={themeSubtext} onChange={e => setThemeSubtext(e.target.value)} placeholder="auto"
                    style={{ flex: 1, padding: '8px 8px', borderRadius: 8, border: '1px solid var(--line)', fontSize: 12, fontFamily: 'var(--font-mono)', outline: 'none', minWidth: 0 }} />
                </div>
              </div>

            </div>

            {/* ── Font family ── */}
            <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>Font</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
              {FONT_OPTIONS.map(f => (
                <button
                  key={f.value}
                  onClick={() => setThemeFont(f.value)}
                  style={{
                    padding: '12px 10px', borderRadius: 10, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                    border: `2px solid ${themeFont === f.value ? 'var(--charcoal)' : 'var(--line)'}`,
                    background: themeFont === f.value ? 'var(--cream-2)' : 'white',
                  }}
                >
                  <div style={{ fontFamily: f.fontFamily, fontSize: 22, lineHeight: 1, marginBottom: 5, color: 'var(--charcoal)' }}>Aa</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.2 }}>{f.label}</div>
                </button>
              ))}
            </div>

            {/* ── Font size ── */}
            <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>Text size</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
              {FONT_SIZE_OPTIONS.map(s => (
                <button
                  key={s.value}
                  onClick={() => setThemeFontSize(s.value)}
                  style={{
                    flex: 1, padding: '12px 8px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
                    border: `2px solid ${themeFontSize === s.value ? 'var(--charcoal)' : 'var(--line)'}`,
                    background: themeFontSize === s.value ? 'var(--cream-2)' : 'white',
                    textAlign: 'center' as const,
                  }}
                >
                  <div style={{ fontFamily: activeFontFamily, fontSize: s.nameSize * 0.38, lineHeight: 1, marginBottom: 5, color: 'var(--charcoal)' }}>Aa</div>
                  <div style={{ fontSize: 11.5, fontWeight: themeFontSize === s.value ? 600 : 400 }}>{s.label}</div>
                </button>
              ))}
            </div>

            {/* ── Company logo ── */}
            <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>Company logo</div>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 12px', lineHeight: 1.5 }}>
              Appears in the banner strip at the top of your card.
            </p>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: '-4px 0 12px', lineHeight: 1.5, padding: '8px 10px', background: 'var(--cream-2)', borderRadius: 8, border: '1px solid var(--line)' }}>
              <strong>Favicon &amp; home-screen icon:</strong> upload your logo as an <strong>SVG</strong> and it will appear as your branded favicon and thumbnail when visitors save your card to their home screen (e.g. leadcard.app/c/vera-retief). JPEG or PNG uploads will show the AvantCard icon instead.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              {logoPreview && (
                <img src={logoPreview} alt="Logo" style={{ height: 44, maxWidth: 120, objectFit: 'contain', borderRadius: 6, border: '1px solid var(--line)' }} />
              )}
              <input ref={logoRef} type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f, 'logo') }} />
              <button onClick={() => logoRef.current?.click()} disabled={uploading === 'logo'}
                style={{ padding: '8px 16px', background: 'var(--cream-2)', color: 'var(--charcoal)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 13, cursor: uploading === 'logo' ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                {uploading === 'logo' ? 'Uploading…' : logoPreview ? 'Replace' : 'Upload logo'}
              </button>
              {logoPreview && (
                <button onClick={deleteLogo}
                  style={{ padding: '8px 16px', background: 'white', color: '#DC2626', border: '1px solid #FECACA', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Remove
                </button>
              )}
            </div>

            {/* ── Live preview ── */}
            <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--line)' }}>
              {/* Banner */}
              <div style={{
                height: 56, background: themeBannerBg || `linear-gradient(135deg, ${themeAccent}30 0%, ${themeAccent}10 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px',
              }}>
                {logoPreview
                  ? <img src={logoPreview} alt="logo" style={{ maxHeight: 32, maxWidth: '80%', objectFit: 'contain' }} />
                  : <span style={{ fontSize: 12, color: themeAccent, fontWeight: 500 }}>{company || 'Your company'}</span>
                }
              </div>
              {/* Card body */}
              <div style={{ background: themeBg, padding: '16px 18px 18px' }}>
                <div style={{ fontFamily: activeFontFamily, fontSize: activeFontSize * 0.42, lineHeight: 1.1, color: themeHeading || themeFg, marginBottom: 4 }}>
                  {displayName || 'Your name'}
                </div>
                <div style={{ fontSize: 12, color: themeSubtext || themeFg, opacity: themeSubtext ? 1 : 0.72, marginBottom: 10 }}>
                  {[title, company].filter(Boolean).join(' · ') || 'Title · Company'}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ padding: '6px 12px', background: themeAccent, color: themeBg, borderRadius: 8, fontSize: 12, fontWeight: 500 }}>
                    {card.cta_primary_label || 'Book a call'}
                  </div>
                  {card.industry && (
                    <div style={{ padding: '6px 10px', background: `${themeAccent}22`, color: themeAccent, borderRadius: 8, fontSize: 12 }}>
                      {card.industry}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={save} disabled={saving}
          style={{ padding: '10px 28px', background: 'var(--charcoal)', color: 'var(--cream)', border: 'none', borderRadius: 8, fontSize: 13.5, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}
