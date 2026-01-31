import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { notifyTeamInviteAccepted } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Invite token is required' },
        { status: 400 }
      );
    }

    const teamMember = await prisma.teamMember.findUnique({
      where: { inviteToken: token },
      include: {
        Partner: {
          include: {
            User: true,
          },
        },
      },
    });

    if (!teamMember) {
      return NextResponse.json(
        { error: 'Invalid invite token' },
        { status: 404 }
      );
    }

    if (teamMember.inviteAcceptedAt) {
      return NextResponse.json(
        { error: 'Invite has already been accepted' },
        { status: 400 }
      );
    }

    const updatedMember = await prisma.teamMember.update({
      where: { id: teamMember.id },
      data: {
        inviteAcceptedAt: new Date(),
        inviteToken: null,
      },
    });

    // Notify the partner who sent the invite
    if (teamMember.Partner?.User) {
      await notifyTeamInviteAccepted(teamMember.Partner.User.id, {
        name: teamMember.name || undefined,
        email: teamMember.email,
        role: teamMember.role,
      });
    }

    return NextResponse.json({
      message: 'Invite accepted successfully',
      member: updatedMember,
    });
  } catch (error) {
    console.error('Error accepting team invite:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
