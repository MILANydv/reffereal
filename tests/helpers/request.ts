import { NextRequest } from 'next/server';

export function createMockRequest(
  url: string,
  method: string = 'GET',
  body?: unknown,
  headers?: Record<string, string>
): NextRequest {
  const init: RequestInit = {
    method,
    headers: new Headers(headers ?? {}),
  };
  if (body !== undefined && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    init.body = JSON.stringify(body);
    if (!init.headers.has('Content-Type')) {
      (init.headers as Headers).set('Content-Type', 'application/json');
    }
  }
  return new NextRequest(url, init);
}

export function getTestSession(overrides?: {
  partnerId?: string;
  userId?: string;
  email?: string;
  role?: string;
  name?: string;
}) {
  return {
    user: {
      id: overrides?.userId ?? 'user_test_123',
      partnerId: overrides?.partnerId ?? 'partner_test_123',
      email: overrides?.email ?? 'partner@example.com',
      role: overrides?.role ?? 'PARTNER',
      name: overrides?.name ?? 'Test Partner',
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}
