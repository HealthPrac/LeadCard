import { getAdminTeam } from '@/lib/admin/queries'
import { AddAdminForm } from './AddAdminForm'
import { RemoveAdminButton } from './RemoveAdminButton'
import { requireAdmin } from '@/lib/admin/gate'

export default async function AdminTeamPage() {
  const currentUser = await requireAdmin()
  const admins      = await getAdminTeam()

  function fmtDate(d: string) {
    return new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div style={{ maxWidth: 680 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--sage)', marginBottom: 6 }}>
          Admin Console
        </p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 34, fontWeight: 400, margin: '0 0 6px', letterSpacing: '-0.01em' }}>
          Admin team
        </h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
          Control who can access this admin console. Only people listed here see the /admin area.
        </p>
      </div>

      {/* Current admins */}
      <div style={{ background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden', marginBottom: 28 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line-2)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sage)' }}>
            Current admins — {admins.length}
          </p>
        </div>

        {admins.length === 0 ? (
          <div style={{ padding: '28px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' }}>
              No admins found. Migration 006 may not have been applied yet.
            </p>
          </div>
        ) : (
          <div>
            {admins.map(admin => (
              <div
                key={admin.id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 20px', borderBottom: '1px solid var(--line-2)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* Initials avatar */}
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: 'var(--sage-tint)', color: 'var(--charcoal)',
                    display: 'grid', placeItems: 'center',
                    fontSize: 13, fontWeight: 700, flexShrink: 0,
                  }}>
                    {(admin.email[0] ?? 'A').toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--charcoal)' }}>
                      {admin.email}
                      {admin.user_id === currentUser.id && (
                        <span style={{ marginLeft: 8, fontSize: 10.5, background: 'var(--sage)', color: 'var(--charcoal)', padding: '1px 7px', borderRadius: 4, fontWeight: 700 }}>
                          You
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>
                      Added {fmtDate(admin.created_at)}
                      {admin.note && ` · ${admin.note}`}
                    </div>
                  </div>
                </div>

                {/* Can't remove yourself */}
                {admin.user_id !== currentUser.id && (
                  <RemoveAdminButton adminId={admin.id} email={admin.email} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add admin */}
      <div style={{ background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--line)', padding: '22px 24px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sage)', marginBottom: 14 }}>
          Add admin
        </p>
        <AddAdminForm />
      </div>

      {/* Access note */}
      <div style={{ marginTop: 20, padding: '14px 18px', background: 'var(--cream-2)', borderRadius: 12, border: '1px solid var(--line-2)' }}>
        <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>
          🔒 <strong>Access works immediately</strong> — no re-login required. The admin check runs server-side on every page load.<br />
          Removed admins lose access instantly on their next navigation.<br />
          Admins can also sign in as regular subscribers and see their own card — admin access is additive, not exclusive.
        </p>
      </div>
    </div>
  )
}
