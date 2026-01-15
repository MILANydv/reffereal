import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set.');
  }

  const { Pool } = require('pg');
  const { PrismaPg } = require('@prisma/adapter-pg');

  // Parse SSL requirement from connection string
  const requiresSSL = process.env.DATABASE_URL.includes('sslmode=require') || 
                      process.env.DATABASE_URL.includes('neon.tech');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: process.env.NODE_ENV === 'production' ? 20 : 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Increased timeout for better reliability
    ssl: requiresSSL ? { rejectUnauthorized: false } : undefined,
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['error'],
  });
}

// Reuse instance in development, create new in production
const prisma =
  process.env.NODE_ENV === 'production'
    ? createPrismaClient()
    : globalForPrisma.prisma ?? (globalForPrisma.prisma = createPrismaClient());

export { prisma };


