import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import {
  sendEnterpriseInquiryNotification,
  sendEnterpriseInquiryConfirmation,
} from '@/lib/email/resend'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      contact_name,
      contact_email,
      contact_phone,
      company_name,
      estimated_seats,
      message,
    } = body

    if (!contact_name?.trim() || !contact_email?.trim() || !company_name?.trim()) {
      return NextResponse.json({ error: 'Name, email, and company are required.' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact_email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }

    const svc = createServiceClient()
    const { error: insertErr } = await svc.from('enterprise_leads').insert({
      contact_name:    contact_name.trim(),
      contact_email:   contact_email.trim(),
      contact_phone:   contact_phone?.trim() || null,
      company_name:    company_name.trim(),
      estimated_seats: estimated_seats ? parseInt(estimated_seats, 10) : null,
      message:         message?.trim() || null,
      status:          'new',
    })

    if (insertErr) {
      console.error('enterprise_leads insert:', insertErr.message)
      return NextResponse.json({ error: 'Failed to save inquiry.' }, { status: 500 })
    }

    await Promise.allSettled([
      sendEnterpriseInquiryNotification({
        contact_name,
        contact_email,
        contact_phone: contact_phone || null,
        company_name,
        estimated_seats: estimated_seats ? parseInt(estimated_seats, 10) : null,
        message: message || null,
      }),
      sendEnterpriseInquiryConfirmation({
        toName:      contact_name,
        toEmail:     contact_email,
        companyName: company_name,
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('enterprise inquiry:', err)
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
  }
}
