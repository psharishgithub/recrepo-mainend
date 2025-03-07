import NextAuth from 'next-auth';
import { DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      regulation?: Int | null;
      role: String | null;
    } & DefaultUser;
  }

  interface User {
    id: string;
  }
}
