import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/app/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/authoptions';

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const savedResponses = await prisma.savedResponse.findMany({
      where: {
        userId: userId!,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(savedResponses);
  } catch (error) {
    console.error('Error fetching saved responses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved responses' },
      { status: 500 }
    );
  }
}
