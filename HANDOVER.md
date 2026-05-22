# LeadCard — Handover Document

**Last updated:** 2026-05-21 (Session 117)  
**Status:** ✅ Resend email flow LIVE (commit e4b58c7). Supabase migrations still need applying.

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
| `PAYFAST_MERCHANT_ID` | payfast.co.za dashboard | Add in Session 3 |
| `PAYFAST_MERCHANT_KEY` | payfast.co.za dashboard | Add in Session 3 |
| `PAYFAST_PASSPHRASE` | payfast.co.za dashboard | Add in Session 3 |
| `NEXT_PUBLIC_PAYFAST_MERCHANT_ID` | same as above | Add in Session 3 |

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

---

## Route Map

| Route | Type | What |
|-------|------|------|
| `/` | Static | Marketing landing page |
| `/sign-up` | Static | Auth |
| `/sign-in` | Static | Auth |
| `/forgot-password` | Static | Auth |
| `/onboarding` | SSR | 3-step wizard: identity → style → URL claim |
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
`id, subscriber_id, slug, display_name, title, company, email, mobile, website, welcome_headline, welcome_body, cta_primary_label, cta_primary_url, cta_secondary_label, cta_secondary_url, form_fields (JSONB), lead_destination_email, links (JSONB), theme_bg, theme_fg, theme_accent, photo_path, logo_path, video_path, is_published, is_owner_card`

### leads
`id, card_id, subscriber_id, first_name, last_name, email, org, role, mobile, message, source, consented_at, ip_address, user_agent`

### Storage buckets
- `card-assets` — photos + logos (5MB limit, public read via signed URLs)
- `card-videos` — intro videos (100MB limit, signed URLs)

### Migrations
- `supabase/migrations/001_schema.sql` — tables + storage buckets + triggers
- `supabase/migrations/002_rls.sql` — RLS policies

**⚠️ Neither migration has been applied yet. Apply both in Supabase SQL editor before testing auth/data features.**

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
4. PayFast posts ITN to `/api/webhooks/payfast` ← **NOT YET BUILT (Session 3)**
5. Webhook updates `subscribers.subscription_status` + `subscribers.plan`

---

## Public Card Flow (6 screens)

`Welcome` (photo, name, contact strip) → `Video` (uploaded or placeholder) → `CTA` (primary action button) → `Form` (JSONB fields + POPIA consent) → `Confirmed` → `Share` (QR + link + vCard)

---

## Git History

| Commit | What |
|--------|------|
| `1c23a18` | Initial commit — prototype |
| `888c0b1` | Product summary |
| `4c51e3e` | Full MVP — all 22 routes |
| `20e4ee5` | Switch Paystack → PayFast |
| `ebf2822` | Downgrade Next.js 16 → 14, React 19 → 18 |
| `2c52fb9` | Fix `await cookies()` → `cookies()` for Next.js 14 |
| `ea9d2e6` | Rename Supabase key to `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |
| `01f83bf` | amplify.yml diagnostic output |
| `fadcf50` | Update app URL to new Amplify deployment |

---

## Session Roadmap

| Session | Focus |
|---------|-------|
| **Session 117** | Resend email flow: `/auth/confirm` handler, `/reset-password` page, `sendWelcomeEmail()`, middleware public routes updated. Commit `e4b58c7`. |
| **Session 3 remaining** | Apply Supabase migrations 001+002 · PayFast ITN webhook `/api/webhooks/payfast` · Domain `leadcard.app` |
| **Session 4** | Card editor: photo/video upload preview, image crop |
| **Session 5** | Analytics: real view tracking, lead source attribution |
| **Session 6** | NFC order flow, quarterly PDF report |
