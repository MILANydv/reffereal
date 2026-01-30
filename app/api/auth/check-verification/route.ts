import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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
      select: {
        id: true,
        email: true,
        emailVerified: true,
        role: true,
      },
    });

    // Only check for PARTNER role
    if (user && user.role === 'PARTNER' && !user.emailVerified) {
      return NextResponse.json({
        emailNotVerified: true,
      });
    }

    return NextResponse.json({
      emailNotVerified: false,
    });
  } catch (error) {
    console.error('Error checking email verification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
