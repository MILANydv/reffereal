import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const blogs = await (prisma as any).blog.findMany({
            where: {
                status: 'PUBLISHED',
            },
            orderBy: {
                publishedAt: 'desc',
            },
        });

        return NextResponse.json(blogs);
    } catch (error) {
        console.error('Error fetching public blogs:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
