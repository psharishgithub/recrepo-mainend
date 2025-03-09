import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../auth/[...nextauth]/authoptions';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '5');
    const skip = (page - 1) * limit;

    const files = await prisma.file.findMany({
      where: {
        uploaderId: session.user.id
      },
      include: {
        subject: {
          select: {
            name: true,
            code: true
          }
        }
      },
      orderBy: {
        uploadedAt: 'desc'
      },
      skip,
      take: limit,
    });

    return NextResponse.json({ success: true, files });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
