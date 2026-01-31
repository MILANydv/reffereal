import { vi } from 'vitest';

const mockPrisma = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), findFirst: vi.fn() },
}));
vi.mock('@/lib/db', () => ({ prisma: mockPrisma }));

import { createMockRequest } from '../../helpers/request';
import { GET } from '@/app/api/auth/verify-email/route';

describe('GET /api/auth/verify-email', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to login with invalid_token when token query is missing', async () => {
    const request = createMockRequest('http://localhost/api/auth/verify-email', 'GET', undefined, {});
    const response = await GET(request);
    expect([302, 307]).toContain(response.status);
    expect(response.headers.get('location')).toContain('/login?error=invalid_token');
    expect(mockPrisma.user.findFirst).not.toHaveBeenCalled();
  });

  it('redirects to login with success when token is valid', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'user_1',
      email: 'user@example.com',
      emailVerified: false,
    });
    mockPrisma.user.update.mockResolvedValue({});
    const request = createMockRequest('http://localhost/api/auth/verify-email?token=validtoken123', 'GET', undefined, {});
    const response = await GET(request);
    expect([302, 307]).toContain(response.status);
    expect(response.headers.get('location')).toContain('/login?verified=success');
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user_1' },
      data: expect.objectContaining({ emailVerified: true, emailVerifyToken: null, emailVerifyExpiry: null }),
    });
  });

  it('redirects to login with invalid_or_expired_token when token not found', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockPrisma.user.findMany.mockResolvedValue([]);
    const request = createMockRequest('http://localhost/api/auth/verify-email?token=badtoken', 'GET', undefined, {});
    const response = await GET(request);
    expect([302, 307]).toContain(response.status);
    expect(response.headers.get('location')).toContain('invalid_or_expired_token');
  });
});
