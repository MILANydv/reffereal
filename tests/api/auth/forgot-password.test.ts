import { vi } from 'vitest';

const mockPrisma = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), findFirst: vi.fn() },
}));
vi.mock('@/lib/db', () => ({ prisma: mockPrisma }));
vi.mock('@/lib/email', () => ({ sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined) }));

import { createMockRequest } from '../../helpers/request';
import { POST } from '@/app/api/auth/forgot-password/route';

describe('POST /api/auth/forgot-password', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when email is missing', async () => {
    const request = createMockRequest('http://localhost/api/auth/forgot-password', 'POST', {}, {});
    const response = await POST(request);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe('Email is required');
  });

  it('returns 200 with generic message when user exists (sends reset email)', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user_1',
      email: 'user@example.com',
      name: 'Test',
    });
    mockPrisma.user.update.mockResolvedValue({});
    const request = createMockRequest('http://localhost/api/auth/forgot-password', 'POST', { email: 'user@example.com' }, {});
    const response = await POST(request);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.message).toContain('If an account with that email exists');
    expect(mockPrisma.user.update).toHaveBeenCalled();
  });

  it('returns 200 with same message when user does not exist (no email enumeration)', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const request = createMockRequest('http://localhost/api/auth/forgot-password', 'POST', { email: 'nonexistent@example.com' }, {});
    const response = await POST(request);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.message).toContain('If an account with that email exists');
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it('returns 500 when prisma throws', async () => {
    mockPrisma.user.findUnique.mockRejectedValue(new Error('DB error'));
    const request = createMockRequest('http://localhost/api/auth/forgot-password', 'POST', { email: 'user@example.com' }, {});
    const response = await POST(request);
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe('Internal server error');
  });
});
