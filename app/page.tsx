import { createServiceClient } from '@/lib/supabase/server'
import HomepageClient from './HomepageClient'

export const revalidate = 60  // revalidate landing page every 60s

export default async function HomePage() {
  // Fetch live prices server-side — falls back to hardcoded defaults in HomepageClient if DB is unavailable
  try {
    const svc = createServiceClient()
    const { data } = await svc
      .from('pricing_current')
      .select('plan_key, currency, price')

    const priceMap: Record<string, string> = {}
    for (const row of data ?? []) {
      priceMap[`${row.plan_key}:${row.currency}`] = row.price
    }
    return <HomepageClient priceMap={priceMap} />
  } catch {
    // DB unavailable — render with hardcoded defaults
    return <HomepageClient />
  }
}
