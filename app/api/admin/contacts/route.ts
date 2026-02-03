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
        const search = searchParams.get('search');
        const status = searchParams.get('status');

        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { subject: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (status && status !== 'all') {
            where.status = status;
        }

        const inquiries = await (prisma as any).contactInquiry.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(inquiries);
    } catch (error) {
        console.error('Error fetching inquiries:', error);
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
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json(
                { error: 'id and status are required' },
                { status: 400 }
            );
        }

        const inquiry = await (prisma as any).contactInquiry.update({
            where: { id },
            data: { status },
        });

        await logger.info(
            `Inquiry ${id} status updated to ${status} by admin`,
            'admin-api',
            { inquiryId: id, status, adminId: session.user.id }
        );

        return NextResponse.json(inquiry);
    } catch (error) {
        console.error('Error updating inquiry:', error);
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

        await (prisma as any).contactInquiry.delete({
            where: { id },
        });

        await logger.warn(
            `Inquiry ${id} deleted by admin`,
            'admin-api',
            { inquiryId: id, adminId: session.user.id }
        );

        return NextResponse.json({ success: true, message: 'Inquiry deleted successfully' });
    } catch (error) {
        console.error('Error deleting inquiry:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
