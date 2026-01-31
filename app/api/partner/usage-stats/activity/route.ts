import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.partnerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const statusFilter = searchParams.get('status');
    const endpointFilter = searchParams.get('endpoint');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');

    const partnerId = session.user.partnerId;

    // Build where clause - if appId is provided, filter to that app; otherwise show all apps (platform-level)
    const whereClause: any = {
      App: {
        partnerId,
        ...(appId ? { id: appId } : {}),
      },
    };

    // Date range filter
    if (startDate || endDate) {
      whereClause.timestamp = {};
      if (startDate) {
        whereClause.timestamp.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.timestamp.lte = new Date(endDate);
      }
    }

    // Note: ApiUsageLog doesn't have statusCode, so status filter is not applicable
    // Status filter would require adding statusCode to ApiUsageLog model

    // Endpoint filter
    if (endpointFilter && endpointFilter !== 'all') {
      whereClause.endpoint = endpointFilter;
    }

    // Search filter
    if (search) {
      whereClause.OR = [
        { endpoint: { contains: search, mode: 'insensitive' } },
        { ipAddress: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const totalItems = await prisma.apiUsageLog.count({ where: whereClause });
    const totalPages = Math.ceil(totalItems / limit);

    // Get logs with pagination, including app information
    const logs = await prisma.apiUsageLog.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        App: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // For referral-related endpoints, try to find associated campaign
    // Note: This is a best-effort approach since API logs don't directly link to campaigns
    const logsWithCampaign = await Promise.all(
      logs.map(async (log) => {
        let campaignName = null;
        
        // If endpoint is referral-related, try to find the most recent campaign for this app
        if (log.endpoint.includes('/referral') || log.endpoint.includes('/conversion') || log.endpoint.includes('/click')) {
          const recentCampaign = await prisma.campaign.findFirst({
            where: {
              appId: log.appId,
              status: 'ACTIVE',
            },
            orderBy: { createdAt: 'desc' },
            select: { name: true },
          });
          campaignName = recentCampaign?.name || null;
        }

        return {
          id: log.id,
          endpoint: log.endpoint,
          statusCode: 200, // Default to 200 since ApiUsageLog doesn't track status codes
          timestamp: log.timestamp.toISOString(),
          ipAddress: log.ipAddress || null,
          userAgent: log.userAgent || null,
          app: {
            id: log.App.id,
            name: log.App.name,
          },
          campaign: campaignName,
        };
      })
    );

    return NextResponse.json({
      logs: logsWithCampaign,
      totalItems,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error('Error fetching API activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
