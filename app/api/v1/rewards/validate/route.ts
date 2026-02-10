import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateApiKey, logApiUsage } from '@/lib/api-middleware';

/**
 * GET /api/v1/rewards/validate?code=ABC123
 * Validate a discount/coupon code without consuming it.
 * Returns validity, reward amount, currency, userId, and redemption state.
 */
export async function GET(request: NextRequest) {
  const authResult = await authenticateApiKey(request);

  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { app } = authResult;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code || !code.trim()) {
    return NextResponse.json({ error: 'code query parameter is required' }, { status: 400 });
  }

  try {
    // Search by discountCode (IN_APP_DISCOUNT) or fulfillmentReference (COUPON_CODE)
    const reward = await prisma.reward.findFirst({
      where: {
        appId: app.id,
        OR: [
          { discountCode: code.trim() },
          { fulfillmentReference: code.trim(), fulfillmentType: 'COUPON_CODE' },
        ],
      },
      select: {
        id: true,
        userId: true,
        amount: true,
        currency: true,
        status: true,
        fulfillmentType: true,
        discountCode: true,
        expiresAt: true,
        claimedAt: true,
        paidAt: true,
      },
    });

    if (!reward) {
      return NextResponse.json({
        valid: false,
        error: 'Code not found',
      });
    }

    const now = new Date();
    const isExpired = reward.expiresAt != null && reward.expiresAt < now;
    const isRedeemed = reward.status === 'PAID';
    const isCancelled = reward.status === 'CANCELLED';
    const isValid = reward.status === 'APPROVED' && !isExpired;

    await logApiUsage(app.id, '/api/v1/rewards/validate', request);

    return NextResponse.json({
      valid: isValid,
      rewardId: reward.id,
      userId: reward.userId,
      amount: reward.amount,
      currency: reward.currency,
      fulfillmentType: reward.fulfillmentType,
      status: reward.status,
      isExpired,
      isRedeemed,
      isCancelled,
      expiresAt: reward.expiresAt,
    });
  } catch (error) {
    console.error('Error validating code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
