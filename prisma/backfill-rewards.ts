/**
 * One-time backfill: create Reward rows for existing CONVERTED referrals.
 * Run after applying the add_reward_model migration: npx tsx prisma/backfill-rewards.ts
 */
import 'dotenv/config';
import { prisma } from '../lib/db';

async function main() {
  const converted = await prisma.referral.findMany({
    where: { status: 'CONVERTED' },
    include: {
      Campaign: { select: { appId: true } },
      Conversion: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  let created = 0;
  let skipped = 0;

  for (const ref of converted) {
    const conversion = ref.Conversion?.[0];
    const existing = conversion
      ? await prisma.reward.findUnique({ where: { conversionId: conversion.id } })
      : await prisma.reward.findFirst({ where: { referralId: ref.id } });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.reward.create({
      data: {
        referralId: ref.id,
        conversionId: conversion?.id ?? null,
        appId: ref.Campaign.appId,
        userId: ref.referrerId,
        amount: ref.rewardAmount ?? 0,
        currency: 'USD',
        status: 'PAID',
        level: ref.level ?? 1,
        paidAt: ref.convertedAt ?? new Date(),
        createdAt: ref.convertedAt ?? ref.createdAt,
        updatedAt: new Date(),
      },
    });
    created++;
  }

  console.log(`Backfill complete: ${created} rewards created, ${skipped} skipped (already existed).`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
