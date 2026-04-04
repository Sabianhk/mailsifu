/**
 * Dev seed: creates an initial admin user and workspace.
 * Run: npm run prisma:seed
 *
 * Credentials: admin@mailsifu.com / changeme
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@mailsifu.com'
  const passwordHash = await bcrypt.hash('changeme', 12)

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: 'Admin',
      passwordHash,
    },
  })

  const workspace = await prisma.workspace.upsert({
    where: { slug: 'mailsifu' },
    update: {},
    create: {
      name: 'MailSifu',
      slug: 'mailsifu',
    },
  })

  await prisma.membership.upsert({
    where: { userId_workspaceId: { userId: user.id, workspaceId: workspace.id } },
    update: {},
    create: {
      userId: user.id,
      workspaceId: workspace.id,
      role: 'owner',
    },
  })

  console.log(`Seeded user: ${email} (password: changeme)`)
  console.log(`Seeded workspace: ${workspace.slug}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
