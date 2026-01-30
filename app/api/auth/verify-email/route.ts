import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  let token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
  }

  // Decode the token in case it was URL-encoded
  try {
    token = decodeURIComponent(token);
  } catch (e) {
    // If decoding fails, use the original token
    console.warn('Failed to decode token, using original:', e);
  }

  try {
    // Debug: Log the token we're searching for
    console.log('[Verify Email] Searching for token:', token.substring(0, 20) + '...');
    console.log('[Verify Email] Token length:', token.length);

    // First, try to find user with the exact token (case-sensitive)
    let user = await prisma.user.findFirst({
      where: {
        emailVerifyToken: token,
        emailVerifyExpiry: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        emailVerifyToken: true,
        emailVerifyExpiry: true,
      },
    });

    console.log('[Verify Email] User found with valid token:', user ? user.email : 'none');

    // If not found, check if token might be expired or already used
    if (!user) {
      // Check if token exists but is expired
      const expiredUser = await prisma.user.findFirst({
        where: {
          emailVerifyToken: token,
        },
        select: {
          id: true,
          email: true,
          emailVerifyExpiry: true,
          emailVerified: true,
        },
      });

      if (expiredUser) {
        console.log('[Verify Email] Found user with token but expired/already verified:', expiredUser.email);
        if (expiredUser.emailVerified) {
          console.log('[Verify Email] Token already used for user:', expiredUser.email);
          return NextResponse.redirect(new URL('/login?error=already_verified', request.url));
        }
        if (expiredUser.emailVerifyExpiry && expiredUser.emailVerifyExpiry <= new Date()) {
          console.log('[Verify Email] Token expired for user:', expiredUser.email, 'Expiry:', expiredUser.emailVerifyExpiry);
          return NextResponse.redirect(new URL('/login?error=expired_token', request.url));
        }
      }

      // Check if any users have tokens at all (for debugging)
      const usersWithTokens = await prisma.user.findMany({
        where: {
          emailVerifyToken: { not: null },
        },
        select: {
          email: true,
          emailVerifyToken: true,
        },
        take: 3,
      });

      console.log('[Verify Email] Users with tokens in DB:', usersWithTokens.length);
      if (usersWithTokens.length > 0) {
        console.log('[Verify Email] Sample tokens:', usersWithTokens.map(u => ({
          email: u.email,
          tokenPrefix: u.emailVerifyToken?.substring(0, 20) + '...',
          tokenLength: u.emailVerifyToken?.length,
        })));
      }

      // Last check: maybe the token was created but the user was created before the fields existed
      // Try to find by partial match (first 20 chars) to see if there's a similar token
      const similarTokens = await prisma.user.findMany({
        where: {
          emailVerifyToken: { startsWith: token.substring(0, 20) },
        },
        select: {
          email: true,
          emailVerifyToken: true,
        },
        take: 1,
      });

      if (similarTokens.length > 0) {
        console.log('[Verify Email] Found similar token but not exact match');
        console.log('[Verify Email] Expected:', token);
        console.log('[Verify Email] Found:', similarTokens[0].emailVerifyToken);
      }

      console.error('[Verify Email] Token not found:', token.substring(0, 20) + '...');
      return NextResponse.redirect(new URL('/login?error=invalid_or_expired_token', request.url));
    }

    // Verify the email
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpiry: null,
      },
    });

    console.log('Email verified successfully for user:', user.email);
    return NextResponse.redirect(new URL('/login?verified=success', request.url));
  } catch (error) {
    console.error('Error verifying email:', error);
    return NextResponse.redirect(new URL('/login?error=verification_failed', request.url));
  }
}
