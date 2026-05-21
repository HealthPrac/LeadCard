import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

const PAYFAST_URL = 'https://www.payfast.co.za/eng/process'

const PLAN_AMOUNTS: Record<string, { amount: string; description: string }> = {
  solo:  { amount: '69.00',  description: 'LeadCard Solo — monthly subscription' },
  small: { amount: '199.00', description: 'LeadCard Small Business — monthly subscription' },
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: subscriber } = await supabase.from('subscribers').select('id').eq('user_id', user.id).single()
  if (!subscriber) return NextResponse.json({ error: 'Not found' }, { status: 403 })

  const body = await req.json()
  const plan = (body.plan as string) ?? 'solo'
  const planData = PLAN_AMOUNTS[plan]
  if (!planData) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  const merchantId = process.env.PAYFAST_MERCHANT_ID
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY
  const passphrase = process.env.PAYFAST_PASSPHRASE ?? ''
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://leadcard.app'

  if (!merchantId || !merchantKey) {
    return NextResponse.json({ error: 'PayFast not configured' }, { status: 500 })
  }

  const params: Record<string, string> = {
    merchant_id:      merchantId,
    merchant_key:     merchantKey,
    return_url:       `${appUrl}/settings?billing=success`,
    cancel_url:       `${appUrl}/settings?billing=cancelled`,
    notify_url:       `${appUrl}/api/webhooks/payfast`,
    name_first:       user.email?.split('@')[0] ?? '',
    email_address:    user.email ?? '',
    m_payment_id:     subscriber.id,
    amount:           planData.amount,
    item_name:        planData.description,
    subscription_type: '1',
    billing_date:     new Date().toISOString().slice(0, 10),
    recurring_amount: planData.amount,
    frequency:        '3',  // Monthly
    cycles:           '0',  // Indefinite
    custom_str1:      subscriber.id,
    custom_str2:      plan,
  }

  // Build the signature string
  const signatureString = Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(v.trim()).replace(/%20/g, '+')}`)
    .join('&') + (passphrase ? `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}` : '')

  const signature = crypto.createHash('md5').update(signatureString).digest('hex')
  params.signature = signature

  const url = `${PAYFAST_URL}?${new URLSearchParams(params).toString()}`

  return NextResponse.json({ url })
}
