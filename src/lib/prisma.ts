import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'],
  })

// Cache on globalThis in all environments — prevents connection pool exhaustion
// in Next.js standalone (long-lived Node process) and hot-reload in dev.
globalForPrisma.prisma = prisma
