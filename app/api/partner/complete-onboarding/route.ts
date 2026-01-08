import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { generateApiKey } from '@/lib/api-key';

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userType, companyName, appName, appDescription } = await request.json();

        // Find the partner
        let partner = await prisma.partner.findFirst({
            where: { userId: session.user.id },
            select: { id: true },
        });

        if (!partner) {
            // Fallback: Create partner if doesn't exist
            partner = await prisma.partner.create({
                data: {
                    userId: session.user.id,
                }
            });
        }

        // Update partner with onboarding data
        await prisma.partner.update({
            where: { id: partner.id },
            data: {
                userType,
                companyName,
                onboardingCompleted: true,
                onboardingStep: 4,
            },
        });

        // Create first app if provided
        if (appName) {
            const apiKey = generateApiKey();

            await prisma.app.create({
                data: {
                    name: appName,
                    apiKey,
                    partnerId: partner.id,
                    monthlyLimit: 10000,
                    currentUsage: 0,
                    status: 'ACTIVE',
                    isSandbox: false,
                },
            });
        }

        // Log system activity
        await prisma.systemLog.create({
            data: {
                level: 'INFO',
                message: `Partner onboarding completed: ${companyName} (${userType})`,
                source: 'onboarding',
                metadata: JSON.stringify({
                    partnerId: partner.id,
                    userType,
                    companyName,
                    hasApp: !!appName,
                }),
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error completing onboarding:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
