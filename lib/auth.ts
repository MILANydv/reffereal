import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { UserRole } from '@prisma/client';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Lazy import to avoid edge runtime issues with Node.js modules
        const { prisma } = await import('./db');
        const bcrypt = (await import('bcryptjs')).default;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: {
            partners: true,
          },
        });

        if (!user || !user.active) {
          return null;
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValidPassword) {
          return null;
        }

        // Check email verification for PARTNER role
        // Return null to prevent login if email is not verified
        // The login page will check this separately and show appropriate error
        if (user.role === UserRole.PARTNER && !user.emailVerified) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          partnerId: user.partners[0]?.id,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.partnerId = user.partnerId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.partnerId = token.partnerId as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});
