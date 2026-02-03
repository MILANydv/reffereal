import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
    const session = await auth();

    if (!session || session.user.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const where: any = {};
        if (status && status !== 'all') {
            where.status = status;
        }

        const changelogs = await (prisma as any).changelog.findMany({
            where,
            orderBy: { releaseDate: 'desc' },
        });

        return NextResponse.json(changelogs);
    } catch (error) {
        console.error('Error fetching changelogs:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const session = await auth();

    if (!session || session.user.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { version, type, title, content, status, releaseDate } = body;

        if (!version || !type || !title || !content) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const changelog = await (prisma as any).changelog.create({
            data: {
                version,
                type,
                title,
                content,
                status: status || 'DRAFT',
                releaseDate: releaseDate ? new Date(releaseDate) : new Date(),
            },
        });

        await logger.info(
            `Changelog ${version} created by admin`,
            'admin-api',
            { changelogId: changelog.id, version, adminId: session.user.id }
        );

        return NextResponse.json(changelog);
    } catch (error) {
        console.error('Error creating changelog:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    const session = await auth();

    if (!session || session.user.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { id, version, type, title, content, status, releaseDate } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'id is required' },
                { status: 400 }
            );
        }

        const updateData: any = {};
        if (version) updateData.version = version;
        if (type) updateData.type = type;
        if (title) updateData.title = title;
        if (content) updateData.content = content;
        if (status) updateData.status = status;
        if (releaseDate) updateData.releaseDate = new Date(releaseDate);

        const changelog = await (prisma as any).changelog.update({
            where: { id },
            data: updateData,
        });

        await logger.info(
            `Changelog ${id} updated by admin`,
            'admin-api',
            { changelogId: id, adminId: session.user.id }
        );

        return NextResponse.json(changelog);
    } catch (error) {
        console.error('Error updating changelog:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    const session = await auth();

    if (!session || session.user.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'id is required' },
                { status: 400 }
            );
        }

        await (prisma as any).changelog.delete({
            where: { id },
        });

        await logger.warn(
            `Changelog ${id} deleted by admin`,
            'admin-api',
            { changelogId: id, adminId: session.user.id }
        );

        return NextResponse.json({ success: true, message: 'Changelog deleted successfully' });
    } catch (error) {
        console.error('Error deleting changelog:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
