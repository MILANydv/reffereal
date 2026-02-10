import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateApiKey, logApiUsage } from '@/lib/api-middleware';
import { triggerWebhook } from '@/lib/webhooks';
import { logger } from '@/lib/logger';
import crypto from 'crypto';

/**
 * Generate a unique 8-character alphanumeric discount code.
 */
function generateDiscountCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No 0/O/1/I to avoid ambiguity
  const bytes = crypto.randomBytes(8);
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

/**
 * POST /api/v1/rewards/[rewardId]/claim
 * Claim a PENDING reward. Behavior depends on fulfillmentType:
 *
 * - IN_APP_DISCOUNT: auto-generates a unique discountCode
 * - COUPON_CODE: requires `couponCode` in body (partner provides their external code)
 * - STORE_CREDIT / POINTS / CASH / OTHER: marks as APPROVED; partner handles externally
 *
 * Sets status to APPROVED and claimedAt to now.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ rewardId: string }> }
) {
  const authResult = await authenticateApiKey(request);

  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { app } = authResult;
  const { rewardId } = await params;

  try {
    const reward = await prisma.reward.findFirst({
      where: { id: rewardId, appId: app.id },
      include: {
        Referral: {
          select: {
            campaignId: true,
            Campaign: { select: { payoutType: true, rewardExpiration: true } },
          },
        },
      },
    });

    if (!reward) {
      return NextResponse.json({ error: 'Reward not found' }, { status: 404 });
    }

    if (reward.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Reward cannot be claimed; current status is ${reward.status}` },
        { status: 400 }
      );
    }

    // Determine fulfillment type: use reward's own, or fallback to campaign's payoutType
    const fulfillmentType = reward.fulfillmentType ?? reward.Referral?.Campaign?.payoutType ?? null;

    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      // body is optional for most types
    }

    const updateData: Record<string, unknown> = {
      status: 'APPROVED',
      claimedAt: new Date(),
      fulfillmentType: fulfillmentType ?? undefined,
    };

    // Calculate expiry from campaign's rewardExpiration (days)
    const rewardExpirationDays = reward.Referral?.Campaign?.rewardExpiration;
    if (rewardExpirationDays != null && rewardExpirationDays > 0) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + rewardExpirationDays);
      updateData.expiresAt = expiresAt;
    }

    if (fulfillmentType === 'IN_APP_DISCOUNT') {
      // Auto-generate unique discount code
      let discountCode: string | null = null;
      let attempts = 0;
      while (attempts < 10) {
        const candidate = generateDiscountCode();
        const exists = await prisma.reward.findUnique({ where: { discountCode: candidate } });
        if (!exists) {
          discountCode = candidate;
          break;
        }
        attempts++;
      }
      if (!discountCode) {
        return NextResponse.json(
          { error: 'Failed to generate unique discount code. Please retry.' },
          { status: 500 }
        );
      }
      updateData.discountCode = discountCode;
    } else if (fulfillmentType === 'COUPON_CODE') {
      // Partner provides their external coupon code
      const couponCode = body.couponCode as string | undefined;
      if (!couponCode || typeof couponCode !== 'string' || !couponCode.trim()) {
        return NextResponse.json(
          { error: 'couponCode is required in the request body for COUPON_CODE fulfillment' },
          { status: 400 }
        );
      }
      updateData.fulfillmentReference = couponCode.trim();
    } else if (fulfillmentType === 'STORE_CREDIT' || fulfillmentType === 'POINTS') {
      // Partner credits externally; optionally pass a reference
      if (body.reference) {
        updateData.fulfillmentReference = String(body.reference);
      }
    } else if (fulfillmentType === 'CASH') {
      // Partner handles external payment; optionally pass payout reference
      if (body.payoutReference) {
        updateData.payoutReference = String(body.payoutReference);
      }
    }

    const updated = await prisma.reward.update({
      where: { id: rewardId },
      data: updateData as any,
      select: {
        id: true,
        userId: true,
        amount: true,
        currency: true,
        status: true,
        fulfillmentType: true,
        fulfillmentReference: true,
        discountCode: true,
        expiresAt: true,
        claimedAt: true,
        createdAt: true,
      },
    });

    await logApiUsage(app.id, `/api/v1/rewards/${rewardId}/claim`, request);

    await logger.info('Reward claimed', 'api.v1.rewards.claim', {
      appId: app.id,
      rewardId,
      userId: reward.userId,
      fulfillmentType,
      discountCode: updated.discountCode,
    });

    // Trigger webhook
    await triggerWebhook(app.id, 'REWARD_CLAIMED', {
      rewardId: updated.id,
      userId: updated.userId,
      amount: updated.amount,
      currency: updated.currency,
      fulfillmentType: updated.fulfillmentType,
      discountCode: updated.discountCode,
      claimedAt: updated.claimedAt,
    });

    return NextResponse.json({
      success: true,
      reward: updated,
    });
  } catch (error) {
    console.error('Error claiming reward:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
