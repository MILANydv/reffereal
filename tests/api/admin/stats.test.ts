import { vi } from 'vitest';

const mockAuth = vi.hoisted(() => vi.fn());
const mockPrisma = vi.hoisted(() => ({
  partner: { count: vi.fn(), findUnique: vi.fn(), findMany: vi.fn() },
  app: { count: vi.fn(), findUnique: vi.fn(), aggregate: vi.fn() },
  subscription: { count: vi.fn() },
  invoice: { findMany: vi.fn() },
  apiUsageLog: { count: vi.fn(), groupBy: vi.fn(), findMany: vi.fn() },
  fraudFlag: { count: vi.fn(), findMany: vi.fn() },
  user: { findUnique: vi.fn() },
}));
vi.mock('@/lib/auth', () => ({ auth: mockAuth }));
vi.mock('@/lib/db', () => ({ prisma: mockPrisma }));

import { GET } from '@/app/api/admin/stats/route';

describe('GET /api/admin/stats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({
      user: { id: 'admin_1', role: 'SUPER_ADMIN', email: 'admin@example.com' },
      expires: new Date().toISOString(),
    });
    mockPrisma.partner.count.mockResolvedValue(10);
    mockPrisma.app.count.mockResolvedValue(25);
    mockPrisma.subscription.count.mockResolvedValue(8);
    mockPrisma.invoice.findMany.mockResolvedValue([
      { amount: 100 },
      { amount: 200 },
    ]);
    mockPrisma.apiUsageLog.count.mockResolvedValue(5000);
    mockPrisma.apiUsageLog.groupBy.mockResolvedValue([]);
    mockPrisma.fraudFlag.count.mockResolvedValue(2);
    mockPrisma.fraudFlag.findMany.mockResolvedValue([]);
    mockPrisma.partner.findMany.mockResolvedValue([]);
    mockPrisma.app.aggregate.mockResolvedValue({ _sum: { currentUsage: 1000 } });
  });

  it('returns 401 when not SUPER_ADMIN', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'user_1', role: 'PARTNER', partnerId: 'partner_1' },
      expires: new Date().toISOString(),
    });
    const response = await GET();
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBe('Unauthorized');
  });

  it('returns 200 with admin stats when SUPER_ADMIN', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.totalPartners).toBe(10);
    expect(json.totalApps).toBe(25);
    expect(json.activeSubscriptions).toBe(8);
    expect(json.totalRevenue).toBe(300);
    expect(json.totalApiCalls).toBe(5000);
    expect(mockPrisma.partner.count).toHaveBeenCalled();
    expect(mockPrisma.app.count).toHaveBeenCalled();
  });
});
