import { NextRequest, NextResponse } from 'next/server';
import { auth, signOut } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get the session to verify user is logged in
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      );
    }

    // Sign out the user - this invalidates the JWT token
    // In NextAuth v5, signOut handles session destruction
    await signOut({ redirect: false });

    // Create response
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );

    // Clear all possible NextAuth cookies
    const cookieNames = [
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
      'next-auth.csrf-token',
      '__Host-next-auth.csrf-token',
      'authjs.session-token',
      '__Secure-authjs.session-token',
      'authjs.csrf-token',
      '__Host-authjs.csrf-token',
    ];

    cookieNames.forEach((cookieName) => {
      response.cookies.delete(cookieName);
      // Also try to clear with different path options
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Also support GET for convenience
export async function GET(request: NextRequest) {
  return POST(request);
}
