import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sendCustomEmail } from '@/lib/email';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, subject, content, userId, partnerId } = body;

    if (!email || !subject || !content) {
      return NextResponse.json(
        { error: 'Email, subject, and content are required' },
        { status: 400 }
      );
    }

    // If userId or partnerId is provided, get user details
    let user = null;
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
      });
    } else if (partnerId) {
      const partner = await prisma.partner.findUnique({
        where: { id: partnerId },
        include: { User: true },
      });
      user = partner?.User || null;
    }

    const recipientEmail = user?.email || email;
    const recipientName = user?.name || undefined;

    await sendCustomEmail(recipientEmail, subject, content, recipientName);

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('Error sending custom email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
