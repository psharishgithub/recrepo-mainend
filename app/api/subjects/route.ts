export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const includeFiles = searchParams.get('includeFiles') === 'true';
        
        const skip = (page - 1) * limit;

        const where: Prisma.SubjectWhereInput = search ? {
            OR: [
                { name: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
                { code: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
                { department: { contains: search, mode: 'insensitive' as Prisma.QueryMode } }
            ]
        } : {};

        const [subjects, total] = await Promise.all([
            prisma.subject.findMany({
                where,
                skip,
                take: limit,
                include: {
                    files: includeFiles // Only include files when requested
                },
                orderBy: {
                    id: 'desc'
                }
            }),
            prisma.subject.count({ where })
        ]);
        
        return NextResponse.json({
            subjects,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });

    } catch (error) {
        console.error('Error fetching subjects:', error);
        return NextResponse.json(
            { error: 'Failed to fetch subjects' }, 
            { status: 500 }
        );
    }
}
