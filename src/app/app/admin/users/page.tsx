import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession, getMembership } from '@/lib/workspace'
import { Sidebar } from '@/components/Sidebar'
import { TopBar } from '@/components/TopBar'
import { CreateUserForm } from './CreateUserForm'

export default async function AdminUsersPage() {
  const [session, membership] = await Promise.all([
    getSession(),
    getMembership(),
  ])

  if (membership?.role !== 'owner') redirect('/app/inbox')

  const userName = session?.user?.name ?? session?.user?.email ?? 'User'

  const members = await prisma.membership.findMany({
    where: { workspaceId: membership.workspaceId },
    orderBy: { createdAt: 'asc' },
    include: {
      user: { select: { id: true, email: true, name: true, createdAt: true } },
    },
  })

  return (
    <>
      <Sidebar activePage="users" userName={userName} userEmail={session?.user?.email ?? ''} isAdmin />
      <main className="flex-1 flex flex-col overflow-hidden" style={{ background: '#fcf9f6' }}>
        <TopBar breadcrumb={['Admin', 'Users']} showSearch={false} userName={userName} />

        <section className="flex-1 overflow-y-auto px-4 md:px-10 py-6 md:py-12">
          <div className="max-w-4xl mx-auto space-y-12">

            {/* Header */}
            <div>
              <h1
                className="text-2xl md:text-4xl mb-2"
                style={{ fontFamily: 'var(--font-newsreader)', color: '#1c1c1a', fontWeight: 600, lineHeight: 1.1 }}
              >
                User Management
              </h1>
              <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '0.9375rem', color: '#5f5e58' }}>
                Manage workspace members and their roles.
              </p>
            </div>

            {/* Users table */}
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(222,192,183,0.3)', background: '#ffffff' }}>
              <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(222,192,183,0.3)' }}>
                <h2 style={{ fontFamily: 'var(--font-manrope)', fontSize: '0.875rem', fontWeight: 700, color: '#1c1c1a' }}>
                  Members ({members.length})
                </h2>
              </div>
              <div className="divide-y" style={{ borderColor: 'rgba(222,192,183,0.2)' }}>
                {members.map(({ user, role, createdAt }) => {
                  const initials = (user.name ?? user.email)
                    .split(/[\s@]/)
                    .map((p: string) => p[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)

                  return (
                    <div key={user.id} className="flex items-center gap-4 px-6 py-4">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #832800 0%, #a43e15 100%)' }}
                      >
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        {user.name && (
                          <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '0.875rem', fontWeight: 600, color: '#1c1c1a' }}>
                            {user.name}
                          </p>
                        )}
                        <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '0.8125rem', color: '#5f5e58' }}>{user.email}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{
                            background: role === 'owner' ? '#f4dfcb' : '#e5e2da',
                            color: role === 'owner' ? '#524536' : '#5f5e58',
                            fontFamily: 'var(--font-manrope)',
                          }}
                        >
                          {role === 'owner' ? 'Admin' : 'Member'}
                        </span>
                        <span style={{ fontFamily: 'var(--font-manrope)', fontSize: '0.75rem', color: '#8b726a' }}>
                          {new Date(createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Create user form */}
            <div className="rounded-xl p-6 md:p-8" style={{ background: '#ffffff', border: '1px solid rgba(222,192,183,0.3)' }}>
              <h2
                className="mb-6"
                style={{ fontFamily: 'var(--font-newsreader)', fontSize: '1.375rem', color: '#1c1c1a', fontWeight: 600 }}
              >
                Add New User
              </h2>
              <CreateUserForm />
            </div>

          </div>
        </section>
      </main>
    </>
  )
}
