import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';
import { logger } from '@/lib/logger';
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
    if (user) {
      const resetToken = randomBytes(32).toString('hex');
      const resetExpiry = new Date();
      resetExpiry.setHours(resetExpiry.getHours() + 1); // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: resetToken,
          passwordResetExpiry: resetExpiry,
        },
      });

      await logger.info(
        'Password reset requested',
        'auth-api',
        { userId: user.id, email: user.email }
      );

      const emailSent = await sendPasswordResetEmail(user.email, resetToken, user.name || undefined);
      
      if (!emailSent) {
        await logger.error(
          'Failed to send password reset email',
          'auth-api',
          { userId: user.id, email: user.email }
        );
      }
    } else {
      await logger.warn(
        'Password reset requested for non-existent email',
        'auth-api',
        { email }
      );
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Error processing password reset:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
