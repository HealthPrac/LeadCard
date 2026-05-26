import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/admin/gate'
import {
  getEnterpriseLead,
  getEnrollmentForLead,
  getEnrollmentPricingProposals,
  getEnrollmentAuditLog,
  changeTypeLabel,
} from '@/lib/admin/enterprise-queries'
import { getAdminOptions } from '@/lib/admin/pricing-queries'
import { EnterpriseLeadDetail } from './EnterpriseLeadDetail'

export default async function EnterpriseLeadPage({ params }: { params: { id: string } }) {
  const actor = await requireAdmin()
  const lead  = await getEnterpriseLead(params.id)
  if (!lead) notFound()

  const enrollment = await getEnrollmentForLead(lead.id)
  const [admins, proposals, auditLog] = await Promise.all([
    getAdminOptions(),
    enrollment ? getEnrollmentPricingProposals(enrollment.id) : Promise.resolve([]),
    enrollment ? getEnrollmentAuditLog(enrollment.id) : Promise.resolve([]),
  ])

  return (
    <EnterpriseLeadDetail
      lead={lead}
      enrollment={enrollment}
      admins={admins}
      proposals={proposals}
      auditLog={auditLog}
      currentAdminId={actor.id}
    />
  )
}
