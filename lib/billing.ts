import { prisma } from './db';
import { createStripeInvoice } from './stripe';
import { sendBillingInvoiceEmail } from './email';

export async function calculateMonthlyUsage(partnerId: string) {
  const partner = await prisma.partner.findUnique({
    where: { id: partnerId },
    include: {
      subscription: {
        include: { plan: true },
      },
      apps: {
        include: {
          apiUsageLogs: {
            where: {
              timestamp: {
                gte: new Date(new Date().setDate(1)),
              },
            },
          },
        },
      },
    },
  });

  if (!partner || !partner.subscription) {
    throw new Error('Partner or subscription not found');
  }

  const totalApiCalls = partner.apps?.reduce(
    (sum, app) => sum + (app.apiUsageLogs?.length || 0),
    0
  ) || 0;

  const plan = partner.subscription.plan;
  const overage = Math.max(0, totalApiCalls - plan.apiLimit);
  const overageCost = (overage / 1000) * plan.overagePrice;

  return {
    totalApiCalls,
    allowedApiCalls: plan.apiLimit,
    overage,
    overageCost,
    basePrice: plan.monthlyPrice,
    totalCost: plan.monthlyPrice + overageCost,
  };
}

export async function generateMonthlyInvoices() {
  const partners = await prisma.partner.findMany({
    include: {
      subscription: {
        where: {
          status: 'ACTIVE',
          currentPeriodEnd: {
            lte: new Date(),
          },
        },
        include: { plan: true },
      },
    },
  });

  for (const partner of partners) {
    if (!partner.subscription) continue;

    try {
      const usage = await calculateMonthlyUsage(partner.id);

      const invoice = await prisma.invoice.create({
        data: {
          partnerId: partner.id,
          amount: usage.totalCost,
          currency: 'USD',
          status: 'pending',
          billingPeriodStart: partner.subscription.currentPeriodStart,
          billingPeriodEnd: partner.subscription.currentPeriodEnd,
          apiUsage: usage.totalApiCalls,
          overageAmount: usage.overageCost,
        },
      });

      if (partner.subscription.stripeCustomerId && usage.overageCost > 0) {
        const stripeInvoice = await createStripeInvoice(
          partner.subscription.stripeCustomerId,
          usage.overageCost,
          `API Overage - ${usage.overage.toLocaleString()} calls`
        );

        await prisma.invoice.update({
          where: { id: invoice.id },
          data: { stripeInvoiceId: stripeInvoice.id },
        });
      }

      await prisma.subscription.update({
        where: { id: partner.subscription.id },
        data: {
          currentPeriodStart: partner.subscription.currentPeriodEnd,
          currentPeriodEnd: new Date(
            partner.subscription.currentPeriodEnd.getTime() + 30 * 24 * 60 * 60 * 1000
          ),
        },
      });

      // Send billing email to partner
      try {
        const user = await prisma.user.findUnique({
          where: { id: partner.userId },
        });
        
        if (user) {
          await sendBillingInvoiceEmail(user.email, {
            id: invoice.id,
            amount: invoice.amount,
            currency: invoice.currency,
            billingPeriodStart: invoice.billingPeriodStart,
            billingPeriodEnd: invoice.billingPeriodEnd,
            apiUsage: invoice.apiUsage,
          }, user.name || undefined);
        }
      } catch (error) {
        console.error(`Failed to send billing email for partner ${partner.id}:`, error);
      }

      console.log(`Invoice generated for partner ${partner.id}: $${usage.totalCost}`);
    } catch (error) {
      console.error(`Failed to generate invoice for partner ${partner.id}:`, error);
    }
  }
}

export async function enforceUsageLimits(appId: string) {
  const app = await prisma.app.findUnique({
    where: { id: appId },
    include: {
      partner: {
        include: {
          subscription: {
            include: { plan: true },
          },
        },
      },
    },
  });

  if (!app || !app.partner.subscription) {
    return { allowed: false, reason: 'No subscription found' };
  }

  const plan = app.partner.subscription.plan;
  const currentPeriodStart = app.partner.subscription.currentPeriodStart;

  const usageCount = await prisma.apiUsageLog.count({
    where: {
      appId,
      timestamp: { gte: currentPeriodStart },
    },
  });

  const hardLimit = plan.apiLimit * 1.2;

  if (usageCount >= hardLimit) {
    await prisma.app.update({
      where: { id: appId },
      data: { status: 'SUSPENDED' },
    });
    return { allowed: false, reason: 'Hard limit exceeded - app suspended' };
  }

  if (usageCount >= plan.apiLimit) {
    return { allowed: true, reason: 'Overage - will be billed' };
  }

  return { allowed: true, reason: 'Within limits' };
}

export async function canCreateApp(partnerId: string): Promise<boolean> {
  const partner = await prisma.partner.findUnique({
    where: { id: partnerId },
    include: {
      subscription: { include: { plan: true } },
      apps: true,
    },
  });

  if (!partner || !partner.subscription) {
    return false;
  }

  return partner.apps.length < partner.subscription.plan.maxApps;
}
