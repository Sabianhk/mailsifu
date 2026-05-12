import { redirect } from 'next/navigation'
import { getSession, getMembership } from '@/lib/workspace'
import { prisma } from '@/lib/prisma'
import { SessionProvider } from 'next-auth/react'
import { Sidebar } from '@/components/Sidebar'
import { PushNotificationProvider } from '@/components/PushNotificationProvider'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [session, membership] = await Promise.all([getSession(), getMembership()])
  if (!session?.user) redirect('/auth/signin')

  const userName = session?.user?.name ?? session?.user?.email ?? 'User'
  const isAdmin = membership?.role === 'owner'

  let unreadCount = 0
  try {
    unreadCount = membership
      ? await prisma.receivedMessage.count({
          where: {
            isRead: false,
            isArchived: false,
            mailDomain: { workspaceId: membership.workspaceId },
          },
        })
      : 0
  } catch (err) {
    console.error('Unread count query failed:', err)
  }

  return (
    <SessionProvider session={session}>
      <PushNotificationProvider />
      <div className="flex h-screen overflow-hidden" style={{ background: '#fdf8f5' }}>
        <Sidebar userName={userName} userEmail={session?.user?.email ?? ''} isAdmin={isAdmin} unreadCount={unreadCount} />
        {children}
      </div>
    </SessionProvider>
  )
}
