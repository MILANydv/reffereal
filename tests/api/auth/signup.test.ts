import { vi } from 'vitest';

const mockPrisma = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), findFirst: vi.fn() },
}));
vi.mock('@/lib/db', () => ({ prisma: mockPrisma }));
vi.mock('@/lib/email', () => ({
  sendSignupEmail: vi.fn().mockResolvedValue(undefined),
  sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
}));

import { createMockRequest } from '../../helpers/request';
import { POST } from '@/app/api/auth/signup/route';

describe('POST /api/auth/signup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({
      id: 'user_1',
      email: 'new@example.com',
      Partner: [{ id: 'partner_1' }],
    });
  });

  it('returns 400 when email or password is missing', async () => {
    const request = createMockRequest('http://localhost/api/auth/signup', 'POST', { email: 'a@b.com' }, {});
    const response = await POST(request);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe('Email and password are required');
  });

  it('returns 400 when user with email already exists', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing', email: 'existing@example.com' });
    const request = createMockRequest('http://localhost/api/auth/signup', 'POST', {
      email: 'existing@example.com',
      password: 'secret123',
    }, {});
    const response = await POST(request);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe('User with this email already exists');
  });

  it('returns 201 with userId and partnerId when signup succeeds', async () => {
    const request = createMockRequest('http://localhost/api/auth/signup', 'POST', {
      email: 'new@example.com',
      password: 'secret123',
      name: 'Test User',
      companyName: 'Test Co',
    }, {});
    const response = await POST(request);
    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json.message).toContain('User created successfully');
    expect(json.userId).toBe('user_1');
    expect(json.partnerId).toBe('partner_1');
    expect(mockPrisma.user.create).toHaveBeenCalled();
  });

  it('returns 500 when prisma throws', async () => {
    mockPrisma.user.create.mockRejectedValue(new Error('DB error'));
    const request = createMockRequest('http://localhost/api/auth/signup', 'POST', {
      email: 'new@example.com',
      password: 'secret123',
    }, {});
    const response = await POST(request);
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe('Internal server error');
  });
});
