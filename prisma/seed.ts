import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import bcrypt from 'bcryptjs';

const adapter = new PrismaLibSql({
  url: 'file:./prisma/dev.db',
});

const prisma = new PrismaClient({
  adapter: adapter,
});

async function main() {
  // Create pricing plans
  const freePlan = await prisma.pricingPlan.upsert({
    where: { type: 'FREE' },
    update: {},
    create: {
      name: 'Free',
      type: 'FREE',
      monthlyPrice: 0,
      yearlyPrice: 0,
      apiLimit: 10000,
      maxApps: 1,
      overagePrice: 0,
      features: JSON.stringify([
        'Up to 10,000 API calls/month',
        '1 app',
        'Basic analytics',
        'Email support',
      ]),
      isActive: true,
    },
  });

  await prisma.pricingPlan.upsert({
    where: { type: 'GROWTH' },
    update: {},
    create: {
      name: 'Growth',
      type: 'GROWTH',
      monthlyPrice: 49,
      yearlyPrice: 470,
      apiLimit: 100000,
      maxApps: 5,
      overagePrice: 0.5,
      features: JSON.stringify([
        'Up to 100,000 API calls/month',
        '5 apps',
        'Advanced analytics',
        'Webhooks',
        'Team collaboration (3 members)',
        'Priority support',
      ]),
      isActive: true,
    },
  });

  await prisma.pricingPlan.upsert({
    where: { type: 'PRO' },
    update: {},
    create: {
      name: 'Pro',
      type: 'PRO',
      monthlyPrice: 199,
      yearlyPrice: 1910,
      apiLimit: 500000,
      maxApps: 20,
      overagePrice: 0.4,
      features: JSON.stringify([
        'Up to 500,000 API calls/month',
        '20 apps',
        'Full analytics suite',
        'Webhooks',
        'Team collaboration (unlimited)',
        'Multi-level referrals',
        'Fraud detection',
        'Custom integration support',
        '24/7 support',
      ]),
      isActive: true,
    },
  });

  await prisma.pricingPlan.upsert({
    where: { type: 'ENTERPRISE' },
    update: {},
    create: {
      name: 'Enterprise',
      type: 'ENTERPRISE',
      monthlyPrice: 999,
      yearlyPrice: 9590,
      apiLimit: 5000000,
      maxApps: 100,
      overagePrice: 0.3,
      features: JSON.stringify([
        'Up to 5,000,000 API calls/month',
        '100 apps',
        'Enterprise analytics',
        'Webhooks',
        'Unlimited team members',
        'Multi-level referrals',
        'Advanced fraud detection',
        'Dedicated account manager',
        'SLA guarantee',
        'Custom contracts',
      ]),
      isActive: true,
    },
  });

  console.log('Pricing plans created');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      active: true,
    },
  });

  console.log('Super Admin created:', superAdmin.email);

  const partnerPassword = await bcrypt.hash('partner123', 10);

  const partnerUser = await prisma.user.upsert({
    where: { email: 'partner@example.com' },
    update: {},
    create: {
      email: 'partner@example.com',
      password: partnerPassword,
      name: 'Test Partner',
      role: 'PARTNER',
      active: true,
      partners: {
        create: {
          companyName: 'Test Company',
        },
      },
    },
  });

  console.log('Test Partner created:', partnerUser.email);

  // Create free subscription for test partner
  const testPartner = await prisma.partner.findFirst({
    where: { userId: partnerUser.id },
  });

  if (testPartner) {
    await prisma.subscription.upsert({
      where: { partnerId: testPartner.id },
      update: {},
      create: {
        partnerId: testPartner.id,
        planId: freePlan.id,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    console.log('Free subscription created for test partner');
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
