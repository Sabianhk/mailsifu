'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import bcrypt from 'bcryptjs'

async function getAdminMembership(userId: string) {
  return prisma.membership.findFirst({
    where: { userId, role: 'owner' },
    select: { workspaceId: true },
  })
}

export async function createUser(_prevState: unknown, formData: FormData): Promise<{ error?: string; success?: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated' }

  const adminMembership = await getAdminMembership(session.user.id)
  if (!adminMembership) return { error: 'Not authorised' }

  const email = (formData.get('email') as string | null)?.trim().toLowerCase()
  const name = (formData.get('name') as string | null)?.trim() || null
  const password = formData.get('password') as string | null
  const role = formData.get('role') as string | null

  if (!email || !password) return { error: 'Email and password are required' }
  if (password.length < 8) return { error: 'Password must be at least 8 characters' }
  if (role !== 'owner' && role !== 'member') return { error: 'Invalid role' }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return { error: 'A user with that email already exists' }

  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email, name, passwordHash },
    })
    await tx.membership.create({
      data: { userId: user.id, workspaceId: adminMembership.workspaceId, role },
    })
  })

  revalidatePath('/app/admin/users')
  return { success: `User ${email} created successfully` }
}
