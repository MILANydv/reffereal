import { UserRole } from '@prisma/client';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      partnerId?: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: UserRole;
    partnerId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    partnerId?: string;
  }
}
