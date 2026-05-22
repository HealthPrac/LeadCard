import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LeadCard — Your business is an experience',
  description: 'Premium digital business cards with video, lead capture, and quarterly reports.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300..700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Serif+Display:ital@0;1&family=Inter:wght@300..600&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
