import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateApiKey, logApiUsage } from '@/lib/api-middleware';
import { triggerWebhook } from '@/lib/webhooks';
import { logger } from '@/lib/logger';

/**
 * POST /api/v1/rewards/redeem
 * Redeem (consume) a discount or coupon code.
 * Body: { code: string }
 *
 * Validates the code belongs to this app, status is APPROVED, and not expired.
 * Sets status to PAID and paidAt to now.
 */
export async function POST(request: NextRequest) {
  const authResult = await authenticateApiKey(request);

  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { app } = authResult;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const code = body.code as string | undefined;
  if (!code || typeof code !== 'string' || !code.trim()) {
    return NextResponse.json({ error: 'code is required in the request body' }, { status: 400 });
  }

  try {
    // Find by discountCode (IN_APP_DISCOUNT) or fulfillmentReference (COUPON_CODE)
    const reward = await prisma.reward.findFirst({
      where: {
        appId: app.id,
        OR: [
          { discountCode: code.trim() },
          { fulfillmentReference: code.trim(), fulfillmentType: 'COUPON_CODE' },
        ],
      },
    });

    if (!reward) {
      return NextResponse.json({ error: 'Code not found' }, { status: 404 });
    }

    if (reward.status === 'PAID') {
      return NextResponse.json(
        { error: 'This code has already been redeemed', redeemedAt: reward.paidAt },
        { status: 400 }
      );
    }

    if (reward.status === 'CANCELLED') {
      return NextResponse.json({ error: 'This reward has been cancelled' }, { status: 400 });
    }

    if (reward.status !== 'APPROVED') {
      return NextResponse.json(
        { error: `Reward cannot be redeemed; current status is ${reward.status}. It must be claimed first.` },
        { status: 400 }
      );
    }

    // Check expiry
    if (reward.expiresAt != null && reward.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'This code has expired', expiredAt: reward.expiresAt },
        { status: 400 }
      );
    }

    const now = new Date();
    const updated = await prisma.reward.update({
      where: { id: reward.id },
      data: {
        status: 'PAID',
        paidAt: now,
        payoutReference: body.orderReference ? String(body.orderReference) : undefined,
      },
      select: {
        id: true,
        userId: true,
        amount: true,
        currency: true,
        status: true,
        fulfillmentType: true,
        discountCode: true,
        fulfillmentReference: true,
        paidAt: true,
        payoutReference: true,
      },
    });

    await logApiUsage(app.id, '/api/v1/rewards/redeem', request);

    await logger.info('Reward redeemed', 'api.v1.rewards.redeem', {
      appId: app.id,
      rewardId: reward.id,
      userId: reward.userId,
      amount: reward.amount,
      code: code.trim(),
    });

    // Trigger webhook
    await triggerWebhook(app.id, 'REWARD_REDEEMED', {
      rewardId: updated.id,
      userId: updated.userId,
      amount: updated.amount,
      currency: updated.currency,
      fulfillmentType: updated.fulfillmentType,
      discountCode: updated.discountCode,
      paidAt: updated.paidAt,
      payoutReference: updated.payoutReference,
    });

    return NextResponse.json({
      success: true,
      reward: updated,
    });
  } catch (error) {
    console.error('Error redeeming reward:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
