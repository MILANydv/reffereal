import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { resolveFraudFlag } from '@/lib/fraud-detection';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ flagId: string }> }
) {
  try {
    const session = await auth();
    const { flagId } = await params;

    if (!session?.user?.partnerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const partnerId = session.user.partnerId;

    const flag = await prisma.fraudFlag.findFirst({
      where: {
        id: flagId,
        App: { partnerId },
      },
    });

    if (!flag) {
      return NextResponse.json({ error: 'Flag not found' }, { status: 404 });
    }

    const resolved = await resolveFraudFlag(flagId, session.user.id);

    return NextResponse.json(resolved);
  } catch (error) {
    console.error('Fraud flag resolution error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
