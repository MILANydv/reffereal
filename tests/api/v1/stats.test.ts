import { vi } from 'vitest';

const mockPrisma = vi.hoisted(() => ({
  app: { findUnique: vi.fn(), update: vi.fn() },
  apiUsageLog: { create: vi.fn(), findMany: vi.fn() },
  emailLog: { findMany: vi.fn() },
  referral: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), count: vi.fn(), aggregate: vi.fn() },
  campaign: { findUnique: vi.fn() },
  conversion: { create: vi.fn() },
  partner: { findUnique: vi.fn() },
  user: { findUnique: vi.fn() },
  $transaction: vi.fn(),
}));
vi.mock('@/lib/db', () => ({ prisma: mockPrisma }));
vi.mock('@/lib/email', () => ({ sendApiUsageWarningEmail: vi.fn().mockResolvedValue(undefined) }));

import { createMockRequest } from '../../helpers/request';
import { GET } from '@/app/api/v1/stats/route';

const validApp = {
  id: 'app_123',
  name: 'Test App',
  apiKey: 'sk_test_abc',
  partnerId: 'partner_123',
  monthlyLimit: 10000,
  currentUsage: 100,
  status: 'ACTIVE',
  Partner: { id: 'partner_123', active: true },
};

describe('GET /api/v1/stats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.app.findUnique.mockResolvedValue(validApp);
    mockPrisma.apiUsageLog.create.mockResolvedValue({});
    mockPrisma.app.update.mockResolvedValue({});
    mockPrisma.referral.count.mockResolvedValue(0);
    mockPrisma.referral.aggregate.mockResolvedValue({ _sum: { rewardAmount: null } });
  });

  it('returns 401 when authorization header is missing', async () => {
    const request = createMockRequest('http://localhost/api/v1/stats', 'GET', undefined, {});
    const response = await GET(request);
    expect(response.status).toBe(401);
  });

  it('returns 200 with stats when authorized', async () => {
    mockPrisma.referral.count
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(2);
    mockPrisma.referral.aggregate.mockResolvedValue({ _sum: { rewardAmount: 20 } });
    const request = createMockRequest('http://localhost/api/v1/stats', 'GET', undefined, {
      authorization: 'Bearer sk_test_abc',
    });
    const response = await GET(request);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.totalReferrals).toBe(10);
    expect(json.totalClicks).toBe(5);
    expect(json.totalConversions).toBe(2);
    expect(json.conversionRate).toBe(40);
    expect(json.totalRewardValue).toBe(20);
  });

  it('accepts campaignId query param', async () => {
    mockPrisma.referral.count.mockResolvedValue(0);
    mockPrisma.referral.aggregate.mockResolvedValue({ _sum: { rewardAmount: null } });
    const request = createMockRequest('http://localhost/api/v1/stats?campaignId=camp_1', 'GET', undefined, {
      authorization: 'Bearer sk_test_abc',
    });
    await GET(request);
    expect(mockPrisma.referral.count).toHaveBeenCalledWith({
      where: expect.objectContaining({ campaignId: 'camp_1', Campaign: { appId: 'app_123' } }),
    });
  });

  it('returns 500 when prisma throws', async () => {
    mockPrisma.referral.count.mockRejectedValue(new Error('DB error'));
    const request = createMockRequest('http://localhost/api/v1/stats', 'GET', undefined, {
      authorization: 'Bearer sk_test_abc',
    });
    const response = await GET(request);
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe('Internal server error');
  });
});
