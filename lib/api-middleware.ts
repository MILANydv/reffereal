import { NextRequest } from 'next/server';
import { prisma } from './db';

export async function authenticateApiKey(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Missing or invalid authorization header', status: 401 };
  }

  const apiKey = authHeader.substring(7);
  
  const app = await prisma.app.findUnique({
    where: { apiKey },
    include: { partner: true },
  });

  if (!app) {
    return { error: 'Invalid API key', status: 401 };
  }

  if (app.status !== 'ACTIVE' || !app.partner.active) {
    return { error: 'App or partner is suspended', status: 403 };
  }

  if (app.currentUsage >= app.monthlyLimit) {
    return { error: 'Monthly API limit exceeded', status: 429 };
  }

  return { app };
}

export async function logApiUsage(
  appId: string,
  endpoint: string,
  request: NextRequest
) {
  await prisma.$transaction([
    prisma.apiUsageLog.create({
      data: {
        appId,
        endpoint,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    }),
    prisma.app.update({
      where: { id: appId },
      data: { currentUsage: { increment: 1 } },
    }),
  ]);
}
