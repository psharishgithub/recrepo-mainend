import NextAuth, {AuthOptions, NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from '@/app/lib/prisma'

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'select_account',
          hd: 'rajalakshmi.edu.in',
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.sub = profile.sub as string;
        const user = await prisma.user.findUnique({
          where: { id: profile.sub as string },
          select: { role: true },
        });

        token.role = user?.role || 'STUDENT';
      }
      return token;
    },
  },
  pages: {
    signIn: '/',
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
