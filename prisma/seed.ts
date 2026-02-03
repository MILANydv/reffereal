import 'dotenv/config';
import { prisma } from '../lib/db';
import bcrypt from 'bcryptjs';

async function main() {
  // Create pricing plans
  const freePlan = await prisma.pricingPlan.upsert({
    where: { type: 'FREE' },
    update: {},
    create: {
      id: 'free-plan',
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
      id: 'growth-plan',
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
      id: 'pro-plan',
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
      id: 'enterprise-plan',
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
      Partner: {
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
        Partner: { connect: { id: testPartner.id } },
        PricingPlan: { connect: { id: freePlan.id } },
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    console.log('Free subscription created for test partner');
  }

  // Create Blogs
  const blog1 = await (prisma as any).blog.upsert({
    where: { slug: 'scaling-referral-infrastructure-2024' },
    update: {},
    create: {
      title: 'Scaling Referral Infrastructure in 2024',
      slug: 'scaling-referral-infrastructure-2024',
      author: 'Milan Ydv',
      content: 'Detailed technical guide on scaling referral systems to handle millions of requests...',
      category: 'Engineering',
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });

  const blog2 = await (prisma as any).blog.upsert({
    where: { slug: 'preventing-sybil-attacks-mlm' },
    update: {},
    create: {
      title: 'Preventing Sybil Attacks in Multi-Level Marketing',
      slug: 'preventing-sybil-attacks-mlm',
      author: 'Milan Ydv',
      content: 'Exploring advanced detection mechanisms for multi-account fraud in MLM networks...',
      category: 'Security',
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });

  const blog3 = await (prisma as any).blog.upsert({
    where: { slug: 'new-sdk-support-go-ruby' },
    update: {},
    create: {
      title: 'New SDK Support for Go and Ruby',
      slug: 'new-sdk-support-go-ruby',
      author: 'Engineering Team',
      content: 'Announcing official support for Go and Ruby on Incenta SDK...',
      category: 'Product',
      status: 'DRAFT',
    },
  });

  console.log('Blogs created');

  // Create Changelogs
  await (prisma as any).changelog.upsert({
    where: { id: 'cl-1' },
    update: {},
    create: {
      id: 'cl-1',
      version: 'v2.1.0',
      type: 'MAJOR',
      title: 'Advanced Anti-Fraud Engine',
      content: '### Key Changes \n- New IP fingerprinting \n- Velocity-based rate limiting',
      status: 'PUBLISHED',
      releaseDate: new Date('2024-02-01'),
    },
  });

  await (prisma as any).changelog.upsert({
    where: { id: 'cl-2' },
    update: {},
    create: {
      id: 'cl-2',
      version: 'v2.0.4',
      type: 'MINOR',
      title: 'Developer Experience Patch',
      content: '### Key Changes \n- Faster integration with updated documentation',
      status: 'PUBLISHED',
      releaseDate: new Date('2024-01-15'),
    },
  });

  await (prisma as any).changelog.upsert({
    where: { id: 'cl-3' },
    update: {},
    create: {
      id: 'cl-3',
      version: 'v2.1.1',
      type: 'PATCH',
      title: 'Webhook Latency Optimization',
      content: '### Key Changes \n- Reduced webhook delay by 200ms',
      status: 'DRAFT',
      releaseDate: new Date('2024-02-05'),
    },
  });

  console.log('Changelogs created');
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
