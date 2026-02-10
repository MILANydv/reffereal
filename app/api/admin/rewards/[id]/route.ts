import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['APPROVED', 'PAID', 'CANCELLED'],
  APPROVED: ['PAID', 'CANCELLED'],
  PAID: [],
  CANCELLED: [],
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (session?.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const reward = await prisma.reward.findUnique({
      where: { id },
    });

    if (!reward) {
      return NextResponse.json({ error: 'Reward not found' }, { status: 404 });
    }

    const body = await request.json();
    const { status, payoutReference, fulfillmentType, fulfillmentReference } = body;

    const allowed = ALLOWED_TRANSITIONS[reward.status];
    if (status != null && !allowed?.includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition from ${reward.status} to ${status}` },
        { status: 400 }
      );
    }

    const data: {
      status?: 'PENDING' | 'APPROVED' | 'PAID' | 'CANCELLED';
      paidAt?: Date | null;
      payoutReference?: string | null;
      fulfillmentType?: 'CASH' | 'STORE_CREDIT' | 'IN_APP_DISCOUNT' | 'COUPON_CODE' | 'POINTS' | 'OTHER' | null;
      fulfillmentReference?: string | null;
    } = {};

    if (status !== undefined) {
      data.status = status as 'PENDING' | 'APPROVED' | 'PAID' | 'CANCELLED';
      if (status === 'PAID') {
        data.paidAt = new Date();
      }
    }
    if (payoutReference !== undefined) data.payoutReference = payoutReference ?? null;
    if (fulfillmentType !== undefined) data.fulfillmentType = fulfillmentType ?? null;
    if (fulfillmentReference !== undefined) data.fulfillmentReference = fulfillmentReference ?? null;

    const updated = await prisma.reward.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating reward:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
