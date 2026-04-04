import type { NextAuthConfig } from 'next-auth'

/**
 * Minimal auth config safe for Edge Runtime (middleware).
 * No Node.js-only imports (no bcryptjs, no Prisma).
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user
    },
  },
  providers: [],
}
