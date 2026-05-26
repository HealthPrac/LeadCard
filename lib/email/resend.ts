import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? 'placeholder')
}
const FROM = process.env.RESEND_FROM_EMAIL ?? 'hello@leadcard.app'

export interface LeadPayload {
  cardOwnerName: string
  cardOwnerEmail: string
  cardCompany: string | null
  cardSlug: string
  firstName: string | null
  lastName: string | null
  email: string
  org: string | null
  role: string | null
  mobile: string | null
  message: string | null
  source: string | null
}

export async function sendLeadNotification(payload: LeadPayload) {
  const name = [payload.firstName, payload.lastName].filter(Boolean).join(' ') || payload.email
  const subject = `New lead from your LeadCard — ${name}`

  const rows = [
    payload.org   && `<tr><td style="color:#666;padding:6px 0;width:120px">Organisation</td><td style="padding:6px 0">${payload.org}</td></tr>`,
    payload.role  && `<tr><td style="color:#666;padding:6px 0">Role</td><td style="padding:6px 0">${payload.role}</td></tr>`,
    payload.mobile && `<tr><td style="color:#666;padding:6px 0">Mobile</td><td style="padding:6px 0">${payload.mobile}</td></tr>`,
    payload.source && `<tr><td style="color:#666;padding:6px 0">Source</td><td style="padding:6px 0">${payload.source}</td></tr>`,
    payload.message && `<tr><td style="color:#666;padding:6px 0;vertical-align:top">Message</td><td style="padding:6px 0">${payload.message}</td></tr>`,
  ].filter(Boolean).join('')

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;color:#17181C">
      <div style="background:#17181C;padding:28px 32px;border-radius:12px 12px 0 0">
        <div style="font-family:Georgia,serif;font-size:22px;color:#F6F7F3;letter-spacing:-0.01em">LeadCard</div>
      </div>
      <div style="background:#F6F7F3;padding:32px;border-radius:0 0 12px 12px;border:1px solid rgba(23,24,28,0.1)">
        <p style="margin:0 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#8FAF9D;font-weight:500">New lead</p>
        <h2 style="margin:0 0 24px;font-family:Georgia,serif;font-size:28px;font-weight:400">${name}</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;border-top:1px solid rgba(23,24,28,0.1)">
          <tr><td style="color:#666;padding:10px 0 6px;width:120px">Email</td>
              <td style="padding:10px 0 6px"><a href="mailto:${payload.email}" style="color:#17181C">${payload.email}</a></td></tr>
          ${rows}
        </table>
        <div style="margin-top:24px;padding-top:20px;border-top:1px solid rgba(23,24,28,0.1)">
          <a href="mailto:${payload.email}" style="display:inline-block;background:#17181C;color:#F6F7F3;padding:12px 22px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500">
            Reply to ${payload.firstName ?? payload.email}
          </a>
        </div>
        <p style="margin:20px 0 0;font-size:12px;color:#999">
          Via your LeadCard · <a href="${process.env.NEXT_PUBLIC_APP_URL}/c/${payload.cardSlug}" style="color:#999">leadcard.app/c/${payload.cardSlug}</a>
        </p>
      </div>
    </div>`

  await getResend().emails.send({
    from: `LeadCard <${FROM}>`,
    to: payload.cardOwnerEmail,
    replyTo: payload.email,
    subject,
    html,
  })
}

export async function sendWelcomeEmail(payload: {
  toEmail: string
  toName: string
  slug: string
  trialDays?: number
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://main.d2idx6kv8dvjyf.amplifyapp.com'
  const cardUrl = `${appUrl}/c/${payload.slug}`
  const dashboardUrl = `${appUrl}/dashboard`
  const days = payload.trialDays ?? 7

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;color:#17181C">
      <div style="background:#17181C;padding:28px 32px;border-radius:12px 12px 0 0">
        <div style="font-family:Georgia,serif;font-size:22px;color:#F6F7F3;letter-spacing:-0.01em">LeadCard</div>
      </div>
      <div style="background:#F6F7F3;padding:32px;border-radius:0 0 12px 12px;border:1px solid rgba(23,24,28,0.1)">
        <p style="margin:0 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#8FAF9D;font-weight:500">You're in</p>
        <h2 style="margin:0 0 16px;font-family:Georgia,serif;font-size:28px;font-weight:400">Welcome, ${payload.toName}.</h2>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#444">
          Your LeadCard is live. Share the link, drop it in your email signature, or tap it to an NFC card — every lead flows straight to your inbox.
        </p>
        <div style="background:white;border-radius:10px;padding:18px 22px;margin:0 0 24px;border:1px solid rgba(23,24,28,0.08)">
          <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#8FAF9D;font-weight:500;margin-bottom:8px">Your card link</div>
          <a href="${cardUrl}" style="font-size:14px;color:#17181C;text-decoration:none;font-weight:500">${cardUrl.replace('https://', '')}</a>
        </div>
        <div style="margin:0 0 24px;font-size:14px;color:#444;line-height:2">
          <strong style="font-size:13px;display:block;margin-bottom:6px">Three things to do first:</strong>
          1. Add your photo in the <a href="${dashboardUrl}/editor" style="color:#17181C">Editor</a><br>
          2. Record a short intro video (30 seconds is plenty)<br>
          3. Share the link on LinkedIn or in your email signature
        </div>
        <a href="${dashboardUrl}" style="display:inline-block;background:#17181C;color:#F6F7F3;padding:12px 22px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500">
          Go to dashboard →
        </a>
        <p style="margin:24px 0 0;font-size:12px;color:#999">
          Your ${days}-day free trial has started — no card required. Questions? Just reply to this email.
        </p>
      </div>
    </div>`

  await getResend().emails.send({
    from: `LeadCard <${FROM}>`,
    to: payload.toEmail,
    subject: `Welcome to LeadCard, ${payload.toName} — your card is live`,
    html,
  })
}

export async function sendLeadConfirmation(payload: { toEmail: string; toName: string; ownerName: string; ownerCompany: string | null }) {
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;color:#17181C">
      <div style="background:#17181C;padding:28px 32px;border-radius:12px 12px 0 0">
        <div style="font-family:Georgia,serif;font-size:22px;color:#F6F7F3">LeadCard</div>
      </div>
      <div style="background:#F6F7F3;padding:32px;border-radius:0 0 12px 12px;border:1px solid rgba(23,24,28,0.1)">
        <h2 style="margin:0 0 16px;font-family:Georgia,serif;font-size:28px;font-weight:400">Got it, ${payload.toName}.</h2>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#444">
          Your request has been sent to ${payload.ownerName}${payload.ownerCompany ? ` at ${payload.ownerCompany}` : ''}.
          They'll be in touch within one business day.
        </p>
        <p style="margin:0;font-size:12px;color:#999">
          This is an automated confirmation. You consented to being contacted when submitting this request.
        </p>
      </div>
    </div>`

  await getResend().emails.send({
    from: `LeadCard <${FROM}>`,
    to: payload.toEmail,
    subject: `Your request was sent to ${payload.ownerName}`,
    html,
  })
}

// ── Enterprise inquiry: notification to admin@healthprac.com ─────────────────
export async function sendEnterpriseInquiryNotification(payload: {
  contact_name: string
  contact_email: string
  contact_phone: string | null
  company_name: string
  estimated_seats: number | null
  message: string | null
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://main.d2idx6kv8dvjyf.amplifyapp.com'
  const rows = [
    payload.contact_phone    && `<tr><td style="color:#666;padding:6px 0;width:140px">Phone</td><td style="padding:6px 0">${payload.contact_phone}</td></tr>`,
    payload.estimated_seats  && `<tr><td style="color:#666;padding:6px 0">Est. team size</td><td style="padding:6px 0">${payload.estimated_seats}</td></tr>`,
    payload.message          && `<tr><td style="color:#666;padding:6px 0;vertical-align:top">Message</td><td style="padding:6px 0">${payload.message}</td></tr>`,
  ].filter(Boolean).join('')

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;color:#17181C">
      <div style="background:#17181C;padding:28px 32px;border-radius:12px 12px 0 0">
        <div style="font-family:Georgia,serif;font-size:22px;color:#F6F7F3;letter-spacing:-0.01em">AvantCard</div>
        <div style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;background:rgba(184,116,62,0.85);color:#fff;display:inline-block;padding:2px 8px;border-radius:4px;margin-top:8px">Enterprise Inquiry</div>
      </div>
      <div style="background:#F6F7F3;padding:32px;border-radius:0 0 12px 12px;border:1px solid rgba(23,24,28,0.1)">
        <p style="margin:0 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#B8743E;font-weight:500">New enterprise inquiry</p>
        <h2 style="margin:0 0 20px;font-family:Georgia,serif;font-size:26px;font-weight:400">${payload.company_name}</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;border-top:1px solid rgba(23,24,28,0.1)">
          <tr><td style="color:#666;padding:10px 0 6px;width:140px">Contact</td><td style="padding:10px 0 6px;font-weight:500">${payload.contact_name}</td></tr>
          <tr><td style="color:#666;padding:6px 0">Email</td><td style="padding:6px 0"><a href="mailto:${payload.contact_email}" style="color:#17181C">${payload.contact_email}</a></td></tr>
          ${rows}
        </table>
        <div style="margin-top:24px;padding-top:20px;border-top:1px solid rgba(23,24,28,0.1);display:flex;gap:12px">
          <a href="${appUrl}/admin/enterprise" style="display:inline-block;background:#17181C;color:#F6F7F3;padding:12px 22px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500">
            View in admin →
          </a>
          <a href="mailto:${payload.contact_email}" style="display:inline-block;background:transparent;color:#17181C;border:1px solid rgba(23,24,28,0.2);padding:12px 22px;border-radius:8px;text-decoration:none;font-size:14px">
            Reply to ${payload.contact_name}
          </a>
        </div>
      </div>
    </div>`

  await getResend().emails.send({
    from:    `AvantCard <${FROM}>`,
    to:      'admin@healthprac.com',
    replyTo: payload.contact_email,
    subject: `Enterprise inquiry — ${payload.company_name}`,
    html,
  })
}

// ── Enterprise inquiry: confirmation to submitter ─────────────────────────────
export async function sendEnterpriseInquiryConfirmation(payload: {
  toName: string
  toEmail: string
  companyName: string
}) {
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;color:#17181C">
      <div style="background:#17181C;padding:28px 32px;border-radius:12px 12px 0 0">
        <div style="font-family:Georgia,serif;font-size:22px;color:#F6F7F3;letter-spacing:-0.01em">AvantCard</div>
      </div>
      <div style="background:#F6F7F3;padding:32px;border-radius:0 0 12px 12px;border:1px solid rgba(23,24,28,0.1)">
        <p style="margin:0 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#8FAF9D;font-weight:500">We got it</p>
        <h2 style="margin:0 0 16px;font-family:Georgia,serif;font-size:26px;font-weight:400">Thanks, ${payload.toName}.</h2>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#444">
          Your enterprise inquiry for <strong>${payload.companyName}</strong> has been received. Our team will be in touch within one business day.
        </p>
        <p style="margin:0;font-size:12px;color:#999">
          Questions in the meantime? Reply directly to this email.
        </p>
      </div>
    </div>`

  await getResend().emails.send({
    from:    `AvantCard <${FROM}>`,
    to:      payload.toEmail,
    subject: `We received your enterprise inquiry — AvantCard`,
    html,
  })
}

// ── Enterprise pricing: approval request ─────────────────────────────────────
export async function sendEnterprisePricingApprovalRequest(payload: {
  toEmail: string
  proposedBy: string
  companyName: string
  changeLabel: string
  oldValue: string
  newValue: string
  notes?: string
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://main.d2idx6kv8dvjyf.amplifyapp.com'
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;color:#17181C">
      <div style="background:#17181C;padding:28px 32px;border-radius:12px 12px 0 0">
        <div style="font-family:Georgia,serif;font-size:22px;color:#F6F7F3;letter-spacing:-0.01em">AvantCard</div>
        <div style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;background:rgba(184,116,62,0.85);color:#fff;display:inline-block;padding:2px 8px;border-radius:4px;margin-top:8px">Enterprise · Pricing</div>
      </div>
      <div style="background:#F6F7F3;padding:32px;border-radius:0 0 12px 12px;border:1px solid rgba(23,24,28,0.1)">
        <p style="margin:0 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#B8743E;font-weight:500">Approval required</p>
        <h2 style="margin:0 0 20px;font-family:Georgia,serif;font-size:26px;font-weight:400">${payload.companyName} — ${payload.changeLabel}</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px">
          <tr style="border-bottom:1px solid rgba(23,24,28,0.08)"><td style="color:#666;padding:10px 0;width:140px">Change</td><td style="padding:10px 0;font-weight:500">${payload.changeLabel}</td></tr>
          <tr style="border-bottom:1px solid rgba(23,24,28,0.08)"><td style="color:#666;padding:10px 0">Current</td><td style="padding:10px 0;text-decoration:line-through;color:#999">${payload.oldValue}</td></tr>
          <tr style="border-bottom:1px solid rgba(23,24,28,0.08)"><td style="color:#666;padding:10px 0">Proposed</td><td style="padding:10px 0;font-weight:600">${payload.newValue}</td></tr>
          <tr style="border-bottom:1px solid rgba(23,24,28,0.08)"><td style="color:#666;padding:10px 0">Proposed by</td><td style="padding:10px 0">${payload.proposedBy}</td></tr>
          ${payload.notes ? `<tr><td style="color:#666;padding:10px 0;vertical-align:top">Notes</td><td style="padding:10px 0">${payload.notes}</td></tr>` : ''}
        </table>
        <a href="${appUrl}/admin/enterprise" style="display:inline-block;background:#17181C;color:#F6F7F3;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500">Review &amp; approve →</a>
      </div>
    </div>`

  await getResend().emails.send({
    from:    `AvantCard Admin <${FROM}>`,
    to:      payload.toEmail,
    subject: `Approval required: ${payload.companyName} — ${payload.changeLabel}`,
    html,
  })
}

// ── Enterprise pricing: decision notification ─────────────────────────────────
export async function sendEnterprisePricingDecisionNotification(payload: {
  toEmail: string
  decision: 'approved' | 'rejected'
  companyName: string
  changeLabel: string
  newValue: string
}) {
  const approved = payload.decision === 'approved'
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;color:#17181C">
      <div style="background:#17181C;padding:28px 32px;border-radius:12px 12px 0 0">
        <div style="font-family:Georgia,serif;font-size:22px;color:#F6F7F3">AvantCard</div>
        <div style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;background:rgba(184,116,62,0.85);color:#fff;display:inline-block;padding:2px 8px;border-radius:4px;margin-top:8px">Enterprise · Pricing</div>
      </div>
      <div style="background:#F6F7F3;padding:32px;border-radius:0 0 12px 12px;border:1px solid rgba(23,24,28,0.1)">
        <p style="margin:0 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:${approved ? '#2A7A4A' : '#C0392B'};font-weight:500">${approved ? 'Approved' : 'Rejected'}</p>
        <h2 style="margin:0 0 16px;font-family:Georgia,serif;font-size:26px;font-weight:400">${payload.companyName} — ${payload.changeLabel}</h2>
        <p style="font-size:15px;color:#444;margin:0">
          ${approved
            ? `The change to <strong>${payload.newValue}</strong> was approved and is now active.`
            : `The proposed change to <strong>${payload.newValue}</strong> was rejected. Check the audit log for details.`
          }
        </p>
      </div>
    </div>`

  await getResend().emails.send({
    from:    `AvantCard Admin <${FROM}>`,
    to:      payload.toEmail,
    subject: `${approved ? 'Approved' : 'Rejected'}: ${payload.companyName} — ${payload.changeLabel}`,
    html,
  })
}

// ── Pricing: approval request (to assigned approver) ─────────────────────────
export async function sendPricingApprovalRequest(payload: {
  toEmail:    string
  proposedBy: string
  planLabel:  string
  currency:   string
  oldPrice:   string
  newPrice:   string
  notes?:     string
  proposalId: string
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://main.d2idx6kv8dvjyf.amplifyapp.com'
  const reviewUrl = `${appUrl}/admin/pricing`

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;color:#17181C">
      <div style="background:#17181C;padding:28px 32px;border-radius:12px 12px 0 0">
        <div style="font-family:Georgia,serif;font-size:22px;color:#F6F7F3;letter-spacing:-0.01em">AvantCard</div>
        <div style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;background:rgba(184,116,62,0.85);color:#fff;display:inline-block;padding:2px 8px;border-radius:4px;margin-top:8px">Admin · Pricing</div>
      </div>
      <div style="background:#F6F7F3;padding:32px;border-radius:0 0 12px 12px;border:1px solid rgba(23,24,28,0.1)">
        <p style="margin:0 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#B8743E;font-weight:500">Approval required</p>
        <h2 style="margin:0 0 20px;font-family:Georgia,serif;font-size:26px;font-weight:400">Price change: ${payload.planLabel} (${payload.currency})</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px">
          <tr style="border-bottom:1px solid rgba(23,24,28,0.08)">
            <td style="color:#666;padding:10px 0;width:140px">Plan</td>
            <td style="padding:10px 0;font-weight:500">${payload.planLabel}</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(23,24,28,0.08)">
            <td style="color:#666;padding:10px 0">Currency</td>
            <td style="padding:10px 0">${payload.currency}</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(23,24,28,0.08)">
            <td style="color:#666;padding:10px 0">Current price</td>
            <td style="padding:10px 0;text-decoration:line-through;color:#999">${payload.oldPrice}</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(23,24,28,0.08)">
            <td style="color:#666;padding:10px 0">Proposed price</td>
            <td style="padding:10px 0;font-weight:600;color:#17181C">${payload.newPrice}</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(23,24,28,0.08)">
            <td style="color:#666;padding:10px 0">Proposed by</td>
            <td style="padding:10px 0">${payload.proposedBy}</td>
          </tr>
          ${payload.notes ? `
          <tr>
            <td style="color:#666;padding:10px 0;vertical-align:top">Notes</td>
            <td style="padding:10px 0">${payload.notes}</td>
          </tr>` : ''}
        </table>
        ${payload.currency === 'ZAR' ? `
        <div style="background:#FEF3E2;border:1px solid #F6C675;border-radius:8px;padding:14px 16px;margin-bottom:24px;font-size:13px;color:#7A4A0F">
          ⚠️ <strong>PayFast reminder:</strong> If you approve, remember to update the ZAR price in your PayFast merchant account manually.
        </div>` : ''}
        <a href="${reviewUrl}" style="display:inline-block;background:#17181C;color:#F6F7F3;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500">
          Review &amp; approve →
        </a>
        <p style="margin:20px 0 0;font-size:12px;color:#999">Log in to the AvantCard admin console to approve or reject this proposal.</p>
      </div>
    </div>`

  await getResend().emails.send({
    from:    `AvantCard Admin <${FROM}>`,
    to:      payload.toEmail,
    subject: `Approval required: ${payload.planLabel} (${payload.currency}) price change`,
    html,
  })
}

// ── Plan change: admin notification ──────────────────────────────────────────
export async function sendPlanChangeAdminNotification(payload: {
  subscriberEmail: string
  fromPlan: string
  toPlan: string
  fromPrice: string
  toPrice: string
  cardsUnpublished: number
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://main.d2idx6kv8dvjyf.amplifyapp.com'
  const isUpgrade = ['Solo → Small Business', 'Small Business → Enterprise'].includes(`${payload.fromPlan} → ${payload.toPlan}`)
  const directionLabel = isUpgrade ? 'Upgrade' : 'Downgrade'
  const directionColor = isUpgrade ? '#2A7A4A' : '#B8743E'

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;color:#17181C">
      <div style="background:#17181C;padding:28px 32px;border-radius:12px 12px 0 0">
        <div style="font-family:Georgia,serif;font-size:22px;color:#F6F7F3;letter-spacing:-0.01em">LeadCard</div>
        <div style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;background:${directionColor};color:#fff;display:inline-block;padding:2px 8px;border-radius:4px;margin-top:8px">Plan ${directionLabel}</div>
      </div>
      <div style="background:#F6F7F3;padding:32px;border-radius:0 0 12px 12px;border:1px solid rgba(23,24,28,0.1)">
        <p style="margin:0 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:${directionColor};font-weight:500">Billing adjustment required</p>
        <h2 style="margin:0 0 20px;font-family:Georgia,serif;font-size:26px;font-weight:400">${payload.subscriberEmail}</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px">
          <tr style="border-bottom:1px solid rgba(23,24,28,0.08)"><td style="color:#666;padding:10px 0;width:160px">Change</td><td style="padding:10px 0;font-weight:500">${payload.fromPlan} → ${payload.toPlan}</td></tr>
          <tr style="border-bottom:1px solid rgba(23,24,28,0.08)"><td style="color:#666;padding:10px 0">Old billing</td><td style="padding:10px 0;text-decoration:line-through;color:#999">${payload.fromPrice}</td></tr>
          <tr style="border-bottom:1px solid rgba(23,24,28,0.08)"><td style="color:#666;padding:10px 0">New billing</td><td style="padding:10px 0;font-weight:600">${payload.toPrice}</td></tr>
          ${payload.cardsUnpublished > 0 ? `<tr style="border-bottom:1px solid rgba(23,24,28,0.08)"><td style="color:#666;padding:10px 0">Cards unpublished</td><td style="padding:10px 0;color:#B8743E;font-weight:500">${payload.cardsUnpublished} card${payload.cardsUnpublished !== 1 ? 's' : ''}</td></tr>` : ''}
        </table>
        <div style="background:#FEF3E2;border:1px solid #F6C675;border-radius:8px;padding:14px 16px;margin-bottom:24px;font-size:13px;color:#7A4A0F">
          ⚠️ Update the subscriber's PayFast subscription amount manually to <strong>${payload.toPrice}</strong>.
        </div>
        <a href="${appUrl}/admin" style="display:inline-block;background:#17181C;color:#F6F7F3;padding:12px 22px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500">View admin console →</a>
      </div>
    </div>`

  await getResend().emails.send({
    from: `LeadCard <${FROM}>`,
    to: 'admin@healthprac.com',
    subject: `Plan ${directionLabel.toLowerCase()}: ${payload.subscriberEmail} — ${payload.fromPlan} → ${payload.toPlan}`,
    html,
  })
}

// ── Plan change: subscriber confirmation ──────────────────────────────────────
export async function sendPlanChangeSubscriberConfirmation(payload: {
  toEmail: string
  fromPlan: string
  toPlan: string
  toPrice: string
  cardsUnpublished: number
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://main.d2idx6kv8dvjyf.amplifyapp.com'
  const isUpgrade = payload.toPlan !== 'Solo'

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;color:#17181C">
      <div style="background:#17181C;padding:28px 32px;border-radius:12px 12px 0 0">
        <div style="font-family:Georgia,serif;font-size:22px;color:#F6F7F3;letter-spacing:-0.01em">LeadCard</div>
      </div>
      <div style="background:#F6F7F3;padding:32px;border-radius:0 0 12px 12px;border:1px solid rgba(23,24,28,0.1)">
        <p style="margin:0 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#8FAF9D;font-weight:500">Plan ${isUpgrade ? 'upgraded' : 'changed'}</p>
        <h2 style="margin:0 0 16px;font-family:Georgia,serif;font-size:26px;font-weight:400">You're now on ${payload.toPlan}.</h2>
        <p style="font-size:15px;line-height:1.6;color:#444;margin:0 0 20px">
          Your plan has been updated from <strong>${payload.fromPlan}</strong> to <strong>${payload.toPlan}</strong>.
          Your billing will be adjusted to <strong>${payload.toPrice}</strong> within 24 hours.
        </p>
        ${payload.cardsUnpublished > 0 ? `
        <div style="background:#FEF3E2;border:1px solid #F6C675;border-radius:8px;padding:14px 16px;margin-bottom:20px;font-size:13.5px;color:#7A4A0F;line-height:1.5">
          <strong>${payload.cardsUnpublished} team card${payload.cardsUnpublished !== 1 ? 's were' : ' was'} unpublished</strong> as the Solo plan supports 1 card.
          Your cards and their data are preserved — they can be republished if you upgrade again.
        </div>` : ''}
        <a href="${appUrl}/settings" style="display:inline-block;background:#17181C;color:#F6F7F3;padding:12px 22px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500">View account settings →</a>
        <p style="margin:20px 0 0;font-size:12px;color:#999">Questions about billing? Contact <a href="mailto:billing@leadcard.app" style="color:#999">billing@leadcard.app</a></p>
      </div>
    </div>`

  await getResend().emails.send({
    from: `LeadCard <${FROM}>`,
    to: payload.toEmail,
    subject: `Your plan has been updated to ${payload.toPlan} — LeadCard`,
    html,
  })
}

// ── Pricing: decision notification (to proposer) ──────────────────────────────
export async function sendPricingDecisionNotification(payload: {
  toEmail:   string
  decision:  'approved' | 'rejected'
  planLabel: string
  currency:  string
  newPrice:  string
}) {
  const approved = payload.decision === 'approved'
  const subject  = approved
    ? `Price change approved — ${payload.planLabel} (${payload.currency})`
    : `Price change rejected — ${payload.planLabel} (${payload.currency})`

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;color:#17181C">
      <div style="background:#17181C;padding:28px 32px;border-radius:12px 12px 0 0">
        <div style="font-family:Georgia,serif;font-size:22px;color:#F6F7F3">AvantCard</div>
        <div style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;background:rgba(184,116,62,0.85);color:#fff;display:inline-block;padding:2px 8px;border-radius:4px;margin-top:8px">Admin · Pricing</div>
      </div>
      <div style="background:#F6F7F3;padding:32px;border-radius:0 0 12px 12px;border:1px solid rgba(23,24,28,0.1)">
        <p style="margin:0 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:${approved ? '#2A7A4A' : '#C0392B'};font-weight:500">${approved ? 'Approved' : 'Rejected'}</p>
        <h2 style="margin:0 0 16px;font-family:Georgia,serif;font-size:26px;font-weight:400">
          ${payload.planLabel} (${payload.currency}) — ${approved ? 'price updated' : 'proposal rejected'}
        </h2>
        ${approved ? `
        <p style="font-size:15px;color:#444;margin:0 0 16px">
          The new price <strong>${payload.newPrice}</strong> is now live on the website.
          ${payload.currency === 'ZAR' ? 'Remember to update PayFast manually.' : ''}
        </p>` : `
        <p style="font-size:15px;color:#444;margin:0 0 16px">
          Your proposed price of <strong>${payload.newPrice}</strong> was not approved. Check the audit log for details.
        </p>`}
        <p style="margin:0;font-size:12px;color:#999">AvantCard Admin Console</p>
      </div>
    </div>`

  await getResend().emails.send({
    from:    `AvantCard Admin <${FROM}>`,
    to:      payload.toEmail,
    subject,
    html,
  })
}
