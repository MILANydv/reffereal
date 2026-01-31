import { vi } from 'vitest';

const mockAuth = vi.hoisted(() => vi.fn());
const mockPrisma = vi.hoisted(() => ({
  app: { findFirst: vi.fn(), findUnique: vi.fn() },
  campaign: { findMany: vi.fn(), count: vi.fn(), create: vi.fn(), update: vi.fn(), findUnique: vi.fn() },
  referral: { findMany: vi.fn() },
  partner: { findUnique: vi.fn() },
  user: { findUnique: vi.fn() },
}));
vi.mock('@/lib/auth', () => ({ auth: mockAuth }));
vi.mock('@/lib/db', () => ({ prisma: mockPrisma }));

import { createMockRequest } from '../../helpers/request';
import { getTestSession } from '../../helpers/request';
import { GET } from '@/app/api/partner/campaigns/route';

describe('GET /api/partner/campaigns', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue(getTestSession({ partnerId: 'partner_123' }));
    mockPrisma.app.findFirst.mockResolvedValue({ id: 'app_1', name: 'Test App', partnerId: 'partner_123' });
    mockPrisma.campaign.count.mockResolvedValue(2);
    mockPrisma.campaign.findMany.mockResolvedValue([
      { id: 'camp_1', name: 'Campaign 1', appId: 'app_1', _count: { Referral: 5 } },
      { id: 'camp_2', name: 'Campaign 2', appId: 'app_1', _count: { Referral: 3 } },
    ]);
  });

  it('returns 401 when session is missing', async () => {
    mockAuth.mockResolvedValue(null);
    const request = createMockRequest('http://localhost/api/partner/campaigns?appId=app_1', 'GET', undefined, {});
    const response = await GET(request);
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBe('Unauthorized');
  });

  it('returns 400 when appId is missing', async () => {
    const request = createMockRequest('http://localhost/api/partner/campaigns', 'GET', undefined, {});
    const response = await GET(request);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe('appId is required');
  });

  it('returns 404 when app not found', async () => {
    mockPrisma.app.findFirst.mockResolvedValue(null);
    const request = createMockRequest('http://localhost/api/partner/campaigns?appId=other_app', 'GET', undefined, {});
    const response = await GET(request);
    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json.error).toBe('App not found');
  });

  it('returns 200 with campaigns and pagination', async () => {
    const request = createMockRequest('http://localhost/api/partner/campaigns?appId=app_1', 'GET', undefined, {});
    const response = await GET(request);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.campaigns).toHaveLength(2);
    expect(json.pagination).toEqual({ page: 1, limit: 25, totalItems: 2, totalPages: 1 });
  });
});
