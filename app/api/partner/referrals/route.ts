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
    const campaignId = searchParams.get('campaignId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const statusFilter = searchParams.get('status');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const partnerId = session.user.partnerId;

    // Build where clause for code generation records (original referrals)
    const whereClause: any = {
      Campaign: {
        App: {
          partnerId,
          ...(appId ? { id: appId } : {}),
        },
      },
      isConversionReferral: false, // Only show code generation records
    };

    if (campaignId) {
      whereClause.Campaign.id = campaignId;
    }

    if (statusFilter && statusFilter !== 'all') {
      // For status filter, we need to check if there are any conversions with that status
      // But we still show the original code generation record
      // The status filter will be applied to conversion referrals
    }

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.createdAt.lte = new Date(endDate);
      }
    }

    if (search) {
      whereClause.OR = [
        { referralCode: { contains: search, mode: 'insensitive' } },
        { referrerId: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count of code generation records
    const totalItems = await prisma.referral.count({ where: whereClause });
    const totalPages = Math.ceil(totalItems / limit);

    const codeGenerationRecords = await prisma.referral.findMany({
      where: whereClause,
      include: {
        Campaign: {
          include: {
            App: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Enrich each record with clicks, conversions, and converted users
    const referrals = await Promise.all(
      codeGenerationRecords.map(async (ref) => {
        // Count clicks for this code
        const clicksCount = await prisma.click.count({
          where: { referralCode: ref.referralCode },
        });

        // Get conversion referrals for this code
        const conversionWhere: any = {
          originalReferralCode: ref.referralCode,
          isConversionReferral: true,
        };
        
        if (statusFilter && statusFilter !== 'all') {
          conversionWhere.status = statusFilter;
        }

        const conversionsCount = await prisma.referral.count({
          where: conversionWhere,
        });

        // Get list of who converted
        const conversionRecords = await prisma.referral.findMany({
          where: {
            originalReferralCode: ref.referralCode,
            isConversionReferral: true,
            status: 'CONVERTED',
          },
          select: {
            id: true,
            refereeId: true,
            convertedAt: true,
            rewardAmount: true,
            isFlagged: true,
            status: true,
          },
          orderBy: { convertedAt: 'desc' },
        });

        // Sum total rewards from all conversions
        const totalRewardAmount = conversionRecords.reduce((sum, conv) => sum + (conv.rewardAmount || 0), 0);

        // Determine overall status: if any conversion is flagged, show FLAGGED; if any converted, show CONVERTED; else PENDING
        let overallStatus = 'PENDING';
        if (conversionRecords.some(c => c.isFlagged)) {
          overallStatus = 'FLAGGED';
        } else if (conversionsCount > 0) {
          overallStatus = 'CONVERTED';
        } else if (clicksCount > 0) {
          overallStatus = 'CLICKED';
        }

        return {
          ...ref,
          clicks: clicksCount,
          conversions: conversionsCount,
          convertedUsers: conversionRecords.map(conv => ({
            id: conv.id,
            refereeId: conv.refereeId,
            convertedAt: conv.convertedAt,
            rewardAmount: conv.rewardAmount || 0,
            isFlagged: conv.isFlagged,
            status: conv.status,
          })),
          totalRewardAmount,
          status: overallStatus, // Override status with calculated overall status
        };
      })
    );

    return NextResponse.json({
      referrals,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

