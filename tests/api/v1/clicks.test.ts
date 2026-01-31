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
vi.mock('@/lib/webhooks', () => ({ triggerWebhook: vi.fn().mockResolvedValue(undefined) }));

import { createMockRequest } from '../../helpers/request';
import { POST } from '@/app/api/v1/clicks/route';

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

describe('POST /api/v1/clicks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.app.findUnique.mockResolvedValue(validApp);
    mockPrisma.apiUsageLog.create.mockResolvedValue({});
    mockPrisma.app.update.mockResolvedValue({});
  });

  it('returns 401 when authorization header is missing', async () => {
    const request = createMockRequest('http://localhost/api/v1/clicks', 'POST', { referralCode: 'abc123' }, {});
    const response = await POST(request);
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBeDefined();
  });

  it('returns 400 when referralCode is missing', async () => {
    const request = createMockRequest('http://localhost/api/v1/clicks', 'POST', {}, {
      authorization: 'Bearer sk_test_abc',
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe('referralCode is required');
  });

  it('returns 404 when referral code not found', async () => {
    mockPrisma.referral.findUnique.mockResolvedValue(null);
    const request = createMockRequest('http://localhost/api/v1/clicks', 'POST', { referralCode: 'nonexistent' }, {
      authorization: 'Bearer sk_test_abc',
    });
    const response = await POST(request);
    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json.error).toBe('Referral code not found');
  });

  it('returns 403 when referral belongs to another app', async () => {
    mockPrisma.referral.findUnique.mockResolvedValue({
      id: 'ref_1',
      referralCode: 'abc123',
      campaignId: 'camp_1',
      Campaign: { appId: 'other_app', App: { id: 'other_app' } },
    });
    const request = createMockRequest('http://localhost/api/v1/clicks', 'POST', { referralCode: 'abc123' }, {
      authorization: 'Bearer sk_test_abc',
    });
    const response = await POST(request);
    expect(response.status).toBe(403);
    const json = await response.json();
    expect(json.error).toBe('Referral does not belong to this app');
  });

  it('returns 200 and updates referral status to CLICKED', async () => {
    const referral = {
      id: 'ref_1',
      referralCode: 'abc123',
      campaignId: 'camp_1',
      Campaign: { appId: 'app_123', App: { id: 'app_123' } },
    };
    mockPrisma.referral.findUnique.mockResolvedValue(referral);
    mockPrisma.referral.update.mockResolvedValue({
      id: 'ref_1',
      referralCode: 'abc123',
      status: 'CLICKED',
      clickedAt: new Date(),
    });
    const request = createMockRequest('http://localhost/api/v1/clicks', 'POST', { referralCode: 'abc123' }, {
      authorization: 'Bearer sk_test_abc',
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.referralId).toBe('ref_1');
    expect(json.status).toBe('CLICKED');
    expect(mockPrisma.referral.update).toHaveBeenCalledWith({
      where: { id: 'ref_1' },
      data: expect.objectContaining({ status: 'CLICKED' }),
    });
  });

  it('returns 500 when prisma throws', async () => {
    mockPrisma.referral.findUnique.mockRejectedValue(new Error('DB error'));
    const request = createMockRequest('http://localhost/api/v1/clicks', 'POST', { referralCode: 'abc123' }, {
      authorization: 'Bearer sk_test_abc',
    });
    const response = await POST(request);
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe('Internal server error');
  });
});
