import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateSignature } from '@/lib/webhooks';

const SAMPLE_PAYLOADS: Record<string, { event: string; data: unknown }> = {
  REFERRAL_CREATED: {
    event: 'REFERRAL_CREATED',
    data: {
      referralId: 'clxxxxxxxxxxxx',
      referralCode: 'ABC12XYZ',
      referrerId: 'user_123',
      refereeId: null,
      campaignId: 'clxxxxxxxxxxxx',
    },
  },
  REFERRAL_CLICKED: {
    event: 'REFERRAL_CLICKED',
    data: {
      referralId: 'clxxxxxxxxxxxx',
      referralCode: 'ABC12XYZ',
      clickedAt: new Date().toISOString(),
      campaignId: 'clxxxxxxxxxxxx',
    },
  },
  REFERRAL_CONVERTED: {
    event: 'REFERRAL_CONVERTED',
    data: {
      referralId: 'clxxxxxxxxxxxx',
      referralCode: 'ABC12XYZ',
      conversionId: 'clxxxxxxxxxxxx',
      rewardAmount: 10,
      convertedAt: new Date().toISOString(),
      campaignId: 'clxxxxxxxxxxxx',
    },
  },
  REWARD_CREATED: {
    event: 'REWARD_CREATED',
    data: {
      referralId: 'clxxxxxxxxxxxx',
      referrerId: 'user_123',
      rewardAmount: 10,
      campaignId: 'clxxxxxxxxxxxx',
    },
  },
  USAGE_LIMIT_EXCEEDED: {
    event: 'USAGE_LIMIT_EXCEEDED',
    data: {
      appId: 'clxxxxxxxxxxxx',
      currentUsage: 10000,
      limit: 10000,
    },
  },
};

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.partnerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { url, secret, eventType } = body;

    if (!url || typeof url !== 'string' || !secret || typeof secret !== 'string' || !eventType) {
      return NextResponse.json(
        { error: 'url, secret, and eventType are required' },
        { status: 400 }
      );
    }

    const sample = SAMPLE_PAYLOADS[eventType];
    if (!sample) {
      return NextResponse.json(
        { error: 'Invalid eventType. Use: REFERRAL_CREATED, REFERRAL_CLICKED, REFERRAL_CONVERTED, REWARD_CREATED, USAGE_LIMIT_EXCEEDED' },
        { status: 400 }
      );
    }

    const payload = {
      ...sample,
      timestamp: new Date().toISOString(),
    };
    const payloadStr = JSON.stringify(payload);
    const signature = await generateSignature(payloadStr, secret);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
      },
      body: payloadStr,
    });

    const responseText = await res.text();
    return NextResponse.json({
      success: res.ok,
      statusCode: res.status,
      response: responseText.slice(0, 500),
    });
  } catch (error) {
    console.error('Send test webhook error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send test webhook' },
      { status: 500 }
    );
  }
}
