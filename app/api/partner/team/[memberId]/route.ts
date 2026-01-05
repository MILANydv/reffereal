import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const session = await auth();
    const { memberId } = await params;

    if (!session?.user?.partnerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const partnerId = session.user.partnerId;

    const member = await prisma.teamMember.findFirst({
      where: {
        id: memberId,
        partnerId,
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    await prisma.teamMember.delete({
      where: { id: memberId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Team member deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
