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
vi.mock('@/lib/notifications', () => ({ notifyReferralConversion: vi.fn().mockResolvedValue(undefined) }));

import { createMockRequest } from '../../helpers/request';
import { POST } from '@/app/api/v1/conversions/route';

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

const referralWithCampaign = {
  id: 'ref_1',
  referralCode: 'abc123',
  referrerId: 'user_1',
  campaignId: 'camp_1',
  Campaign: {
    id: 'camp_1',
    appId: 'app_123',
    status: 'ACTIVE',
    rewardModel: 'FIXED_CURRENCY',
    rewardValue: 10,
    rewardCap: null,
    name: 'Test Campaign',
    App: { id: 'app_123' },
  },
};

describe('POST /api/v1/conversions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.app.findUnique.mockResolvedValue(validApp);
    mockPrisma.apiUsageLog.create.mockResolvedValue({});
    mockPrisma.app.update.mockResolvedValue({});
    mockPrisma.referral.findUnique.mockResolvedValue(referralWithCampaign);
    mockPrisma.$transaction.mockImplementation((arg: unknown) => {
      if (Array.isArray(arg)) {
        return Promise.all(arg as Promise<unknown>[]);
      }
      return (arg as (tx: unknown) => Promise<unknown>)(mockPrisma);
    });
    mockPrisma.referral.update.mockResolvedValue({
      id: 'ref_1',
      referralCode: 'abc123',
      status: 'CONVERTED',
      rewardAmount: 10,
      convertedAt: new Date(),
    });
    mockPrisma.conversion.create.mockResolvedValue({
      id: 'conv_1',
      referralId: 'ref_1',
      amount: 100,
    });
    mockPrisma.partner.findUnique.mockResolvedValue({ User: null });
  });

  it('returns 401 when authorization header is missing', async () => {
    const request = createMockRequest('http://localhost/api/v1/conversions', 'POST', {
      referralCode: 'abc123',
      refereeId: 'user_2',
    }, {});
    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('returns 400 when referralCode or refereeId is missing', async () => {
    const request = createMockRequest('http://localhost/api/v1/conversions', 'POST', { referralCode: 'abc123' }, {
      authorization: 'Bearer sk_test_abc',
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe('referralCode and refereeId are required');
  });

  it('returns 404 when referral code not found', async () => {
    mockPrisma.referral.findUnique.mockResolvedValue(null);
    const request = createMockRequest('http://localhost/api/v1/conversions', 'POST', {
      referralCode: 'nonexistent',
      refereeId: 'user_2',
    }, {
      authorization: 'Bearer sk_test_abc',
    });
    const response = await POST(request);
    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json.error).toBe('Referral code not found');
  });

  it('returns 403 when referral belongs to another app', async () => {
    mockPrisma.referral.findUnique.mockResolvedValue({
      ...referralWithCampaign,
      Campaign: { ...referralWithCampaign.Campaign, appId: 'other_app', App: { id: 'other_app' } },
    });
    const request = createMockRequest('http://localhost/api/v1/conversions', 'POST', {
      referralCode: 'abc123',
      refereeId: 'user_2',
    }, {
      authorization: 'Bearer sk_test_abc',
    });
    const response = await POST(request);
    expect(response.status).toBe(403);
    const json = await response.json();
    expect(json.error).toBe('Referral does not belong to this app');
  });

  it('returns 400 when campaign is not active', async () => {
    mockPrisma.referral.findUnique.mockResolvedValue({
      ...referralWithCampaign,
      Campaign: { ...referralWithCampaign.Campaign, status: 'PAUSED' },
    });
    const request = createMockRequest('http://localhost/api/v1/conversions', 'POST', {
      referralCode: 'abc123',
      refereeId: 'user_2',
    }, {
      authorization: 'Bearer sk_test_abc',
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe('Campaign is not active');
  });

  it('returns 201 with conversion and reward amount', async () => {
    const request = createMockRequest('http://localhost/api/v1/conversions', 'POST', {
      referralCode: 'abc123',
      refereeId: 'user_2',
      amount: 100,
    }, {
      authorization: 'Bearer sk_test_abc',
    });
    const response = await POST(request);
    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.referralId).toBe('ref_1');
    expect(json.conversionId).toBe('conv_1');
    expect(json.rewardAmount).toBe(10);
    expect(json.status).toBe('CONVERTED');
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });

  it('returns 500 when prisma throws', async () => {
    mockPrisma.$transaction.mockRejectedValue(new Error('DB error'));
    const request = createMockRequest('http://localhost/api/v1/conversions', 'POST', {
      referralCode: 'abc123',
      refereeId: 'user_2',
    }, {
      authorization: 'Bearer sk_test_abc',
    });
    const response = await POST(request);
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe('Internal server error');
  });
});
