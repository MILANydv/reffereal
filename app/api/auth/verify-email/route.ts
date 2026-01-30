import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        emailVerifyToken: token,
        emailVerifyExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.redirect(new URL('/login?error=invalid_or_expired_token', request.url));
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpiry: null,
      },
    });

    return NextResponse.redirect(new URL('/login?verified=success', request.url));
  } catch (error) {
    console.error('Error verifying email:', error);
    return NextResponse.redirect(new URL('/login?error=verification_failed', request.url));
  }
}
