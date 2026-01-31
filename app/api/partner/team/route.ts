import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

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

    // Generate a secure random 32-byte token using Web Crypto
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const inviteToken = Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const member = await prisma.teamMember.create({
      data: {
        Partner: { connect: { id: partnerId } },
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
