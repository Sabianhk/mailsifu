import { redirect } from 'next/navigation'
import { getSession } from '@/lib/workspace'
import { SessionProvider } from 'next-auth/react'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session?.user) redirect('/auth/signin')

  return (
    <SessionProvider session={session}>
      <div className="flex h-screen overflow-hidden" style={{ background: '#fdf8f5' }}>
        {children}
      </div>
    </SessionProvider>
  )
}
