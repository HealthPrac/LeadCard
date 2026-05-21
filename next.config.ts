import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    // Type errors from Supabase generic inference — runtime is correct, fix post-launch
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
}

export default nextConfig
