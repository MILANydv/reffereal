import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const partner = await prisma.partner.findFirst({
      where: { userId: session.user.id },
      select: {
        id: true,
        userId: true,
        companyName: true,
        userType: true,
        onboardingCompleted: true,
        onboardingStep: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    return NextResponse.json({
      onboardingCompleted: partner.onboardingCompleted,
      step: partner.onboardingStep,
      data: {
        userType: partner.userType,
        companyName: partner.companyName,
      },
    });
  } catch (error) {
    console.error('Error loading onboarding status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}