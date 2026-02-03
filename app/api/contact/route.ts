import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, company, subject, message } = body;

        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Name, email and message are required' },
                { status: 400 }
            );
        }

        const inquiry = await (prisma as any).contactInquiry.create({
            data: {
                name,
                email,
                company,
                subject: subject || 'New Inquiry',
                message,
                status: 'NEW',
            },
        });

        await logger.info(
            `New contact inquiry from ${email}`,
            'contact-api',
            { inquiryId: inquiry.id, email }
        );

        return NextResponse.json({ success: true, message: 'Inquiry submitted successfully' });
    } catch (error) {
        console.error('Error submitting inquiry:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
