import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;

// Force Node.js runtime to avoid edge runtime issues with Prisma
export const runtime = 'nodejs';
