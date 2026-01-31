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
vi.mock('@/lib/api-key', () => ({ generateReferralCode: vi.fn().mockReturnValue('REFCODE123') }));
vi.mock('@/lib/fraud-detection-enhanced', () => ({
  detectFraudEnhanced: vi.fn().mockResolvedValue({ isFraud: false, reasons: [], riskScore: 0 }),
  generateDeviceFingerprint: vi.fn().mockReturnValue('fp_xxx'),
}));
vi.mock('@/lib/notifications', () => ({ notifyReferralCodeGenerated: vi.fn().mockResolvedValue(undefined) }));

import { createMockRequest } from '../../helpers/request';
import { POST } from '@/app/api/v1/referrals/route';

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

const validCampaign = {
  id: 'camp_1',
  appId: 'app_123',
  name: 'Test Campaign',
  status: 'ACTIVE',
  rewardModel: 'FIXED_CURRENCY',
  rewardValue: 10,
  rewardCap: null,
  App: { id: 'app_123' },
};

describe('POST /api/v1/referrals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.app.findUnique.mockResolvedValue(validApp);
    mockPrisma.apiUsageLog.create.mockResolvedValue({});
    mockPrisma.app.update.mockResolvedValue({});
    mockPrisma.campaign.findUnique.mockResolvedValue(validCampaign);
    mockPrisma.referral.create.mockResolvedValue({
      id: 'ref_1',
      referralCode: 'REFCODE123',
      status: 'PENDING',
      referrerId: 'user_1',
      refereeId: null,
    });
    mockPrisma.partner.findUnique.mockResolvedValue({ User: null });
  });

  it('returns 401 when authorization header is missing', async () => {
    const request = createMockRequest('http://localhost/api/v1/referrals', 'POST', { campaignId: 'camp_1', referrerId: 'user_1' }, {});
    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('returns 400 when campaignId or referrerId is missing', async () => {
    const request = createMockRequest('http://localhost/api/v1/referrals', 'POST', { referrerId: 'user_1' }, {
      authorization: 'Bearer sk_test_abc',
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe('campaignId and referrerId are required');
  });

  it('returns 404 when campaign not found', async () => {
    mockPrisma.campaign.findUnique.mockResolvedValue(null);
    const request = createMockRequest('http://localhost/api/v1/referrals', 'POST', { campaignId: 'camp_1', referrerId: 'user_1' }, {
      authorization: 'Bearer sk_test_abc',
    });
    const response = await POST(request);
    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json.error).toBe('Campaign not found');
  });

  it('returns 403 when campaign belongs to another app', async () => {
    mockPrisma.campaign.findUnique.mockResolvedValue({ ...validCampaign, appId: 'other_app', App: { id: 'other_app' } });
    const request = createMockRequest('http://localhost/api/v1/referrals', 'POST', { campaignId: 'camp_1', referrerId: 'user_1' }, {
      authorization: 'Bearer sk_test_abc',
    });
    const response = await POST(request);
    expect(response.status).toBe(403);
    const json = await response.json();
    expect(json.error).toBe('Campaign does not belong to this app');
  });

  it('returns 400 when campaign is not active', async () => {
    mockPrisma.campaign.findUnique.mockResolvedValue({ ...validCampaign, status: 'PAUSED' });
    const request = createMockRequest('http://localhost/api/v1/referrals', 'POST', { campaignId: 'camp_1', referrerId: 'user_1' }, {
      authorization: 'Bearer sk_test_abc',
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe('Campaign is not active');
  });

  it('returns 201 with referralCode and referralId', async () => {
    const request = createMockRequest('http://localhost/api/v1/referrals', 'POST', { campaignId: 'camp_1', referrerId: 'user_1' }, {
      authorization: 'Bearer sk_test_abc',
    });
    const response = await POST(request);
    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json.referralCode).toBe('REFCODE123');
    expect(json.referralId).toBe('ref_1');
    expect(json.status).toBe('PENDING');
    expect(mockPrisma.referral.create).toHaveBeenCalled();
  });

  it('returns 500 when prisma throws', async () => {
    mockPrisma.referral.create.mockRejectedValue(new Error('DB error'));
    const request = createMockRequest('http://localhost/api/v1/referrals', 'POST', { campaignId: 'camp_1', referrerId: 'user_1' }, {
      authorization: 'Bearer sk_test_abc',
    });
    const response = await POST(request);
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe('Internal server error');
  });
});
