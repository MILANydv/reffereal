import { vi } from 'vitest';

const mockAuth = vi.hoisted(() => vi.fn());
const mockPrisma = vi.hoisted(() => ({
  partner: { findUnique: vi.fn(), findMany: vi.fn() },
  referral: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), count: vi.fn(), aggregate: vi.fn() },
  apiUsageLog: { create: vi.fn(), findMany: vi.fn(), count: vi.fn(), groupBy: vi.fn() },
  fraudFlag: { count: vi.fn(), findMany: vi.fn() },
  app: { findUnique: vi.fn() },
  campaign: { findUnique: vi.fn() },
  user: { findUnique: vi.fn() },
  $transaction: vi.fn(),
}));
vi.mock('@/lib/auth', () => ({ auth: mockAuth }));
vi.mock('@/lib/db', () => ({ prisma: mockPrisma }));

import { createMockRequest } from '../../helpers/request';
import { getTestSession } from '../../helpers/request';
import { GET } from '@/app/api/partner/dashboard-stats/route';

describe('GET /api/partner/dashboard-stats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue(getTestSession({ partnerId: 'partner_123' }));
    mockPrisma.partner.findUnique.mockResolvedValue({
      id: 'partner_123',
      App: [
        {
          id: 'app_1',
          name: 'App 1',
          Campaign: [],
          ApiUsageLog: [],
        },
      ],
      Subscription: { PricingPlan: { apiLimit: 10000 } },
    });
    mockPrisma.referral.findMany.mockResolvedValue([]);
    mockPrisma.fraudFlag.count.mockResolvedValue(0);
    mockPrisma.apiUsageLog.findMany.mockResolvedValue([]);
  });

  it('returns 401 when session is missing', async () => {
    mockAuth.mockResolvedValue(null);
    const request = createMockRequest('http://localhost/api/partner/dashboard-stats', 'GET', undefined, {});
    const response = await GET(request);
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBe('Unauthorized');
  });

  it('returns 401 when partnerId is missing', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user_1' } });
    const request = createMockRequest('http://localhost/api/partner/dashboard-stats', 'GET', undefined, {});
    const response = await GET(request);
    expect(response.status).toBe(401);
  });

  it('returns 404 when partner not found', async () => {
    mockPrisma.partner.findUnique.mockResolvedValue(null);
    const request = createMockRequest('http://localhost/api/partner/dashboard-stats', 'GET', undefined, {});
    const response = await GET(request);
    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json.error).toBe('Partner not found');
  });

  it('returns 200 with stats when authorized', async () => {
    const request = createMockRequest('http://localhost/api/partner/dashboard-stats', 'GET', undefined, {});
    const response = await GET(request);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.totalApps).toBe(1);
    expect(json.totalReferrals).toBe(0);
    expect(json.totalClicks).toBe(0);
    expect(json.totalConversions).toBe(0);
    expect(json.apiUsage).toBeDefined();
    expect(json.recentActivity).toBeDefined();
    expect(json.alerts).toBeDefined();
  });
});
