import { cache } from 'react'
import { auth } from './auth'
import { prisma } from './prisma'

export const getSession = cache(() => auth())

export const getMembership = cache(async () => {
  const session = await getSession()
  if (!session?.user?.id) return null
  return prisma.membership.findFirst({
    where: { userId: session.user.id },
    select: { workspaceId: true, role: true },
  })
})
