import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { sendSignupEmail, sendVerificationEmail } from '@/lib/email';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, companyName } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate email verification token
    const emailVerifyToken = randomBytes(32).toString('hex');
    const emailVerifyExpiry = new Date();
    emailVerifyExpiry.setHours(emailVerifyExpiry.getHours() + 24); // 24 hours

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'PARTNER',
        emailVerifyToken,
        emailVerifyExpiry,
        Partner: {
          create: {
            companyName,
          },
        },
      },
      include: {
        Partner: true,
      },
    });

    // Verify token was saved
    console.log('[Signup] User created:', user.email);
    console.log('[Signup] Token saved:', user.emailVerifyToken ? user.emailVerifyToken.substring(0, 20) + '...' : 'NULL');
    console.log('[Signup] Token expiry:', user.emailVerifyExpiry);

    // Send signup and verification emails
    await Promise.all([
      sendSignupEmail(email, name),
      sendVerificationEmail(email, emailVerifyToken, name),
    ]);

    return NextResponse.json(
      {
        message: 'User created successfully. Please check your email to verify your account.',
        userId: user.id,
        partnerId: user.Partner[0].id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
