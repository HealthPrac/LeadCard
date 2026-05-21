# HPS Digital Business Card — Product Summary

## What We Built

A **premium, mobile-first digital business card** delivered as a single self-contained HTML file. No app store. No install. No framework dependency. Share a URL and it behaves like a native iOS/Android app — complete with home-screen icon, branded splash, and full-screen video.

Three live instances are deployed to **healthprac.com** via AWS Amplify:

| Person | Title | URL |
|--------|-------|-----|
| Liezl Joubert | CEO | https://www.healthprac.com/welcome.html |
| Lezanne Hempel | COO | https://www.healthprac.com/lezanne.html |
| Marisa von Brandis | CFO | https://www.healthprac.com/marisa.html |

---

## User Journey (Screen Flow)

```
Welcome Screen
  └─ [Watch intro]  → Video Screen (full-screen, no controls)
  │                       └─ [Video ends / Skip] → CTAs slide up
  │                             ├─ Visit the website  → external link
  │                             └─ Request a call     → Lead Capture Screen
  │                                                         └─ [Submit] → Confirmed Screen
  └─ [Share my card] → Share Card Screen
```

---

## Features

### iOS/Android PWA Behaviour
- Saved to home screen it looks and launches like a native app
- Custom app icon (HPS Emblem, 180×180 PNG)
- Branded title per card ("Liezl · HPS", "Lezanne · HPS", "Marisa · HPS")
- Status bar style: `black-translucent` (full-bleed, no browser chrome)
- `theme-color` matches brand navy (`#0B2545`)

### Branded Welcome Screen
- Full-bleed dark card with gold accent line and subtle grid texture
- HPS emblem mark + executive name, title, company
- Email address + mobile number (tap-to-call)
- "Watch our intro" CTA to launch the video
- "Share my card" CTA to open the share screen

### Full-Screen Video Experience
- Iframe-based video player fills the entire screen — no browser controls visible
- Frosted-glass back button (top-left) always accessible
- "Skip →" button (top-right) disappears once CTAs reveal
- After video ends (57-second timer), two CTAs slide up from the bottom with animation:
  - **Visit the website** (primary, gold) → `https://www.healthprac.com`
  - **Request a call** (secondary) → leads to the capture form

### Lead Capture Form
- Fields: First name, Last name, Email, Organisation, Role (optional), Mobile (optional)
- POPIA-compliant consent checkbox required before submit
- Live validation: required fields + email format check
- On submit: calls `/api/request-callback` on the HPS platform
  - Sends a notification email to `admin@healthprac.com`
  - Sends a confirmation email to the enquirer
  - Writes a lead record into the HPS client onboarding pipeline (Supabase)
  - `cardSource` tag identifies which executive's card generated the lead
- Error state shown inline if the API call fails
- "Sending…" disabled state during in-flight request
- Confirmation screen on success

### Share Card Screen
- Visual navy business card replica (HPS mark, name, title, QR code)
- Contact rows: email · phone (tap-to-call) · website
- **Share my card** button — invokes native Web Share API on mobile; falls back to clipboard copy on desktop
- **Save contact (.vcf)** — downloads a vCard 3.0 file with name, org, title, email, phone, URL
- QR code links directly to the card URL

---

## Technical Architecture

### Single-File HTML — No Build Step
Each card is one `.html` file (~1,200 lines). Zero dependencies to install, zero build pipeline to maintain.

```
Technology        Role
─────────────────────────────────────────────────────
React 18          UI components (loaded via CDN Babel standalone)
Babel Standalone  JSX transpiled in-browser at runtime
CSS-in-JS         All styles inline via React style props
Google Fonts      Fraunces (serif headings) + JetBrains Mono (data)
```

### Backend Integration (HPS Platform — Next.js 16 / Supabase)
```
POST /api/request-callback
  ← { name, email, org, role?, mobile?, cardSource }
  → Resend: sendCallbackNotification  → admin@healthprac.com
  → Resend: sendCallbackConfirmation  → enquirer
  → Supabase: client_onboarding_applications INSERT (lifecycle_status: 'target')
```

### Brand Tokens
```
Navy       #0B2545   Backgrounds, card surfaces
Gold       #C9A24A   Accents, icons, active states
Gold Hi    #E8C868   Gradient highlights
Cream      #FAF7F1   Light backgrounds
```

---

## File Structure (HPS-Website repo)

```
HPS-Website/
  welcome.html          ← Liezl Joubert · CEO
  lezanne.html          ← Lezanne Hempel · COO
  marisa.html           ← Marisa von Brandis · CFO
  assets/
    app-icon.png        ← 180×180 HPS Emblem (iOS home-screen icon)
  video/
    Welcome Video.html  ← Self-contained animation bundle (shared by all three)
  index.html            ← Live healthprac.com website (NOT modified)
```

---

## Commercialisation Opportunities

### Product Concept
**"CardPrac"** (or white-label under any name) — a premium digital business card SaaS for healthcare executives, practice owners, and medical professionals. Every card is a micro-landing page, a lead magnet, and a CRM entry point in one.

### What Makes This Different

| Generic QR/link-in-bio tools | This product |
|------------------------------|-------------|
| Generic templates | Pixel-perfect brand execution |
| Static contact dump | Cinematic video experience |
| No lead capture | Integrated CRM pipeline entry |
| No analytics hook | `cardSource` tagging per card |
| Requires app install | Zero install — URL to home screen |
| One-size-fits-all | Per-executive personalisation |

### Suggested Tier Structure

| Tier | What's included |
|------|----------------|
| **Solo** | 1 card, standard template, vCard + share |
| **Practice** | Up to 5 cards, practice video, shared lead inbox |
| **Enterprise** | Unlimited cards, custom video, CRM integration, analytics |

### Extension Ideas
- Analytics dashboard (scan count, form submissions, watch-through rate)
- Custom domain per card (`liezl.healthprac.com`)
- WhatsApp / SMS share optimisation
- Dynamic QR codes (update destination without reprinting)
- NFC-ready (card URL embedded in an NFC chip on a physical card)
- Multilingual variants
- Appointment booking integration (Calendly / internal HPS scheduler)

---

## Deployment

- **Repo:** `https://github.com/HealthPrac/HPS-Website`
- **Branch:** `main` — auto-deploys to Amplify on push
- **Platform API:** `https://main.d2rogr2lbyrjz1.amplifyapp.com/api/request-callback`
- **Email sender:** `HealthPrac Solutions <admin@mail.healthprac.com>` via Resend
- **Lead destination:** `client_onboarding_applications` table · Supabase

---

*Built by HealthPrac Solutions · May 2026*
