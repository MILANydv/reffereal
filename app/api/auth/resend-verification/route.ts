import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Don't reveal if user exists or not (security best practice)
    if (user && !user.emailVerified) {
      // Generate new verification token
      const emailVerifyToken = randomBytes(32).toString('hex');
      const emailVerifyExpiry = new Date();
      emailVerifyExpiry.setHours(emailVerifyExpiry.getHours() + 24); // 24 hours

      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerifyToken,
          emailVerifyExpiry,
        },
      });

      await sendVerificationEmail(user.email, emailVerifyToken, user.name || undefined);
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      message: 'If an account with that email exists and is unverified, a verification link has been sent.',
    });
  } catch (error) {
    console.error('Error resending verification email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
