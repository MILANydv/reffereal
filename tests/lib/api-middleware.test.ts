import { vi } from 'vitest';

const mockPrisma = vi.hoisted(() => ({
  app: { findUnique: vi.fn(), findMany: vi.fn(), update: vi.fn(), create: vi.fn() },
  apiUsageLog: { create: vi.fn(), findMany: vi.fn() },
  emailLog: { findMany: vi.fn() },
  campaign: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
  referral: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), count: vi.fn(), aggregate: vi.fn() },
  conversion: { create: vi.fn(), findMany: vi.fn() },
  partner: { findUnique: vi.fn(), findMany: vi.fn() },
  user: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
  $transaction: vi.fn(),
}));
vi.mock('@/lib/db', () => ({ prisma: mockPrisma }));
vi.mock('@/lib/email', () => ({ sendApiUsageWarningEmail: vi.fn().mockResolvedValue(undefined) }));

import { createMockRequest } from '../helpers/request';
import { authenticateApiKey, logApiUsage } from '@/lib/api-middleware';

describe('authenticateApiKey', () => {
  const validApp = {
    id: 'app_123',
    name: 'Test App',
    apiKey: 'sk_test_abc',
    partnerId: 'partner_123',
    monthlyLimit: 10000,
    currentUsage: 100,
    status: 'ACTIVE',
    isSandbox: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    Partner: {
      id: 'partner_123',
      active: true,
      companyName: 'Test Co',
      userId: 'user_123',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when authorization header is missing', async () => {
    const request = createMockRequest('http://localhost/api/v1/referrals', 'POST', {}, {});
    const result = await authenticateApiKey(request);
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.status).toBe(401);
      expect(result.error).toBe('Missing or invalid authorization header');
    }
    expect(mockPrisma.app.findUnique).not.toHaveBeenCalled();
  });

  it('returns 401 when authorization header does not start with Bearer', async () => {
    const request = createMockRequest('http://localhost/api/v1/referrals', 'POST', {}, {
      authorization: 'Basic xxx',
    });
    const result = await authenticateApiKey(request);
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.status).toBe(401);
      expect(result.error).toBe('Missing or invalid authorization header');
    }
  });

  it('returns 401 when API key is invalid (app not found)', async () => {
    mockPrisma.app.findUnique.mockResolvedValue(null);
    const request = createMockRequest('http://localhost/api/v1/referrals', 'POST', {}, {
      authorization: 'Bearer invalid_key',
    });
    const result = await authenticateApiKey(request);
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.status).toBe(401);
      expect(result.error).toBe('Invalid API key');
    }
    expect(mockPrisma.app.findUnique).toHaveBeenCalledWith({
      where: { apiKey: 'invalid_key' },
      include: { Partner: true },
    });
  });

  it('returns 403 when app status is not ACTIVE', async () => {
    mockPrisma.app.findUnique.mockResolvedValue({
      ...validApp,
      status: 'SUSPENDED',
    });
    const request = createMockRequest('http://localhost/api/v1/referrals', 'POST', {}, {
      authorization: 'Bearer sk_test_abc',
    });
    const result = await authenticateApiKey(request);
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.status).toBe(403);
      expect(result.error).toBe('App or partner is suspended');
    }
  });

  it('returns 403 when partner is not active', async () => {
    mockPrisma.app.findUnique.mockResolvedValue({
      ...validApp,
      Partner: { ...validApp.Partner, active: false },
    });
    const request = createMockRequest('http://localhost/api/v1/referrals', 'POST', {}, {
      authorization: 'Bearer sk_test_abc',
    });
    const result = await authenticateApiKey(request);
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.status).toBe(403);
      expect(result.error).toBe('App or partner is suspended');
    }
  });

  it('returns 429 when monthly API limit exceeded', async () => {
    mockPrisma.app.findUnique.mockResolvedValue({
      ...validApp,
      currentUsage: 10000,
      monthlyLimit: 10000,
    });
    const request = createMockRequest('http://localhost/api/v1/referrals', 'POST', {}, {
      authorization: 'Bearer sk_test_abc',
    });
    const result = await authenticateApiKey(request);
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.status).toBe(429);
      expect(result.error).toBe('Monthly API limit exceeded');
    }
  });

  it('returns app when API key is valid', async () => {
    mockPrisma.app.findUnique.mockResolvedValue(validApp);
    const request = createMockRequest('http://localhost/api/v1/referrals', 'POST', {}, {
      authorization: 'Bearer sk_test_abc',
    });
    const result = await authenticateApiKey(request);
    expect('app' in result).toBe(true);
    if ('app' in result) {
      expect(result.app.id).toBe('app_123');
      expect(result.app.apiKey).toBe('sk_test_abc');
    }
  });
});

describe('logApiUsage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.apiUsageLog.create.mockResolvedValue({});
    mockPrisma.app.update.mockResolvedValue({
      id: 'app_123',
      currentUsage: 101,
      monthlyLimit: 10000,
      Partner: { User: null },
    });
    mockPrisma.emailLog.findMany.mockResolvedValue([]);
  });

  it('calls apiUsageLog.create and app.update', async () => {
    const request = createMockRequest('http://localhost/api/v1/clicks', 'POST', { referralCode: 'abc' }, {
      authorization: 'Bearer sk_test',
    });
    await logApiUsage('app_123', '/api/v1/clicks', request);
    expect(mockPrisma.apiUsageLog.create).toHaveBeenCalled();
    expect(mockPrisma.app.update).toHaveBeenCalledWith({
      where: { id: 'app_123' },
      data: { currentUsage: { increment: 1 } },
      include: { Partner: { include: { User: true } } },
    });
  });
});
