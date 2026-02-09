import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET() {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        emailNotifications: true,
        marketingEmails: true,
        language: true,
        timezone: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      emailNotifications: user.emailNotifications,
      marketingEmails: user.marketingEmails,
      language: user.language,
      timezone: user.timezone,
    });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    await logger.error('Failed to fetch user settings', 'user-api', { error: String(error) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { emailNotifications, marketingEmails, language, timezone } = body;

    const updateData: {
      emailNotifications?: boolean;
      marketingEmails?: boolean;
      language?: string;
      timezone?: string;
    } = {};

    if (emailNotifications !== undefined) {
      if (typeof emailNotifications !== 'boolean') {
        return NextResponse.json({ error: 'emailNotifications must be a boolean' }, { status: 400 });
      }
      updateData.emailNotifications = emailNotifications;
    }

    if (marketingEmails !== undefined) {
      if (typeof marketingEmails !== 'boolean') {
        return NextResponse.json({ error: 'marketingEmails must be a boolean' }, { status: 400 });
      }
      updateData.marketingEmails = marketingEmails;
    }

    if (language !== undefined) {
      if (typeof language !== 'string' || language.length === 0) {
        return NextResponse.json({ error: 'language must be a non-empty string' }, { status: 400 });
      }
      updateData.language = language;
    }

    if (timezone !== undefined) {
      if (typeof timezone !== 'string' || timezone.length === 0) {
        return NextResponse.json({ error: 'timezone must be a non-empty string' }, { status: 400 });
      }
      updateData.timezone = timezone;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        emailNotifications: true,
        marketingEmails: true,
        language: true,
        timezone: true,
      },
    });

    await logger.info(
      `User settings updated`,
      'user-api',
      { userId: session.user.id, changes: updateData }
    );

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user settings:', error);
    await logger.error('Failed to update user settings', 'user-api', { error: String(error) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
