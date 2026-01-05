import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.partnerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const partnerId = session.user.partnerId;

    const members = await prisma.teamMember.findMany({
      where: { partnerId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error('Team members error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.partnerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, name, role } = await request.json();
    const partnerId = session.user.partnerId;

    const inviteToken = crypto.randomBytes(32).toString('hex');

    const member = await prisma.teamMember.create({
      data: {
        partnerId,
        email,
        name,
        role,
        inviteToken,
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error('Team member creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
