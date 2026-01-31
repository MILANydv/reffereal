import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: userId, role } = session.user;

        // Early return for Super Admin
        if (role === 'SUPER_ADMIN') {
            return NextResponse.json({
                onboardingCompleted: true,
                step: 4,
                data: {}
            });
        }

        let partner = await prisma.partner.findFirst({
            where: { userId },
            select: {
                id: true,
                companyName: true,
                userType: true,
                onboardingCompleted: true,
                onboardingStep: true,
            },
        });

        // If partner record is missing, create it (safe fallback)
        if (!partner) {
            partner = await prisma.partner.create({
                data: {
                    User: { connect: { id: userId } },
                    onboardingCompleted: false,
                    onboardingStep: 1,
                },
                select: {
                    id: true,
                    companyName: true,
                    userType: true,
                    onboardingCompleted: true,
                    onboardingStep: true,
                },
            });
        }

        return NextResponse.json({
            onboardingCompleted: partner.onboardingCompleted,
            step: partner.onboardingStep,
            data: {
                userType: partner.userType,
                companyName: partner.companyName || '',
            },
        });
    } catch (error) {
        console.error('Error loading onboarding status:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
