import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  // Neon database connection string (hardcoded)
  const databaseUrl = 'postgresql://neondb_owner:npg_Ia7vCtRAzSc6@ep-muddy-credit-aht047xs-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

  const { Pool } = require('pg');
  const { PrismaPg } = require('@prisma/adapter-pg');

  const pool = new Pool({
    connectionString: databaseUrl,
    max: process.env.NODE_ENV === 'production' ? 20 : 10,
    min: 0, // Allow pool to shrink to zero connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 20000, // Increased timeout
    ssl: { rejectUnauthorized: false },
    // Add connection retry logic
    allowExitOnIdle: true,
  });

  // Handle pool errors
  pool.on('error', (err: Error) => {
    console.error('Unexpected error on idle client', err);
  });

  const adapter = new PrismaPg(pool);

  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['error'],
  });

  // Ensure connection is established
  client.$connect().catch((err) => {
    console.error('Failed to connect to database:', err);
  });

  return client;
}

// Reuse instance in development, create new in production
const prisma =
  process.env.NODE_ENV === 'production'
    ? createPrismaClient()
    : globalForPrisma.prisma ?? (globalForPrisma.prisma = createPrismaClient());

export { prisma };


