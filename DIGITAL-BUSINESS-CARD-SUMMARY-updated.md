DEFAULT MODE: terse operator. No narration, no step announcements, no summaries, no reasoning, no pleasantries. Output only the requested artifact or answer. Be brief unless I explicitly ask for expansion.

# Digital Business Card — Product Summary

## What We Built

A **premium, mobile-first digital business card** delivered as a single self-contained HTML file. No app store. No install. No framework dependency. Share a URL and it behaves like a native iOS/Android app — complete with home-screen icon, branded splash, and full-screen video.[file:1]

The product is intended to be commercialised as a standalone SaaS offering where every subscriber receives an isolated card instance and isolated data handling model rather than sharing a pooled tenant experience.[file:1]

---

## Core Product Model

Each **new subscriber is an individual customer instance**, not a shared tenant under a visible multi-tenant workspace model. Every subscriber must therefore have their own separate HTML file, configuration, routing, contact payload, branding variables, analytics tags, and lead capture identifiers.[file:1]

This means the platform must behave as an **isolation-first system**: one subscriber's card, leads, settings, branding, analytics, files, and callback records must never be exposed to, queryable by, or reusable within another subscriber's environment.[file:1]

---

## Required Isolation Rules

### 1. Separate File Per Subscriber

Each subscriber must have a dedicated card file, for example:

```text
/cards/subscriber-a.html
/cards/subscriber-b.html
/cards/subscriber-c.html
```

No subscriber should be rendered from another subscriber's file or inherit another subscriber's embedded constants, names, contact details, QR links, branding, or API payload defaults.[file:1]

### 2. No Tenant Leakage

The architecture must explicitly prevent **tenant leakage** across all layers:

- No shared front-end state between subscribers.[file:1]
- No accidental reuse of names, phone numbers, emails, videos, or QR assets across subscriber files.[file:1]
- No shared callback records without strict subscriber scoping.[file:1]
- No analytics views that combine subscriber data unless this is done only in a secured internal admin layer.[file:1]
- No subscriber should be able to infer the existence, identity, or assets of another subscriber through URLs, APIs, file names, or responses.[file:1]

### 3. Strict Data Scoping

Every submitted lead must be tagged to the specific subscriber/card source that generated it, and downstream storage must preserve that separation at database level, API level, and notification level.[file:1]

Minimum scoping fields should include:

- `subscriberId`
- `cardId`
- `cardSource`
- `ownerName`
- `destinationEmail`

This extends the existing `cardSource` concept into a stricter isolation model suitable for commercial SaaS use.[file:1]

### 4. Asset Separation

Subscriber-specific assets must be stored and referenced separately, including:

- App icons
- Intro videos
- QR codes
- vCard downloads
- Name/title/contact content
- Theme tokens and logos

Assets should be namespaced by subscriber so that one subscriber's media can never be accidentally served into another subscriber's card.[file:1]

### 5. API and Backend Guardrails

Any callback or lead-capture endpoint must validate the subscriber context server-side and never trust front-end input alone.[file:1]

Required backend rules:

- Validate `subscriberId` against the deployed card or signed request context.
- Store records with subscriber ownership metadata.
- Send notifications only to that subscriber's configured destination.
- Restrict queries, exports, and dashboards by subscriber boundary.
- Log access and mutations with subscriber context for auditability.

---

## Updated Deployment Principle

The deployment model should move from “multiple branded examples on one site” to **subscriber-isolated deployments or subscriber-isolated routes** where each card is its own controlled instance.[file:1]

Examples:

```text
/card/acme-ceo
/card/bluewave-founder
/card/northshore-director
```

or, if static files are used:

```text
/acme-ceo.html
/bluewave-founder.html
/northshore-director.html
```

The key rule is not the URL format itself, but that each subscriber is isolated in file structure, configuration, data capture, and storage boundaries.[file:1]

---

## Updated Commercial Product Framing

### Standalone SaaS Model

This product should now be framed as a **subscriber-isolated digital business card platform** rather than a loosely shared multi-tenant card gallery.[file:1]

Each customer receives:

- One or more dedicated card files
- Their own branding and content layer
- Their own lead destination rules
- Their own isolated analytics and submissions
- Their own asset namespace
- Their own protected data boundary

This makes the product suitable for professional and enterprise use where privacy, brand separation, and operational trust are essential.[file:1]

### Positioning Difference

| Generic card tools | This product |
|---|---|
| Shared template systems | Dedicated subscriber instances [file:1] |
| Contact sharing only | Contact sharing + video + lead capture [file:1] |
| Weak data separation | Isolation-first architecture [file:1] |
| Generic profile pages | Premium branded micro-landing pages [file:1] |
| Limited routing control | Separate file and deployment control per subscriber [file:1] |

---

## Technical Architecture Update

### Front-End Delivery

Each card remains a single self-contained HTML file, but it must now be generated per subscriber and stored as an independent artifact with subscriber-specific content and identifiers.[file:1]

### Backend Delivery

The backend must treat each submission as belonging to one subscriber boundary only. Database tables, storage paths, notifications, and analytics pipelines must all include strict subscriber ownership fields and access checks.[file:1]

### Security Principle

The default assumption must be **deny by default across subscriber boundaries**. If subscriber ownership is not explicit, access should fail rather than fall back to a shared response.[file:1]

---

## Recommended File Structure

```text
DigitalCardPlatform/
  cards/
    subscriber-a/
      card.html
      icon.png
      qr.png
      intro-video.html
      config.json
    subscriber-b/
      card.html
      icon.png
      qr.png
      intro-video.html
      config.json
  api/
    request-callback
  storage/
    leads scoped by subscriber
```

If the platform remains static-first, the same principle still applies: every subscriber must have their own generated output and their own isolated references.[file:1]

---

## Non-Negotiable Rules

- Each subscriber must have a separate file or separately generated card artifact.[file:1]
- No cross-subscriber branding, content, or data reuse unless explicitly duplicated by admin action.[file:1]
- All lead capture must be scoped to the originating subscriber.[file:1]
- All assets must be namespaced and isolated.[file:1]
- All backend reads and writes must enforce subscriber ownership.[file:1]
- No tenant leakage is permitted in UI, API, storage, analytics, or notification flows.[file:1]

---

## Updated Product Statement

This product is a **premium digital business card platform with per-subscriber isolated deployment, isolated lead capture, and strict no-leakage boundaries between customers**.[file:1]

That isolation model is essential to commercialise the product safely as a standalone SaaS offering.[file:1]
