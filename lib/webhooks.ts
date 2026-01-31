import { prisma } from './db';
import { WebhookEventType } from '@prisma/client';

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
  const signature = await generateSignature(JSON.stringify(payload), secret);

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

export async function generateSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const data = encoder.encode(payload);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, data);

  // Convert ArrayBuffer to hex string
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifySignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const expectedSignature = await generateSignature(payload, secret);

  // Timing-safe comparison using Web Crypto is subtle.
  // One way is to sign and then use crypto.subtle.verify or just compare manually.
  // A simple manual timing-safe comparison:
  if (signature.length !== expectedSignature.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }
  return result === 0;
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
      Webhook: true,
    },
  });

  for (const delivery of failedDeliveries) {
    const payload = JSON.parse(delivery.payload) as WebhookPayload;
    await deliverWebhook(
      delivery.id,
      delivery.Webhook.url,
      payload,
      delivery.Webhook.secret
    );
  }
}
