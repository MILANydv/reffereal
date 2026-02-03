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
                { title: { contains: search, mode: 'insensitive' } },
                { author: { contains: search, mode: 'insensitive' } },
                { category: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (status && status !== 'all') {
            where.status = status;
        }

        const blogs = await (prisma as any).blog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(blogs);
    } catch (error) {
        console.error('Error fetching blogs:', error);
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
        const { title, slug, author, content, category, status } = body;

        if (!title || !slug || !content) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const blog = await (prisma as any).blog.create({
            data: {
                title,
                slug,
                author: author || session.user.name || 'Admin',
                content,
                category: category || 'General',
                status: status || 'DRAFT',
                publishedAt: status === 'PUBLISHED' ? new Date() : null,
            },
        });

        await logger.info(
            `Blog post "${title}" created by admin`,
            'admin-api',
            { blogId: blog.id, adminId: session.user.id }
        );

        return NextResponse.json(blog);
    } catch (error) {
        console.error('Error creating blog:', error);
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
        const { id, title, slug, author, content, category, status } = body;

        if (!id) {
            return NextResponse.json({ error: 'id is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (title) updateData.title = title;
        if (slug) updateData.slug = slug;
        if (author) updateData.author = author;
        if (content) updateData.content = content;
        if (category) updateData.category = category;
        if (status) {
            updateData.status = status;
            if (status === 'PUBLISHED') updateData.publishedAt = new Date();
        }

        const blog = await (prisma as any).blog.update({
            where: { id },
            data: updateData,
        });

        await logger.info(
            `Blog post ${id} updated by admin`,
            'admin-api',
            { blogId: id, adminId: session.user.id }
        );

        return NextResponse.json(blog);
    } catch (error) {
        console.error('Error updating blog:', error);
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
            return NextResponse.json({ error: 'id is required' }, { status: 400 });
        }

        await (prisma as any).blog.delete({
            where: { id },
        });

        await logger.warn(
            `Blog post ${id} deleted by admin`,
            'admin-api',
            { blogId: id, adminId: session.user.id }
        );

        return NextResponse.json({ success: true, message: 'Blog deleted successfully' });
    } catch (error) {
        console.error('Error deleting blog:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
