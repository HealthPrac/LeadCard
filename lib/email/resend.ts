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
