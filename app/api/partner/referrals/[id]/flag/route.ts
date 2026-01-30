import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.partnerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify referral belongs to partner's app
    const referral = await prisma.referral.findFirst({
      where: { id },
      include: {
        campaign: {
          include: {
            app: {
              select: {
                partnerId: true,
              },
            },
          },
        },
      },
    });

    if (!referral) {
      return NextResponse.json({ error: 'Referral not found' }, { status: 404 });
    }

    if (referral.campaign.app.partnerId !== session.user.partnerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Mark referral as flagged/suspicious
    await prisma.referral.update({
      where: { id },
      data: {
        isFlagged: true,
        status: 'FLAGGED',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking referral as suspicious:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
