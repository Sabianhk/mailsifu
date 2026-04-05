import { redirect } from 'next/navigation'
import { getSession, getMembership } from '@/lib/workspace'
import { SessionProvider } from 'next-auth/react'
import { Sidebar } from '@/components/Sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [session, membership] = await Promise.all([getSession(), getMembership()])
  if (!session?.user) redirect('/auth/signin')

  const userName = session?.user?.name ?? session?.user?.email ?? 'User'
  const isAdmin = membership?.role === 'owner'

  return (
    <SessionProvider session={session}>
      <div className="flex h-screen overflow-hidden" style={{ background: '#fdf8f5' }}>
        <Sidebar userName={userName} userEmail={session?.user?.email ?? ''} isAdmin={isAdmin} />
        {children}
      </div>
    </SessionProvider>
  )
}
