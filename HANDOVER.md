# LeadCard — Handover Document

**Last updated:** 2026-05-23 (Session 127 complete)  
**Status:** ✅ Phase 1 SaaS tracking LIVE. Migration 009 READY TO APPLY. Last commit: `eedd590`.

---

## URLs & IDs

| Thing | Value |
|-------|-------|
| **Live app** | https://main.d2idx6kv8dvjyf.amplifyapp.com |
| **Amplify App ID** | `d2idx6kv8dvjyf` |
| **GitHub repo** | https://github.com/HealthPrac/LeadCard |
| **Supabase project** | https://vdrrpixgdgnxtvltglul.supabase.co |
| **Local path** | `/Users/liezljoubert/Projects/LeadCard/` |

---

## Stack

| Layer | Version | Notes |
|-------|---------|-------|
| Next.js | **14.2.35** | Must stay on 14.x — Amplify SSR (WEB_COMPUTE) does not support 15/16 |
| React | 18.3.1 | Must match Next.js 14 |
| Supabase SSR | @supabase/ssr 0.5.2 | Uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (new Supabase format) |
| Tailwind | v4 (`@import "tailwindcss"` in globals.css) | `@theme {}` for design tokens |
| Resend | 4.5.1 | Lazy init via `getResend()` — safe when key absent |
| qrcode | 1.5.4 | Real QR code generation in /share |
| Amplify | WEB_COMPUTE platform | Must be WEB_COMPUTE not WEB — static hosting does NOT work |

---

## Environment Variables (Amplify)

| Variable | Where to get it | Notes |
|----------|----------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | `https://vdrrpixgdgnxtvltglul.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Connect → Next.js | starts with `sb_publishable_` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → Secret key | starts with `sb_secret_` |
| `NEXT_PUBLIC_APP_URL` | this doc | `https://main.d2idx6kv8dvjyf.amplifyapp.com` |
| `RESEND_API_KEY` | resend.com → API Keys | ✅ Set in Amplify — using HPS Resend key |
| `RESEND_FROM_EMAIL` | — | ✅ Set in Amplify — `leadcard@healthprac.com` |
| `PAYFAST_MERCHANT_ID` | payfast.co.za dashboard | Add before Session 3 payments work |
| `PAYFAST_MERCHANT_KEY` | payfast.co.za dashboard | Add before Session 3 payments work |
| `PAYFAST_PASSPHRASE` | payfast.co.za dashboard | Add before Session 3 payments work |
| `NEXT_PUBLIC_PAYFAST_MERCHANT_ID` | same as above | Add before Session 3 payments work |

---

## Critical Technical Rules

### 1. Never upgrade Next.js beyond 14.x without testing Amplify SSR support first
Amplify's compute runtime lags Next.js releases. Next.js 15/16 caused complete 404s.

### 2. `cookies()` is synchronous in Next.js 14
```typescript
// CORRECT (Next.js 14)
const cookieStore = cookies()

// WRONG — Next.js 15+ only, crashes silently in 14
const cookieStore = await cookies()
```

### 3. Supabase uses new key format
New Supabase projects use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (not the old `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Our code reflects this. Never revert to the old name.

### 4. Amplify platform MUST be WEB_COMPUTE
If the app returns 404 and builds succeed, the Amplify app was created as static (`WEB`). Delete and recreate — Amplify auto-detects Next.js SSR on fresh create.

### 5. `params` are synchronous in Next.js 14
```typescript
// CORRECT (Next.js 14)
interface Props { params: { slug: string } }
const { slug } = params

// WRONG — Next.js 15+ only
interface Props { params: Promise<{ slug: string }> }
const { slug } = await params
```

### 6. Resend lazy init
`lib/email/resend.ts` uses `getResend()` function — never module-level `new Resend()`. Build-time throw when key absent.

### 7. `serverComponentsExternalPackages`
`resend` + `@react-email/render` are in `experimental.serverComponentsExternalPackages` in `next.config.mjs`. Required to prevent prettier webpack crash.

### 8. ⚠️ Amplify SSR: non-NEXT_PUBLIC_ vars MUST be in next.config.mjs env block
**This is the most common silent failure.** Amplify's SSR Lambda does NOT expose server-side env vars at runtime unless they are explicitly declared in `next.config.mjs`:

```javascript
// next.config.mjs — REQUIRED for Amplify SSR Lambda
env: {
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
  PAYFAST_MERCHANT_ID: process.env.PAYFAST_MERCHANT_ID,
  PAYFAST_MERCHANT_KEY: process.env.PAYFAST_MERCHANT_KEY,
  PAYFAST_PASSPHRASE: process.env.PAYFAST_PASSPHRASE,
}
```

`NEXT_PUBLIC_*` vars are embedded at build time and are always available. Every other server-side secret needs the env block. Missing this causes empty 500 responses with no error log.

### 9. Test auth flows from Amplify URL only — never localhost
Supabase auth emails embed the origin from `emailRedirectTo`. If you sign up from `localhost:3000`, the confirmation email links back to localhost even in production. **Always test from `https://main.d2idx6kv8dvjyf.amplifyapp.com`.**

### 10. Supabase Site URL must match Amplify URL
Supabase → Authentication → URL Configuration:
- **Site URL:** `https://main.d2idx6kv8dvjyf.amplifyapp.com`
- **Redirect URLs:** `https://main.d2idx6kv8dvjyf.amplifyapp.com/**`

### 11. Onboarding page must stay outside all route groups
`app/onboarding/page.tsx` — NOT `app/(app)/onboarding/`. The `(app)` layout redirects to `/onboarding` if no subscriber record exists, which creates an infinite redirect loop if onboarding is inside that group.

---

## Route Map

| Route | Type | What |
|-------|------|------|
| `/` | Static | Marketing landing page |
| `/sign-up` | Auth | Sign-up + check-inbox screen |
| `/sign-in` | Auth | Email + password login |
| `/forgot-password` | Auth | Password reset request |
| `/reset-password` | Auth | New password form (after token exchange) |
| `/auth/confirm` | API | Supabase auth callback — handles token_hash + code |
| `/onboarding` | SSR | 2-step wizard: identity → URL claim (style removed — done post-subscribe in editor) |
| `/dashboard` | SSR | Trial banner, card panel, leads summary |
| `/editor` | SSR | 7-tab card editor |
| `/leads` | SSR | Full leads inbox, search, CSV export |
| `/analytics` | SSR | Source breakdown + coming-soon stub |
| `/share` | SSR | Real QR code, vCard, email signature |
| `/nfc` | SSR | NFC order stub (R349/card, coming soon) |
| `/settings` | SSR | Account / Billing (PayFast) / Data & privacy |
| `/c/[slug]` | SSR | Public card — 6 screens |
| `POST /api/leads` | API | Lead insert, fires Resend emails |
| `POST /api/onboarding` | API | Subscriber + card creation |
| `GET /api/slug-check` | API | Real-time slug availability |
| `GET /api/upload-url` | API | Signed upload URL (Supabase Storage) |
| `POST /api/cards/update` | API | Card update (allowlist-gated) |
| `GET /api/export/leads` | API | CSV download |
| `POST /api/billing/payfast-url` | API | Builds MD5-signed PayFast redirect URL |

---

## Database Schema

### subscribers
`id, user_id, email, plan, payfast_customer_id, payfast_subscription_id, subscription_status (trialing/active/inactive/cancelled), trial_ends_at`

### cards
`id, subscriber_id, slug, display_name, title, company, email, mobile, website, industry, welcome_headline, welcome_body, cta_primary_label, cta_primary_url, cta_secondary_label, cta_secondary_url, form_fields (JSONB), lead_destination_email, links (JSONB), theme_bg, theme_fg, theme_accent, theme_font, theme_font_size, theme_banner_bg, theme_heading, theme_subtext, photo_path, logo_path, video_path, is_published, is_owner_card`

### leads
`id, card_id, subscriber_id, first_name, last_name, email, org, role, mobile, message, source, consented_at, ip_address, user_agent`

### Storage buckets
- `card-assets` — photos + logos (5MB limit, public read via signed URLs)
- `card-videos` — intro videos MP4/WebM/MOV/HTML (100MB limit, signed URLs)

### Migrations
- `supabase/migrations/001_schema.sql` — tables + storage buckets + triggers
- `supabase/migrations/002_rls.sql` — RLS policies
- `supabase/migrations/003_theme_fonts.sql` — adds `theme_font` + `theme_font_size` to cards
- `supabase/migrations/004_industry.sql` — adds `industry text` to cards
- `supabase/migrations/007_theme_colours.sql` — adds `theme_banner_bg`, `theme_heading`, `theme_subtext` to cards
- `supabase/migrations/008_bucket_html.sql` — adds `text/html` to `card-videos` allowed_mime_types

**✅ All migrations 001–004 + 007–008 APPLIED (project `vdrrpixgdgnxtvltglul`).**

---

## Email Architecture

Two separate email systems — don't confuse them:

| System | Sends | Config |
|--------|-------|--------|
| **Supabase Auth** | Confirm email, Reset password | Supabase → Auth → Email Templates + SMTP settings |
| **Resend (our code)** | Welcome email, Lead notifications | `lib/email/resend.ts`, `RESEND_API_KEY` env var |

**FROM address:** `leadcard@healthprac.com` — uses the existing `healthprac.com` domain verified in Resend (no new domain needed).

**Supabase auth emails:** Currently using Supabase default templates/SMTP (free plan = ~3 emails/hour limit).  
**⚠️ TODO:** Configure Supabase SMTP → Resend to use branded templates + remove rate limit:
- Host: `smtp.resend.com`, Port: `465`, Username: `resend`, Password: `RESEND_API_KEY`
- Paste branded HTML into Supabase → Auth → Email Templates → Confirm signup + Reset password
- Then re-enable "Confirm email" in Supabase Auth settings

---

## Business Model

| Plan | Price | Cards |
|------|-------|-------|
| Solo | R 69/mo | 1 |
| Small business | R 199/mo | Up to 5 |
| Enterprise | Custom | Unlimited |

- 7-day free trial, no card required
- Billing: **PayFast** (South Africa) — redirect flow, MD5-signed URL, ITN webhook
- NFC physical card: R 349/card once-off (coming soon)

---

## PayFast Billing Flow

1. User clicks "Activate" in `/settings`
2. `POST /api/billing/payfast-url` — builds signed redirect URL (MD5 + passphrase)
3. User redirected to `payfast.co.za/eng/process`
4. PayFast posts ITN to `/api/webhooks/payfast` ← **NOT YET BUILT**
5. Webhook updates `subscribers.subscription_status` + `subscribers.plan`

---

## Public Card Flow (6 screens)

`Welcome` (photo, name, contact strip) → `Video` (uploaded or placeholder) → `CTA` (primary action button) → `Form` (JSONB fields + POPIA consent) → `Confirmed` → `Share` (QR + link + vCard)

---

## Git History

| Commit | What |
|--------|------|
| `1c23a18` | Initial commit — prototype |
| `4c51e3e` | Full MVP — all 22 routes |
| `ebf2822` | Downgrade Next.js 16 → 14, React 18 |
| `2c52fb9` | Fix `await cookies()` → `cookies()` for Next.js 14 |
| `ea9d2e6` | Rename Supabase key to `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |
| `c8f5d06` | Fix: expose server-side env vars to Amplify SSR Lambda |
| `e4b58c7` | Add Resend email confirmation + welcome email flow |
| `5b01b9e` | Logo background removed (auth + onboarding) |
| `7c89907` | Logo fully removed from auth + onboarding screens |
| `9e596ac` | Industry field — onboarding (required, searchable dropdown + Other) |
| `b547538` | Industry field — editor + public card display |
| `ad4fb97` | Dashboard phone preview + desktop card phone wrapper |
| `d7f0f8e` | Dashboard overview (Analytics/Team/Leads summary) + card welcome polish |
| `4111b25` | Card welcome: logo as full-width banner with photo overlap |
| `f4c053d` | Video tab: MP4 + HTML file upload support |
| `9d9c612` | Theme: 6-colour system, logo delete, fix replace (upsert) |
| `dc8ee49` | Fix HTML intro reel playback on public card |
| `943c834` | CTA screen shows live video in background on skip/end |
| `9f88731` | Fix font propagation, accent bleed, and real QR code |
| `fc7b458` | Enable video sound on autoplay — remove muted attribute |
| `6f78b3c` | Fix admin subscribers crash — extract table to SubscribersClient (server component had event handlers) |

---

## Session Roadmap

| Session | Focus |
|---------|-------|
| **Session 117 ✅** | Auth email flow (check-inbox, /auth/confirm, /reset-password, sendWelcomeEmail). Migrations 001+002 applied. Root fix: env block in next.config.mjs. |
| **Session 118 ✅** | Logo removed from auth + onboarding. |
| **Session 121 ✅** | Industry field (onboarding + editor + public card). |
| **Session 123 ✅** | Dashboard phone preview (iframe mockup). Desktop card rendered as phone shape. Commit `ad4fb97`. |
| **Session 124 ✅** | Dashboard overview: removed card identity tile; right column = Analytics (3 stats) + Team summary + Recent leads. Card welcome screen: logo is now a full-width banner (124px) with photo circle overlapping its bottom. Email + phone stacked under industry pill. NFC hidden from sidebar. Commits `d7f0f8e` + `4111b25`. |
| **Session 125 ✅** | Video tab: MP4 + HTML upload. 6-colour theme (bg, banner bg, heading, body, accent, subtext) with independent pickers. Logo delete + replace (upsert fix). HTML video blob URL workaround for Content-Disposition. Video persists on CTA skip via React reconciliation. Font propagation to all screens. Accent bleed removed. Real QR code (`qrcode` pkg). Video autoplay with sound on click. Migrations 003, 004, 007, 008 applied. Commits `f4c053d`→`fc7b458`. |
| **Session 126 ✅** | Fix: admin subscribers page hard crash. Server component had `onMouseEnter`/`onMouseLeave` on `<tr>` rows. Extracted table to `SubscribersClient.tsx` (`"use client"`). Commit `6f78b3c`. |
| **Session 127 ✅** | Phase 1 SaaS tracking — `card_events` table (mig 009 ⏳ APPLY), `/api/events` ingest route, CardExperience client-side events (view/video/CTA/form), analytics page upgrade (views + conversion + CTA + device), admin overview platform views. Commit `eedd590`. |
| **Next session** | Apply mig 009 in Supabase SQL editor · PayFast ITN webhook `/api/webhooks/payfast` · Configure Supabase SMTP → Resend · Custom domain `card.healthprac.com` |
| **Session +2** | Card editor: photo/video upload preview, image crop |
| **Session +3** | Phase 2 tracking: share_links propagation graph, forward attribution |
| **Session +4** | NFC order flow, quarterly PDF report |
