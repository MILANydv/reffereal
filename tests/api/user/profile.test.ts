import { vi } from 'vitest';

const mockAuth = vi.hoisted(() => vi.fn());
const mockPrisma = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
}));
vi.mock('@/lib/auth', () => ({ auth: mockAuth }));
vi.mock('@/lib/db', () => ({ prisma: mockPrisma }));
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn().mockResolvedValue(undefined),
    error: vi.fn().mockResolvedValue(undefined),
  },
}));

import { createMockRequest } from '../../helpers/request';
import { getTestSession } from '../../helpers/request';
import { GET, PATCH } from '@/app/api/user/profile/route';

const sessionUser = getTestSession({ userId: 'user_123', email: 'user@example.com' });

describe('GET /api/user/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue(sessionUser);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user_123',
      email: 'user@example.com',
      name: 'Test User',
      role: 'PARTNER',
      active: true,
      createdAt: new Date(),
    });
  });

  it('returns 401 when session is missing', async () => {
    mockAuth.mockResolvedValue(null);
    const response = await GET();
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBe('Unauthorized');
  });

  it('returns 404 when user not found', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const response = await GET();
    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json.error).toBe('User not found');
  });

  it('returns 200 with user profile', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.id).toBe('user_123');
    expect(json.email).toBe('user@example.com');
    expect(json.name).toBe('Test User');
    expect(json.role).toBe('PARTNER');
  });
});

describe('PATCH /api/user/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue(sessionUser);
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.update.mockResolvedValue({
      id: 'user_123',
      email: 'updated@example.com',
      name: 'Updated Name',
      role: 'PARTNER',
      active: true,
      createdAt: new Date(),
    });
  });

  it('returns 401 when session is missing', async () => {
    mockAuth.mockResolvedValue(null);
    const request = createMockRequest('http://localhost/api/user/profile', 'PATCH', { name: 'New Name' }, {});
    const response = await PATCH(request);
    expect(response.status).toBe(401);
  });

  it('returns 400 when email already in use by another user', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'other_user', email: 'taken@example.com' });
    const request = createMockRequest('http://localhost/api/user/profile', 'PATCH', { email: 'taken@example.com' }, {});
    const response = await PATCH(request);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe('Email already in use');
  });

  it('returns 200 with updated profile', async () => {
    const request = createMockRequest('http://localhost/api/user/profile', 'PATCH', {
      name: 'Updated Name',
      email: 'updated@example.com',
    }, {});
    const response = await PATCH(request);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.name).toBe('Updated Name');
    expect(json.email).toBe('updated@example.com');
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user_123' },
      data: expect.objectContaining({ name: 'Updated Name', email: 'updated@example.com' }),
      select: expect.any(Object),
    });
  });
});
