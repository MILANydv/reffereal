import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { UserRole } from '@prisma/client';

export async function DELETE(request: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        Partner: {
          select: {
            id: true,
            App: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent SUPER_ADMIN from deleting their account via this endpoint
    // Super admins should be managed through admin panel only
    if (user.role === UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { error: 'Super admin accounts cannot be deleted through this endpoint. Please contact system administrator.' },
        { status: 403 }
      );
    }

    // Log the deletion attempt before proceeding
    await logger.warn(
      `User account deletion initiated`,
      'user-api',
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        appsCount: user.Partner.reduce((sum, p) => sum + p.App.length, 0),
        partnersCount: user.Partner.length,
      }
    );

    // Delete the user (cascades will handle Partner, App, Campaign, Referral, etc.)
    // This is a hard delete - all related data will be removed
    await prisma.user.delete({
      where: { id: user.id },
    });

    await logger.warn(
      `User account deleted successfully`,
      'user-api',
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user account:', error);
    await logger.error('Failed to delete user account', 'user-api', { error: String(error) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
