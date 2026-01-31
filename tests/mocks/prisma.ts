import { vi } from 'vitest';

/**
 * Creates a chainable Prisma mock with all models/methods used across API routes.
 * Use in test files: const mockPrisma = vi.hoisted(() => createMockPrisma());
 * Then: vi.mock('@/lib/db', () => ({ prisma: mockPrisma }));
 */
export function createMockPrisma() {
  return {
    app: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    apiUsageLog: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    emailLog: {
      findMany: vi.fn(),
    },
    campaign: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    referral: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
    },
    conversion: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    partner: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  };
}

export type MockPrisma = ReturnType<typeof createMockPrisma>;
