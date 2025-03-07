export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

export async function GET() {
    try {
        await prisma.$connect();
        const subjects = await prisma.subject.findMany();
        
        return NextResponse.json(subjects, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Surrogate-Control': 'no-store',
            },
        });
    } catch (error) {
        console.error('Error fetching subjects:', error);
        return NextResponse.json({ error: 'Failed to fetch subjects', details: error }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
