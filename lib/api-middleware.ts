import { NextRequest } from 'next/server';
import { prisma } from './db';
import { sendApiUsageWarningEmail } from './email';
import { getClientIp } from './client-ip';

export async function authenticateApiKey(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Missing or invalid authorization header', status: 401 };
  }

  const apiKey = authHeader.substring(7);
  
  const app = await prisma.app.findUnique({
    where: { apiKey },
    include: { Partner: true },
  });

  if (!app) {
    return { error: 'Invalid API key', status: 401 };
  }

  if (app.status !== 'ACTIVE' || !app.Partner.active) {
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
  const [_, updatedApp] = await Promise.all([
    prisma.apiUsageLog.create({
      data: {
        App: { connect: { id: appId } },
        endpoint,
        ipAddress: getClientIp(request) || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    }),
    prisma.app.update({
      where: { id: appId },
      data: { currentUsage: { increment: 1 } },
      include: {
        Partner: {
          include: {
            User: true,
          },
        },
      },
    }),
  ]);

  // Check if usage thresholds are reached and send warnings
  const usagePercentage = (updatedApp.currentUsage / updatedApp.monthlyLimit) * 100;
  
  // Send warning at 80%, 90%, and 95%
  if ([80, 90, 95].includes(Math.floor(usagePercentage / 10) * 10) && updatedApp.Partner?.User) {
    try {
      // Check if we've already sent a warning for this threshold
      const recentWarnings = await prisma.emailLog.findMany({
        where: {
          to: updatedApp.Partner.User.email,
          template: 'api_usage_warning',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
          metadata: {
            contains: `"percentage":${Math.floor(usagePercentage / 10) * 10}`,
          },
        },
        take: 1,
      });

      if (recentWarnings.length === 0) {
        await sendApiUsageWarningEmail(
          updatedApp.Partner.User.email,
          {
            name: updatedApp.name,
            currentUsage: updatedApp.currentUsage,
            monthlyLimit: updatedApp.monthlyLimit,
          },
          Math.floor(usagePercentage / 10) * 10,
          updatedApp.Partner.User.name || undefined
        );
      }
    } catch (error) {
      console.error('[API Usage] Error sending warning email:', error);
      // Don't fail the request if email fails
    }
  }
}
