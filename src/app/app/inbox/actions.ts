'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

async function getUserWorkspaceId(): Promise<string | null> {
  const session = await auth()
  if (!session?.user?.id) return null
  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id },
    select: { workspaceId: true },
  })
  return membership?.workspaceId ?? null
}

export async function archiveMessage(messageId: string): Promise<void> {
  const workspaceId = await getUserWorkspaceId()
  if (!workspaceId) return
  // Verify ownership before mutation
  const msg = await prisma.receivedMessage.findFirst({
    where: { id: messageId, mailDomain: { workspaceId } },
  })
  if (!msg) return
  await prisma.receivedMessage.update({
    where: { id: messageId },
    data: { isArchived: true },
  })
  revalidatePath('/app/inbox')
}

export async function markAsRead(messageId: string): Promise<void> {
  const workspaceId = await getUserWorkspaceId()
  if (!workspaceId) return
  const msg = await prisma.receivedMessage.findFirst({
    where: { id: messageId, mailDomain: { workspaceId } },
  })
  if (!msg) return
  await prisma.receivedMessage.update({
    where: { id: messageId },
    data: { isRead: true },
  })
}
