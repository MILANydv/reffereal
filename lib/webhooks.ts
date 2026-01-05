import { prisma } from './db';
import { WebhookEventType } from '@prisma/client';
import crypto from 'crypto';

interface WebhookPayload {
  event: WebhookEventType;
  data: unknown;
  timestamp: string;
}

export async function triggerWebhook(
  appId: string,
  event: WebhookEventType,
  data: unknown
) {
  const webhooks = await prisma.webhook.findMany({
    where: {
      appId,
      isActive: true,
    },
  });

  for (const webhook of webhooks) {
    const events = JSON.parse(webhook.events) as string[];
    if (!events.includes(event)) {
      continue;
    }

    const payload: WebhookPayload = {
      event,
      data,
      timestamp: new Date().toISOString(),
    };

    await queueWebhookDelivery(webhook.id, event, payload, webhook.url, webhook.secret);
  }
}

async function queueWebhookDelivery(
  webhookId: string,
  eventType: WebhookEventType,
  payload: WebhookPayload,
  url: string,
  secret: string
) {
  const delivery = await prisma.webhookDelivery.create({
    data: {
      webhookId,
      eventType,
      payload: JSON.stringify(payload),
      retryCount: 0,
    },
  });

  await deliverWebhook(delivery.id, url, payload, secret);
}

async function deliverWebhook(
  deliveryId: string,
  url: string,
  payload: WebhookPayload,
  secret: string
) {
  const signature = generateSignature(JSON.stringify(payload), secret);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
      },
      body: JSON.stringify(payload),
    });

    await prisma.webhookDelivery.update({
      where: { id: deliveryId },
      data: {
        success: response.ok,
        statusCode: response.status,
        response: await response.text(),
      },
    });

    return response.ok;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    await prisma.webhookDelivery.update({
      where: { id: deliveryId },
      data: {
        success: false,
        response: errorMessage,
        retryCount: { increment: 1 },
        nextRetryAt: calculateNextRetry(1),
      },
    });

    return false;
  }
}

export function generateSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

export function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = generateSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

function calculateNextRetry(retryCount: number): Date {
  const delays = [60, 300, 900, 3600, 7200];
  const delaySeconds = delays[Math.min(retryCount, delays.length - 1)];
  return new Date(Date.now() + delaySeconds * 1000);
}

export async function retryFailedWebhooks() {
  const failedDeliveries = await prisma.webhookDelivery.findMany({
    where: {
      success: false,
      retryCount: { lt: 5 },
      nextRetryAt: { lte: new Date() },
    },
    include: {
      webhook: true,
    },
  });

  for (const delivery of failedDeliveries) {
    const payload = JSON.parse(delivery.payload) as WebhookPayload;
    await deliverWebhook(
      delivery.id,
      delivery.webhook.url,
      payload,
      delivery.webhook.secret
    );
  }
}
