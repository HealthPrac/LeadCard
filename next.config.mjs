/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['resend', '@react-email/render'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  // Amplify SSR Lambda does not expose non-NEXT_PUBLIC_ env vars at runtime
  // unless explicitly listed here. NEXT_PUBLIC_* vars are fine (build-time embedded).
  env: {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    PAYFAST_MERCHANT_ID: process.env.PAYFAST_MERCHANT_ID,
    PAYFAST_MERCHANT_KEY: process.env.PAYFAST_MERCHANT_KEY,
    PAYFAST_PASSPHRASE: process.env.PAYFAST_PASSPHRASE,
    // Shared secret for server-to-server market-intel endpoint
    LEADCARD_ADMIN_SECRET: process.env.LEADCARD_ADMIN_SECRET,
  },
}

export default nextConfig
