import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const response = await prisma.savedResponse.findUnique({
            where: {
                id: params.id
            }
        });

        if (!response) {
            return new NextResponse(JSON.stringify({ error: 'Response not found' }), {
                status: 404,
            });
        }

        return NextResponse.json(response);
    } catch (error) {
        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
        });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.savedResponse.delete({
            where: {
                id: params.id
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
        });
    }
}
